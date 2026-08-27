# Project Guidelines & Design Rules

## UI & Design Rules

### 1. No Colored Top Accent Stripes / Header Bars on Cards
- **Strict Rule**: Never add colored top accent stripes or colored border bars on the top edge of cards, widgets, containers, or modals (e.g. `border-t-4 border-primary-500` or `<div class="absolute top-0 left-0 right-0 h-1.5 bg-primary-500"></div>`).
- **Clean Card Aesthetic**: Cards and containers must maintain a clean, consistent, and minimal design using uniform borders (`border border-gray-200` or subtle brand borders), rounded corners (`rounded-2xl` / `rounded-xl`), and soft neutral backgrounds (`bg-white` or subtle `bg-gray-50`).

### 2. Brand Colors
- Use the primary purple palette (`var(--color-primary-500)` / `text-primary-500` / `bg-primary-500`) for primary buttons, active links, and brand accents.
- Use the secondary gold palette (`--color-gold-500`) for special badges, highlights, and secondary callouts.

### 3. Responsiveness
- All pages, components, and widgets must be completely responsive across mobile (< 640px), tablet (640px–1024px), and desktop (> 1024px) without horizontal scrolling or layout breakage.
