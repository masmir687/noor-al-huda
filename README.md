# 🕌 Noor Al-Huda — Islamic Dawah Web Application
### *"Invite to the way of your Lord with wisdom and good instruction"* — Quran 16:125

**Noor Al-Huda** (نور الهدى — Light of Guidance) is a comprehensive, lightning-fast, and entirely static Islamic Dawah web application. It is designed to be a complete, trusted digital platform for spreading Islamic knowledge, facilitating learning, and supporting both Muslims and non-Muslims exploring Islam.

---

## 🌟 Core Features

- **📖 Dynamic Quran Reader:** Full 114 Surahs fetched dynamically from the Al-Quran Cloud API. Includes Uthmani script, multiple English translations (Sahih International, Yusuf Ali, Pickthall), and dynamic font resizing.
- **🎧 Authentic Audio Engine:** High-quality, Ayah-by-Ayah MP3 recitation synchronized with the text, streamed directly from the EveryAyah CDN.
- **📚 Hadith Library:** Access to the Six Canonical Books (Kutub al-Sittah) via a clean, structured UI.
- **🎓 Learning Center:** Structured, visually appealing tutorial modules for Beginners, Intermediates, and Advanced learners.
- **❓ Q&A Section:** Searchable database of scholarly answers to common questions, complete with verification tags and video references.
- **🎬 Video & Media Hub:** Curated video lectures and Islamic podcasts presented in an elegant grid layout with rich gradient thumbnails.
- **⏱️ Persistent Player & Prayer Times:** A global audio player that persists across the bottom of the screen, and a sleek daily prayer time widget.

---

## 🏗️ System Architecture

Noor Al-Huda was intentionally designed to **bypass heavy modern frameworks** (like React, Next.js, or Node.js backends) to ensure maximum performance, zero build steps, and easy hosting on any static file server.

### The "Serverless" Data Loader Pattern
The application relies on a custom Vanilla JS architecture that mimics a backend database entirely on the client side:
1.  **Data Layer (`/data/`):** All content (Hadiths, Q&A, Video links) is stored in raw `.json` files.
2.  **Logic Layer (`js/data-loader.js`):** When a user navigates to a page, this script dynamically fetches the relevant JSON file and renders the HTML cards into the DOM instantly.
3.  **External APIs:** The Quran text and translations are fetched dynamically from `api.alquran.cloud`, ensuring the application remains lightweight while providing the full text of the Quran.

### Audio Architecture
- **Quran Recitation:** MP3 files are fetched on-the-fly from `everyayah.com` using a strict `Surah (3 digits) + Ayah (3 digits).mp3` formatting system (e.g., `001001.mp3` for Surah Al-Fatiha, Ayah 1).
- **Global Text-to-Speech:** To guarantee playback for users without native Arabic OS voice packs, the persistent "Listen" buttons bypass the Web Speech API and fetch perfect pronunciation audio directly from Google's Translate TTS endpoint.

---

## 🎨 UI/UX Design System

The application uses a custom design system called **"Desert Dawn"**, inspired by classical Islamic architecture (sacred geometry, calligraphic elegance) merged with modern minimalism.

### Color Palette
- **Primary:** Emerald Green (`#1A6B47`), Deep Forest (`#0F4A31`)
- **Secondary:** Golden Amber (`#C8922A`)
- **Tertiary:** Royal Teal (`#1A7B8A`)
- **Neutrals:** Parchment (`#F5F0E8`), Cream (`#FDFAF5`), Ink Charcoal (`#1C1C1E`)

### Typography
- **Headings:** Playfair Display
- **Body Text:** DM Sans
- **Arabic Text (Quran):** Noto Naskh Arabic

---

## 📂 Project Structure

```text
noor-al-huda/
│
├── index.html           # Homepage (Hero, Quick Access, Daily Widgets)
├── quran.html           # Advanced Quran Reader (Dynamic API fetcher)
├── hadith.html          # Hadith Collections Grid
├── learn.html           # Islamic Tutorials Grid
├── qa.html              # Scholarly Q&A Feed
├── videos.html          # Curated Video Lectures
├── media.html           # Podcasts & Nasheeds
│
├── css/
│   └── style.css        # The entire custom "Desert Dawn" design system
│
├── js/
│   ├── main.js          # Core logic (Mobile menu, Theme toggle, Global Audio)
│   ├── quran.js         # Advanced Quran API fetching, Audio Sync, and Sidebar logic
│   └── data-loader.js   # Fetches and renders JSON data for all inner pages
│
├── data/
│   ├── quran_meta.js    # Pre-downloaded 114 Surah Metadata (for instant offline sidebar)
│   ├── hadith.json      # Structured Hadith books data
│   ├── learn.json       # Tutorials data
│   ├── qa.json          # Q&A data
│   ├── videos.json      # Video library data
│   └── media.json       # Podcast data
│
└── images/
    └── favicon.svg      # Custom geometric Rub el Hizb app icon
```

---

## 🚀 Setup & Development

Because Noor Al-Huda is a pure HTML/CSS/JS static site, **there are no `npm install` or build steps required.**

### Running Locally
To view the site with all dynamic JSON data loading correctly, you **must** serve it over a local HTTP server (browsers block local `file://` fetch requests for security).

**Using VS Code:**
1. Install the **Live Server** extension.
2. Open `index.html`.
3. Click **"Go Live"** in the bottom right corner.

**Using Python:**
```bash
# Run this command in the project root directory
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

---
*بَارَكَ اللَّهُ فِيكُمْ — May Allah bless your work*