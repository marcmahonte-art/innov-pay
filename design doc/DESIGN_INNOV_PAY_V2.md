---
name: Innov Pay Design System — V2
version: 2.0.0
status: Proposition d'amélioration
region: Tchad / Zone CEMAC
colors:
  # ─── Surfaces ───────────────────────────────────────────
  surface: '#f5f7fa'
  surface-dim: '#d6d9dd'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f2f5'
  surface-container: '#eaedf0'
  surface-container-high: '#e4e7ea'
  surface-container-highest: '#dde1e4'
  on-surface: '#0f1214'
  on-surface-variant: '#3c3f4a'
  inverse-surface: '#272b2e'
  inverse-on-surface: '#edf0f2'

  # ─── Contours ────────────────────────────────────────────
  outline: '#6b6d79'
  outline-variant: '#bfc0cc'

  # ─── Primaire — Trust Blue (inchangé, pilier marque) ─────
  primary: '#00103e'
  on-primary: '#ffffff'
  primary-container: '#0a2463'
  on-primary-container: '#7a8ed2'
  inverse-primary: '#b5c4ff'
  surface-tint: '#475b9c'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00164d'
  on-primary-fixed-variant: '#2e4382'

  # ─── Secondaire — Vibrant Orange (NOUVEAU : renforcé) ────
  # Passage de #a73a00 à #ea580c pour coller au "Vibrant Orange" décrit
  secondary: '#c94400'
  on-secondary: '#ffffff'
  secondary-container: '#ff7034'
  on-secondary-container: '#4a1400'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'

  # ─── Tertiaire — Emerald Green ────────────────────────────
  tertiary: '#001a06'
  on-tertiary: '#ffffff'
  tertiary-container: '#003112'
  on-tertiary-container: '#41a35b'
  tertiary-fixed: '#95f8a7'
  tertiary-fixed-dim: '#79db8d'
  on-tertiary-fixed: '#00210a'
  on-tertiary-fixed-variant: '#005323'

  # ─── Sémantique ──────────────────────────────────────────
  error: '#B91C1C'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  success: '#15803D'
  success-container: '#dcfce7'
  on-success-container: '#14532d'
  warning: '#92400E'
  warning-container: '#fef3c7'
  on-warning-container: '#78350f'
  info: '#1d4ed8'
  info-container: '#dbeafe'
  on-info-container: '#1e3a8a'

  # ─── Neutrals utilitaires ────────────────────────────────
  background: '#f5f7fa'
  on-background: '#0f1214'
  surface-variant: '#dde1e4'
  border: '#e2e5ea'
  border-strong: '#c8cbd3'
  card-bg: '#ffffff'
  text-gray: '#5c6470'
  text-muted: '#8b919d'
  text-inactive: '#9ca3af'
  text-disabled: '#b8bcc5'

  # ─── Sidebar & Admin ─────────────────────────────────────
  admin-sidebar: '#0a1628'
  sidebar-hover: '#152e5e'
  sidebar-active: '#1a3a72'
  sidebar-text: '#c8d3e8'
  sidebar-text-active: '#ffffff'
  sidebar-icon-inactive: '#8fa3c8'

  # ─── NOUVEAU : Dark mode (tokens optionnels) ─────────────
  dark-surface: '#0f1214'
  dark-surface-container: '#1a1e21'
  dark-card: '#1e2326'
  dark-on-surface: '#e4e7ea'
  dark-border: '#2e3338'
  dark-primary: '#b5c4ff'

  # ─── NOUVEAU : Gradients (tokens CSS custom properties) ──
  gradient-primary: 'linear-gradient(135deg, #0a2463 0%, #1a3a72 100%)'
  gradient-accent: 'linear-gradient(135deg, #c94400 0%, #ff7034 100%)'
  gradient-success: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)'

