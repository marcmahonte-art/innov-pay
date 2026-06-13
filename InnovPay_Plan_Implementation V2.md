# Innov Pay — Plan d'Implémentation Prototype
## API First · Base de données · Dashboard Marchand
## Inspiré de LigdiCash BF · Version 1.0 · Juin 2026

> **Stratégie :** Construire le prototype technique complet AVANT de contacter UBA Tchad,
> Ecobank ou tout autre partenaire bancaire. Un prototype qui fonctionne vaut 10 fois
> plus qu'un business plan lors d'une réunion avec un directeur bancaire.

---

## Philosophie LigdiCash à reproduire

LigdiCash a construit son succès sur 3 principes simples :
1. **Une seule API** pour tous les opérateurs → les marchands intègrent une fois
2. **Payin sans redirection** → l'utilisateur ne quitte jamais le site du marchand
3. **Webhook comme source de vérité** → jamais se fier au retour synchrone

Innov Pay doit appliquer exactement ces principes pour le marché tchadien.

---

## Stack technique recommandée

```
Backend    : Node.js 20 + Express ou Fastify
Base de données : PostgreSQL 16
Cache      : Redis 7
Auth       : JWT + API Keys
Docs API   : Swagger / OpenAPI 3.0
Hébergement : Ubuntu 22.04 + Docker + Nginx
SSL        : Let's Encrypt (certbot)
Monitoring : Uptime Robot + Sentry
```

**Pourquoi Node.js et pas PHP ?**
LigdiCash utilise PHP. Pour Innov Pay, Node.js donne de meilleures
performances pour les webhooks temps réel et un écosystème plus moderne
pour séduire les développeurs tchadiens lors de la démo aux banques.

---

## Phase 0 — Préparation (Semaine 1)

### 0.1 Domaine et infrastructure

```bash
# Acheter le domaine
innovpay.td

# Structure des sous-domaines
api.innovpay.td        → API principale
app.innovpay.td        → Dashboard marchand
docs.innovpay.td       → Documentation développeurs
admin.innovpay.td      → Back office admin
sandbox.innovpay.td    → Environnement de test
```

### 0.2 Structure du projet

```
innovpay/
├── api/                    ← API principale (Node.js)
│   ├── src/
│   │   ├── routes/         ← Endpoints API
│   │   ├── controllers/    ← Logique métier
│   │   ├── models/         ← Modèles DB
│   │   ├── middleware/      ← Auth, rate limit, logs
│   │   ├── services/       ← Intégrations opérateurs
│   │   ├── webhooks/       ← Réception callbacks opérateurs
│   │   └── utils/          ← Helpers, crypto, validation
│   ├── prisma/             ← Schéma base de données
│   └── docs/               ← Swagger OpenAPI
├── dashboard/              ← Dashboard marchand (Next.js)
├── admin/                  ← Back office (Next.js)
├── docs-site/              ← Documentation (Docusaurus)
├── docker-compose.yml
└── .env.example
```

---

## Phase 1 — Base de données complète (Semaine 1-2)

### Schéma PostgreSQL complet

