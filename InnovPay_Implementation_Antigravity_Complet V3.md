

| INNOV PAY Document d'Implémentation Complet — Antigravity *Clone PayDunya · Agrégateur de paiement · Tchad & Zone CEMAC · Juin 2026* |  |  |  |  |
| ----- | :---: | :---: | :---: | :---: |
| **PROMPTS** **22 prompts** | **STACK** **Next.js 14 \+ NestJS** | **MARCHE** **Tchad — XAF CEMAC** | **INSPIRE DE** **PayDunya \+ Flutterwave** | **STATUT** **Confidentiel** |

| 01 |   Étude Comparative — Les Grands Agrégateurs Africains |
| :---: | :---- |

Analyse des 8 principaux agrégateurs pour définir ce qu'Innov Pay doit reproduire ET dépasser.

| Critère | PayDunya | CinetPay | Flutterwave | Paystack | Wave | KKiaPay | INNOV PAY |
| :---- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Zone couverte | AO Francophones | AO Francophones | 35 pays | Nigeria/Ghana | AO | Bénin/AO | **Tchad \+ CEMAC** |
| Mobile Money | ✓ 3 opérateurs | ✓ 4 opérateurs | ✓ Multi | ✓ Ghana/Kenya | ✓ Wave | ✓ USSD | **✓ Airtel+Moov+Orange** |
| Cartes Visa/MC | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | **✓ via Ecobank** |
| OneQR / QR Code | ✓ OneQR | ✗ | ✗ | ✗ | ✗ | ✗ | **✓ InnovQR ★** |
| Déboursement masse | ✓ PER | ✓ | ✓ | ✓ | ✗ | ✗ | **✓ MassePay ★** |
| Collecte récurrente | ✓ Collect | ✗ | ✓ | ✓ | ✗ | ✗ | **✓ AutoCollect ★** |
| Liens de paiement | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | **✓** |
| API WebPay | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | **✓** |
| API MobPay (USSD) | ✓ | ✓ | Partiel | ✗ | ✗ | ✗ | **✓ USSD Push ★** |
| Gestion des rôles | ✓ Équipes | Partiel | ✓ | ✓ | ✗ | ✗ | **✓ Multi-rôles ★** |
| Multi-devises | 6 pays XOF | 6 pays | 30+ devises | 2-3 pays | XOF | XOF | **XAF CEMAC** |
| Frais marchands | 1.5-2.5% | 2-3% | 1.4% | 1.5% | 1% | 1.5% | **2% (1% net) ★** |
| Support local | ✓ WhatsApp | ✓ | Email | Email | App | Email | **✓ WhatsApp+Arabe★** |
| KYC en ligne | ✓ | ✓ | ✓ | ✓ | ✓ | Basique | **✓ Avancé ★** |
| Plugin WooCommerce | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | **✓ ★** |
| SDK PHP/JS/Python | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | **✓ ★** |
| PCI-DSS | ✓ Level 1 | ✓ | ✓ | ✓ (Stripe) | ✗ | ✗ | **✓ (via Orqex) ★** |
| Frais payés par client | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓ Option ★** |
| Tableau analytics | Basique | Basique | Avancé | Avancé | ✗ | Basique | **✓ Avancé ★** |

| ★  Features exclusives Innov Pay — Ce que personne ne fait au Tchad InnovQR : QR code unique par marchand, payable depuis n'importe quel opérateur (Airtel, Moov, Orange) MassePay : déboursement vers 1 000 numéros en un seul appel API — pour les ONG, salaires, bourses AutoCollect : collecte récurrente automatique (frais scolaires, abonnements, cotisations) Support WhatsApp en arabe tchadien et français — personne d'autre ne fait ça au Tchad USSD Push natif tchadien — fonctionne sur les vieux téléphones sans internet Option 'frais supportés par le client' comme PayDunya — le marchand paie 0% |
| :---- |

| 02 |   Architecture Complète — Innov Pay Clone PayDunya |
| :---: | :---- |

Stack technique exacte pour reproduire PayDunya et le surpasser pour le marché tchadien.

| FRONTEND Next.js 14 App Router TypeScript \+ Tailwind CSS Recharts \+ shadcn/ui React Hook Form \+ Zod | BACKEND NestJS \+ Prisma 7 Neon PostgreSQL BullMQ \+ Redis (Railway) Swagger /docs auto | INFRA Vercel (Frontend) Railway (Backend \+ Redis) Cloudflare R2 (KYC files) Resend (Emails) | PAIEMENT Orqex (Orchestration) Airtel Money Tchad Moov Money Tchad Visa/MC via Ecobank |
| :---: | :---: | :---: | :---: |

**Flux de paiement complet**

| Client App/Web | → | API Innov Pay POST /v1/payments | → | Orqex Routage \+ Failover | → | UBA/Ecobank Cantonnement XAF | → | Airtel·Moov·Orange·Visa |  |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---- |

| 03 |   Toutes les Features à Implémenter — Inspirées de PayDunya \+ Extras |
| :---: | :---- |

| COLLECTE WebPay (redirection) MobPay (USSD Push) SoftPay (sans redirect) Lien de paiement InnovQR (QR Code) ★ Demande par SMS/Email | DÉBOURSEMENT PER (transfert unitaire) MassePay (1000+ bénéf.) ★ Virement bancaire Retrait vers mobile money Remboursement auto | COLLECTE RECURRENTE AutoCollect ★ Frais scolaires récurrents Abonnements mensuels Cotisations associations Relance auto SMS/WhatsApp | GESTION Multi-rôles équipe ★ Tableau de bord analytics Rapports PDF auto Export CSV/Excel Suivi paiements dus | INTÉGRATIONS Plugin WooCommerce ★ Plugin PrestaShop ★ SDK PHP/JS/Python Webhooks signés Zapier / N8N ★ |
| ----- | ----- | ----- | ----- | ----- |

| 04 |   Pages du Dashboard Marchand — Clone PayDunya |
| :---: | :---- |

Chaque page correspond exactement à ce que PayDunya propose, avec les améliorations Innov Pay.