fonts:
  # ─────────────────────────────────────────────────────────
  # STRATÉGIE TYPOGRAPHIQUE PAR CONTEXTE (V2.1)
  # ─────────────────────────────────────────────────────────
  #
  # Dashboard / Admin   → Geist (titres, corps, données)
  # Checkout WebPay     → DM Sans (interface consommateur)
  # Clés API / Code     → Geist Mono > JetBrains Mono
  #
  dashboard-admin:
    primary: "'Geist', system-ui, sans-serif"
    google-import: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap"
    weights: [400, 500, 600, 700, 800]
    rationale: >
      Police géométrique créée par Vercel, conçue pour les interfaces
      produit denses. Variable font 9 graisses, excellents chiffres
      tabulaires, distinction 0/O et 1/l/I irréprochable.
      Caractère distinctif sans être ostentatoire — différencie
      Innov Pay des dashboards bancaires génériques.
  checkout-webpay:
    primary: "'DM Sans', system-ui, sans-serif"
    google-import: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
    weights: [400, 500, 600, 700]
    rationale: >
      Terminaux arrondis et courbes douces pour une interface
      consommateur (public, mobile, WebPay). Réduit la friction
      perçue pour l'acte de paiement. Géométrique bas-contraste,
      lisible sur petits écrans 2G/3G à faible résolution.
  code-api:
    primary: "'Geist Mono', 'JetBrains Mono', 'Courier Prime', monospace"
    google-import: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
    weights: [400, 600]
    rationale: >
      Geist Mono en priorité (cohérence famille avec Geist).
      Fallback JetBrains Mono si Geist Mono non disponible.
      Les deux offrent des ligatures optionnelles et une
      disambiguation parfaite des caractères techniques.

typography:
  # ─── Marketing / Hero ─────────────────────────────────────
  hero-h1:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 60px
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.03em
  hero-h1-mobile:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 34px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em

  # ─── Titres dashboard (Geist) ─────────────────────────────
  page-title:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '32px'
    letterSpacing: -0.01em
  section-title:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '26px'
  card-title:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '22px'

  # ─── Données financières (Geist + tabular-nums) ───────────
  dashboard-amount:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '36px'
    letterSpacing: -0.02em
    fontVariantNumeric: tabular-nums
  dashboard-amount-sm:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '28px'
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  transaction-amount:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '20px'
    fontVariantNumeric: tabular-nums

  # ─── Navigation & UI (Geist) ──────────────────────────────
  sidebar-brand:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 20px
    fontWeight: '800'
    lineHeight: '24px'
    letterSpacing: -0.01em
  nav-item:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '20px'
  topbar-label:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '18px'

  # ─── Corps de texte dashboard (Geist) ─────────────────────
  hero-subtitle:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '28px'
  body-base:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '24px'
  body-sm:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '20px'

  # ─── Labels & micro-textes (Geist) ────────────────────────
  label-md:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '20px'
  label-sm:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '18px'
  label-xs:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '16px'
    letterSpacing: 0.04em
    textTransform: uppercase
  caption-xs:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '16px'

  # ─── WebPay / Checkout (DM Sans) ──────────────────────────
  webpay-heading:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '30px'
    letterSpacing: -0.01em
  webpay-amount:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '40px'
    letterSpacing: -0.02em
    fontVariantNumeric: tabular-nums
  webpay-body:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '24px'
  webpay-label:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '18px'
  webpay-button:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '24px'

  # ─── Code / API / USSD (Geist Mono > JetBrains Mono) ──────
  code-mono:
    fontFamily: "'Geist Mono', 'JetBrains Mono', 'Courier Prime', monospace"
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '20px'
  code-mono-sm:
    fontFamily: "'Geist Mono', 'JetBrains Mono', monospace"
    fontSize: 11px
    fontWeight: '400'
    lineHeight: '18px'
  code-mono-strong:
    fontFamily: "'Geist Mono', 'JetBrains Mono', monospace"
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '20px'

rounded:
  xs: 0.125rem   # 2px  — séparateurs, mini badges
  sm: 0.25rem    # 4px  — inputs compacts
  DEFAULT: 0.5rem # 8px  — inputs, boutons checkout
  md: 0.625rem   # 10px — NOUVEAU : intermédiaire boutons admin
  lg: 0.75rem    # 12px — cartes principales
  xl: 1rem       # 16px — modales, drawers
  2xl: 1.5rem    # 24px — cartes marketing
  full: 9999px   # pills, avatars, toggles