```sql
-- ════════════════════════════════════════
-- INNOV PAY — Schéma base de données v1.0
-- ════════════════════════════════════════

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════
-- TABLE MARCHANDS
-- ══════════════════
CREATE TABLE merchants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT NOT NULL,
  country         TEXT DEFAULT 'TD',
  city            TEXT,
  address         TEXT,
  category        TEXT CHECK (category IN (
                    'ecommerce','school','ngo','admin',
                    'restaurant','transport','health','other'
                  )),
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','active','suspended','rejected')),
  kyc_status      TEXT DEFAULT 'pending'
                    CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
  kyc_doc_url     TEXT,
  balance         DECIMAL(15,2) DEFAULT 0.00,
  balance_pending DECIMAL(15,2) DEFAULT 0.00,
  webhook_url     TEXT,
  webhook_secret  TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════
-- TABLE API KEYS
-- ══════════════════
CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id   UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  api_key       TEXT UNIQUE NOT NULL DEFAULT 'innpk_' || encode(gen_random_bytes(24), 'hex'),
  api_token     TEXT UNIQUE NOT NULL DEFAULT 'innpt_' || encode(gen_random_bytes(32), 'hex'),
  environment   TEXT DEFAULT 'sandbox' CHECK (environment IN ('sandbox','production')),
  is_active     BOOLEAN DEFAULT true,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════
-- TABLE TRANSACTIONS
-- ══════════════════
CREATE TABLE transactions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id           UUID REFERENCES merchants(id) NOT NULL,
  reference             TEXT UNIQUE NOT NULL,  -- Référence marchand
  innov_reference       TEXT UNIQUE NOT NULL   -- Référence Innov Pay
                          DEFAULT 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-'
                            || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  type                  TEXT NOT NULL CHECK (type IN ('payin','payout','refund')),
  amount                DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency              TEXT DEFAULT 'XAF',
  fee                   DECIMAL(15,2) DEFAULT 0.00,
  net_amount            DECIMAL(15,2),  -- amount - fee
  channel               TEXT NOT NULL CHECK (channel IN (
                          'airtel_money','moov_money','orange_money',
                          'visa','mastercard','bank_transfer','wallet'
                        )),
  customer_phone        TEXT,
  customer_name         TEXT,
  customer_email        TEXT,
  description           TEXT,
  metadata              JSONB DEFAULT '{}',
  status                TEXT DEFAULT 'pending'
                          CHECK (status IN (
                            'pending','processing','success',
                            'failed','cancelled','refunded','expired'
                          )),
  status_message        TEXT,
  operator_reference    TEXT,  -- Référence retournée par l'opérateur
  operator_response     JSONB DEFAULT '{}',  -- Réponse brute opérateur
  otp_code              TEXT,  -- Pour payin sans redirection
  otp_expires_at        TIMESTAMPTZ,
  redirect_url          TEXT,  -- Pour payin avec redirection
  callback_url          TEXT,  -- Webhook URL spécifique
  webhook_sent          BOOLEAN DEFAULT false,
  webhook_sent_at       TIMESTAMPTZ,
  webhook_attempts      INTEGER DEFAULT 0,
  environment           TEXT DEFAULT 'sandbox',
  ip_address            TEXT,
  user_agent            TEXT,
  expires_at            TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes',
  processed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Index critiques pour performance
CREATE INDEX idx_transactions_merchant    ON transactions(merchant_id, created_at DESC);
CREATE INDEX idx_transactions_reference   ON transactions(reference);
CREATE INDEX idx_transactions_innov_ref   ON transactions(innov_reference);
CREATE INDEX idx_transactions_status      ON transactions(status, created_at);
CREATE INDEX idx_transactions_channel     ON transactions(channel, created_at);
CREATE INDEX idx_transactions_webhook     ON transactions(webhook_sent, status)
                                          WHERE webhook_sent = false AND status IN ('success','failed');

-- ══════════════════
-- TABLE SETTLEMENTS
-- ══════════════════
CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id     UUID REFERENCES merchants(id) NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  currency        TEXT DEFAULT 'XAF',
  fee             DECIMAL(15,2) DEFAULT 0.00,
  net_amount      DECIMAL(15,2),
  bank_name       TEXT,
  bank_account    TEXT,
  bank_reference  TEXT,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','completed','failed')),
  period_start    TIMESTAMPTZ,
  period_end      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  processed_at    TIMESTAMPTZ
);

-- ══════════════════
-- TABLE WEBHOOKS LOGS
-- ══════════════════
CREATE TABLE webhook_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID REFERENCES transactions(id),
  merchant_id     UUID REFERENCES merchants(id),
  url             TEXT NOT NULL,
  payload         JSONB NOT NULL,
  http_status     INTEGER,
  response_body   TEXT,
  attempt         INTEGER DEFAULT 1,
  success         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════
-- TABLE AUDIT LOGS
-- ══════════════════
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_type  TEXT CHECK (actor_type IN ('merchant','admin','system','operator')),
  actor_id    UUID,
  action      TEXT NOT NULL,
  resource    TEXT,
  resource_id UUID,
  metadata    JSONB DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════
-- TABLE OPÉRATEURS (Simulation pour le prototype)
-- ══════════════════
CREATE TABLE operators (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  code         TEXT UNIQUE NOT NULL,  -- 'airtel_money', 'moov_money', etc.
  country      TEXT DEFAULT 'TD',
  is_active    BOOLEAN DEFAULT true,
  is_sandbox   BOOLEAN DEFAULT true,  -- true = simulé, false = réel
  fee_percent  DECIMAL(5,2) DEFAULT 0.30,
  config       JSONB DEFAULT '{}',   -- URL, credentials (chiffrés en prod)
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Données initiales opérateurs Tchad
INSERT INTO operators (name, code, country, is_active, is_sandbox, fee_percent) VALUES
  ('Airtel Money Tchad',  'airtel_money',  'TD', true, true, 0.30),
  ('Moov Money Tchad',    'moov_money',    'TD', true, true, 0.30),
  ('Orange Money Tchad',  'orange_money',  'TD', true, true, 0.30),
  ('Visa',                'visa',          'TD', true, true, 0.50),
  ('Mastercard',          'mastercard',    'TD', true, true, 0.50);

-- ══════════════════
-- TABLE RATE LIMITS
-- ══════════════════
CREATE TABLE rate_limit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key     TEXT NOT NULL,
  endpoint    TEXT NOT NULL,
  count       INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════
-- FONCTIONS & TRIGGERS
-- ══════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calcul automatique net_amount
CREATE OR REPLACE FUNCTION calc_net_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_amount = NEW.amount - COALESCE(NEW.fee, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_net_amount
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION calc_net_amount();
```

