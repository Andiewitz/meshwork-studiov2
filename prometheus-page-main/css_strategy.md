# CSS Design Strategy: "Prometheus Blueprint"

Inspired by the "Peaceful Technicality" of Railway.app, the CSS for Prometheus will pivot from a generic dark theme to a **Blueprint-Grade Operating System** aesthetic.

## 1. Minimalist Color System (Peaceful & Powerful)
*   **Base (The Void)**: `#010101` (Blacker than before to make glows pop).
*   **Surface (The Canvas)**: `#050607` with `border-white/5`.
*   **Accents (The Ember)**: 
    *   `primary`: `#f59e0b` (Amber) - Use sparingly for points of action.
    *   `muted`: `#4b5563` - For technical details, numbers, and labels.
*   **Atmosphere**: Use `backdrop-blur-xl` and `bg-white/[0.01]` for a sense of depth without "cards."

## 2. Typography Strategy (The Engineering Manual)
*   **Hero/Headings**: `Merriweather` (Serif). It should feel like a historical business document meet modern tech.
*   **Primary Copy**: `Inter` (Sans). Clean, high-readability.
*   **Meta/Data**: `JetBrains Mono` (Mono). For specs, numbers, and technical labels.
    *   *Rule*: All numbers and statuses must be monospaced.

## 3. The "Blueprint" Grid
*   **Hairline Dividers**: Replace "sections" with simple horizontal and vertical lines (`h-[1px] w-full bg-white/5`).
*   **Side-Gutter Layout**: Use asymmetric layouts (Railway-inspired) where labels lived in a left gutter and content lives on the right.
*   **No Card Containers**: Shadows are replaced by thin borders and subtle "lift" animations.

## 4. Motion Theory (Peaceful Transitions)
*   **Entrance**: Orchestrated spring animations (framer-motion). Content shouldn't just appear; it should "assemble."
*   **Interaction**: Hovering over a spec shouldn't "highlight" it with a bright color, but rather "illuminate" it with a subtle glow (mix-blend-mode: screen).

## 5. UI Components (The "Pro-Tool" Look)
*   **Buttons**: Transparent borders, high-blur backgrounds.
*   **Pills**: Only use for *active* technical states.
*   **Telemetry**: Small, constantly updating elements (like the "System status" dot) to make the site feel alive.