| Page | Ce que fait PayDunya | Ce qu'Innov Pay fait en plus ★ |
| :---- | :---- | :---- |
| **Tableau de bord** | Soldes Principal/Opération, graphique transactions 7 jours, onglets multi-pays | Graphiques avancés Recharts, alertes temps réel, KPIs par opérateur, widget solde en XAF |
| **Gérer ma boutique** | Infos entreprise, logo, URL de callback | Gestion multi-boutiques, aperçu page de paiement en temps réel |
| **Envoyer de l'argent** | PER — transfert unitaire vers mobile money | \+ MassePay : upload CSV 1000+ bénéficiaires, suivi en temps réel par lot |
| **Demander un paiement** | Formulaire : montant, téléphone/email, description, date limite | \+ modèles réutilisables, envoi groupé, prévisualisation SMS/WhatsApp |
| **Collecter des paiements** | Collecte récurrente simple | AutoCollect : fréquence configurable, relance auto, réconciliation par étudiant/membre |
| **Débourser des paiements** | Déboursement masse via API PER | \+ Interface glisser-déposer CSV, validation avant envoi, rapport PDF post-déboursement |
| **InnovQR ★** | N/A — PayDunya a OneQR basique | QR code unique par marchand, personnalisable avec logo, analytics scan, recharge rapide |
| **Intégrez notre API** | Clés API sandbox/production, doc Swagger | \+ Playground API interactif, snippets de code PHP/JS/Python, webhooks tester |
| **Gestion des rôles** | Invitation membres par email | \+ Rôles granulaires : Caissier/Comptable/Admin/Développeur, log des actions par rôle |
| **Recharger le compte** | Recharge via Orange Money/Wave | \+ Recharge par virement bancaire, reçu automatique, historique recharges |
| **Retirer l'argent** | Retrait vers mobile money ou banque | \+ Planning de retrait automatique (hebdomadaire), justificatif PDF |
| **Paramètres KYC** | Upload RCCM, CNI, NIF | \+ Statut visuel étape par étape, alertes expiration documents, vérification automatique |
| **Analytics ★** | Statistiques basiques | Tableau de bord avancé : taux de conversion, volume par opérateur, heure de pointe, export |

| 05 |   Prompts Antigravity — De A à Z |
| :---: | :---- |

| 📌  Comment utiliser ces prompts Coller chaque prompt dans Antigravity dans l'ordre indiqué (P1 → P2 → ... → P22). Chaque prompt est autonome et référence le travail fait dans le prompt précédent. Fournir les liens Vercel du backend et frontend à partir du P6. Le prototype existant (backend-polo6.vercel.app \+ frontend-polo6.vercel.app) est le point de départ. |
| :---- |

| PROMPT 1  ·  Fondations — Design System \+ Layout Principal | Durée 3-4h | Priorité BLOQUANT |
| :---- | :---: | :---: |

| Tu es développeur React senior et designer UI expert. Tu vas construire Innov Pay, le clone tchadien de PayDunya. Stack : Next.js 14 App Router \+ TypeScript \+ Tailwind CSS. DESIGN SYSTEM INNOV PAY — STRICT Font          : Inter (Google Fonts) — importer dans layout.tsx Primary       : \#0A2463 (Bleu foncé) Accent        : \#EA580C (Orange) Success       : \#15803D (Vert) Warning       : \#92400E (Ambre) Error         : \#B91C1C (Rouge) Background    : \#F8FAFC (gris très clair) Card BG       : \#FFFFFF Border        : \#E5E7EB Gray text     : \#6B7280 Radius card   : 12px Radius btn    : 6px Shadow card   : 0 1px 3px rgba(0,0,0,0.08) STRUCTURE DU PROJET Crée le layout principal : sidebar fixe 220px dark \+ zone centrale fluide. La sidebar (\#0A2463) contient :   Logo : 'Innov' blanc bold \+ 'Pay' \#EA580C bold 20px   Numéro de compte du marchand (masqué, style PayDunya)   Navigation :     LayoutDashboard   'Tableau de bord'     ShoppingCart      'Gérer ma boutique'     Send              'Envoyer de l argent'     FileText          'Demander un paiement'     RefreshCw         'Collecter des paiements'     ArrowDownToLine   'Débourser des paiements'     QrCode            'InnovQR'  ← badge 'New' orange     Code2             'Intégrez notre API'     Users             'Gestion des rôles'     BarChart2         'Analytics'  ← badge 'New' orange     Wallet            'Recharger le compte' (avec chevron)     CreditCard        'Retirer l argent'   Bouton '\<' réducteur sidebar   Footer sidebar : avatar initiales \+ nom marchand \+ chevron TOPBAR (bg blanc, border-bottom, h-48px) :   Bandeau alerte : 'Veuillez confirmer votre email : \[email\] Renvoyer le mail'   Cloche Bell \+ avatar \+ nom marchand en haut à droite Item nav inactif : text \#9CA3AF, hover bg \#1E3A8A Item nav actif : bg \#EA580C text blanc radius 6px Icônes : Lucide React uniquement. TypeScript strict. |
| :---- |

| ✅  Résultats attendus Layout 3 colonnes responsive opérationnel Sidebar navigable avec tous les items Design system Inter/\#0A2463/\#EA580C appliqué Topbar avec bandeau alerte email comme PayDunya |
| :---- |

| PROMPT 2  ·  Tableau de Bord Principal — Clone PayDunya Amélioré | Durée 4-5h | Priorité CRITIQUE |
| :---- | :---: | :---: |

| Crée la page principale /dashboard du tableau de bord Innov Pay. Design system Innov Pay : Inter, \#0A2463, \#EA580C, \#F8FAFC. ONGLETS PAYS (comme PayDunya multi-pays) Onglets pills horizontaux scrollables :   🇹🇩 Tchad (actif — bg \#0A2463 text blanc)   🇨🇲 Cameroun  🇬🇦 Gabon  🇨🇬 Congo  🇨🇫 RCA  🇬🇶 Guinée Éq. Sous-onglets : 'État actuel du compte' | 'Transactions récentes' | 'Paiements dus/en attente (0)' 4 CARDS SOLDES (grid 4 cols, bg blanc, border, radius 12px) Card 1 : 'Solde Principal TD' — montant en FCFA XAF bold 22px Card 2 : 'Solde Opération TD' — montant FCFA Card 3 : 'Débits (7 derniers jours) TD' — montant rouge si \> 0 Card 4 : 'Crédits (7 derniers jours) TD' — montant vert si \> 0 GRAPHIQUE TRANSACTIONS (Recharts AreaChart) Titre : 'Vos récentes transactions' width: '100%', height: 280 XAxis : dates sur 7 jours (5 Juin → 12 Juin) Deux courbes : Reçus (vert \#15803D) \+ Envoyés (rouge \#B91C1C) Area fill avec gradient 10% opacité Légende en bas : ● Reçus ● Envoyés Tooltip bg blanc, radius 8px, shadow BOUTON CACHER/AFFICHER DÉTAILS Bouton haut droit : 'Cacher les détails du compte ⊗' Toggle qui masque les montants avec \*\*\* (comme PayDunya) SECTION TRANSACTIONS RÉCENTES (onglet 2\) Tableau : Date | Description | Montant | Opérateur | Statut 10 lignes dummy avec données tchadiennes réalistes Statuts pill : Succès vert | Échoué rouge | En attente jaune SECTION PAIEMENTS DUS (onglet 3\) Empty state : illustration \+ 'Aucun paiement dû pour le moment.' Données dummy connectées à l'API : GET /dashboard/stats?country=TD Loading skeleton sur toutes les cards. Données en XAF. |
| :---- |