---

## Phase 2 — API Core (Semaine 2-4)

### 2.1 Endpoints principaux

```
POST   /v1/payments                → Initier un paiement
GET    /v1/payments/{id}           → Statut d'un paiement
POST   /v1/payments/{id}/verify    → Vérifier OTP (payin sans redirection)
POST   /v1/refunds                 → Rembourser une transaction
GET    /v1/balance                 → Solde du marchand
GET    /v1/transactions            → Liste des transactions
GET    /v1/transactions/{id}       → Détail d'une transaction

POST   /v1/webhooks/test           → Tester le webhook marchand
GET    /v1/operators               → Liste des opérateurs disponibles
```

### 2.2 Prompt Cursor — API complète

```
Tu es un expert Node.js + PostgreSQL. Crée l'API complète d'Innov Pay.

Stack : Node.js 20 + Fastify + Prisma + PostgreSQL + Redis + JWT

PROJET : Innov Pay — Agrégateur de paiement tchadien
Domaine : api.innovpay.td
Devise : XAF (Franc CFA CEMAC)
Opérateurs : Airtel Money, Moov Money, Orange Money Tchad

════════════════════════════════════
MIDDLEWARE & SÉCURITÉ
════════════════════════════════════

1. Authentication middleware (src/middleware/auth.ts) :
   Header requis : Authorization: Bearer {api_token}
   Vérifier en DB : api_keys WHERE api_token = ? AND is_active = true
   Stocker merchant_id dans request.merchant
   Rate limit : 100 req/minute par api_key via Redis
   Return 401 si invalide, 429 si rate limit dépassé

2. HMAC Webhook Verification (src/utils/hmac.ts) :
   Signer chaque payload webhook avec le webhook_secret du marchand :
   HMAC-SHA256(payload, secret) → header X-Innov-Signature
   Fonction : verifyWebhookSignature(body, signature, secret): boolean

3. Request validation (src/middleware/validate.ts) :
   Utiliser Zod pour valider tous les body de requête
   Retourner les erreurs de validation en français

════════════════════════════════════
ENDPOINT 1 — POST /v1/payments
════════════════════════════════════

Body attendu :
{
  "amount": 5000,
  "currency": "XAF",
  "channel": "airtel_money",
  "customer_phone": "23566XXXXXXXX",
  "customer_name": "Moussa Mahamat",
  "reference": "ORDER-2026-001",
  "description": "Paiement commande #001",
  "callback_url": "https://merchant.td/webhook",
  "redirect_url": "https://merchant.td/success",
  "metadata": { "order_id": "001", "product": "laptop" }
}

Logique :
1. Valider le body avec Zod
2. Vérifier que reference est unique pour ce marchand
3. Calculer les frais : montant * (fee_percent/100)
4. Créer la transaction en DB avec status='pending'
5. Si channel = 'airtel_money' ou 'moov_money' ou 'orange_money' :
   → Mode OTP : appeler src/services/operators/[channel].ts
   → L'opérateur envoie un SMS avec code OTP au client
   → Retourner { transaction_id, innov_reference, status: 'pending',
                  otp_required: true, message: 'Un code OTP a été envoyé au client' }
6. Log dans audit_logs

Réponse succès :
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "innov_reference": "INV-20260601-ABCD1234",
    "merchant_reference": "ORDER-2026-001",
    "amount": 5000,
    "fee": 15,
    "net_amount": 4985,
    "currency": "XAF",
    "channel": "airtel_money",
    "status": "pending",
    "otp_required": true,
    "expires_at": "2026-06-01T15:30:00Z",
    "created_at": "2026-06-01T15:00:00Z"
  }
}

════════════════════════════════════
ENDPOINT 2 — POST /v1/payments/{id}/verify
════════════════════════════════════

Body : { "otp": "123456" }

Logique :
1. Récupérer la transaction par id
2. Vérifier que la transaction appartient au marchand auth
3. Vérifier que status = 'pending'
4. Vérifier que expires_at > NOW()
5. Vérifier l'OTP avec le service opérateur
6. Si OTP valide :
   → UPDATE transactions SET status='success', processed_at=NOW()
   → Envoyer webhook au marchand (async, ne pas bloquer la réponse)
   → Mettre à jour le solde du marchand
7. Si OTP invalide : incrémenter tentatives, bloquer après 3 échecs

════════════════════════════════════
ENDPOINT 3 — GET /v1/payments/{id}
════════════════════════════════════

Retourner le détail complet de la transaction.
Inclure le statut en temps réel.
Ne jamais retourner : operator_response, otp_code, ip_address.

════════════════════════════════════
ENDPOINT 4 — POST /v1/refunds
════════════════════════════════════

Body : { "transaction_id": "uuid", "amount": 5000, "reason": "Annulation client" }

Logique :
1. Vérifier que la transaction originale a status='success'
2. Vérifier que le marchand a assez de solde
3. Créer une nouvelle transaction de type='refund'
4. En sandbox : simuler le remboursement immédiatement
5. En production : appeler l'API opérateur pour remboursement

════════════════════════════════════
SERVICE OPÉRATEURS (Simulation Sandbox)
════════════════════════════════════

Créer src/services/operators/sandbox.ts :

Simuler le comportement des opérateurs Tchad :

initiatePayment(phone, amount, channel): Promise<{otp: string, operatorRef: string}>
  → Générer un OTP 6 chiffres aléatoire
  → Stocker en Redis avec TTL 5 minutes
  → Simuler l'envoi SMS (log en console en sandbox)
  → Return { otp, operatorRef: 'SIM-' + nanoid() }

verifyOTP(transactionId, otp): Promise<boolean>
  → Récupérer l'OTP stocké en Redis
  → Comparer avec l'OTP soumis
  → Si succès : 80% de chance de succès (simuler les échecs réseau)
  → Si simulé en succès : return true
  → Sinon : return false avec motif d'échec

════════════════════════════════════
WEBHOOK SERVICE
════════════════════════════════════

Créer src/services/webhook.ts :

async function sendWebhook(transactionId: string) :
  1. Récupérer la transaction + webhook_url du marchand
  2. Construire le payload :
     {
       "event": "payment.success" | "payment.failed",
       "transaction_id": "uuid",
       "innov_reference": "INV-...",
       "merchant_reference": "ORDER-...",
       "amount": 5000,
       "fee": 15,
       "net_amount": 4985,
       "currency": "XAF",
       "channel": "airtel_money",
       "customer_phone": "235...",
       "status": "success",
       "timestamp": "2026-06-01T15:05:00Z"
     }
  3. Signer avec HMAC-SHA256 → header X-Innov-Signature
  4. POST vers webhook_url avec timeout 10s
  5. Si erreur : retry après 30s, 5min, 30min, 2h (max 4 tentatives)
  6. Logger dans webhook_logs

════════════════════════════════════
CRON JOB — Transactions expirées
════════════════════════════════════

Toutes les 5 minutes :
  UPDATE transactions SET status='expired'
  WHERE status='pending' AND expires_at < NOW()
  → Envoyer webhook 'payment.expired' pour chaque transaction expirée

Toutes les minutes :
  Retry les webhooks non envoyés (webhook_sent=false, status IN ('success','failed'))
  Respecter le backoff exponentiel
```

