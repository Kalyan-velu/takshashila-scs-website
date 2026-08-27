---
name: ui-design-rules
description: Strict UI design guidelines for cards, components, and layout styling across the project.
trigger: always_on
---

# UI Design Rules

## Card & Widget Design Guidelines
- **NEVER use colored top accent stripes / colored border lines at the top edge of cards or containers** (e.g. `border-t-4 border-primary-500` or `<div class="absolute top-0 left-0 right-0 h-1.5 ..."></div>`).
- Keep all cards, widgets, and modals clean with uniform borders (`border border-gray-200`), consistent padding, rounded corners (`rounded-2xl` / `rounded-xl`), and clean backgrounds (`bg-white`).
- Ensure all layouts are fully responsive across mobile, tablet, and desktop without horizontal scroll overflow.