| ✅  Résultats attendus Dashboard clone PayDunya avec onglets multi-pays 4 cards soldes avec toggle masquer/afficher Graphique Recharts Reçus/Envoyés sur 7 jours 3 onglets fonctionnels : état compte / transactions / paiements dus |
| :---- |

| PROMPT 3  ·  WebPay \+ MobPay \+ SoftPay — Les 3 APIs de Collecte | Durée 5-6h | Priorité CRITIQUE |
| :---- | :---: | :---: |

| Crée les 3 modes de collecte de paiement d'Innov Pay (comme PayDunya). Design : Inter, \#0A2463, \#EA580C. MODE 1 — WEBPAY (avec redirection) Page de paiement externe hébergée par Innov Pay. Le marchand crée une facture → Innov Pay génère une URL de checkout. URL format : https://pay.innovpay.td/checkout/{token} Page de checkout (côté client — page publique) :   Logo Innov Pay \+ Nom du marchand \+ Montant en FCFA grand et clair   Description de la commande   Sélecteur de méthode : Airtel Money | Moov Money | Orange Money | Visa/MC   Input numéro de téléphone ou données carte   Bouton 'Payer {montant} FCFA' bg \#0A2463 100% radius 8px   Après paiement → redirect vers return\_url du marchand   Page légère \< 300Ko — fonctionnel sur 2G MODE 2 — MOBPAY (USSD Push — sans redirection) L'API déclenche un USSD Push directement sur le téléphone du client. POST /v1/payments/mobpay avec body : { amount, phone, operator, reference } Réponse : { status: 'PENDING', transaction\_id, ussd\_code } Le client reçoit une notification sur son téléphone et tape son PIN Webhook envoyé au marchand quand le client confirme Endpoint status : GET /v1/payments/{transaction\_id}/status Polling recommandé toutes les 3 secondes pendant 2 minutes max MODE 3 — SOFTPAY (sans redirection, sans USSD — pour cartes PCI-DSS) POST /v1/payments/softpay Body : { amount, card\_number, card\_cvv, card\_expired\_month, card\_expired\_year, token } Disponible uniquement pour marchands certifiés PCI-DSS (activation manuelle admin) Retour : { success, transaction\_id, fees, currency: 'XAF' } OPTION 'FRAIS PAY PAR LE CLIENT' Dans les paramètres du marchand, option toggle :   'Faire supporter les frais par le client' (comme PayDunya)   Si activé : le client voit montant \+ frais (ex: 10 000 \+ 200 FCFA de frais)   Si désactivé : le marchand supporte les 2% Crée aussi :   GET /v1/fees?amount=10000\&method=mobile — calcul des frais avant paiement   POST /v1/refunds — remboursement total ou partiel Tests unitaires pour les 3 modes. Documentation Swagger complète. |
| :---- |

| ✅  Résultats attendus Page checkout WebPay publique \< 300Ko (fonctionnel 2G Tchad) API MobPay USSD Push (sans redirection) API SoftPay carte bancaire (PCI-DSS) Option frais supportés par le client comme PayDunya Endpoint /v1/fees pour calcul préalable |
| :---- |

| PROMPT 4  ·  Lien de Paiement \+ Demande par SMS/Email | Durée 3-4h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée le système de liens de paiement et demandes d'Innov Pay. Équivalent PayDunya 'Demander un paiement'. Design : Inter, \#0A2463, \#EA580C. PAGE 'DEMANDER UN PAIEMENT' Formulaire principal (card bg blanc, radius 12px, padding 24px) :   Titre de la demande (ex: 'Facture Mars 2026')   Description optionnelle (textarea)   Montant en FCFA (input avec formatage automatique)   Date limite de paiement (date picker optionnel)   Canal d'envoi : SMS | Email | WhatsApp | Les deux   Numéro / email du destinataire   Toggle 'Frais supportés par le client'   Bouton 'Envoyer la demande' bg \#0A2463 MODÈLES RÉUTILISABLES ★ Section 'Mes modèles' (innovation vs PayDunya) :   Sauvegarder un formulaire comme modèle nommé   Réutiliser en 1 clic (ex: 'Frais scolaires Terminale' \= même montant chaque mois)   CRUD des modèles ENVOI GROUPÉ ★ Bouton 'Envoi groupé' :   Upload CSV avec colonnes : nom, téléphone, email, montant (optionnel)   Prévisualisation des 10 premiers contacts   Envoi à tous en 1 clic   Rapport : X envoyés / Y échoués PAGE DES LIENS DE PAIEMENT Liste de tous les liens créés :   Tableau : Titre | Montant | Créé le | Expiré le | Clics | Payé ? | Actions   Bouton Copier le lien | Partager WhatsApp | Désactiver | Supprimer   Filtres : Actifs / Expirés / Payés LIEN PUBLIC (/pay/{token}) Page publique minimaliste :   Logo Innov Pay \+ Nom marchand \+ Montant \+ Description   Si expiré : 'Ce lien a expiré.'   Si déjà payé : 'Ce paiement a déjà été effectué.'   Sinon : sélection opérateur \+ paiement POST /v1/payment-links — créer GET /v1/payment-links/{id} — consulter DELETE /v1/payment-links/{id} — désactiver GET /pay/{token} — page publique (pas d'auth) |
| :---- |

| ✅  Résultats attendus Formulaire de demande de paiement complet Modèles réutilisables — innovation vs PayDunya Envoi groupé CSV jusqu'à 1000 contacts Page publique /pay/{token} \< 200Ko compatible 2G |
| :---- |

| PROMPT 5  ·  InnovQR — Système QR Code de Paiement | Durée 3-4h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée InnovQR, le système de QR code de paiement d'Innov Pay. Équivalent amélioré du OneQR de PayDunya. Design : Inter, \#0A2463, \#EA580C. PAGE INNOVQR Header : 'InnovQR' \+ badge 'Nouveau' orange \+ description courte GÉNÉRATION DU QR CODE Chaque marchand a un QR code unique et permanent. QR code encode : https://pay.innovpay.td/qr/{merchant\_code} Le QR code est personnalisable :   Logo du marchand au centre (upload optionnel)   Couleur du QR (primaire \= \#0A2463 par défaut)   Nom du marchand sous le QR Utiliser la librairie 'qrcode' (npm) côté backend pour générer en PNG/SVG. Endpoint : GET /v1/merchants/{id}/qr?format=png|svg FONCTIONNEMENT Un client scanne le QR avec son téléphone : 1\. Ouvre https://pay.innovpay.td/qr/{merchant\_code} 2\. Voit : Nom du marchand \+ champ 'Montant à payer' (si non fixé) 3\. Sélectionne son opérateur (Airtel/Moov/Orange) 4\. Entre son numéro \+ valide avec PIN 5\. Reçoit confirmation SMS \+ le marchand reçoit une notification push Optionnel : QR avec montant fixe (ex: boutique qui affiche le prix) URL format : /qr/{merchant\_code}?amount=5000 ANALYTICS QR ★ Tableau dans le dashboard :   Nombre de scans ce mois | Total payé via QR | Taux de conversion (scanné → payé)   Graphique scans par jour sur 30 jours (Recharts LineChart)   Top heures de scan (heatmap simple) TÉLÉCHARGEMENT Boutons : 'Télécharger PNG' | 'Télécharger SVG' | 'Imprimer' Format imprimable : A4 avec instructions en français et en arabe Backend : POST /v1/qr/generate, GET /v1/qr/{code}/analytics Page publique : GET /qr/{merchant\_code} (sans auth) |
| :---- |