### 2.3 Réponses d'erreur standardisées (inspiré LigdiCash)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "Le code OTP est incorrect ou a expiré.",
    "details": null
  }
}
```

| Code | Message français | HTTP |
|------|-----------------|------|
| `UNAUTHORIZED` | Clé API invalide ou manquante | 401 |
| `FORBIDDEN` | Accès refusé | 403 |
| `NOT_FOUND` | Transaction introuvable | 404 |
| `DUPLICATE_REFERENCE` | Cette référence existe déjà | 409 |
| `INVALID_AMOUNT` | Le montant doit être supérieur à 0 | 422 |
| `INVALID_OTP` | Code OTP incorrect ou expiré | 422 |
| `INSUFFICIENT_BALANCE` | Solde insuffisant | 422 |
| `OPERATOR_ERROR` | Erreur de l'opérateur mobile | 502 |
| `RATE_LIMIT` | Trop de requêtes | 429 |

---

## Phase 3 — Dashboard Marchand (Semaine 4-6)

### Prompt Cursor — Dashboard complet

```
Tu es expert Next.js 14 + Tailwind. Crée le dashboard marchand d'Innov Pay.
Design : sobre, professionnel, confiance. Couleur : #2563EB (bleu) + blanc.

Pages :
1. /login — Email + mot de passe marchand
2. /dashboard — KPIs + graphique + transactions récentes
3. /transactions — Liste filtrée avec export CSV
4. /integration — Clés API + guide d'intégration + test webhook
5. /abonnement — Plans et frais
6. /profil — Infos entreprise + KYC

