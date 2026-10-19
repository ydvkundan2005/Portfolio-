# Kundan Prasad Yadav — Portfolio

A responsive portfolio for Kundan Prasad Yadav, a B.Tech Computer Science and Engineering student at Aditya University (Class of 2027).

**Live site:** https://ydvkundan2005.github.io/Portfolio-/  
**Repository:** https://github.com/ydvkundan2005/Portfolio-

## Design and implementation

- Minimal dark visual system with warm editorial typography and a restrained Claude-inspired terracotta accent (#D97757).
- Circular portrait at the start of the hero with deliberate face crop and an editorial name caption.
- Three.js sculpture with its geometry preserved, warm terracotta lighting, wireframe details, orbital rings, fine particles, and pointer-responsive movement.
- Native scroll reveals, reading progress, active section navigation, interactive portrait framing, and subtle editorial graphics in the About and Skills sections.
- Mobile navigation and reduced-motion support.
- Semantic HTML, keyboard focus states, and descriptive image text.

## Project structure

- index.html
- assets/css/styles.css
- assets/js/main.js
- assets/js/scene.js

## Sections

- **Introduction:** academic context, interests, and résumé link.
- **About:** Java, data structures and algorithms, and backend development.
- **Skills:** languages, backend, frontend, data, tools, and cloud/AI learning.
- **Projects:** Library Hub API System, Real-Time OTP System, SkillDzire Internship, and Deloitte Data Simulation.
- **Contact:** email, LinkedIn, GitHub, LeetCode, HackerRank, and CodeChef.

## Run locally

No build step is required. Open index.html in a browser, or run a static server:

    python3 -m http.server 8000

Then visit http://localhost:8000.

The 3D scene loads Three.js as an ES module from jsDelivr. If WebGL or the module cannot load, the scene area retains a CSS-based fallback illustration.

## Contact form

The contact form validates its fields and opens the visitor's default email application with the message prepared. It does not transmit or store submissions on a backend.

## Deployment

The static site is deployed using GitHub Pages. Paths are relative to the repository root; no framework build is required.