| ✅  Résultats attendus QR code unique et permanent par marchand QR personnalisable avec logo \+ couleur Page scan publique compatible mobile Analytics QR : scans, taux conversion, heatmap heures Export PNG/SVG/PDF imprimable avec instructions arabe+français |
| :---- |

| PROMPT 6  ·  MassePay — Déboursement de Masse | Durée 4-5h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée MassePay, le système de déboursement de masse d'Innov Pay. Plus puissant que PayDunya PER. Design : Inter, \#0A2463, \#EA580C. Cas d'usage : salaires, bourses, remboursements ONG, distributions d'argent. PAGE 'DÉBOURSER DES PAIEMENTS' Deux onglets : 'Envoi unitaire' | 'Envoi en masse ★' ONGLET ENVOI UNITAIRE (comme PayDunya PER) Formulaire : opérateur \+ numéro bénéficiaire \+ montant \+ description Vérification solde avant envoi POST /v1/payouts/single ONGLET ENVOI EN MASSE ★ Étape 1 — Upload CSV :   Zone drag & drop pour fichier CSV   Template CSV téléchargeable : nom,téléphone,opérateur,montant,note   Validation automatique : format téléphone, opérateur valide, montant \> 0   Prévisualisation tableau des 10 premières lignes   Erreurs surlignées en rouge avec explication Étape 2 — Validation :   Résumé : X bénéficiaires | Total : Y FCFA | Solde dispo : Z FCFA   Si solde insuffisant : erreur rouge \+ lien 'Recharger le compte'   Confirmation avec code PIN ou mot de passe Étape 3 — Exécution en temps réel :   Barre de progression : '247/1000 envoyés'   Tableau live : nom | statut (envoyé/échec/en attente) | transaction\_id   Statuts en temps réel via WebSocket ou polling 2s   Pause/Reprendre possible Étape 4 — Rapport final :   X envoyés avec succès | Y échoués | Montant total débité   Tableau détaillé téléchargeable en CSV   Bouton 'Réessayer les échecs' BACKEND POST /v1/payouts/bulk — créer un lot GET /v1/payouts/bulk/{batchId} — statut du lot POST /v1/payouts/bulk/{batchId}/retry — réessayer les échecs Traitement via BullMQ : max 10 envois simultanés, retry 3 fois sur échec Timeout par transaction : 30 secondes Log complet de chaque transaction dans la table payout\_items |
| :---- |

| ✅  Résultats attendus Envoi unitaire PER opérationnel MassePay CSV jusqu'à 1000 bénéficiaires Validation en temps réel avec erreurs surlignées Barre de progression live via polling Rapport CSV téléchargeable avec statut par bénéficiaire |
| :---- |

| PROMPT 7  ·  AutoCollect — Collecte Récurrente | Durée 4-5h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée AutoCollect, le système de collecte récurrente d'Innov Pay. Cas d'usage prioritaires au Tchad : frais scolaires, cotisations associations, abonnements. Design : Inter, \#0A2463, \#EA580C. PAGE 'COLLECTER DES PAIEMENTS' Onglets : 'Mes collectes' | 'Créer une collecte' | 'Historique' CRÉER UNE COLLECTE Formulaire :   Nom de la collecte (ex: 'Frais scolaires Terminale 2026-2027')   Type : Ponctuelle | Récurrente mensuelle | Récurrente trimestrielle | Libre   Montant : fixe OU libre (le client choisit le montant)   Date de début \+ Date limite (optionnel)   Liste de bénéficiaires : upload CSV ou saisie manuelle   Message de rappel personnalisé (SMS/WhatsApp/Email)   Fréquence des rappels : 7j avant \+ 3j avant \+ jour J \+ X jours après TABLEAU DE SUIVI Vue par collecte :   Barre de progression : '47/120 payé — 352 500 FCFA / 900 000 FCFA objectif'   Liste des membres : Nom | Téléphone | Statut | Date paiement | Montant   Statuts : Payé vert | En attente jaune | En retard rouge | Exempté gris   Boutons par membre : Marquer comme payé manuellement | Envoyer rappel | Exempter RELANCE AUTOMATIQUE ★ Système de relance configurable :   Canal : SMS (+235...) | WhatsApp | Email   Message template avec variables : {nom}, {montant}, {date\_limite}, {collecte}   Envoi automatique via CRON Supabase/NestJS scheduler   Log des relances envoyées PAGE DÉTAIL COLLECTE Stats : Total collecté | % de l'objectif | Nb payants | Nb en retard Graphique donut : payé / en attente / en retard Export Excel avec toutes les données Lien public partageable pour que les membres paient directement Backend : POST /v1/collections — créer GET /v1/collections/{id}/members — liste avec statuts POST /v1/collections/{id}/remind — déclencher relance manuelle CRON quotidien : vérifier les retards et envoyer rappels automatiques |
| :---- |

| ✅  Résultats attendus AutoCollect avec 4 types de fréquence Upload CSV des membres Relance automatique SMS/WhatsApp/Email configurable Tableau de suivi avec statut par membre Export Excel \+ lien public de paiement |
| :---- |

