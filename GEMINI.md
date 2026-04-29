# Noor Al-Huda Project Guidance

## Architecture & Tech Stack
- **Stack:** This project strictly uses **Vanilla HTML5, CSS3, and JavaScript**.
- **Frameworks:** Do **NOT** use Next.js, React, Tailwind CSS, Node.js backend, or any other heavy frameworks/build tools.
- **Goal:** Maintain a lightweight, lightning-fast static application that can be served from any basic web server without a build step.

## Styling Conventions
- All styles must be written in pure CSS (`css/style.css`).
- Use CSS variables (`:root`) for the "Desert Dawn" color palette and spacing system.
- Follow a mobile-first responsive design approach using standard media queries.
- Support dark mode using the `[data-theme='dark']` attribute selector on the `body` tag.
- Ensure RTL (Right-to-Left) support for Arabic text using the `dir="rtl"` attribute and appropriate CSS logical properties where necessary.

## JavaScript Conventions
- All JavaScript must be Vanilla JS (`js/main.js`).
- Do not introduce npm packages or module bundlers (like Webpack or Vite) unless explicitly requested.
- If external libraries are needed (e.g., for icons or fonts), use CDN links in the HTML `<head>`.

## Design System
- **Fonts:** Playfair Display (Headings), DM Sans (Body), Noto Naskh Arabic (Arabic Text).
- **Icons:** Phosphor Icons (via CDN).
- **Colors:** Strictly adhere to the Desert Dawn palette defined in `style.css`.
