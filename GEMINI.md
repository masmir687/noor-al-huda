# Noor Al-Huda Project Guidance

## Architecture & Tech Stack
- **Stack:** Pure **Vanilla HTML5, CSS3, and JavaScript**. No frameworks (React, Vue, Next.js, etc.) or build tools (Webpack, Vite).
- **Core Pattern:** **CSR (Client-Side Rendering) with Static Data**. Data is stored in local JSON files (`data/`) and fetched via AJAX/Fetch API.
- **Routing:** Combination of file-based routing (`quran/1/index.html`) and state-based rendering.
- **State Management:** `localStorage` is used for persistable state (Bookmarks, Language, Theme, Playback settings).
- **Media:** Integrated SpeechSynthesis for TTS and YouTube API for video playback.
- **i18n:** Custom module for English (EN) and Bengali (BN) support.

## Project Structure (Files & Folders)

| Path | Purpose / Use Case |
| :--- | :--- |
| `collection/` | Entry points for Hadith collections (Bukhari, Muslim, etc.). |
| `css/` | Contains `style.css` - the single source of truth for all project styling. |
| `data/` | JSON datasets for Quran, Hadith, Learning, and Media content. |
| `images/` | Static assets: favicon, PWA icons, etc. |
| `js/` | Core logic. `main.js` handles global UI, `quran.js` handles reader logic. |
| `quran/` | Static directories for each Surah to enable clean URL routing. |
| `incremental-updates/`| **Internal Docs:** Stores Markdown files documenting every major feature or fix. |
| `index.html` | Homepage and primary landing page. |
| `sw.js` | Service Worker for PWA capabilities (offline support, caching). |
| `manifest.json` | PWA configuration file. |

## Core Functionalities (JS Function Map)

| Function | Location | Use Case |
| :--- | :--- | :--- |
| `toggleSpeech` | `main.js` | Global TTS engine for reading Arabic/Translations. |
| `performShare` | `main.js` | Generates shareable images using html2canvas. |
| `closeMenu` | `main.js` | Handles mobile navigation collapse on scroll/click. |
| `loadSurah` | `quran.js` | Fetches and renders Surah data based on ID. |
| `loadBook` | `hadith-reader.js` | Loads specific Hadith collections and handles pagination. |
| `translatePage`| `i18n.js` | Re-renders UI text based on the selected language. |
| `loadBookmarks`| `bookmarks-page.js`| Retrieves and renders user-saved items from localStorage. |
| `toggleSidebar`| `main.js` | Global UI handler for Quran/Hadith sidebars. |

## Incremental Updates Workflow
- **Rule:** Every significant change must be documented in `incremental-updates/`.
- **Format:** Use a single file per day: `YYYY-MM-DD.md`.
- **Content:** Append updates throughout the day to the same file to reduce file clutter.

## Styling Conventions
- All styles in `css/style.css`.
- Use `:root` variables for the "Desert Dawn" palette.
- Mobile-first (Navbar height: **54px**).
- RTL support via `dir="rtl"` and logical properties.

## Design System
- **Fonts:** Playfair Display, DM Sans, Noto Naskh Arabic.
- **Icons:** Phosphor Icons.
- **Colors:** Primary: `#0F4A31` (Emerald), Accent: `#C8922A` (Gold).