| PROMPT 8  ·  Gestion des Rôles — Multi-utilisateurs | Durée 3-4h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée le système de gestion des rôles d'Innov Pay. Plus granulaire que PayDunya 'Gestion des rôles'. Design : Inter, \#0A2463, \#EA580C. PAGE 'GESTION DES RÔLES' Header : 'Mon équipe' \+ bouton 'Inviter un membre' 5 RÔLES DISPONIBLES ★ (vs 1 chez PayDunya) Super Admin  : accès total, peut tout faire, gère les autres membres Admin        : accès total sauf supprimer le compte ou changer le plan Comptable    : voir les transactions, exporter, demander des retraits, pas d'API Caissier     : créer des demandes de paiement, lancer MassePay, pas de paramètres Développeur  : accès API keys, webhooks, logs — pas aux finances INVITATION Modal 'Inviter un membre' :   Email de la personne   Sélection du rôle (dropdown avec description de chaque rôle)   Bouton 'Envoyer l invitation'   La personne reçoit un email avec lien d'activation LISTE DES MEMBRES Tableau : Avatar initiales | Nom | Email | Rôle pill coloré | Statut | Dernière connexion | Actions Actions : Modifier le rôle | Suspendre | Supprimer Confirmation modal avant suppression JOURNAL DES ACTIONS ★ Log de toutes les actions par membre :   Tableau : Date | Membre | Action | Détail | IP   Exemples : 'Ahmed a créé un lien de paiement de 50 000 FCFA'              'Fatima a téléchargé le rapport transactions de mai 2026'              'Hassan a modifié l URL de webhook' Filtres par membre, par type d'action, par période Export CSV du journal PERMISSIONS PAR ROUTE (middleware NestJS) Guard RoleGuard avec décorateur @Roles('ADMIN', 'COMPTABLE') Appliquer sur tous les endpoints selon le tableau de permissions 401 avec message explicite si permission insuffisante Test : connexion avec rôle Caissier → les menus API et Analytics sont cachés |
| :---- |

| ✅  Résultats attendus 5 rôles granulaires (vs 1 chez PayDunya) Système d'invitation par email Journal d'audit complet par membre Guards NestJS par rôle sur tous les endpoints Menus conditionnels côté frontend selon le rôle |
| :---- |

| PROMPT 9  ·  Analytics Avancé — Tableau de Bord Business | Durée 4-5h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée la page Analytics avancée d'Innov Pay. Plus complète que PayDunya. Design : Inter, \#0A2463, \#EA580C. Recharts. PAGE ANALYTICS Header : 'Analytics' \+ sélecteur période (7j/30j/3m/1an/custom) Onglets : Transactions | Revenus | Opérateurs | Clients | Performances ONGLET TRANSACTIONS KPIs 4 cards :   Total transactions | Taux de succès % | Volume FCFA | Ticket moyen FCFA AreaChart pleine largeur :   Courbes : Réussies (vert) \+ Échouées (rouge) \+ En attente (jaune)   XAxis : dates, YAxis : nombre de transactions   Tooltip détaillé au survol ONGLET REVENUS BarChart : Revenus par mois sur 12 mois Cards : Revenus ce mois | Projections fin de mois | Croissance MoM % Breakdown : Collecte vs Déboursement vs Commissions ONGLET OPÉRATEURS ★ Donut chart : répartition des transactions par opérateur   Airtel Money : X% | Moov Money : Y% | Orange : Z% | Visa : W% Tableau comparatif : taux de succès par opérateur, temps moyen de confirmation Alerte si un opérateur a taux de succès \< 90% ONGLET CLIENTS Top 10 clients par volume (téléphone masqué \+235 ●● ●● ●●) Nouveaux clients cette semaine vs semaine précédente Carte de chaleur : heures de transaction (heatmap 7j × 24h) ONGLET PERFORMANCES ★ Temps moyen de confirmation par opérateur (en secondes) Taux de conversion lien de paiement (envoyé → payé) Taux de succès InnovQR (scanné → payé) SLA uptime Innov Pay (calculé depuis les logs) EXPORT Bouton 'Télécharger le rapport PDF' : génère un PDF A4 avec tous les graphiques Bouton 'Exporter CSV' : données brutes de la période sélectionnée Rapport PDF automatique le 1er du mois par email (configurable) Backend : GET /v1/analytics/summary, GET /v1/analytics/operators, GET /v1/analytics/transactions?from=\&to=\&group\_by=day|week|month |
| :---- |

| ✅  Résultats attendus 5 onglets analytics : Transactions, Revenus, Opérateurs, Clients, Performances Recharts AreaChart \+ BarChart \+ Donut \+ Heatmap Heatmap heures de transaction Export PDF auto mensuel par email Alertes taux de succès opérateur \< 90% |
| :---- |

| PROMPT 10  ·  KYC Avancé \+ Conformité CEMAC | Durée 4-5h | Priorité BLOQUANT |
| :---- | :---: | :---: |

| Crée le système KYC avancé d'Innov Pay pour la conformité BEAC/COBAC. Design : Inter, \#0A2463, \#EA580C. PAGE KYC / CONFORMITÉ Stepper horizontal 5 étapes avec statut visuel : 1\. Informations entreprise ← (en cours si non complété) 2\. Documents légaux 3\. Responsable légal 4\. Comptes bancaires 5\. Validation (review par équipe Innov Pay) ÉTAPE 1 — INFORMATIONS ENTREPRISE Formulaire :   Raison sociale | Forme juridique (SARL/SA/Association/ONG)   NIF tchadien (format : NIF-XXXXXXXX-X)   RCCM (format : TC/NJM/XX/B/XXXX)   Secteur d'activité (dropdown : Commerce/Éducation/Santé/Tech/Autre)   Adresse complète N'Djaména | Téléphone entreprise | Site web   Pays d'opération (Tchad par défaut \+ extension CEMAC) ÉTAPE 2 — DOCUMENTS LÉGAUX Upload pour chaque document (drag & drop, max 10Mo, PDF/JPG/PNG) :   RCCM (obligatoire)   NIF / Attestation fiscale (obligatoire)   Statuts de la société (obligatoire pour SA/SARL)   Justificatif de domicile entreprise   Autorisation d'exercer (pour secteurs réglementés) Chaque document : statut PENDING | VALIDÉ ✓ | REJETÉ ✗ (avec raison) Stockage sécurisé sur Cloudflare R2 (jamais public) ÉTAPE 3 — RESPONSABLE LÉGAL   Nom complet | CNI nationale tchadienne (upload recto/verso)   Date de naissance | Nationalité   Photo selfie avec CNI (upload optionnel, recommandé) ÉTAPE 4 — COMPTES BANCAIRES   Nom de la banque (UBA/Ecobank/Orabank/Autre)   Numéro de compte | Code BIC/SWIFT   Relevé bancaire récent (3 derniers mois — upload)   Compte mobile money professionnel (optionnel) ÉTAPE 5 — VALIDATION Délai affiché : 'Délai de vérification : 24 à 48h ouvrables' Statuts : En attente de review | En cours de vérification | Validé ✓ | Rejeté Si rejeté : raison précise \+ liste des documents à corriger Email automatique à chaque changement de statut BACK-OFFICE ADMIN — VALIDATION KYC Liste des dossiers KYC en attente avec priorité Vue détaillée : tous les documents en plein écran Actions : Valider tout | Rejeter avec raison | Demander un document manquant Log des validations dans audit\_log |
| :---- |