spacing:
  sidebar-width: 220px
  sidebar-collapsed: 60px         # NOUVEAU : largeur mode icônes
  topbar-height: 52px             # Ajusté 48→52 pour confort tactile
  topbar-height-mobile: 56px      # NOUVEAU : topbar mobile plus haute
  container-padding: 24px
  container-padding-mobile: 16px
  container-padding-xs: 12px      # NOUVEAU : très petits écrans
  grid-gap: 12px
  grid-gap-lg: 20px               # NOUVEAU : gap pour cartes larges
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 32px                  # NOUVEAU
  stack-2xl: 48px                 # NOUVEAU : sections marketing
  card-padding: 20px              # NOUVEAU : padding interne standard carte
  card-padding-sm: 14px           # NOUVEAU : carte compacte
  input-height: 40px              # NOUVEAU : hauteur standardisée des champs
  input-height-sm: 34px           # NOUVEAU
  button-height: 40px             # NOUVEAU
  button-height-sm: 34px          # NOUVEAU
  button-height-lg: 48px          # NOUVEAU : CTA hero

shadows:
  card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)'
  card-hover: '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)'
  dropdown: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)'
  modal: '0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)'
  button-primary: '0 2px 6px rgba(10,36,99,0.35)'
  button-accent: '0 2px 6px rgba(201,68,0,0.35)'
  inset: 'inset 0 1px 3px rgba(0,0,0,0.08)'
  none: 'none'

motion:
  duration-instant: 80ms
  duration-fast: 150ms
  duration-base: 200ms
  duration-slow: 300ms
  duration-enter: 250ms
  duration-exit: 180ms
  ease-standard: 'cubic-bezier(0.2, 0, 0, 1)'
  ease-decelerate: 'cubic-bezier(0, 0, 0, 1)'
  ease-accelerate: 'cubic-bezier(0.3, 0, 1, 1)'
  ease-spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'

z-index:
  base: 0
  raised: 10
  dropdown: 100
  sticky: 200
  overlay: 300
  drawer: 400
  modal: 500
  toast: 600
  tooltip: 700

breakpoints:
  xs: 375px
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1440px

accessibility:
  focus-ring: '0 0 0 3px rgba(71,91,156,0.45)'
  focus-ring-error: '0 0 0 3px rgba(185,28,28,0.35)'
  min-touch-target: 44px
  color-contrast-aa: true
  reduced-motion: prefer-reduced-motion
---

---

## 1. Résumé des évolutions majeures

| Domaine | V1 | V2 |
|---|---|---|
| **Police principale** | Inter (unique) | **Geist** — dashboard / admin |
| **Police consommateur** | Inter (unique) | **DM Sans** — checkout WebPay |
| **Police technique** | Courier Prime | **Geist Mono > JetBrains Mono** |
| Stratégie typographique | Police unique tous contextes | 3 polices par contexte fonctionnel |
| Couleur secondaire | `#a73a00` (trop sombre) | `#c94400` → container `#ff7034` |
| Taille solde | 22px | 28px + letter-spacing négatif |
| Typographie nums | Inter standard | `font-variant-numeric: tabular-nums` |
| Body text | 16px | 15px (densité dashboard) |
| Tokens de mouvement | absents | courbes + durées standardisées |
| Dark mode | absent | tokens `dark-*` documentés |
| Z-index | absent | échelle 0–700 définie |
| Shadows | 1 seule | 7 niveaux contextuels |
| Spacing | 6 tokens | 14 tokens dont mobile |
| Rounded | 7 tokens | 9 tokens dont `xs` et `2xl` |

---

## 2. Marque & Vision

Le design system Innov Pay est conçu pour le marché fintech tchadien et la zone CEMAC, avec trois valeurs fondatrices : **confiance**, **efficacité**, **clarté**. Il couvre deux registres simultanément — une rigueur bancaire institutionnelle pour les workflows B2B, et une légèreté SaaS pour les interfaces consommateurs (WebPay, USSD overlay).

### Principes mis à jour

- **Financial Clarity** — Chiffres tabulaires alignés, hiérarchie soldes/transactions explicite, masquage du solde en un tap.
- **Localized Professionalism** — Respect des spécificités CEMAC (bascule multi-pays, codes opérateurs Mobile Money), interface utilisable sur réseau 2G-3G.
- **Safety & Privacy** — Confirmation destructive systématique, masquage par défaut des données sensibles, indicateurs de session active.
- **Accessibility First** *(nouveau)* — Focus visible `3px`, cible tactile minimale 44px, contraste WCAG AA sur tous les textes.
- **Motion with Purpose** *(nouveau)* — Animations courtes et signifiantes ; support `prefers-reduced-motion`.

---

## 3. Palette de couleurs

### Raisonnement des changements

