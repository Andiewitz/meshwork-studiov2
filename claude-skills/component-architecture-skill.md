---
name: component-architecture
description: Enforces modular, reusable component patterns for Next.js + MUI projects. Ensures consistent API design, composition patterns, and file organization.
---

# Component Architecture Skill

This skill governs how components are structured, organized, and composed. A $10K project must be maintainable long after handoff. Spaghetti components kill future value.

## Core Rules for Component Design

### 1. File Organization (Feature-First)
```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (marketing)/        # Route group for public pages
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/        # Route group for authenticated pages
│   └── layout.tsx          # Root layout
├── features/               # Feature modules (self-contained)
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroStats.tsx
│   │   └── index.ts        # Barrel export
│   ├── pricing/
│   │   ├── PricingTable.tsx
│   │   ├── PricingCard.tsx
│   │   └── index.ts
│   └── testimonials/
│       ├── TestimonialCarousel.tsx
│       ├── TestimonialCard.tsx
│       └── index.ts
├── components/             # Shared/generic UI components
│   ├── ui/                 # Primitives (Button, Input, Badge)
│   ├── layout/             # Header, Footer, Container, Section
│   └── feedback/           # Toast, Modal, Skeleton
├── lib/                    # Utilities, configs, clients
│   ├── theme.ts            # MUI theme configuration
│   ├── fonts.ts            # Font definitions
│   └── utils.ts            # Helper functions
├── providers/              # React context providers
├── hooks/                  # Custom React hooks
├── types/                  # Shared TypeScript types
└── styles/                 # Global CSS, design tokens
```

### 2. Component API Rules
- **Props interface:** Every component must have a named TypeScript interface. `interface HeroProps { ... }`, not inline types.
- **Default exports:** Pages use `export default`. All other components use **named exports**.
- **Barrel exports:** Every feature folder has an `index.ts` that re-exports public components. Import from the folder, not the file: `import { Hero } from '@/features/hero'`.
- **Children pattern:** Layout components accept `children: React.ReactNode`. Content components accept explicit props.

### 3. Server vs Client Components
- **Default to Server Components.** Only add `'use client'` when the component:
  - Uses React hooks (`useState`, `useEffect`, `useRef`)
  - Uses browser APIs (`window`, `document`, `IntersectionObserver`)
  - Uses event handlers (`onClick`, `onSubmit`, `onChange`)
  - Uses Framer Motion or other client-only libraries
- **Push client boundaries down.** If a page is mostly static but has one interactive section, make only that section a client component. Don't make the whole page client-side.
- **Data fetching:** Always fetch data in Server Components using `async/await`. Pass data down to client components as props.

### 4. Composition Over Configuration
- Prefer composing small components over creating mega-components with 15+ props.
- **Bad:** `<Card variant="testimonial" showAvatar showRating layout="horizontal" size="lg" />`
- **Good:**
  ```tsx
  <TestimonialCard>
    <Avatar src={author.image} />
    <Rating value={5} />
    <Quote>{testimonial.text}</Quote>
  </TestimonialCard>
  ```

### 5. Shared Section Component
Create a reusable `<Section>` wrapper that enforces consistent spacing, max-width, and semantic HTML:
```tsx
interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg';
}
```
Every page section should be wrapped in this component to maintain rhythm.

### 6. MUI + Tailwind Integration Rules
- **MUI `sx` prop:** Use for component-specific style overrides tied to MUI's theme system (spacing, palette, breakpoints).
- **Tailwind classes:** Use for layout utilities (`flex`, `grid`, `gap`, `p-`, `m-`, `w-`, `max-w-`) and responsive modifiers.
- **Never mix:** Don't set `padding` in both `sx` and `className` on the same element. Pick one system per property.
- **Theme tokens:** Access MUI theme values via `sx` (`color: 'primary.main'`). Access Tailwind tokens via classes.

### 7. Custom Hooks
Extract reusable logic into hooks in `src/hooks/`:
- `useScrollProgress()` — returns scroll percentage for the viewport or a ref'd container.
- `useInView(ref, options)` — wrapper around IntersectionObserver.
- `useMediaQuery(query)` — SSR-safe media query hook (use MUI's `useMediaQuery`).
- `useCountUp(target, duration)` — animates a number from 0 to target when triggered.