| ✅  Résultats attendus Stepper KYC 5 étapes adapté aux documents tchadiens (NIF, RCCM format TC/NJM) Upload sécurisé Cloudflare R2 privé Statut par document avec raison de rejet Interface admin de validation KYC Emails automatiques à chaque changement de statut |
| :---- |

| PROMPT 11  ·  API Gateway Complète \+ Documentation Développeurs | Durée 5-6h | Priorité CRITIQUE |
| :---- | :---: | :---: |

| Crée la page 'Intégrez notre API' et complète l'API gateway d'Innov Pay. Design : Inter, \#0A2463, \#EA580C. PAGE 'INTÉGREZ NOTRE API' Onglets : 'Mes applications' | 'Documentation' | 'Logs API' | 'Playground ★' ONGLET MES APPLICATIONS Bouton 'Créer une application' → modal :   Nom de l'application   URL de callback (webhook)   Mode : Sandbox | Production   Canaux activés : Airtel ☑ Moov ☑ Orange ☑ Visa ☑ Pour chaque app créée :   Clé publique : pk\_live\_XXXX ou pk\_test\_XXXX   Clé secrète : sk\_live\_XXXX (masquée, bouton révéler 5s)   Bouton 'Régénérer la clé secrète' avec confirmation 'CONFIRMER'   Toggle activation/désactivation ONGLET LOGS API Tableau des 50 derniers appels :   Timestamp | Méthode | Endpoint | Statut HTTP | Durée | IP   Filtre : 2xx / 4xx / 5xx / Tous   Clic sur une ligne → détail complet : headers \+ body request \+ response ONGLET PLAYGROUND ★ (innovation vs PayDunya) Interface style Swagger interactive directement dans le dashboard :   Sélecteur endpoint : POST /v1/payments | GET /v1/payments/{id} | POST /v1/payouts...   Éditeur JSON du body (CodeMirror ou textarea monospace)   Bouton 'Tester' → appel réel en sandbox   Réponse JSON formatée avec highlight   Bouton 'Copier le code' → snippets PHP/JS/Python auto-générés ENDPOINTS COMPLETS À IMPLÉMENTER POST   /v1/payments                 — créer un paiement GET    /v1/payments/{id}            — statut d'un paiement POST   /v1/payments/mobpay          — USSD Push POST   /v1/payments/softpay         — carte bancaire POST   /v1/refunds                  — remboursement POST   /v1/payouts/single           — déboursement unitaire POST   /v1/payouts/bulk             — déboursement masse POST   /v1/payment-links            — créer un lien GET    /v1/payment-links/{id}       — détail lien POST   /v1/collections              — créer collecte GET    /v1/collections/{id}/stats   — stats collecte GET    /v1/fees                     — calculer les frais GET    /v1/merchants/me             — profil marchand GET    /v1/analytics/summary        — stats GET    /health                      — santé API Tous les endpoints : auth Bearer pk\_live\_XXX, rate limit, logs, Swagger auto. SDK généré automatiquement depuis la spec OpenAPI. Page docs publique : https://docs.innovpay.td (Next.js MDX) |
| :---- |

| ✅  Résultats attendus Page 'Mes applications' avec gestion clés API sandbox/production Logs API avec détail request/response Playground interactif avec snippets PHP/JS/Python 15 endpoints documentés \+ Swagger SDK auto-généré depuis OpenAPI |
| :---- |

| PROMPT 12  ·  Plugins WooCommerce \+ PrestaShop | Durée 3-4h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée les plugins WooCommerce et PrestaShop pour Innov Pay. Ces plugins permettent d'intégrer Innov Pay en 5 minutes sans coder. PLUGIN WOOCOMMERCE (PHP) Fichier : innov-pay-woocommerce/innov-pay.php class WC\_InnovPay\_Gateway extends WC\_Payment\_Gateway {   public function \_\_construct() {     $this-\>id \= 'innov\_pay';     $this-\>method\_title \= 'Innov Pay';     $this-\>method\_description \= 'Airtel Money, Moov Money, Orange Money, Visa — Tchad';     $this-\>has\_fields \= false;     $this-\>init\_form\_fields();     $this-\>init\_settings();   }   public function init\_form\_fields() {     $this-\>form\_fields \= \[       'enabled'    \=\> \['title' \=\> 'Activer', 'type' \=\> 'checkbox'\],       'public\_key' \=\> \['title' \=\> 'Clé publique Innov Pay', 'type' \=\> 'text'\],       'secret\_key' \=\> \['title' \=\> 'Clé secrète Innov Pay', 'type' \=\> 'password'\],       'mode'       \=\> \['title' \=\> 'Mode', 'type' \=\> 'select',                        'options' \=\> \['sandbox' \=\> 'Sandbox', 'production' \=\> 'Production'\]\],     \];   }   public function process\_payment($order\_id) {     $order \= wc\_get\_order($order\_id);     $response \= wp\_remote\_post('https://api.innovpay.td/v1/payments', \[       'headers' \=\> \['Authorization' \=\> 'Bearer ' . $this-\>public\_key,                     'Content-Type' \=\> 'application/json'\],       'body' \=\> json\_encode(\[         'amount'      \=\> $order-\>get\_total(),         'currency'    \=\> 'XAF',         'reference'   \=\> 'WC-' . $order\_id,         'return\_url'  \=\> $this-\>get\_return\_url($order),         'cancel\_url'  \=\> wc\_get\_cart\_url(),         'description' \=\> 'Commande \#' . $order\_id,       \])     \]);     $data \= json\_decode(wp\_remote\_retrieve\_body($response), true);     return \['result' \=\> 'success', 'redirect' \=\> $data\['checkout\_url'\]\];   }   public function handle\_webhook() {     // Vérification signature HMAC \+ mise à jour statut commande   } } PLUGIN PRESTASHOP (PHP) Fichier : modules/innovpay/innovpay.php Même logique : extends PaymentModule Page de configuration : clé publique \+ clé secrète \+ mode Afficher dans checkout : bouton 'Payer avec Innov Pay' PAGE TÉLÉCHARGEMENT PLUGINS Dans le dashboard, section 'Plugins & Intégrations' :   Card WooCommerce : logo \+ 'Télécharger le plugin' \+ guide d'installation PDF   Card PrestaShop : logo \+ 'Télécharger le module' \+ guide PDF   Card API directe : lien vers documentation   Card Zapier ★ : 'Bientôt disponible' badge Les deux plugins sont packagés en .zip téléchargeable depuis le dashboard. |
| :---- |

| ✅  Résultats attendus Plugin WooCommerce PHP complet avec settings admin Plugin PrestaShop complet Vérification HMAC webhook dans les deux plugins Page téléchargement plugins dans le dashboard Guides PDF installation en français |
| :---- |

| PROMPT 13  ·  Back Office Super Admin Complet | Durée 5-6h | Priorité CRITIQUE |
| :---- | :---: | :---: |

