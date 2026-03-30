# Frontend Developer Portfolio (static)

This is a minimal, responsive portfolio template built for a frontend developer. It uses Font Awesome icons (no emojis), CSS animations, and light JavaScript for interactions and scroll reveals.

What you get

- `index.html` — single-page layout with hero, about, skills, projects, contact, and footer.
- `css/styles.css` — variables, responsive layout, animations, and reveal effects.
- `js/main.js` — nav toggle, smooth scroll, reveal on scroll, small typing loop, and card hover tilt.

Run locally

1. Easiest: open `index.html` in a browser.
2. Recommended (serves files over a local server):
   - With Node tools installed, run a static server (from project root):

     ```powershell
     npx http-server -c-1 .; # or: npx serve . -p 3000
     ```

   - Or use the VS Code Live Server extension and open the workspace folder.

Customizing

- Replace `YourName` in `index.html` with your real name.
- Update project cards with real thumbnails, links and descriptions.
- Swap or add Font Awesome icons — the template uses Font Awesome 6 CDN.

Accessibility & performance notes

- Uses semantic HTML, focus outlines, and avoids emojis per requirement.
- Keep images optimized and prefer vector assets for best performance.

Next improvements (optional)

- Add build tooling (Vite) and React/Next.js if you want a component-based approach.
- Integrate contact form backend (formspree, netlify functions) or add form validation.
- Add keyboard navigation tests and automated Lighthouse checks.