KPI CARDS (dashboard) :
  Revenus aujourd'hui | Transactions aujourd'hui
  Taux de succès (%) | Solde disponible

GRAPHIQUE :
  Bar chart par jour sur 30 jours
  Couleurs : succès (vert) / échec (rouge)

TABLEAU TRANSACTIONS :
  Colonnes : Référence | Montant | Canal | Client | Statut pill | Date | Actions
  Filtres : Par statut, par canal, par date
  Export CSV depuis Supabase/Postgres

PAGE INTÉGRATION (la plus importante pour convaincre les banques) :
  Section 1 — Tes clés API (api_key + api_token masqués + bouton Copier)
  Section 2 — Guide d'intégration avec code PHP/JS/Python
  Section 3 — Simulateur de paiement :
    Formulaire : canal + montant + numéro → bouton "Tester"
    Appelle la vraie API en sandbox
    Affiche la réponse JSON brute en live
  Section 4 — Webhook tester :
    Input URL webhook → bouton "Envoyer un test"
    Montre le payload envoyé et la réponse reçue
```

---

## Phase 4 — Documentation développeurs (Semaine 5-6)

### Structure docs.innovpay.td (inspiré developers.ligdicash.com)

```
GUIDE DE DÉMARRAGE
  → Créer un compte
  → Obtenir ses clés API
  → Premier paiement en 5 minutes

API REFERENCE
  → Authentification
  → POST /v1/payments
  → POST /v1/payments/{id}/verify
  → GET /v1/payments/{id}
  → POST /v1/refunds
  → GET /v1/transactions
  → Codes d'erreur

OPÉRATEURS
  → Airtel Money Tchad
  → Moov Money Tchad
  → Orange Money Tchad
  → Carte Visa/Mastercard

WEBHOOKS
  → Configuration
  → Signature HMAC
  → Événements
  → Retry policy

EXEMPLES DE CODE
  → PHP (le plus utilisé au Tchad)
  → JavaScript/Node.js
  → Python
  → cURL

ENVIRONNEMENTS
  → Sandbox (simulation)
  → Production
  → Numéros de test
```

### Exemple de code PHP pour les marchands

```php
<?php
// Exemple d'intégration Innov Pay — PHP
// docs.innovpay.td

class InnovPay {
    private $apiKey;
    private $apiToken;
    private $baseUrl;

    public function __construct($apiKey, $apiToken, $sandbox = true) {
        $this->apiKey   = $apiKey;
        $this->apiToken = $apiToken;
        $this->baseUrl  = $sandbox
            ? 'https://sandbox.innovpay.td/v1'
            : 'https://api.innovpay.td/v1';
    }

    public function createPayment($data) {
        return $this->request('POST', '/payments', $data);
    }

    public function verifyOTP($transactionId, $otp) {
        return $this->request('POST', "/payments/{$transactionId}/verify",
            ['otp' => $otp]);
    }

    public function getTransaction($transactionId) {
        return $this->request('GET', "/payments/{$transactionId}");
    }

    private function request($method, $endpoint, $data = null) {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiToken,
                'Content-Type: application/json',
                'X-Api-Key: ' . $this->apiKey,
            ],
            CURLOPT_CUSTOMREQUEST => $method,
        ]);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }
}

