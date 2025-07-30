<!--
Prompt: “Create a single‑page portfolio website with the following features:

1. **Hero Section**  
   - Full‑screen dark theme with monospaced terminal overlay at top (blinking cursor, ‘Type “help” to begin’).  
   - Behind the terminal, a `<canvas>` runs a Three.js + Anime.js scene.

2. **3D Laptop Demo**  
   - In the center: a low‑poly laptop GLB model (lid closed).  
   - **On first scroll**: animate hinge to open laptop (use Anime.js timeline).  
   - **As the user scrolls further**: stagger‑disassemble each part (screen, keyboard deck, motherboard, battery, ports, etc.) using anime.stagger() and easing.  
   - Each part is a Three.js mesh named semantically; clicking or scrolling to it focuses camera via Anime.js and then navigates to its dedicated subpage (e.g. /projects, /about, /contact).

3. **Terminal‑Style Navigation**  
   - Overlay a semi‑transparent terminal UI that responds to commands:  
     - `help` → lists commands (`tour`, `about`, `projects`, `contact`, `resume`).  
     - `tour` → locks pointer into canvas and enables click‑hotspots on 3D parts.  
     - Typing `about`/`projects`/`contact` triggers a smooth scroll or redirect to that section/subpage.

4. **Scroll‑Synced Animations**  
   - Use a ScrollObserver or IntersectionObserver to sync scroll position with the Anime.js timeline controlling disassembly.  
   - Show a subtle progress bar (like animejs.com’s scrubber) indicating disassembly progress.

5. **Ambient Background Effects**  
   - Add a dot‑matrix or faint grid of particles behind the laptop, animated with a slow, looping Anime.js timeline to convey depth without distraction.

6. **Theme & Styling**  
   - Dark, minimalist palette (black/charcoal background, neon‑accent cursor/text).  
   - Custom ASCII art logo in the terminal banner.  
   - Responsive layout: canvas fills viewport; terminal UI shrinks or hides on mobile with a fallback hamburger menu.

7. **SEO & Metadata**  
   - Proper `<title>`, `<meta>` description, and JSON‑LD Person schema.  
   - Preload the 3D model and critical scripts for performance.

8. **Progressive Enhancement & Accessibility**  
   - If `<canvas>` or JS fails, show basic HTML nav links to About, Projects, Resume, Contact.  
   - ARIA roles for terminal UI and hidden nav for screen‑readers.

9. **Build & Deploy**  
   - Use modern bundler (Vite or Parcel) with scripts: `npm run dev`, `npm build`, `npm preview`.  
   - Output to a `dist/` folder ready for Vercel/GitHub Pages.

Use Three.js for 3D, Anime.js for all timeline‑driven and staggered animations, and vanilla ES modules. Keep code modular, with clear comments for each feature block. ”
-->