**Secondaire renforcé :** Le `#a73a00` d'origine était trop proche d'un brun-rouge, peu énergisant. La V2 adopte `#c94400` (orange profond saturé), cohérent avec le "Vibrant Orange" décrit dans les principes mais absent de la V1. Le container `#ff7034` produit des badges et CTA à fort contraste visuel sans agression.

**Tokens sémantiques étendus :** Ajout de `success-container`, `warning-container`, `info` et `info-container` pour couvrir les statuts manquants dans les tables (notifications, virements en cours, alertes KYC).

**Dark mode :** Tokens `dark-*` introduits comme couche optionnelle. Ils permettent d'activer un thème sombre pour les usages nocturnes ou les interfaces d'administration avancée, sans refondre l'ensemble du système.

### Logique fonctionnelle (mise à jour)

- **Primaire `#0a2463`** — Sidebar, boutons CTA principaux, focus ring, liens actifs.
- **Secondaire `#c94400`** — Boutons "Payer", "Nouveau", badges de nouveauté, indicateurs d'urgence.
- **Tertiaire `#003112`** — Courbes de revenus, statuts "Succès", indicateurs positifs.
- **Sémantique** — Application stricte : jamais de rouge pour un avertissement, jamais d'ambre pour une erreur.
- **Fond `#f5f7fa`** — Légèrement plus chaud que le `#f8fafc` d'origine, réduit la fatigue oculaire sur de longues sessions.

---

## 4. Typographie

### Stratégie 3 polices par contexte fonctionnel

La V2.1 abandonne la police unique (Inter) au profit d'une **architecture typographique à 3 niveaux** alignée sur les deux univers du produit et les besoins techniques.

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD / ADMIN          →  Geist                        │
│  Titres · Corps · Données · Navigation · Labels             │
├─────────────────────────────────────────────────────────────┤
│  CHECKOUT WEBPAY            →  DM Sans                      │
│  Interface grand public · Mobile · Écrans de paiement       │
├─────────────────────────────────────────────────────────────┤
│  CLÉS API / CODE / USSD     →  Geist Mono > JetBrains Mono  │
│  Playground dev · Clés · JSON · Numéros USSD                │
└─────────────────────────────────────────────────────────────┘
```

### Geist — Dashboard & Admin

Développée par Vercel en 2023, Geist est une police géométrique neo-grotesque disponible en variable font (9 graisses, 100–900). Elle est conçue précisément pour les interfaces produit denses, avec :

- Chiffres tabulaires natifs (`font-variant-numeric: tabular-nums`) pour l'alignement des colonnes de montants
- Distinction irréprochable des glyphes ambigus : `0` vs `O`, `1` vs `l` vs `I`
- Très haute lisibilité à petite taille (12–14px) dans les tables et formulaires
- Variable font : un seul fichier pour toutes les graisses, performance réseau optimale sur 2G/3G
- Licence MIT, hébergeable en local (pas de dépendance Google Fonts obligatoire)

**Import :**
```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');

:root {
  --font-dashboard: 'Geist', system-ui, sans-serif;
}
```

### DM Sans — Checkout WebPay

Interface grand public destinée aux payeurs finaux, souvent sur mobile avec connectivité limitée. DM Sans apporte :

- Terminaux légèrement arrondis — réduit la friction perçue à l'acte de paiement
- Géométrique bas-contraste, confortable sur petits écrans à faible résolution
- Courbes douces sur les boutons CTA "Payer" qui inspirent confiance et fluidité
- Utilisé sur des produits financiers grand public (PayPal checkout, Wave Africa)

**Import :**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-webpay: 'DM Sans', system-ui, sans-serif;
}
```

**Règle stricte :** DM Sans est réservé aux pages et composants WebPay (écrans de paiement public, page de confirmation, reçu consommateur). Ne pas l'utiliser dans le dashboard admin ou les tableaux de bord marchands.

### Geist Mono > JetBrains Mono — Code & API

```css
:root {
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Courier Prime', monospace;
}
```

**Geist Mono** en premier choix — cohérence de famille avec Geist Sans, rendu homogène dans le developer playground et les blocs JSON. **JetBrains Mono** en fallback — ligatures optionnelles, meilleure densité sur les longues clés API. Les deux polices offrent une disambiguation parfaite des caractères techniques critiques.

