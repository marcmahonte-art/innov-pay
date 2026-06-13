---
name: Innov Pay Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444650'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757681'
  outline-variant: '#c5c6d2'
  surface-tint: '#475b9c'
  primary: '#00103e'
  on-primary: '#ffffff'
  primary-container: '#0a2463'
  on-primary-container: '#7a8ed2'
  inverse-primary: '#b5c4ff'
  secondary: '#a73a00'
  on-secondary: '#ffffff'
  secondary-container: '#fd651e'
  on-secondary-container: '#571a00'
  tertiary: '#001a06'
  on-tertiary: '#ffffff'
  tertiary-container: '#003112'
  on-tertiary-container: '#41a35b'
  error: '#B91C1C'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00164d'
  on-primary-fixed-variant: '#2e4382'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#95f8a7'
  tertiary-fixed-dim: '#79db8d'
  on-tertiary-fixed: '#00210a'
  on-tertiary-fixed-variant: '#005323'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  success: '#15803D'
  warning: '#92400E'
  border: '#E5E7EB'
  card-bg: '#FFFFFF'
  text-gray: '#6B7280'
  text-inactive: '#9CA3AF'
  sidebar-hover: '#1E3A8A'
  admin-sidebar: '#0F172A'
typography:
  hero-h1:
    fontFamily: Inter
    fontSize: 60px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  hero-h1-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  dashboard-amount:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  sidebar-brand:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
  hero-subtitle:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-mono:
    fontFamily: Courier Prime
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 220px
  topbar-height: 48px
  container-padding: 24px
  grid-gap: 12px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

The design system is engineered for the Chadian and CEMAC fintech landscape, prioritizing **trust, efficiency, and clarity**. It bridges the gap between high-level corporate banking and the agility of modern SaaS. The brand personality is professional yet energetic, utilizing high-contrast visual cues to ensure critical financial data is instantly scannable.

The visual style is **Corporate / Modern**, heavily influenced by high-density financial dashboards. It employs a "Flat-Plus" philosophy: clean, geometric layouts that prioritize information density, enhanced by subtle elevation to define interactive containers. The interface must remain performant and legible even on lower-bandwidth 2G networks, favoring system-standard typography and CSS-driven styling over heavy assets.

**Key Principles:**
- **Financial Clarity:** High-contrast text and purposeful color coding for transaction statuses.
- **Localized Professionalism:** A layout that respects international fintech standards while accommodating regional specificities like multi-country switching and USSD workflows.
- **Safety & Privacy:** UI patterns like balance masking and clear destructive action confirmations.

## Colors

The palette is built on a foundation of "Trust Blue" (`#0A2463`) to communicate stability and a "Vibrant Orange" (`#EA580C`) for interactive accents and brand personality. 

### Functional Logic
- **Primary:** Used for the core structural elements (Sidebar) and main Call-to-Action buttons.
- **Accent:** Reserved for badges, active states in navigation, and high-priority "New" features.
- **Semantic Colors:** These are strictly enforced. Success (Green), Warning (Amber), and Error (Red) must be used consistently across all transaction tables, status pills, and data visualization curves.
- **Neutral/Background:** The system uses a very light cool-gray (`#F8FAFC`) for page backgrounds to allow white cards to pop with minimal shadow.

## Typography

This design system exclusively uses **Inter** to ensure maximum legibility and cross-platform consistency. The typographic hierarchy is designed to handle high-density data without overwhelming the user.

- **Headlines:** Large, bold weights are used for the marketing hero and dashboard balances to establish clear focal points.
- **Data Display:** Amounts and transaction totals use a specific `dashboard-amount` style for rapid scanning.
- **Status & Labels:** Smaller sizes (14px and 12px) are used for table headers, form labels, and status pills. Status pills should use bold or semi-bold weights for visibility.
- **Monospace:** Use **Courier Prime** or a system-default monospace for API keys, JSON blocks, and code snippets in the developer playground.

## Layout & Spacing

The layout uses a **fixed-fluid hybrid grid** model tailored for complex dashboards.

- **Sidebar:** A fixed 220px sidebar houses primary navigation. It can be collapsed into an icon-only view for increased workspace.
- **Main Content:** A fluid area that reflows based on screen width.
- **Rhythm:** The system follows an 8px base grid (4px, 8px, 12px, 16px, 24px).
- **Desktop:** A 3-column strategy (Sidebar | Main Content | Action/Context Drawer) is preferred for complex workflows like KYC validation.
- **Mobile:** The sidebar transitions to a bottom-sheet or hidden drawer. Container padding reduces from 24px to 16px.

## Elevation & Depth

To maintain a clean, professional aesthetic, elevation is used sparingly. Hierarchy is established primarily through **Tonal Layering** and **Low-Contrast Outlines**.

- **Surface Layers:** The main background is `#F8FAFC`, while content containers (Cards) are `#FFFFFF`.
- **Shadows:** Use a single, subtle shadow for all cards: `0 1px 3px rgba(0,0,0,0.08)`. This provides just enough depth to separate the content from the background without feeling heavy.
- **Interactive States:** Hovering over sidebar items or clickable list rows uses a light tonal shift (e.g., `#1E3A8A` for sidebar hover) rather than increased shadow depth.
- **Modals & Tooltips:** Use a more pronounced shadow for floating elements to ensure they sit clearly above the dashboard plane.

## Shapes

The shape language reflects "SaaS Professionalism"—modern and approachable but structured.

- **Primary Containers:** Dashboard cards and form containers use a **12px radius** (`rounded-lg` in this system) to soften the information-heavy interface.
- **Action Elements:** Buttons use a tighter **6px radius** to feel more precise and technical.
- **Public Checkout:** For the WebPay/Public interface, a slightly softer **8px radius** may be used on buttons to appear more consumer-friendly.
- **Status Indicators:** Pills and badges should use a fully rounded (pill-shaped) or **8px radius** to distinguish them from structural cards.

## Components

### Buttons
- **Primary:** Background `#0A2463`, text `#FFFFFF`, 6px radius.
- **Secondary:** Border `#E5E7EB`, background `#FFFFFF`, text `#0A2463`.
- **Accent/CTA:** Background `#EA580C`, text `#FFFFFF`. Used for "Pay" or "New" actions.

### Cards
- **Standard:** Background `#FFFFFF`, border `1px solid #E5E7EB`, radius 12px, subtle shadow.
- **Balance Card:** Features `dashboard-amount` typography and a toggle to mask/unmask sensitive financial data.

### Status Pills
- Compact, bold text inside a light-tinted background of the semantic color.
- **Success:** Background tinted Green, text `#15803D`.
- **Pending:** Background tinted Amber, text `#92400E`.
- **Failed:** Background tinted Red, text `#B91C1C`.

### Input Fields
- Border `1px solid #E5E7EB`, 6px radius, 14px text.
- Active state uses a `1px` border of `#0A2463`.

### Lists & Tables
- Clean, horizontal dividers using `#E5E7EB`.
- Row hover state: background `#F8FAFC`.
- Use `Lucide React` icons consistently for all table actions (e.g., Eye for view, Trash for delete).

### Data Visualization
- Use `Recharts` with the semantic palette. Success Green for credit trends, Error Red for debit/failed trends, and Primary Blue for neutral volume.