| Crée le dashboard super admin d'Innov Pay. Route /admin protégée — accessible uniquement au rôle super\_admin. Design : sidebar \#0F172A, fond \#F8FAFC, Inter. SIDEBAR ADMIN Logo Innov Pay \+ badge rouge 'ADMIN' Navigation :   LayoutDashboard    'Vue globale'   Users              'Marchands'   CreditCard         'Transactions'   Wallet             'Finances & Settlements'   ShieldCheck        'KYC — Validation'   AlertTriangle      'Fraudes & Alertes'   BarChart2          'Analytics Plateforme'   Settings           'Configuration'   FileText           'Logs Système' VUE GLOBALE — KPIs 5 cards :   MRR (Revenu mensuel récurrent) en FCFA \+ sparkline 30j   Total marchands | Marchands actifs | Marchands KYC validés   Volume transactions ce mois | Taux de succès global   Coût infrastructure | Marge nette % PAGE MARCHANDS Tableau avec filtres : statut KYC | date inscription | volume | pays Cols : Nom | RCCM | Email | Plan | KYC | Volume 30j | Statut | Actions Actions 3-dots : Voir détails | Changer plan | Suspendre | Supprimer Drawer marchand : Profil complet \+ Transactions \+ Documents KYC \+ Logs PAGE KYC — VALIDATION File d'attente des dossiers à valider (triée par date) Chaque dossier : nom entreprise \+ documents uploadés (viewer PDF/image) Actions : Valider ✓ | Rejeter avec motif | Demander un document | Reporter Historique de validation avec auditor \+ timestamp PAGE FINANCES & SETTLEMENTS Solde global de la plateforme Settlements en attente par marchand Bouton 'Déclencher le settlement' (virement vers banque marchand) Historique des settlements : date | marchand | montant | banque | statut PAGE FRAUDES & ALERTES Transactions suspectes détectées automatiquement :   Montant \> 5x le ticket moyen du marchand   Même IP pour 10+ transactions en 1h   Changement clé API \+ transaction immédiate Actions : Marquer comme fraude | Faux positif | Bloquer le marchand PAGE CONFIGURATION Taux de commission par opérateur (modifiable) Plafonds par transaction (500 000 FCFA mobile, 5M carte) Liste des opérateurs actifs \+ statut API (vert si OK, rouge si down) Feature flags : activer/désactiver InnovQR, MassePay, AutoCollect par marchand Tout loggé dans audit\_log. Téléphones masqués. Confirmation avant actions sensibles. |
| :---- |

| ✅  Résultats attendus Dashboard admin complet : marchands, KYC, finances, fraudes, config Page validation KYC avec viewer documents Détection fraudes automatique Settlement manuel par marchand Feature flags par marchand |
| :---- |

| PROMPT 14  ·  Système Notifications — Email \+ SMS \+ Push | Durée 3-4h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée le système de notifications complet d'Innov Pay. Resend pour emails, API SMS opérateur tchadien, push navigateur. 12 EMAILS AUTOMATIQUES À IMPLÉMENTER 1\. Bienvenue à l'inscription    Sujet : 'Bienvenue sur Innov Pay — Votre compte est créé'    Corps : nom, clé publique sandbox, prochaines étapes (KYC), lien dashboard 2\. Confirmation email (lien de vérification)    Lien valable 24h : https://app.innovpay.td/verify?token=XXX 3\. Paiement reçu    Sujet : 'Paiement reçu — 15 000 FCFA de \+235 66 XX XX XX'    Corps : montant, opérateur, référence, solde mis à jour 4\. Déboursement traité    Confirmation que le virement a été envoyé au bénéficiaire 5\. KYC validé → Compte production activé    Félicitations \+ clés de production \+ guide démarrage 6\. KYC rejeté    Raison détaillée \+ documents à corriger \+ lien pour renvoyer 7\. Retrait traité    Montant retiré, compte destination, délai estimé J+1 8\. Alerte sécurité (nouvelle connexion IP inconnue) 9\. Quota presque atteint (90% du plafond transaction) 10\. Rapport mensuel automatique (1er du mois) 11\. Invitation membre d'équipe 12\. Réinitialisation mot de passe (lien 1h) SMS AUTOMATIQUES (API SMS Tchad) Intégrer l'API SMS locale (Twilio en fallback) pour :   Paiement reçu (SMS marchand) : '+15 000 FCFA reçu. Ref: IP-XXXX. Solde: 45 200 FCFA'   Code OTP connexion : '123456 est votre code Innov Pay. Valable 5 minutes.'   Rappel AutoCollect : 'Cher {nom}, votre paiement de {montant} FCFA est dû le {date}.' PAGE PRÉFÉRENCES NOTIFICATIONS (dans paramètres marchand) Toggle par type de notification :   Email paiement reçu ☑ | SMS paiement reçu ☑   Email rapport mensuel ☑ | Alertes sécurité ☑   Seuil alerte : notifier si paiement \> X FCFA CENTRE DE NOTIFICATIONS (cloche en haut à droite) Dropdown avec les 10 dernières notifications Badge rouge avec compteur (non lues) Lien 'Voir toutes les notifications' → page dédiée Marquer tout comme lu Tous les emails : template HTML avec charte Innov Pay. Fire-and-forget : jamais bloquant pour les transactions. Resend API key dans .env RESEND\_API\_KEY. |
| :---- |

| ✅  Résultats attendus 12 emails automatiques avec templates HTML Innov Pay SMS automatiques (paiement reçu \+ OTP \+ rappel AutoCollect) Centre de notifications en temps réel Préférences de notification configurables par marchand Seuil d'alerte personnalisable |
| :---- |

| PROMPT 15  ·  Landing Page Marketing — Clone PayDunya Amélioré | Durée 5-6h | Priorité IMPORTANT |
| :---- | :---: | :---: |