// Usage
$innov = new InnovPay('innpk_xxxxx', 'innpt_xxxxx', sandbox: true);

// Initier un paiement Airtel Money
$payment = $innov->createPayment([
    'amount'         => 10000,
    'currency'       => 'XAF',
    'channel'        => 'airtel_money',
    'customer_phone' => '23566000001',
    'customer_name'  => 'Moussa Mahamat',
    'reference'      => 'CMD-' . uniqid(),
    'description'    => 'Paiement commande école',
    'callback_url'   => 'https://mon-site.td/webhook',
]);

echo "Référence : " . $payment['data']['innov_reference'];
echo "Statut : " . $payment['data']['status'];
echo "→ Demander l'OTP au client";

// Vérifier l'OTP du client
$result = $innov->verifyOTP($payment['data']['transaction_id'], '123456');
echo "Résultat : " . $result['data']['status']; // success
```

---

## Phase 5 — Back Office Admin (Semaine 6-7)

### Fonctionnalités essentielles pour la démo banques

```
/admin/dashboard
  → Volume total transactions
  → Revenus commissions
  → Marchands actifs
  → Taux de succès global

/admin/marchands
  → Liste avec statut KYC
  → Approuver/Rejeter les inscriptions
  → Voir toutes les transactions d'un marchand
  → Suspendre un marchand

/admin/transactions
  → Vue globale de toutes les transactions
  → Filtres avancés
  → Forcer un retry webhook
  → Annuler une transaction stuck

/admin/settlements
  → Créer un virement de règlement
  → Marquer comme traité
  → Historique

/admin/operateurs
  → Toggle actif/inactif par opérateur
  → Statistiques par opérateur
  → Taux de succès par opérateur
```

---

## Phase 6 — Préparer la démo banques (Semaine 7-8)

### Ce que tu montres à UBA et Ecobank Tchad

**Slide 1 — Le problème au Tchad**
- Screenshot de 3 sites tchadiens qui n'acceptent pas le paiement en ligne
- Montant du commerce digitale perdu par an

**Slide 2 — Innov Pay live**
- Ouvrir app.innovpay.td sur ton laptop
- Créer un compte marchand en 2 minutes en direct
- Copier les clés API

**Slide 3 — Intégration en direct**
- Ouvrir le simulateur de paiement dans le dashboard
- Faire un paiement test Airtel Money 10 000 XAF en direct
- Le webhook arrive en temps réel dans le dashboard

**Slide 4 — Architecture**
- Montrer que Innov Pay est au milieu entre les marchands et les opérateurs
- Expliquer le rôle stratégique de la banque partenaire (compte de cantonnement)

**Slide 5 — Proposition banque**
- "Nous avons le produit technique qui fonctionne"
- "Nous avons besoin d'un compte de cantonnement agréé"
- "Vous recevez X% de chaque transaction"
- "Volume projeté Année 1 : X transactions / Y XAF"

---

## Ordre d'exécution — 8 semaines

| Semaine | Tâche | Livrable |
|---------|-------|----------|
| S1 | Setup infra + Base de données | Docker + PostgreSQL opérationnel |
| S2 | API Auth + POST /v1/payments | Créer un paiement en sandbox |
| S3 | OTP + Verify + Webhooks | Flux complet bout en bout |
| S4 | GET transactions + Dashboard | Dashboard marchand fonctionnel |
| S5 | Documentation + Code examples | docs.innovpay.td en ligne |
| S6 | Back office admin | Gestion marchands + KYC |
| S7 | Tests + Sécurité + SSL | API stable et sécurisée |
| S8 | Démo prep + Pitch banques | Rendez-vous UBA/Ecobank |

---

## Budget infrastructure Phase 1

| Poste | Coût/mois | Détail |
|-------|-----------|--------|
| VPS Ubuntu 22.04 | ~15 000 XAF | 4 CPU, 8 Go RAM, 100 Go SSD |
| Domaine .td | ~10 000 XAF/an | innovpay.td |
| SSL | 0 XAF | Let's Encrypt gratuit |
| Monitoring | 0 XAF | Uptime Robot gratuit |
| **Total** | **~16 000 XAF/mois** | Phase prototype |

---

*Innov Pay — "One API. Every Payment." 🇹🇩*
*Construit au Tchad. Pour le Tchad. Pour la zone CEMAC.*
