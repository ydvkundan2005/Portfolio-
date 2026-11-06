# Kundan Prasad Yadav — Portfolio

A responsive personal portfolio for a B.Tech Computer Science and Engineering student at Aditya University (Class of 2027).

**Live site:** https://ydvkundan2005.github.io/Portfolio-/  
**Repository:** https://github.com/ydvkundan2005/Portfolio-

## Purpose

The portfolio provides a concise introduction, technical areas, selected project summaries and professional contact links. Its content is intended to complement—not replace—the source code and implementation details in the linked repositories.

## Selected public projects

| Project | Focus | Source |
|---|---|---|
| FloatCam | Electron desktop application, WebRTC and local-network signalling | [GitHub](https://github.com/ydvkundan2005/FloatCam) |
| LocalBridge | Kotlin Android and Swift macOS application, local file and text transfer | [GitHub](https://github.com/ydvkundan2005/LocalBridge) |
| BloodByte | JavaScript, Firebase, geolocation and proximity-based request discovery | [GitHub](https://github.com/ydvkundan2005/BloodByte) |
| QuietSend | Browser-based text sharing with Firebase Realtime Database | [GitHub](https://github.com/ydvkundan2005/Secure-Text-send-and-receive-by-otp-2) |

Project status and limitations are documented in each repository. A project summary on the portfolio should not be interpreted as a claim that it has passed a production security or reliability audit.

## Design and implementation

- Editorial hero layout with the main statement first, followed by a compact portrait and profile details.
- Responsive single-page layout with section navigation.
- Three.js-based animated hero visual with responsive camera framing and a CSS fallback.
- Scroll-triggered section reveals and subtle interactive details.
- Distinct SVG illustrations for the About and Skills sections.
- Mobile navigation and reduced-motion support.
- Semantic HTML, keyboard focus states and descriptive image text.
- Static deployment through GitHub Pages.

## Project structure

- `index.html` — page content and semantic structure
- `assets/css/styles.css` — design system and responsive styles
- `assets/js/main.js` — navigation and interaction behavior
- `assets/js/scene.js` — Three.js hero scene
- `assets/images/` — section illustrations

## Run locally

No build step is required. Open `index.html` in a browser, or start a local static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

The 3D scene loads Three.js as an ES module from jsDelivr. Its camera is resized to the scene container so the primary sculpture and orbital rings remain in view as the layout changes. If WebGL or the module cannot load, the scene area retains a CSS-based fallback illustration.

## Contact form

The contact form validates its fields and opens the visitor's default email application with the message prepared. It does not transmit or store submissions on a backend.

## Deployment

The static site is deployed using the GitHub Pages workflow in `.github/workflows/static.yml`. Paths are relative to the repository root; no framework build is required.