| Crée la landing page marketing d'Innov Pay. Inspirée de paydunya.com mais adaptée au Tchad. Design : Inter, \#0A2463, \#EA580C, \#F8FAFC. Tout en français. NAVBAR FIXE Logo Innov Pay | Liens : Produits / Solutions / Tarifs / Développeurs / À propos Boutons : 'Se connecter' outline | 'Créer un compte gratuit' bg \#0A2463 Mobile : menu hamburger HERO Badge pill : '🇹🇩 Conçu pour le Tchad et la zone CEMAC' H1 60px bold : 'La digitalisation de tous vos paiements au Tchad' Sous-titre 18px gray : 'Acceptez Airtel Money, Moov Money, Orange Money et les cartes bancaires en une seule intégration. Payez et recevez partout au Tchad.' 2 CTAs : 'Créer un compte gratuit' bg \#0A2463 | 'Voir la documentation →' outline Mockup dashboard animé côté droit (screenshot ou illustration SVG) TRUST BADGES 4 pills horizontaux : 🔒 PCI-DSS | ⚡ 99.9% Uptime | 🇹🇩 100% Tchadien | 📱 USSD Push PRODUITS (comme PayDunya — 6 cards) WebPay : Paiement avec redirection MobPay : USSD Push sans redirection InnovQR : QR code universel ★ MassePay : Déboursement de masse ★ AutoCollect : Collecte récurrente ★ API directe : Pour les développeurs SOLUTIONS SECTORIELLES (comme PayDunya) 3 cols avec mockup \+ texte :   Écoles & Universités — Frais scolaires récurrents, réconciliation auto   ONG & Associations — Collecte de dons, MassePay pour distributions   Commerce & E-commerce — WooCommerce plugin, lien de paiement COMPARAISON (tableau simple)   InnovPay vs CinetPay vs PayDunya (pour le Tchad)   Lignes : Couverture Tchad | USSD Push natif | Support Arabe | Prix | Tchadien TÉMOIGNAGES 3 cards : directeur école N'Djaména / commerçant Grand Marché / responsable ONG PRICING (3 plans) Gratuit : sandbox illimité \+ 1% frais en production (max 100 000 FCFA/mois) Business : 0% frais fixes \+ 1.5% par transaction (badge 'Populaire' \#EA580C) Enterprise : sur devis, SLA garanti, account manager dédié FOOTER Bg \#0A2463 | Logo blanc | Liens | 'Innov Pay © 2026 · N'Djaména, Tchad' 'Agrégateur de paiement certifié · Zone CEMAC · XAF' |
| :---- |

| ✅  Résultats attendus Landing page complète inspirée de PayDunya Hero avec badge pays \+ CTA 6 produits \+ 3 solutions sectorielles Tableau comparaison vs CinetPay vs PayDunya 3 plans tarifaires \+ footer CEMAC |
| :---- |

| P16-22 |   Prompts Supplémentaires — Récapitulatif |
| :---: | :---- |

| \# | Prompt | Ce qu'il fait | Instruction clé |
| ----- | :---- | :---- | :---- |
| **P16** | **Auth OTP SMS \+ JWT** | Login par SMS OTP (comme PayDunya). Supabase Auth ou JWT custom. Rate limit 3/10min. Redirect dashboard après auth. | *Implémenter aussi le flow inscription : nom, email, téléphone, RCCM optionnel* |
| **P17** | **Railway \+ Redis \+ Migrations** | Migrer le backend vers Railway (serveur persistant). Connecter Redis pour BullMQ. Configurer les variables d'env prod. | *Copier .env.production.example dans le projet. Tester /health après déploiement.* |
| **P18** | **Storage KYC Cloudflare R2** | Remplacer les chemins fictifs KYC par de vrais uploads sur Cloudflare R2 privé. URLs signées expirantes 1h. | *max 10Mo par fichier, types pdf/jpg/png uniquement, isolation par merchantId* |
| **P19** | **Intégration Airtel Money Tchad** | Remplacer la simulation Airtel par la vraie API (OAuth2 \+ USSD Push). Vérification signature webhook. | *Nécessite credentials Airtel. Utiliser X-Country: TD et X-Currency: XAF* |
| **P20** | **Intégration Moov \+ Orange Tchad** | Même travail pour Moov Money et Orange Money Tchad. Toggle sandbox/production. | *Sélection opérateur automatique par préfixe numéro tchadien (+235 60-64=Airtel, 65-69=Moov, 90-95=Orange)* |
| **P21** | **Pages manquantes \+ Polish** | Finaliser les pages : Recharger le compte / Retirer l'argent / Paramètres généraux / Comptes bancaires. Toasters, skeletons, erreurs réseau. | *Connecter toutes les pages à l'API réelle. 401 → redirect login automatique.* |
| **P22** | **Tests \+ SEO \+ Production** | Tests E2E Playwright sur les flows critiques. SEO meta tags. Sitemap.xml. robots.txt. Variable PAYMENT\_MODE=production. | *Tester paiement complet sandbox → confirmer via webhook → mise à jour statut → email automatique* |

| FIN |   Récapitulatif — 22 Prompts, Budget, Roadmap |
| :---: | :---- |

| 22 Prompts dans l'ordre P1  — Design System \+ Layout P2  — Tableau de bord clone PayDunya P3  — WebPay \+ MobPay \+ SoftPay P4  — Liens de paiement \+ Demandes P5  — InnovQR (QR Code) ★ P6  — MassePay (déboursement masse) ★ P7  — AutoCollect (collecte récurrente) ★ P8  — Gestion des rôles avancée ★ P9  — Analytics avancé ★ P10 — KYC Avancé \+ Conformité CEMAC P11 — API Gateway \+ Documentation P12 — Plugins WooCommerce \+ PrestaShop ★ P13 — Back Office Super Admin P14 — Notifications Email \+ SMS \+ Push P15 — Landing Page Marketing P16 — Auth OTP SMS P17 — Railway \+ Redis P18 — Storage KYC R2 P19 — Airtel Money Tchad P20 — Moov \+ Orange Tchad P21 — Pages manquantes \+ Polish P22 — Tests \+ Production | Budget & Timeline Coût infrastructure mensuel : Railway (backend \+ Redis) : \~5$/mois \= 3 000 FCFA Neon PostgreSQL : 0$ (gratuit \< 10 Go) Cloudflare R2 (KYC) : 0$ (gratuit \< 10 Go) Vercel Frontend : 0$ (gratuit) Resend emails : 0$ (100/jour gratuit) TOTAL : \~5$/mois pour aller en production Timeline estimée : P1 à P5 : semaine 1 (fondations \+ features core) P6 à P10 : semaine 2 (features avancées) P11 à P15 : semaine 3 (API, plugins, admin, landing) P16 à P22 : semaine 4 (infra, opérateurs, production) Total : 3 à 4 semaines de développement |
| :---- | :---- |

| 🎯  Verdict — Innov Pay vs PayDunya au Tchad PayDunya couvre 6 pays XOF (Afrique de l'Ouest). Le Tchad est en zone XAF — PayDunya n'y est pas présent. Innov Pay reproduit 100% de PayDunya ET ajoute 6 features exclusives : InnovQR, MassePay, AutoCollect, multi-rôles avancé, analytics détaillé, support arabe tchadien. Avec les 22 prompts de ce document, Innov Pay est en production en 4 semaines pour \~5$/mois d'infra. Le seul chantier non technique restant : accords opérateurs Airtel/Moov/Orange Tchad \+ adossement bancaire UBA ou Ecobank. |
| :---- |

| Innov Pay — One API. Every Payment.  ·  Document Confidentiel — Juin 2026  ·  Tchad & Zone CEMAC |
| :---: |

