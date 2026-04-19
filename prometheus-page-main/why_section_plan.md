# Plan for "Why Prometheus" Section (Railway-Inspired)

Focus: Replacing the "cringe" interactive explorer with a high-fidelity, information-dense "Technical Feature Strip" that feels like a professional hardware specification.

## 1. Layout: The "Horizontal Blueprint"
*   **Structure**: A single, full-width horizontal strip divided by thin vertical lines (`border-r border-white/5`).
*   **UX**: No cards, no heavy backgrounds. The content breathes horizontally. 
*   **Dimensions**: Small height, high density. Each feature gets a vertical column.

## 2. Typography & Copy (Railway Style)
*   **The "Peaceful" Hook**: Short, punchy headers that focus on *results* (e.g., "Zero Integration Friction" instead of "Unified Data").
*   **Font Sizes**: Drop heading from `2xl` to `lg` or `xl`. Drop body text to `text-xs` or `text-sm`.
*   **Technical Proof**: Each feature column starts with a **Monospaced Value** (e.g., `< 0.8ms` or `Atomic`) in a tiny, muted font.

## 3. Interaction & Styling
*   **Glow**: Instead of a "selected" state, use a subtle `border-b-2 border-primary` that appears only on hover.
*   **Iconography**: Sharp, single-stroke icons. No colors unless hovered.
*   **Separators**: Vertical hairline dividers that fade out at the top and bottom (`linear-gradient`).

## 4. Section Content (Railway Parallel)
1.  **Deployment**: "Native anywhere." (Hardware Neutral)
2.  **Telemetry**: "Clarity without the chaos." (Unified Analytics)
3.  **Performance**: "Scale without the pains." (Edge Engine)
4.  **Security**: "Resilience by default." (Offline-First)

## 5. CSS Strategy
*   Use `grid-cols-4` with `divide-x divide-white/5`.
*   Remove all `bg-white/5` or `rounded-2xl` card-like wrappers.
*   The entire section lives in a `border-y border-white/5` wrapper, making it feel like a "ribbon" of info on the page.