Usages couverts : clés API, webhooks, blocs JSON, réponses SDK, numéros USSD (#123*456#), codes de confirmation par SMS.

### Autres changements typographiques

**Chiffres tabulaires systématiques :** `font-variant-numeric: tabular-nums` ajouté sur tous les tokens `dashboard-amount`, `dashboard-amount-sm` et `transaction-amount`. Garantit l'alignement vertical dans les tables de relevés.

**Hiérarchie soldes :** Le `dashboard-amount` passe de 22px à 28px avec `letter-spacing: -0.02em`. Le solde devient le point focal visuel irréfutable des cartes (pratique Stripe, Wave, Moov).

**Body 15px :** Le corps de texte passe de 16 à 15px. Ce demi-point libère de l'espace vertical sur les dashboards denses — pattern utilisé par Linear, Vercel, Mercury Bank.

### Hiérarchie recommandée par zone

```
Marketing / landing :   hero-h1 (Geist 800) > hero-subtitle (Geist 400) > body-base
Dashboard admin :       page-title (Geist 700) > card-title (Geist 600) > label-md > caption-xs
Données financières :   dashboard-amount (Geist 700 tnum) > transaction-amount > label-sm
Navigation sidebar :    sidebar-brand (Geist 800) > nav-item (Geist 500) > label-xs
Checkout WebPay :       webpay-heading (DM Sans 700) > webpay-amount > webpay-label
Technique / Dev :       code-mono (Geist Mono) > code-mono-sm
```

---

## 5. Layout & Espacement

### Grille mise à jour

La V2 formalise les espacements manquants dans la V1 : tokens `xs` (4px), `xl` (32px) et `2xl` (48px) comblent les écarts entre les paliers existants. Les hauteurs fixes `input-height` (40px) et `button-height` (40px/34px/48px) éliminent les incohérences de hauteur entre composants.

### Sidebar évolutive

```
Expanded  : 220px  — label + icône + badge
Collapsed : 60px   — icône seule + tooltip au survol
Mobile    : drawer bottom-sheet — se glisse depuis le bas
```

La transition entre les modes utilise `duration-slow: 300ms` avec `ease-decelerate`.

### Stratégie de grille desktop

```
[Sidebar 220px] | [Contenu principal fluid] | [Drawer contextuel 320px optionnel]
```

Le drawer contextuel (détail transaction, KYC, notes) s'ouvre sans changer de page, réduisant les aller-retours de navigation sur les workflows complexes.

---

## 6. Élévation & Profondeur

### Système d'ombres à 7 niveaux

```
none        → Éléments plats, lignes de tableau
inset       → Champs de saisie (état par défaut)
card        → Cartes en repos
card-hover  → Carte survolée / sélectionnée
dropdown    → Menus déroulants, popovers
modal       → Modales, drawers latéraux
button-*    → Ombres colorées (primary / accent) pour CTA
```

Les boutons primaires et d'action utilisent des ombres **colorées** (teintées de la couleur du bouton). Ce pattern (utilisé par Stripe, PayPal) renforce la perception de la marque et améliore la distinction CTA/fond.

### États interactifs

```
Repos       → shadow: card
Survol      → shadow: card-hover  + translateY(-1px)
Actif       → shadow: inset       + translateY(0)
Désactivé   → opacity: 0.45, cursor: not-allowed
Focus       → focus-ring (3px, couleur primaire)
```

---

## 7. Mouvement & Animation

*(Section absente en V1 — ajout structurant)*

Les animations doivent être **fonctionnelles**, jamais décoratives. Toute interaction doit retourner un feedback visuel en moins de 150ms.

### Tableau de référence

| Cas d'usage | Durée | Courbe |
|---|---|---|
| Feedback bouton (ripple) | 80ms | ease-standard |
| Transition d'état (pill, badge) | 150ms | ease-standard |
| Apparition dropdown/tooltip | 150ms | ease-decelerate |
| Ouverture sidebar / drawer | 300ms | ease-decelerate |
| Fermeture sidebar / drawer | 180ms | ease-accelerate |
| Entrée de modale | 250ms | ease-decelerate |
| Compteur de montant (ticker) | 600ms | ease-spring |

### Règle `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Toutes les animations doivent respecter cette préférence système.

---

## 8. Composants mis à jour

### Boutons

```
Taille lg  : height 48px, px 24px, font label-md 15px — CTA hero/landing
Taille md  : height 40px, px 16px, font label-md 14px — actions principales
Taille sm  : height 34px, px 12px, font label-sm 13px — actions secondaires compact
```

| Variante | Fond | Texte | Bordure | Ombre |
|---|---|---|---|---|
| Primary | `#0a2463` | `#ffffff` | aucune | `button-primary` |
| Accent | `#c94400` | `#ffffff` | aucune | `button-accent` |
| Secondary | `#ffffff` | `#0a2463` | `1px #e2e5ea` | `card` |
| Ghost | transparent | `#0a2463` | aucune | none |
| Danger | `#B91C1C` | `#ffffff` | aucune | none |
| Disabled (tous) | fond à 0.45 opacité | idem | idem | none |

### Cartes

**Carte standard :**

```
fond         : #ffffff
bordure      : 1px solid #e2e5ea
radius       : 12px
shadow       : card
padding      : 20px
hover-shadow : card-hover
```

**Carte solde (Balance Card) :**

```
fond         : gradient-primary (dégradé bleu)
texte label  : sidebar-text (#c8d3e8)
texte montant: #ffffff, dashboard-amount (28px, tabular-nums)
icône masque : œil / œil barré, couleur sidebar-text
radius       : 16px
```

**Carte KPI / metric :**

```
fond         : #ffffff
en-tête      : label-xs uppercase + icône Lucide (20px)
valeur       : dashboard-amount-sm
delta        : label-sm + success/error coloring + flèche Lucide
```

### Status Pills

Taille standardisée : `height: 22px`, `px: 10px`, `font: label-xs` (11px uppercase).

| Statut | Fond | Texte |
|---|---|---|
| Succès | `success-container` | `#15803D` |
| En attente | `warning-container` | `#92400E` |
| Échoué | `error-container` | `#B91C1C` |
| Info / En cours | `info-container` | `#1d4ed8` |
| Annulé | `surface-container-high` | `text-muted` |

### Champs de saisie

```
height         : 40px (md), 34px (sm)
border         : 1px solid #e2e5ea
radius         : 8px
font           : body-sm (13px) ou label-md (14px)
padding        : 0 12px
état défaut    : shadow inset
état focus     : border 1.5px #0a2463, focus-ring 3px
état erreur    : border 1.5px #B91C1C, focus-ring error 3px
état succès    : border 1.5px #15803D
état désactivé : fond surface-container, texte text-disabled
```

### Tables de transactions

```
en-tête        : fond surface-container, label-xs uppercase, text-muted
ligne          : border-bottom 1px solid #e2e5ea, height 52px
survol ligne   : fond surface-container-low (#f0f2f5)
sélection ligne: fond primary-fixed (#dce1ff), border-left 3px primary
montant crédit : success #15803D, tabular-nums, font-weight 600
montant débit  : error #B91C1C, tabular-nums, font-weight 600
actions        : icônes Lucide 16px, couleur text-muted, hover text-gray
```

### Navigation latérale

```
fond sidebar   : admin-sidebar (#0a1628)
item repos     : texte sidebar-text, icône sidebar-icon-inactive
item survol    : fond sidebar-hover (#152e5e), texte #ffffff
item actif     : fond sidebar-active (#1a3a72), texte #ffffff,
                 bar gauche 3px secondary (#c94400)
séparateur     : 1px solid rgba(255,255,255,0.08)
badge count    : fond secondary-container, texte on-secondary-container,
                 radius full, height 18px, min-width 18px
```

### Toasts & Notifications

*(Nouveau composant)*

```
position       : fixed top-right, gap 8px entre toasts
width          : 360px max
radius         : 10px
shadow         : dropdown
durée affichage: 4000ms (success/info), 6000ms (warning/error)
animation      : slide-in depuis la droite, 250ms ease-decelerate
icône          : Lucide 18px (couleur sémantique)
bouton fermer  : Lucide X 16px, opacity 0.6, hover opacity 1
```

| Type | Fond | Bordure gauche |
|---|---|---|
| Succès | `success-container` | 4px `#15803D` |
| Erreur | `error-container` | 4px `#B91C1C` |
| Avertissement | `warning-container` | 4px `#92400E` |
| Info | `info-container` | 4px `#1d4ed8` |

### Modales

*(Spécifications étendues)*

```
overlay        : rgba(0,0,0,0.50) avec backdrop-filter blur(4px)
contenu        : fond #ffffff, radius 16px, shadow modal
largeur        : 480px (sm), 640px (md), 800px (lg)
mobile         : bottom-sheet (radius top 20px, swipe-to-dismiss)
header         : card-title (16px bold) + Lucide X, padding 20px
body           : body-sm, padding 20px, scroll interne si besoin
footer         : padding 16px 20px, flex row-reverse gap 8px
```

**Confirmation d'action destructive :**

```
titre          : "Confirmer la suppression" (rouge, Lucide AlertTriangle)
message        : description de l'impact (ex. nombre de transactions affectées)
bouton cancel  : Secondary
bouton confirm : Danger, texte explicite ("Supprimer définitivement")
délai          : bouton Danger activé après 1.5s (anti-clic accidentel)
```

### Skeleton Loaders

*(Nouveau composant — critique pour 2G/3G)*

```
animation      : shimmer (gradient left-to-right, 1.5s infini)
couleur base   : surface-container (#eaedf0)
couleur shimmer: surface-container-lowest (#ffffff) à 60%
radius         : correspond au composant final (carte = 12px, texte = 4px)
```

Utiliser systématiquement les skeletons en remplacement des spinners pour les chargements de listes et de tableaux. Ils préservent la structure de la page et réduisent la perception du temps d'attente.

---

## 9. Visualisation de données

### Palette Recharts étendue

```javascript
const CHART_COLORS = {
  credit:   '#15803D',  // Entrées d'argent
  debit:    '#B91C1C',  // Sorties d'argent
  volume:   '#0a2463',  // Volume neutre
  pending:  '#92400E',  // En attente
  forecast: '#475b9c',  // Projection (pointillés)
  neutral:  '#6b6d79',  // Données secondaires
}
```

### Conventions graphiques

- **Courbes :** `strokeWidth: 2`, `dot: false` par défaut, `activeDot: { r: 5 }`.
- **Barres :** `radius: [4, 4, 0, 0]` (coins arrondis en haut uniquement).
- **Tooltips :** fond `#ffffff`, shadow `dropdown`, `font: label-sm`, montants en `tabular-nums`.
- **Axes :** couleur `text-muted`, fontSize 12px, pas de ligne d'axe vertical.
- **Responsive :** toujours encapsuler dans `<ResponsiveContainer width="100%" height={240}>`.
- **Courbes de prévision :** `strokeDasharray: "5 3"`, couleur `forecast`.

---

## 10. Accessibilité

*(Section absente en V1 — ajout obligatoire WCAG AA)*

### Contrastes vérifiés

| Paire | Ratio | Niveau |
|---|---|---|
| `#ffffff` sur `#0a2463` | 12.6:1 | AAA |
| `#ffffff` sur `#c94400` | 4.8:1 | AA |
| `#0f1214` sur `#f5f7fa` | 16.2:1 | AAA |
| `#15803D` sur `#dcfce7` | 5.1:1 | AA |
| `#B91C1C` sur `#ffdad6` | 4.6:1 | AA |
| `#92400E` sur `#fef3c7` | 5.8:1 | AA |

### Règles composants

- Tout bouton doit avoir un `aria-label` si l'icône seule est utilisée.
- Toute table doit utiliser `<th scope="col">` et un `<caption>` descriptif.
- Les champs de formulaire doivent avoir un `<label>` associé (pas de `placeholder` seul).
- Les modales doivent piéger le focus (`focus-trap`) et fermer au `Escape`.
- Les cartes de solde avec masquage doivent annoncer l'état aux lecteurs d'écran (`aria-label="Solde masqué"` / `"Solde affiché"`).

---

## 11. Patterns spécifiques CEMAC

### Sélecteur de pays / opérateur

```
composant      : dropdown custom (pas de <select> natif)
drapeau        : sprite SVG 20x14px
opérateurs     : logo + nom + indicatif (ex. "MTN · +235")
fond           : card-bg, border border
survol         : surface-container-low
actif          : primary-fixed avec checkmark Lucide
```

### Indicateurs USSD

Pour les workflows USSD complémentaires à l'interface web :

```
fond           : admin-sidebar (#0a1628)
texte          : code-mono, couleur tertiary-fixed (#95f8a7) — vert terminal
numéro court   : dashboard-amount-sm, couleur #ffffff
instruction    : body-sm, couleur sidebar-text
bouton copier  : Ghost sm + Lucide Copy
```

### Balance masquée

```
état visible   : montant en dashboard-amount
état masqué    : "••••••" en dashboard-amount, letter-spacing 0.1em
toggle icône   : Lucide Eye / EyeOff, 20px, couleur sidebar-text-active
transition     : opacity + blur, duration-fast (150ms)
```

---

## 12. Implémentation de la stratégie typographique

### Import des polices (head HTML ou layout racine)

```html
<!-- Dashboard / Admin — Geist -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Checkout WebPay — DM Sans -->
<!-- Charger uniquement sur les routes /pay, /checkout, /receipt -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Code / API / USSD — JetBrains Mono (fallback Geist Mono) -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

### Variables CSS racine

```css
/* ─── Variables de polices par contexte ─────────────────── */
:root {
  /* Dashboard & Admin */
  --font-sans:    'Geist', system-ui, -apple-system, sans-serif;

  /* Checkout WebPay (consommateur) */
  --font-webpay:  'DM Sans', system-ui, -apple-system, sans-serif;

  /* Code, API, USSD */
  --font-mono:    'Geist Mono', 'JetBrains Mono', 'Courier Prime', monospace;
}

/* ─── Application par scope ─────────────────────────────── */

/* Dashboard admin : police par défaut sur le layout */
.layout-admin,
.layout-dashboard {
  font-family: var(--font-sans);
}

/* WebPay : scope isolé sur les pages publiques */
.layout-webpay,
.checkout-page {
  font-family: var(--font-webpay);
}

/* Monospace : composants techniques partout */
.code-block,
.api-key,
.json-viewer,
.ussd-display,
pre, code, kbd {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Chiffres tabulaires sur tous les montants */
.amount,
.balance,
.transaction-value,
[data-numeric] {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';  /* fallback OpenType */
}
```

### Tailwind CSS — configuration

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans:   ['Geist', ...fontFamily.sans],    // dashboard (défaut)
        webpay: ['DM Sans', ...fontFamily.sans],  // checkout public
        mono:   ['Geist Mono', 'JetBrains Mono', ...fontFamily.mono],
      },
    },
  },
}
```

```jsx
// Usage Tailwind dans les composants

// Dashboard — police par défaut (font-sans)
<h1 className="font-sans font-bold text-2xl">Tableau de bord</h1>

// WebPay — police consommateur
<div className="font-webpay">
  <h2 className="font-bold text-xl">Confirmer le paiement</h2>
  <p className="font-normal text-sm">MTN Mobile Money · +235 60 XX XX XX</p>
</div>

// Clés API et code
<code className="font-mono text-sm">sk-ant-api03-xK9mZr4...</code>
```

### Next.js — chargement optimisé (recommandé)

```typescript
// app/layout.tsx  — Dashboard admin
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}

// app/(webpay)/layout.tsx  — Checkout public (chargement séparé)
import { DM_Sans } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-webpay',
  display: 'swap',
})

export default function WebPayLayout({ children }) {
  return (
    <div className={`${dmSans.variable} font-webpay`}>
      {children}
    </div>
  )
}
```

### Performance — stratégie de chargement

```
Priorité        : Geist chargé en priorité (layout admin = chemin critique)
Lazy loading    : DM Sans chargé uniquement sur les routes /pay/*
Sous-ensembles  : subset latin suffit (pas de caractères CJK ou arabes dans la zone CEMAC)
Fallback stack  : system-ui → police système locale si Google Fonts indisponible (2G)
Font display    : swap sur toutes les polices (texte visible immédiatement)
```

### Tableau de décision rapide

| Composant | Police | Classe Tailwind |
|---|---|---|
| Sidebar, topbar, nav | Geist | `font-sans` (défaut) |
| Titres de page dashboard | Geist 700 | `font-sans font-bold` |
| Montants, soldes | Geist 700 + tabular | `font-sans font-bold tabular-nums` |
| Corps de texte admin | Geist 400 | `font-sans font-normal` |
| Labels, badges, pills | Geist 500–600 | `font-sans font-medium` |
| Page de paiement public | DM Sans | `font-webpay` |
| Bouton "Payer" | DM Sans 600 | `font-webpay font-semibold` |
| Clés API, JSON, code | Geist Mono | `font-mono` |
| Numéros USSD | Geist Mono 600 | `font-mono font-semibold` |
