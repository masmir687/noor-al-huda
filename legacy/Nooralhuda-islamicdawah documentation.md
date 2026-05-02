# 🕌 Noor Al-Huda — Islamic Dawah Web Application
### *"ٱدْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِٱلْحِكْمَةِ وَٱلْمَوْعِظَةِ ٱلْحَسَنَةِ"*
#### *"Invite to the way of your Lord with wisdom and good instruction"* — Quran 16:125

---

| Field | Details |
|---|---|
| **Application Name** | Noor Al-Huda (نور الهدى) — Light of Guidance |
| **Document Type** | Full Technical & Design Documentation |
| **Version** | 1.0.0 |
| **Date** | April 2026 |
| **Status** | Draft — Ready for Development |
| **Audience** | Muslims, Reverts, Non-Muslims seeking knowledge |
| **Platform** | Web Application (Responsive PWA) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Requirements](#2-requirements)
3. [UI/UX Design System](#3-uiux-design-system)
4. [Application Pages & Screens](#4-application-pages--screens)
5. [System Architecture](#5-system-architecture)
6. [Feature Module Specifications](#6-feature-module-specifications)
7. [Database Schema](#7-database-schema)
8. [Technology Stack](#8-technology-stack)
9. [Phase-wise Implementation Plan](#9-phase-wise-implementation-plan)
10. [SEO, Accessibility & Performance](#10-seo-accessibility--performance)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

### 1.1 Vision

**Noor Al-Huda** (نور الهدى — Light of Guidance) is a comprehensive Islamic Dawah web application designed to be a complete, trusted digital platform for spreading Islamic knowledge, facilitating learning, and supporting both Muslims deepening their faith and non-Muslims exploring Islam. The platform serves as an all-in-one Islamic knowledge hub encompassing the Holy Quran, Hadith collections, scholarly tutorials, live Q&A, embedded media content, and podcast resources.

### 1.2 Mission Statement

> *To make authentic Islamic knowledge accessible, searchable, and engaging for every person on Earth — in their language, on any device, at any time — through a beautiful, modern digital experience rooted in scholarly credibility.*

### 1.3 Problem Statement

Muslims and seekers of Islamic knowledge currently face several fragmented challenges:

- **Scattered resources**: Quran on one site, Hadiths on another, videos elsewhere, no unified platform
- **Poor UX**: Most Islamic sites have outdated, non-responsive designs that discourage younger audiences
- **No Dawah focus**: Existing platforms cater to practicing Muslims but lack beginner-friendly, Dawah-oriented content for non-Muslims
- **Language barriers**: Limited multilingual support across existing platforms
- **No engagement layer**: No built-in Q&A, no community interaction, no curated learning paths

### 1.4 Solution Overview

Noor Al-Huda solves these problems by delivering:

- 📖 **Full Quran** with Arabic, transliteration, multiple translations, and recitation audio
- 📚 **Hadith Library** with Sahih Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah (Six Books)
- 🎓 **Tutorial Center** with structured courses for beginners, intermediate, and advanced learners
- ❓ **Q&A Section** with written answers and embedded YouTube scholar videos
- 🎬 **Video Library** with curated YouTube embeds for lectures, debates, and Dawah content
- 🎧 **Media Center** with Quran recitation audio, Islamic podcasts, and embedded streams
- 🔍 **Unified Search** across all content types

### 1.5 Key Differentiators

| Feature | Noor Al-Huda | Typical Islamic Sites |
|---|---|---|
| Unified Platform | ✅ All-in-one | ❌ Siloed content |
| Modern Responsive UI | ✅ Mobile-first PWA | ❌ Desktop-only legacy |
| Dawah-Focused Onboarding | ✅ Beginner paths for non-Muslims | ❌ Assumes prior knowledge |
| Embedded YouTube/Media | ✅ Curated video + audio | ❌ External links only |
| Multilingual Support | ✅ Arabic, English, Urdu, French, Turkish | ❌ English only |
| Full Quran + Audio | ✅ Integrated with reciter selection | ⚠️ Basic or external |
| Full Hadith 6 Books | ✅ Searchable with grading | ⚠️ Limited or paid |
| Q&A with Video Answers | ✅ Text + YouTube embed | ❌ Text only |
| PWA / Offline | ✅ Installable, partial offline | ❌ No PWA |
| Dark Mode | ✅ Full dark/light themes | ❌ Light only |

---

## 2. Requirements

### 2.1 Functional Requirements

#### 2.1.1 Quran Module

| ID | Requirement | Priority |
|---|---|---|
| FR-QUR-01 | Display the full Holy Quran with all 114 Surahs and 6,236 Ayahs | Must-Have |
| FR-QUR-02 | Show Arabic text in Uthmani Quran script (Naskh/Hafs) | Must-Have |
| FR-QUR-03 | Provide English transliteration alongside Arabic | Must-Have |
| FR-QUR-04 | Offer multiple translation options (English, Urdu, French, Turkish minimum) | Must-Have |
| FR-QUR-05 | Provide Surah-by-Surah and Ayah-by-Ayah audio recitation (multiple reciters: Al-Sudais, Al-Ghamdi, Mishary, etc.) | Must-Have |
| FR-QUR-06 | Enable per-Ayah playback with auto-advance through Surah | Must-Have |
| FR-QUR-07 | Show Surah metadata: Meccan/Medinan, number of Ayahs, Juz number, revelation order | Must-Have |
| FR-QUR-08 | Allow users to bookmark and save Ayahs | Should-Have |
| FR-QUR-09 | Enable sharing of individual Ayahs via link or image card | Should-Have |
| FR-QUR-10 | Display Word-by-word translation for each Ayah | Should-Have |
| FR-QUR-11 | Tafsir integration (Ibn Kathir, Al-Tabari brief notes per Ayah) | Should-Have |
| FR-QUR-12 | Quran search by Arabic text, transliteration, or English keyword | Must-Have |
| FR-QUR-13 | Juz (Para) navigation alongside Surah navigation | Must-Have |
| FR-QUR-14 | Last-read position memory across sessions | Should-Have |

#### 2.1.2 Hadith Library

| ID | Requirement | Priority |
|---|---|---|
| FR-HAD-01 | Include the Six Canonical Hadith Books (Kutub al-Sittah) | Must-Have |
| FR-HAD-02 | Sahih Al-Bukhari — full collection (7,563 Hadiths), organized by Book and Chapter | Must-Have |
| FR-HAD-03 | Sahih Muslim — full collection organized by Book | Must-Have |
| FR-HAD-04 | Sunan Abu Dawud, Jami At-Tirmidhi, Sunan An-Nasai, Sunan Ibn Majah | Must-Have |
| FR-HAD-05 | Each Hadith displays: Arabic text, English translation, narrator chain (Isnad), grading | Must-Have |
| FR-HAD-06 | Hadith grading labels: Sahih, Hasan, Da'if with color indicators | Must-Have |
| FR-HAD-07 | Search across all Hadiths by keyword, narrator, or topic | Must-Have |
| FR-HAD-08 | Browse by Book → Chapter → Hadith hierarchical navigation | Must-Have |
| FR-HAD-09 | Hadith of the Day on home page | Should-Have |
| FR-HAD-10 | Bookmark and share individual Hadiths | Should-Have |
| FR-HAD-11 | Cross-reference related Hadiths within same topic | Nice-to-Have |

#### 2.1.3 Tutorial / Learning Center

| ID | Requirement | Priority |
|---|---|---|
| FR-TUT-01 | Structured learning paths: Beginner (Non-Muslim Introduction), Intermediate (Pillars), Advanced (Fiqh/Aqeedah) | Must-Have |
| FR-TUT-02 | Each tutorial has: title, description, estimated time, difficulty level, category | Must-Have |
| FR-TUT-03 | Tutorial content supports rich text, images, Quran/Hadith citations with inline links | Must-Have |
| FR-TUT-04 | Lesson progress tracking (completed / in-progress / not started) | Should-Have |
| FR-TUT-05 | Category tagging: Aqeedah, Fiqh, Seerah, Akhlaq, Prayer, Fasting, Hajj, Zakat, etc. | Must-Have |
| FR-TUT-06 | Admin CMS to create, edit, and publish tutorials | Must-Have |
| FR-TUT-07 | Tutorial search by keyword, category, difficulty | Must-Have |
| FR-TUT-08 | Estimated reading time displayed per article | Nice-to-Have |
| FR-TUT-09 | Related tutorials suggestion at end of each lesson | Should-Have |
| FR-TUT-10 | Print / PDF export of tutorial content | Nice-to-Have |

#### 2.1.4 Q&A Module

| ID | Requirement | Priority |
|---|---|---|
| FR-QNA-01 | Display a searchable Q&A database with Islamic questions and scholarly answers | Must-Have |
| FR-QNA-02 | Each Q&A entry: Question, Detailed Answer, Scholar attribution, Category tags, References | Must-Have |
| FR-QNA-03 | Embed one or more YouTube videos per Q&A answer (from scholars like Yasir Qadhi, Mufti Menk, etc.) | Must-Have |
| FR-QNA-04 | Users can submit questions via a form (routed to admin for moderation) | Should-Have |
| FR-QNA-05 | Browse Q&A by category (Prayer, Marriage, Finance, Aqeedah, etc.) | Must-Have |
| FR-QNA-06 | Search Q&A by keyword | Must-Have |
| FR-QNA-07 | Upvote/helpful rating on Q&A (no login required) | Nice-to-Have |
| FR-QNA-08 | Featured/Pinned Q&A on home page | Should-Have |
| FR-QNA-09 | Related Q&A suggestions at the bottom of each answer | Should-Have |
| FR-QNA-10 | Q&A filter: answered vs. pending | Should-Have |

#### 2.1.5 Video Library

| ID | Requirement | Priority |
|---|---|---|
| FR-VID-01 | Curated video library with embedded YouTube videos | Must-Have |
| FR-VID-02 | Video categories: Dawah, Lectures, Debates, Quran Recitation, Seerah, Documentaries | Must-Have |
| FR-VID-03 | Each video entry: title, description, scholar/speaker, duration, category, embed | Must-Have |
| FR-VID-04 | Lazy-loaded YouTube embeds (load player only on user click) | Must-Have |
| FR-VID-05 | Video search and filter by category and speaker | Must-Have |
| FR-VID-06 | Featured video / "Watch of the Week" on home page | Should-Have |
| FR-VID-07 | Video playlists / curated collections | Should-Have |
| FR-VID-08 | Save/bookmark videos to personal list | Nice-to-Have |

#### 2.1.6 Media Center (Podcast & Audio)

| ID | Requirement | Priority |
|---|---|---|
| FR-MED-01 | Embedded Quran recitation audio player with Surah selector | Must-Have |
| FR-MED-02 | Support multiple Quran reciters (Al-Sudais, Mishary Al-Afasy, Al-Husary, etc.) | Must-Have |
| FR-MED-03 | Islamic podcast embeds (Spotify, Anchor, YouTube audio embeds) | Must-Have |
| FR-MED-04 | Persistent audio player bar at bottom of screen (does not stop on navigation) | Must-Have |
| FR-MED-05 | Audio player controls: play/pause, seek, volume, speed (0.75x, 1x, 1.25x, 1.5x) | Must-Have |
| FR-MED-06 | Download Quran audio per Surah (where licensing permits) | Nice-to-Have |
| FR-MED-07 | Playlist of podcast episodes with episode descriptions | Should-Have |
| FR-MED-08 | "Now Playing" notification on mobile (via Media Session API) | Nice-to-Have |

#### 2.1.7 General / App-Level

| ID | Requirement | Priority |
|---|---|---|
| FR-APP-01 | Responsive design: mobile (320px+), tablet, desktop | Must-Have |
| FR-APP-02 | PWA: installable with offline reading for cached Quran pages | Should-Have |
| FR-APP-03 | Light / Dark mode with system preference detection | Must-Have |
| FR-APP-04 | RTL (Right-to-Left) language support for Arabic text throughout | Must-Have |
| FR-APP-05 | Global search across all modules (Quran, Hadith, Tutorials, Q&A, Videos) | Must-Have |
| FR-APP-06 | Multilingual UI: English, Arabic, Urdu, French, Turkish | Should-Have |
| FR-APP-07 | Prayer Time widget (based on user location via geolocation or manual city) | Should-Have |
| FR-APP-08 | Daily Dhikr / Ayah of the Day widget on home page | Should-Have |
| FR-APP-09 | Hijri calendar display alongside Gregorian | Nice-to-Have |
| FR-APP-10 | Social sharing (Twitter/X, WhatsApp, Telegram, Facebook) | Should-Have |
| FR-APP-11 | Contact / Feedback form with admin email routing | Must-Have |
| FR-APP-12 | Admin dashboard for content management (CMS) | Must-Have |

### 2.2 Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | First Contentful Paint < 1.5s; Largest Contentful Paint < 2.5s |
| NFR-02 | Performance | Quran page loads all Ayahs within 500ms after first paint |
| NFR-03 | Accessibility | WCAG 2.1 AA compliance; Arabic text reads correctly with RTL screen readers |
| NFR-04 | Security | All content served over HTTPS; no user data stored without consent |
| NFR-05 | SEO | Every Surah, Hadith, Q&A, and Tutorial has unique, crawlable URL |
| NFR-06 | Scalability | Architecture supports 50,000 concurrent visitors without degradation |
| NFR-07 | Availability | 99.9% uptime SLA; CDN-backed static assets |
| NFR-08 | Content Integrity | All Quran text verified against official Medina Mushaf; Hadiths from Sunnah.com API |
| NFR-09 | Privacy | GDPR-compliant; no tracking without consent; cookies policy page |
| NFR-10 | PWA | Lighthouse score: Performance >= 90, Accessibility >= 95, SEO >= 95, PWA = 100 |
| NFR-11 | Multilingual | Arabic text renders in Uthmani Quran font (Amiri Quran / Hafs) |
| NFR-12 | Media | YouTube embeds use privacy-enhanced mode (youtube-nocookie.com) |

### 2.3 Constraints & Assumptions

- All Quran data uses the open Quran.com / Al-Quran Cloud API or static JSON (no licensing cost)
- Hadith data sourced from Sunnah.com's open API or static dataset (creative commons licensed)
- YouTube embeds are used for video/audio; no self-hosting of copyrighted recitation without permission
- No user authentication required for content consumption; auth needed only for bookmarks/progress
- The CMS admin area is a separate, password-protected route
- RTL and LTR content can coexist on the same page with proper CSS logical properties

---

## 3. UI/UX Design System

### 3.1 Design Philosophy

**Aesthetic Direction: Sacred Geometry meets Modern Minimalism**

The design draws inspiration from classical Islamic architecture — intricate geometric patterns, calligraphic elegance, the serenity of sacred spaces — merged with the clarity and accessibility of modern web design. The result is a platform that feels *trustworthy, beautiful, and timeless* without being heavy or dated.

**Core Principles:**
- **Reverence** — The Quran and Hadith are sacred; the UI must reflect dignity and respect
- **Clarity** — Knowledge should be easy to find and read; zero cognitive clutter
- **Warmth** — Welcoming for non-Muslims exploring Islam; not intimidating or preachy
- **Accessibility** — Readable Arabic + English at all font sizes; strong contrast ratios

### 3.2 Color Palette

#### Primary Palette — "Desert Dawn"

| Role | Name | Hex | Usage |
|---|---|---|---|
| **Primary** | Emerald Green | `#1A6B47` | Primary buttons, active states, CTAs |
| **Primary Light** | Mint Emerald | `#2D9A68` | Hover states, highlights |
| **Primary Dark** | Deep Forest | `#0F4A31` | Dark mode primary, footer |
| **Secondary** | Golden Amber | `#C8922A` | Accents, Quranic verse numbers, icons |
| **Secondary Light** | Warm Gold | `#E8B84B` | Hover accents, star ratings |
| **Tertiary** | Royal Teal | `#1A7B8A` | Video/Media module accent |
| **Neutral Dark** | Ink Charcoal | `#1C1C1E` | Dark mode background |
| **Neutral Mid** | Warm Stone | `#6B6560` | Secondary text, metadata |
| **Neutral Light** | Parchment | `#F5F0E8` | Light mode background (warm white) |
| **Surface** | Cream | `#FDFAF5` | Cards, panels (light mode) |
| **Border** | Sand | `#E2D9CC` | Dividers, input borders (light mode) |
| **Error** | Vermillion | `#C0392B` | Errors, Da'if hadith indicator |
| **Success** | Sage | `#27AE60` | Sahih hadith indicator |
| **Warning** | Amber | `#E67E22` | Hasan hadith indicator |

#### Dark Mode Overrides

| Role | Hex | Description |
|---|---|---|
| Background | `#0F1117` | Deep near-black with blue tint |
| Surface | `#1A1D27` | Elevated card surface |
| Surface Raised | `#22263A` | Higher elevation cards |
| Border | `#2D3150` | Subtle dark borders |
| Text Primary | `#F0ECE4` | Warm white text |
| Text Secondary | `#9A9BA8` | Muted text |

### 3.3 Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| **Display / Hero** | Cinzel Decorative | 700 | Section headers, hero titles |
| **UI Headings** | Playfair Display | 600, 700 | Page titles, card headings |
| **Body Text** | Lora | 400, 500 | Article content, descriptions |
| **UI Labels / Nav** | DM Sans | 400, 500, 600 | Navigation, labels, metadata |
| **Arabic Quran** | Amiri Quran | 400 | Full Quran Arabic text |
| **Arabic UI** | Noto Naskh Arabic | 400, 700 | Arabic labels, Hadith Arabic |
| **Monospace / Ref** | JetBrains Mono | 400 | Verse references, hadith numbers |

#### Type Scale

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `--text-xs` | 12px | 1.4 | Metadata, captions |
| `--text-sm` | 14px | 1.5 | Labels, tags |
| `--text-base` | 16px | 1.6 | Body text |
| `--text-lg` | 18px | 1.6 | Lead paragraphs |
| `--text-xl` | 22px | 1.4 | Card headings |
| `--text-2xl` | 28px | 1.3 | Section headings |
| `--text-3xl` | 36px | 1.2 | Page titles |
| `--text-4xl` | 48px | 1.1 | Hero titles |
| `--text-arabic-base` | 24px | 1.8 | Quran Ayah base size |
| `--text-arabic-lg` | 32px | 1.9 | Quran display size |

### 3.4 Iconography & Ornamentation

- **Icon Library**: Phosphor Icons (open source, consistent, elegant)
- **Custom Icons**: Mosque silhouette, Kaaba, Crescent Moon, Open Book, Tasbeeh beads
- **Geometric Borders**: CSS-drawn Islamic geometric border patterns for section dividers
- **Bismillah Header**: Decorative Bismillah (`بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`) displayed at start of each Quran Surah in ornamental frame
- **Ornamental Dividers**: SVG geometric star patterns as section separators

### 3.5 Spacing & Layout

```
Spacing Scale (4px base unit):
--space-1:  4px   (tight)
--space-2:  8px   (small)
--space-3:  12px
--space-4:  16px  (base)
--space-5:  20px
--space-6:  24px  (medium)
--space-8:  32px
--space-10: 40px
--space-12: 48px  (large)
--space-16: 64px  (section gap)
--space-24: 96px  (hero gap)

Layout:
- Max content width: 1280px
- Wide content width: 1440px
- Sidebar width: 280px
- Card border radius: 12px (standard), 20px (featured)
- Button border radius: 8px
- Input border radius: 8px
```

### 3.6 Component Library

#### Buttons

```
Primary Button:    bg-emerald, white text, hover: bg-emerald-dark
Secondary Button:  border-emerald, emerald text, hover: bg-emerald/10
Ghost Button:      transparent, neutral text, hover: bg-neutral/10
Gold Accent:       bg-amber, dark text (for featured CTAs)
Danger:            bg-vermillion, white text
```

#### Cards

```
Content Card:      white/surface bg, 1px border, 12px radius, 16px padding, subtle shadow
Featured Card:     gradient bg (emerald-to-teal), white text, 20px radius, gold accent border
Ayah Card:         parchment bg, Arabic right, translation left, verse number badge
Hadith Card:       surface bg, grading badge (green/yellow/red), narrator chain collapsible
Video Card:        thumbnail with play overlay, title, speaker, duration badge
```

---

## 4. Application Pages & Screens

### 4.1 Site Map

```
🏠 Home (/)
│
├── 📖 Quran (/quran)
│   ├── Surah Index (/quran)
│   ├── Surah View (/quran/[surah-number]/[surah-name])
│   ├── Ayah Detail (/quran/[surah]/[ayah])
│   └── Search Results (/quran/search?q=...)
│
├── 📚 Hadith (/hadith)
│   ├── Collection Index (/hadith)
│   ├── Book View (/hadith/[collection]/[book])
│   ├── Hadith Detail (/hadith/[collection]/[book]/[number])
│   └── Search Results (/hadith/search?q=...)
│
├── 🎓 Learn (/learn)
│   ├── Tutorial Index (/learn)
│   ├── Category View (/learn/[category])
│   ├── Tutorial Detail (/learn/[category]/[slug])
│   └── Learning Paths (/learn/paths)
│
├── ❓ Q&A (/qa)
│   ├── Q&A Index (/qa)
│   ├── Category Filter (/qa/[category])
│   ├── Q&A Detail (/qa/[slug])
│   └── Submit Question (/qa/submit)
│
├── 🎬 Videos (/videos)
│   ├── Video Library (/videos)
│   ├── Category View (/videos/[category])
│   └── Video Detail (/videos/[id])
│
├── 🎧 Media (/media)
│   ├── Quran Audio (/media/quran)
│   ├── Podcasts (/media/podcasts)
│   └── Episode Detail (/media/podcasts/[episode])
│
├── 🔍 Search (/search?q=...)
├── 📞 Contact (/contact)
├── ℹ️ About (/about)
└── 🔒 Admin (/admin) [password protected]
```

### 4.2 Home Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Quran | Hadith | Learn | Q&A | Videos   │
│           Media | 🔍 Search | 🌙 Dark Mode | 🌐 Language  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  HERO SECTION                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Geometric Islamic Pattern Background (animated)   │  │
│  │                                                    │  │
│  │   نور الهدى                                        │  │
│  │   NOOR AL-HUDA                                     │  │
│  │   Light of Guidance                                │  │
│  │                                                    │  │
│  │   "Your complete Islamic knowledge companion"      │  │
│  │                                                    │  │
│  │  [Explore Quran] [Start Learning] [Browse Q&A]     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ──── Ayah of the Day ────────────────────────────────   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Arabic Ayah (large, ornamental)                   │  │
│  │  Translation | Share | Listen | Read in Context    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ──── Quick Access Modules ───────────────────────────   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │📖    │ │📚    │ │🎓    │ │❓    │ │🎬    │ │🎧    │  │
│  │Quran │ │Hadth │ │Learn │ │ Q&A  │ │Video │ │Media │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                          │
│  ──── Featured Q&A ───────────────────────────────────   │
│  [Q&A Cards with video thumbnails — 3 columns]          │
│                                                          │
│  ──── Latest Tutorials ───────────────────────────────   │
│  [Tutorial Cards — 3 columns grid]                      │
│                                                          │
│  ──── Hadith of the Day ──────────────────────────────   │
│  [Full Hadith card — Arabic + English + Source]         │
│                                                          │
│  ──── Featured Videos ────────────────────────────────   │
│  [YouTube Embed Grid — 2x2 with lazy load]              │
│                                                          │
│  ──── Prayer Times Widget ────────────────────────────   │
│  [Fajr | Dhuhr | Asr | Maghrib | Isha] Location-based  │
│                                                          │
│  FOOTER: Logo | Links | Social | © | Privacy            │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Quran Reader Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (sticky)                                         │
├───────────────────┬─────────────────────────────────────┤
│                   │                                      │
│  SIDEBAR          │  MAIN CONTENT AREA                   │
│  ┌─────────────┐  │  ┌─────────────────────────────────┐ │
│  │ Surah List  │  │  │  Surah Header                   │ │
│  │ ─────────── │  │  │  ┌───────────────────────────┐  │ │
│  │ 1. Al-Fatiha│  │  │  │  سورة الفاتحة              │  │ │
│  │ 2. Al-Baqara│  │  │  │  Al-Fatiha (The Opening)   │  │ │
│  │ 3. Al-Imran │  │  │  │  Meccan • 7 Ayahs • Juz 1  │  │ │
│  │ ...         │  │  │  └───────────────────────────┘  │ │
│  │             │  │  │                                  │ │
│  │ Juz View    │  │  │  ┌───────────────────────────┐  │ │
│  │ ─────────── │  │  │  │    بِسْمِ ٱللَّٰهِ...         │  │ │
│  │ Juz 1-30    │  │  │  │  (Bismillah Ornament)      │  │ │
│  │             │  │  │  └───────────────────────────┘  │ │
│  │ Settings    │  │  │                                  │ │
│  │ ─────────── │  │  │  ── Ayah 1 ──────────────────── │ │
│  │ Translation │  │  │  ┌───────────────────────────┐  │ │
│  │ Reciter     │  │  │  │  ٱلْحَمْدُ لِلَّٰهِ رَبِّ ٱلْعَٰلَمِينَ  │  │ │
│  │ Font Size   │  │  │  │  Alhamdu lillahi rabb...   │  │ │
│  │             │  │  │  │  All praise is due to...   │  │ │
│  └─────────────┘  │  │  │  ▶️ | 🔖 | Share | Tafsir  │  │ │
│                   │  │  └───────────────────────────┘  │ │
│                   │  │                                  │ │
│                   │  │  [More Ayahs...]                 │ │
│                   │  └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  🎧 PERSISTENT AUDIO PLAYER (bottom bar)                 │
│  ◀ | ▶️ | ▶▶ | ━━━━●━━━━ | 🔊 | Speed | Surah Name      │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Q&A Detail Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
├─────────────────────────────────────────────────────────┤
│  Breadcrumb: Home > Q&A > Prayer > Can I pray while...  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ❓ QUESTION                                        │  │
│  │  "Is it permissible to combine prayers while       │  │
│  │   travelling? What is the distance limit?"         │  │
│  │                                                    │  │
│  │  Tags: [Prayer] [Travel] [Fiqh] [Hanafi] [Shafi]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ✍️ SCHOLARLY ANSWER                                │  │
│  │  By: Dr. Yasir Qadhi  |  Verified: ✅ Sahih ref    │  │
│  │                                                    │  │
│  │  [Full detailed answer text with Quran/Hadith      │  │
│  │   citations linked inline...]                      │  │
│  │                                                    │  │
│  │  References:                                       │  │
│  │  • Quran 4:101 — [View Ayah]                       │  │
│  │  • Sahih Muslim 1616 — [View Hadith]               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  🎬 VIDEO ANSWERS                                   │  │
│  │                                                    │  │
│  │  ┌──────────────────────┐ ┌──────────────────────┐ │  │
│  │  │  [YouTube Embed #1]  │ │  [YouTube Embed #2]  │ │  │
│  │  │  Mufti Menk          │ │  Yasir Qadhi         │ │  │
│  │  │  "Combining Prayers" │ │  "Traveller's Prayer"│ │  │
│  │  └──────────────────────┘ └──────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── Related Q&A ──────────────────────────────────────   │
│  [3 Related Question Cards]                             │
│                                                          │
│  ── Share This Answer ────────────────────────────────   │
│  [WhatsApp] [Telegram] [Twitter/X] [Copy Link]         │
└─────────────────────────────────────────────────────────┘
```

### 4.5 Media Center Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎧 MEDIA CENTER                                         │
│                                                          │
│  ── Tabs ──────────────────────────────────────────────  │
│  [Quran Audio] [Podcasts] [Lectures] [Nasheeds]         │
│                                                          │
│  ── QURAN AUDIO TAB ──────────────────────────────────   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Select Reciter:                                   │  │
│  │  [Al-Sudais ▼]  [Al-Afasy] [Al-Husary] [Al-Ghamdi]│  │
│  │                                                    │  │
│  │  Select Surah:  [Al-Fatiha ▼]                      │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  🕌  Now Playing                             │ │  │
│  │  │      Al-Fatiha — Sheikh Al-Sudais            │ │  │
│  │  │                                              │ │  │
│  │  │  ◀◀  ◀  ▶️  ▶  ▶▶   ━━━━━━●━━━━  🔊        │ │  │
│  │  │  1:23 ────────────────────────── 0:43 left  │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── PODCASTS TAB ────────────────────────────────────    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Podcast  │ │ Podcast  │ │ Podcast  │ │ Podcast  │   │
│  │ Cover 1  │ │ Cover 2  │ │ Cover 3  │ │ Cover 4  │   │
│  │ [Embed]  │ │ [Embed]  │ │ [Embed]  │ │ [Embed]  │   │
│  │ Title    │ │ Title    │ │ Title    │ │ Title    │   │
│  │ Host     │ │ Host     │ │ Host     │ │ Host     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  🎧 PERSISTENT PLAYER BAR (always visible)               │
│  ║ ◀◀ | ◀ | ▶️ | ▶ | ▶▶ ║ ━━━━●━━━━━ ║ 🔊 ║ 1x ║ ⋮ ║  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
                        USERS (Browser / Mobile PWA)
                               │
                    ┌──────────▼──────────┐
                    │   CDN (Cloudflare)   │
                    │   Static Assets &    │
                    │   Edge Caching       │
                    └──────────┬──────────┘
                               │
              ┌────────────────▼─────────────────┐
              │         NEXT.JS APPLICATION        │
              │      (SSR + SSG + API Routes)      │
              │                                    │
              │  ┌─────────────────────────────┐   │
              │  │       Page Router           │   │
              │  │  /quran  /hadith  /learn     │   │
              │  │  /qa  /videos  /media        │   │
              │  └────────────┬────────────────┘   │
              │               │                    │
              │  ┌────────────▼────────────────┐   │
              │  │      API Routes Layer        │   │
              │  │  /api/quran   /api/hadith    │   │
              │  │  /api/search  /api/content   │   │
              │  └────────────┬────────────────┘   │
              └───────────────┼────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼───────┐  ┌─────────▼──────┐  ┌─────────▼──────┐
│  Supabase DB   │  │  External APIs  │  │  Content Store  │
│  (PostgreSQL)  │  │                │  │  (Sanity CMS)   │
│                │  │ • Quran API    │  │                 │
│  • Users       │  │ • Sunnah API   │  │ • Tutorials     │
│  • Bookmarks   │  │ • Adhan API    │  │ • Q&A Answers   │
│  • Progress    │  │   (Prayer Time)│  │ • Blog Posts    │
│  • Q&A Queue   │  │ • YouTube Data │  │ • Media Meta    │
└────────────────┘  └────────────────┘  └─────────────────┘
```

### 5.2 Component Architecture

| Layer | Components | Technology |
|---|---|---|
| **Presentation** | Pages, UI Components, Layouts, Arabic Typography | Next.js 14, React 18, Tailwind CSS |
| **State Management** | Global state (language, theme, audio player, bookmarks) | Zustand |
| **Data Fetching** | Quran data, Hadith, Prayer times | SWR + React Query |
| **CMS Layer** | Tutorial content, Q&A, Video metadata | Sanity.io (free tier) |
| **Database** | User data, bookmarks, progress, submitted Q&A | Supabase (free tier) |
| **External Data** | Quran text + translation, Hadith, Prayer times | Quran.com API, Sunnah.com API, Adhan.js |
| **Media** | Quran audio, Podcast embeds, YouTube embeds | Al-Quran Cloud, YouTube iFrame API |
| **PWA** | Service Worker, Manifest, Offline | next-pwa, Workbox |
| **Auth (optional)** | Admin + optional user accounts | Supabase Auth / NextAuth |
| **Search** | Full-text search across all modules | Algolia Free Tier / Supabase FTS |
| **Analytics** | Privacy-respecting analytics | Plausible / Umami (self-hosted) |

### 5.3 Data Flow — Quran Module

```
1. User navigates to /quran/2/al-baqara
2. Next.js SSG: pre-renders page with Surah data from Quran.com API at build time
3. Translation overlay: fetched on client from static JSON (pre-bundled translations)
4. Audio: fetched from Al-Quran Cloud CDN on user click (lazy)
5. Bookmarks: read from Supabase if user is logged in, localStorage if not
6. Word-by-word: fetched from Quran.com API on Ayah hover/click
```

### 5.4 External APIs & Data Sources

| Service | Purpose | Cost | Rate Limit |
|---|---|---|---|
| **Quran.com API (v4)** | Quran text, translations, word-by-word, audio | Free | 1000 req/day |
| **Al-Quran Cloud API** | Alternative Quran audio CDN | Free | Generous |
| **Sunnah.com API** | All 6 Hadith collections, search | Free | 100 req/hour |
| **Adhan.js** | Prayer time calculations (no API needed — local JS) | Free | N/A |
| **YouTube IFrame API** | Embedded video player | Free | Fair use |
| **Sanity.io** | CMS for tutorials, Q&A, blog | Free tier | 250k API calls/month |
| **Supabase** | PostgreSQL DB + Auth | Free tier | 500MB + 50MB bandwidth |
| **Cloudflare** | CDN, DNS, DDoS protection | Free | Unlimited static |

---

## 6. Feature Module Specifications

### 6.1 Quran Module — Technical Specification

#### Data Structure

```typescript
interface Surah {
  number: number;           // 1-114
  name: string;             // "Al-Fatiha"
  arabicName: string;       // "الفاتحة"
  englishName: string;      // "The Opening"
  revelation: "Meccan" | "Medinan";
  ayahCount: number;        // 7
  juz: number[];            // [1]
  pages: number[];          // [1, 1]
}

interface Ayah {
  number: number;           // Global Ayah number (1-6236)
  numberInSurah: number;    // Position in Surah (1-n)
  surahNumber: number;      // Parent Surah
  text: string;             // Arabic text (Uthmani)
  textSimple: string;       // Simple Arabic without diacritics
  transliteration: string;  // Latin transliteration
  translations: {
    [lang: string]: string; // "en", "ur", "fr", "tr"
  };
  audioUrl: string;         // Per-Ayah audio CDN URL
  juz: number;
  page: number;
}

interface WordByWord {
  ayahKey: string;          // "1:1"
  words: {
    position: number;
    arabic: string;
    transliteration: string;
    translation: string;
  }[];
}
```

#### Audio Player State

```typescript
interface AudioState {
  isPlaying: boolean;
  currentSurah: number;
  currentAyah: number;
  reciter: ReciterKey;
  playbackRate: number;
  volume: number;
  playlist: AyahRef[];      // For full Surah playback
  mode: "single" | "surah" | "continuous";
}

type ReciterKey = "sudais" | "afasy" | "husary" | "ghamdi" | "minshawi";
```

### 6.2 Hadith Module — Technical Specification

#### Data Structure

```typescript
interface HadithCollection {
  id: string;               // "bukhari"
  name: string;             // "Sahih Al-Bukhari"
  arabicName: string;       // "صحيح البخاري"
  author: string;           // "Muhammad al-Bukhari"
  totalHadiths: number;     // 7563
  books: HadithBook[];
}

interface HadithBook {
  number: number;
  title: string;
  arabicTitle: string;
  haditCount: number;
  chapters: HadithChapter[];
}

interface Hadith {
  urn: number;              // Unique reference number
  collection: string;       // "bukhari"
  bookNumber: number;
  chapterNumber: number;
  hadithNumber: string;     // May include letters "1a", "1b"
  arabicText: string;
  englishText: string;
  narrator: string;         // "Narrated by ..."
  chain: string;            // Full Isnad
  grade: "Sahih" | "Hasan" | "Da'if" | "Mawdu" | "Unknown";
  gradeSource: string;      // "Al-Albani", "Ibn Hajar"
  topics: string[];
}
```

### 6.3 Q&A Module — CMS Schema (Sanity)

```typescript
// Sanity.io schema
interface QADocument {
  _type: "qaEntry";
  question: string;
  slug: { current: string };
  category: Reference<Category>;
  tags: string[];
  answer: PortableText;    // Rich text with citations
  scholar: string;
  scholarTitle: string;
  videos: YouTubeEmbed[];
  references: {
    type: "quran" | "hadith" | "book";
    citation: string;
    link?: string;
  }[];
  status: "published" | "draft" | "pending";
  publishedAt: string;
  views: number;
  featured: boolean;
}

interface YouTubeEmbed {
  videoId: string;
  title: string;
  speaker: string;
  duration: string;
  timestamp?: number;      // Start at specific timestamp
}
```

### 6.4 Persistent Audio Player — Global State

```typescript
// Zustand store — persists across page navigation
interface MediaPlayerStore {
  // State
  isVisible: boolean;
  isPlaying: boolean;
  currentTrack: Track | null;
  queue: Track[];
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;

  // Track types
  trackType: "quran" | "podcast" | "lecture";

  // Actions
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setRate: (rate: number) => void;
  addToQueue: (track: Track) => void;
}

interface Track {
  id: string;
  title: string;
  subtitle: string;        // Surah name / Podcast episode
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  type: "quran" | "podcast" | "lecture";
  metadata?: Record<string, unknown>;
}
```

---

## 7. Database Schema

### 7.1 Supabase PostgreSQL Schema

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'en',
  preferred_reciter TEXT DEFAULT 'sudais',
  preferred_translation TEXT DEFAULT 'en.sahih',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quran bookmarks
CREATE TABLE quran_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_number INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, surah_number, ayah_number)
);

-- Hadith bookmarks
CREATE TABLE hadith_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  collection TEXT NOT NULL,
  hadith_urn INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, collection, hadith_urn)
);

-- Tutorial progress
CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tutorial_slug TEXT NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INT DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, tutorial_slug)
);

-- Quran reading position (last read)
CREATE TABLE quran_reading_position (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Q&A submissions (user-submitted questions)
CREATE TABLE qa_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT,
  submitter_name TEXT,
  submitter_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'published', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

-- Video saves / favorites
CREATE TABLE saved_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  video_cms_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_cms_id)
);

-- Anonymous analytics (no PII)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  country_code TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Q&A helpful votes (anonymous)
CREATE TABLE qa_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_slug TEXT NOT NULL,
  session_hash TEXT NOT NULL,  -- Hashed session ID, no PII
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(qa_slug, session_hash)
);
```

---

## 8. Technology Stack

### 8.1 Frontend

| Category | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | Next.js | 14 (App Router) | SSG + SSR, SEO-friendly, file-based routing |
| **UI Language** | TypeScript | 5.x | Type safety for complex data structures |
| **Styling** | Tailwind CSS | 3.x | Utility-first, RTL support via plugin |
| **Fonts** | Google Fonts + Local | — | Amiri Quran (local), Playfair Display, DM Sans |
| **Icons** | Phosphor Icons | 2.x | Beautiful, consistent, React-compatible |
| **State** | Zustand | 4.x | Lightweight, persistent (for player state) |
| **Data Fetching** | TanStack Query (React Query) | 5.x | Caching, background refresh, pagination |
| **Animations** | Framer Motion | 11.x | Page transitions, component animations |
| **Rich Text** | Portable Text (Sanity) | — | CMS content rendering |
| **RTL** | tailwindcss-rtl | — | Right-to-left utility classes |
| **Audio** | Howler.js | 2.x | Cross-browser audio with playlist support |
| **Forms** | React Hook Form + Zod | — | Validated forms (Q&A submission, contact) |
| **Date/Hijri** | Hijri Calendar libraries | — | Hijri date display, Ramadan awareness |
| **Prayer Times** | Adhan.js | — | Client-side prayer time calculation |
| **PWA** | next-pwa | — | Service Worker, offline caching |

### 8.2 Backend & Services

| Category | Technology | Tier | Rationale |
|---|---|---|---|
| **Database** | Supabase (PostgreSQL) | Free | Bookmarks, progress, Q&A queue |
| **Auth** | Supabase Auth | Free | Optional user accounts |
| **CMS** | Sanity.io | Free | Tutorials, Q&A answers, Video library |
| **Search** | Supabase FTS / Algolia | Free | Full-text search across all modules |
| **CDN** | Cloudflare | Free | Static asset caching, DDoS protection |
| **Hosting** | Vercel | Free/Pro | Next.js optimal hosting, edge functions |
| **Analytics** | Plausible / Umami | Free (self-host) | Privacy-respecting analytics |
| **Email** | Resend | Free tier | Contact form, Q&A submission notifications |

### 8.3 External Data APIs

| API | Endpoint | Data | License |
|---|---|---|---|
| **Quran.com API** | `api.quran.com/api/v4` | Text, translations, audio, word-by-word | Free CC |
| **Al-Quran Cloud** | `api.alquran.cloud/v1` | Alternative Quran data, audio | Free |
| **Sunnah.com API** | `api.sunnah.com/v1` | All 6 Hadith books | Free (100 req/hr) |
| **YouTube IFrame** | `youtube-nocookie.com` | Embedded videos | Free fair use |

---

## 9. Phase-wise Implementation Plan

The project is divided into **6 phases** spanning approximately **18–22 weeks** (~5 months).

| Phase | Name | Duration | Key Deliverable |
|---|---|---|---|
| Phase 1 | Foundation, Design System & Infrastructure | Week 1–3 | Deployed shell with design system |
| Phase 2 | Quran Module | Week 4–7 | Full Quran reader with audio |
| Phase 3 | Hadith Library | Week 8–10 | All 6 books, searchable |
| Phase 4 | Tutorials, Q&A & Video Library | Week 11–14 | Full content modules with CMS |
| Phase 5 | Media Center, PWA & Search | Week 15–17 | Audio player, podcasts, global search |
| Phase 6 | Polish, Testing, SEO & Launch | Week 18–22 | Production launch |

---

### Phase 1 — Foundation, Design System & Infrastructure *(Week 1–3)*

**Goal**: Establish the project foundation — Next.js app, Tailwind design system, navigation, Supabase + Sanity setup, and deployment pipeline.

#### Tasks — Phase 1

| Task ID | Task Description | Effort | Area |
|---|---|---|---|
| P1-T01 | Initialize Next.js 14 project with TypeScript, ESLint, Prettier | 3h | Setup |
| P1-T02 | Configure Tailwind CSS with custom design tokens (colors, fonts, spacing) from design system | 4h | Design |
| P1-T03 | Set up Google Fonts: Playfair Display, DM Sans, Amiri Quran (local), Noto Naskh Arabic | 2h | Typography |
| P1-T04 | Build Navbar component: logo, navigation links, search icon, dark mode toggle, language switcher | 5h | UI |
| P1-T05 | Build Footer component: links, social icons, copyright, Islamic ornamental border | 3h | UI |
| P1-T06 | Implement dark/light mode: CSS custom properties + Tailwind dark variant, localStorage persistence | 3h | UI |
| P1-T07 | Implement RTL support: `dir` attribute switching, `tailwindcss-rtl` plugin, Arabic font override | 4h | i18n |
| P1-T08 | Set up i18n framework (next-intl): English, Arabic, Urdu, French routing and message files | 4h | i18n |
| P1-T09 | Initialize Sanity.io CMS: project setup, schemas for Tutorial, QA, Video, Podcast, Category | 5h | CMS |
| P1-T10 | Initialize Supabase: project, apply DB migration (all tables from schema), configure Row Level Security | 4h | DB |
| P1-T11 | Configure Vercel deployment with environment variables; set up GitHub Actions CI (lint + typecheck) | 3h | DevOps |
| P1-T12 | Build reusable UI components: Button, Card, Badge, Tag, Modal, Toast, Skeleton loaders | 6h | UI |
| P1-T13 | Build Home page shell with section placeholders and hero section | 4h | UI |
| P1-T14 | Build Prayer Times widget using Adhan.js with geolocation and manual city fallback | 5h | Feature |
| P1-T15 | Set up next-pwa: Service Worker, manifest.json, icons generation | 3h | PWA |
| P1-T16 | Create Islamic geometric pattern SVG assets for hero background and section dividers | 3h | Design |

#### Definition of Done — Phase 1
- App is live on Vercel with custom domain (or vercel.app URL)
- Design system tokens are applied consistently (colors, typography, spacing)
- Navbar, Footer, dark mode, and language switching all functional
- Sanity Studio accessible at `/studio` with schemas defined
- Supabase tables created with RLS policies

---

### Phase 2 — Quran Module *(Week 4–7)*

**Goal**: Build the complete, production-quality Quran reader with Arabic display, translations, audio recitation, bookmarking, and search.

#### Tasks — Phase 2

| Task ID | Task Description | Effort | Area |
|---|---|---|---|
| P2-T01 | Build Quran data layer: TypeScript types, API client for Quran.com API v4, caching layer | 4h | Data |
| P2-T02 | Fetch and cache Surah index at build time (SSG); create Surah list page `/quran` | 4h | Page |
| P2-T03 | Build Surah Index page: grid of all 114 Surahs with number, name, ayah count, revelation type | 5h | UI |
| P2-T04 | Build Surah Reader page `/quran/[id]`: fetch all Ayahs for selected Surah (SSG) | 5h | Page |
| P2-T05 | Build Ayah Card component: Arabic text (Amiri Quran font), transliteration toggle, translation | 6h | UI |
| P2-T06 | Implement Bismillah ornamental header (shown at top of each Surah, except Al-Tawbah) | 2h | UI |
| P2-T07 | Build Surah sidebar: Surah list with search filter, Juz navigation tabs | 4h | UI |
| P2-T08 | Build Quran settings panel: translation selector (EN/UR/FR/TR), font size, display mode | 4h | UI |
| P2-T09 | Integrate Quran audio: per-Ayah play button using Al-Quran Cloud CDN URLs | 5h | Feature |
| P2-T10 | Build Audio state machine: Howler.js integration, auto-advance through Surah Ayahs | 6h | Feature |
| P2-T11 | Build reciter selector with 5 reciters; persist preference in localStorage/Supabase | 3h | Feature |
| P2-T12 | Implement Ayah bookmarking: save to localStorage (guest) or Supabase (logged in) | 4h | Feature |
| P2-T13 | Implement Word-by-word translation: fetch on hover/click, display popup overlay | 5h | Feature |
| P2-T14 | Implement Quran search: keyword search via Quran.com API, results grouped by Surah | 5h | Search |
| P2-T15 | Build Ayah share feature: generate Open Graph image card with Arabic Ayah + translation | 4h | Social |
| P2-T16 | Implement last-read position memory (localStorage) with "Continue Reading" prompt | 3h | UX |
| P2-T17 | Add Ayah of the Day to home page (random selection, changes daily, cached) | 3h | Home |
| P2-T18 | Implement Tafsir modal: brief Ibn Kathir notes per Ayah (from Quran.com API) | 4h | Feature |
| P2-T19 | Mobile optimization: swipe to navigate between Ayahs, responsive sidebar as bottom sheet | 4h | Mobile |
| P2-T20 | Write unit tests for Quran data layer and audio state machine | 3h | Testing |

#### Definition of Done — Phase 2
- All 114 Surahs render correctly with Arabic text, transliteration, and translation
- Audio plays per-Ayah and auto-advances through full Surah
- Bookmarking saves and restores correctly
- Quran search returns relevant results
- Mobile Quran reader is fully usable on 320px+ screens

---

### Phase 3 — Hadith Library *(Week 8–10)*

**Goal**: Build the complete Hadith library with all 6 books, hierarchical navigation, grading display, and full-text search.

#### Tasks — Phase 3

| Task ID | Task Description | Effort | Area |
|---|---|---|---|
| P3-T01 | Build Hadith data layer: TypeScript types, Sunnah.com API client, response caching | 4h | Data |
| P3-T02 | Build Hadith home page `/hadith`: collection cards for all 6 books with metadata | 3h | Page |
| P3-T03 | Build Collection page `/hadith/[collection]`: list of Books within collection | 4h | Page |
| P3-T04 | Build Book page `/hadith/[collection]/[book]`: list of Chapters + Hadiths | 5h | Page |
| P3-T05 | Build Hadith Card component: Arabic, English, narrator, grading badge, source reference | 6h | UI |
| P3-T06 | Implement Hadith grading badges: color-coded (green=Sahih, yellow=Hasan, red=Da'if) | 2h | UI |
| P3-T07 | Build Isnad (narrator chain) collapsible section per Hadith | 3h | UI |
| P3-T08 | Build Hadith search: keyword search across all 6 collections simultaneously | 5h | Search |
| P3-T09 | Build Hadith filter: by collection, by grade, by topic | 3h | Filter |
| P3-T10 | Implement Hadith bookmarking (same pattern as Quran — localStorage / Supabase) | 3h | Feature |
| P3-T11 | Build Hadith of the Day widget for home page | 2h | Home |
| P3-T12 | Implement Hadith sharing: share card with text, reference, and branding | 3h | Social |
| P3-T13 | Build Hadith detail page `/hadith/[collection]/[book]/[number]` for direct links | 3h | Page |
| P3-T14 | Add pagination for large collections (Bukhari has 7,563 Hadiths) | 3h | UX |
| P3-T15 | Mobile optimization: collapsible Arabic text, readable card layout on small screens | 3h | Mobile |

#### Definition of Done — Phase 3
- All 6 Hadith collections browseable by Book and Chapter
- Each Hadith shows Arabic, English, narrator, and grading
- Full-text search works across all 6 collections
- Hadith of the Day appears on home page

---

### Phase 4 — Tutorials, Q&A & Video Library *(Week 11–14)*

**Goal**: Build the content-driven modules (Tutorials, Q&A, Video Library) powered by Sanity CMS, with YouTube embeds, category filtering, and admin CMS workflow.

#### Tasks — Phase 4

| Task ID | Task Description | Effort | Area |
|---|---|---|---|
| P4-T01 | Finalize Sanity schemas: Tutorial, QA, Video, Podcast, Scholar, Category, LearningPath | 5h | CMS |
| P4-T02 | Build Tutorial index page `/learn`: grid with category filters, difficulty badges, search | 5h | Page |
| P4-T03 | Build Tutorial detail page `/learn/[category]/[slug]`: rich text, progress tracker, citations | 6h | Page |
| P4-T04 | Build Learning Paths page `/learn/paths`: curated beginner → advanced sequences | 4h | Page |
| P4-T05 | Implement tutorial progress tracking: mark as complete, progress bar (localStorage / Supabase) | 4h | Feature |
| P4-T06 | Build PortableText renderer: handle inline Quran/Hadith citations, images, callout boxes | 5h | UI |
| P4-T07 | Build Q&A index page `/qa`: searchable list with category tabs, featured Q&As | 5h | Page |
| P4-T08 | Build Q&A detail page `/qa/[slug]`: question, answer (rich text), video embeds, references | 6h | Page |
| P4-T09 | Build YouTube embed component: privacy-enhanced iframe, lazy load (click to play), title overlay | 4h | UI |
| P4-T10 | Build multi-video answer layout: 1, 2, or 3 videos in responsive grid per Q&A | 3h | UI |
| P4-T11 | Build Q&A submission form `/qa/submit`: validation, CAPTCHA, Supabase insertion | 4h | Feature |
| P4-T12 | Build Q&A category browser: prayer, marriage, finance, aqeedah, worship, etc. | 3h | UI |
| P4-T13 | Build Video Library page `/videos`: grid with category tabs, speaker filter, search | 5h | Page |
| P4-T14 | Build Video detail page `/videos/[id]`: full description, speaker bio, related videos | 4h | Page |
| P4-T15 | Build Video playlist / collection feature in Sanity + frontend | 4h | Feature |
| P4-T16 | Implement "Related Content" engine: suggest related Q&A, tutorials, and videos at end of each | 4h | Feature |
| P4-T17 | Build Admin notification: email alert via Resend when new Q&A submission arrives | 2h | Admin |
| P4-T18 | Populate initial CMS content: 20 tutorials, 30 Q&As with video answers, 50 videos | 8h | Content |
| P4-T19 | Add Featured Q&A and Latest Tutorial widgets to home page | 3h | Home |

#### Definition of Done — Phase 4
- 20+ tutorials accessible with category filtering and progress tracking
- 30+ Q&As display with rich text answers and embedded YouTube videos
- 50+ videos in library with category and speaker filters
- Q&A submission form saves to Supabase and triggers email notification
- CMS editors can add/edit content without developer involvement

---

### Phase 5 — Media Center, PWA & Global Search *(Week 15–17)*

**Goal**: Build the persistent audio player, Quran audio center, podcast embeds, and unified global search. Finalize PWA capabilities.

#### Tasks — Phase 5

| Task ID | Task Description | Effort | Area |
|---|---|---|---|
| P5-T01 | Build Persistent Audio Player component: fixed bottom bar, survives page navigation (Zustand) | 7h | Feature |
| P5-T02 | Build audio controls: play/pause, seek bar, volume, playback speed (0.75x, 1x, 1.25x, 1.5x), next/prev | 5h | UI |
| P5-T03 | Build Media Center page `/media/quran`: Surah selector + reciter selector + embedded player | 5h | Page |
| P5-T04 | Implement Media Session API: lock screen controls, notification (Now Playing) on mobile | 4h | PWA |
| P5-T05 | Build Podcast page `/media/podcasts`: podcast cards with Spotify/YouTube/Anchor embeds | 5h | Page |
| P5-T06 | Populate Sanity with 10+ Islamic podcast series (embed data) | 4h | Content |
| P5-T07 | Build Global Search page `/search`: unified results across Quran, Hadith, Q&A, Tutorials, Videos | 7h | Search |
| P5-T08 | Implement Search with Debouncing: query as-you-type with 300ms debounce, result categorization | 4h | Search |
| P5-T09 | Build Search Results UI: tabbed by type, preview cards, relevance ranking | 4h | UI |
| P5-T10 | Optimize Service Worker: cache Quran pages, static assets; offline page for uncached routes | 4h | PWA |
| P5-T11 | Implement Push Notifications (optional): Friday Jumu'ah reminder, Hadith of the Day | 3h | PWA |
| P5-T12 | Build Bookmarks collection page for logged-in users: saved Ayahs, Hadiths, Videos | 4h | Feature |
| P5-T13 | Performance audit: lazy load all images, convert to WebP, implement blur placeholder | 3h | Perf |

#### Definition of Done — Phase 5
- Persistent audio player works across all page navigations
- Global search returns results from all 5 content types
- PWA installable with offline support for cached Quran pages
- Media Center plays Quran audio with reciter switching

---

### Phase 6 — Polish, Testing, SEO & Launch *(Week 18–22)*

**Goal**: Achieve production quality — full test coverage, SEO optimization, accessibility compliance, performance optimization, and public launch.

#### Tasks — Phase 6

| Task ID | Task Description | Effort | Area |
|---|---|---|---|
| P6-T01 | Conduct full accessibility audit (axe-core + screen reader testing); fix all critical violations | 6h | A11y |
| P6-T02 | Arabic RTL accessibility: verify screen reader reads Arabic text in correct direction | 4h | A11y |
| P6-T03 | Implement comprehensive SEO: dynamic meta tags, Open Graph, Twitter Cards for all pages | 5h | SEO |
| P6-T04 | Generate XML sitemap for all Surahs, Hadiths, Q&As, Tutorials (Next.js sitemap plugin) | 3h | SEO |
| P6-T05 | Add JSON-LD structured data: FAQPage (Q&A), Article (Tutorial), BreadcrumbList | 4h | SEO |
| P6-T06 | Implement Social Sharing images: Open Graph image generation (Vercel OG) for Quran Ayahs | 4h | Social |
| P6-T07 | Performance optimization: bundle analysis, code splitting, image optimization, preloading | 5h | Perf |
| P6-T08 | Add Hijri date display to home page and Quran header | 2h | Feature |
| P6-T09 | Write Vitest unit tests: data layers, utility functions, state stores (target 60%+ coverage) | 6h | Testing |
| P6-T10 | Write Playwright E2E tests: critical paths — Quran navigation, audio play, Q&A view, search | 6h | Testing |
| P6-T11 | Configure Lighthouse CI: fail builds if score drops below thresholds | 2h | CI/CD |
| P6-T12 | Security audit: CSP headers, YouTube embed sandboxing, Supabase RLS review | 3h | Security |
| P6-T13 | Set up analytics: Plausible or Umami self-hosted; dashboard for content performance | 3h | Analytics |
| P6-T14 | Cross-browser and cross-device testing: Chrome, Safari, Firefox, Edge; Android, iOS | 5h | QA |
| P6-T15 | Load testing: verify performance under 1,000 concurrent users (Quran API caching) | 3h | Perf |
| P6-T16 | Write user documentation: About page, Privacy Policy, Terms, Cookie Policy | 4h | Legal |
| P6-T17 | Configure custom domain, SSL, Cloudflare proxy, email routing | 2h | Infra |
| P6-T18 | Soft launch: share with small Islamic community for feedback; collect first 100 real user sessions | — | Launch |
| P6-T19 | Post-launch monitoring: error tracking (Sentry free tier), uptime monitoring | 2h | Ops |
| P6-T20 | Create social media accounts (Instagram, Twitter/X, YouTube) for the platform | 2h | Marketing |

#### Definition of Done — Phase 6
- Lighthouse: Performance >= 90, Accessibility >= 95, SEO >= 95, PWA = 100
- Zero axe-core critical accessibility violations
- Sitemap submitted to Google Search Console
- App is live at production domain with HTTPS and Cloudflare

---

## 10. SEO, Accessibility & Performance

### 10.1 SEO Strategy

| Page Type | URL Pattern | Title Template | Meta Description |
|---|---|---|---|
| Quran Index | `/quran` | "Holy Quran — Read Online with Translation \| Noor Al-Huda" | "Read the complete Holy Quran online in Arabic with English translation, transliteration, and audio recitation." |
| Surah Page | `/quran/1/al-fatiha` | "Surah Al-Fatiha (1) — Read & Listen \| Noor Al-Huda" | "Read Surah Al-Fatiha (The Opening) in Arabic with English translation and audio recitation by Sheikh Al-Sudais." |
| Hadith | `/hadith/bukhari/1/1` | "Sahih Al-Bukhari Hadith #1 \| Noor Al-Huda" | "Read Hadith #1 from Sahih Al-Bukhari with Arabic text, English translation, and narrator chain." |
| Q&A | `/qa/can-i-combine-prayers` | "Can I Combine Prayers While Travelling? — Islamic Q&A \| Noor Al-Huda" | "Scholarly answer to combining prayers while travelling in Islam, with Quran and Hadith references." |
| Tutorial | `/learn/prayer/how-to-pray` | "How to Pray in Islam — Step by Step Guide \| Noor Al-Huda" | "Complete guide on how to perform Salah (Islamic prayer) for beginners, with images and references." |

### 10.2 Accessibility Checklist

- ✅ All images have descriptive `alt` attributes; decorative images have `alt=""`
- ✅ Arabic text has `lang="ar"` and `dir="rtl"` attributes
- ✅ Audio player is fully keyboard-operable (Tab, Space, Arrow keys)
- ✅ YouTube embeds have title attributes for screen readers
- ✅ Color contrast ratio >= 4.5:1 for all text (AA standard)
- ✅ Focus indicators visible in both light and dark modes
- ✅ Modal dialogs trap focus correctly (Tafsir, share modals)
- ✅ ARIA live regions on search results and audio player status
- ✅ Skip-to-content link at top of every page
- ✅ Prayer times announced to screen readers when updated

### 10.3 Performance Targets

| Metric | Target | Strategy |
|---|---|---|
| First Contentful Paint | < 1.2s | SSG pages, CDN, preload fonts |
| Largest Contentful Paint | < 2.0s | Image optimization, lazy loading |
| Time to Interactive | < 3.0s | Code splitting, dynamic imports |
| Cumulative Layout Shift | < 0.05 | Reserve space for images, fonts |
| Total Blocking Time | < 150ms | Defer non-critical scripts |
| Bundle Size (initial) | < 150KB gzipped | Tree-shaking, dynamic imports |
| Quran page hydration | < 500ms | Prefetch adjacent Surahs |

---

## 11. Deployment & Infrastructure

### 11.1 Environments

| Environment | URL | Purpose | Deployment Trigger |
|---|---|---|---|
| Development | `localhost:3000` | Local development | Manual `npm run dev` |
| Preview | `pr-[number].noorlhuda.vercel.app` | PR review | Automatic on PR open |
| Staging | `staging.noorlhuda.com` | QA testing | Manual promote |
| Production | `noorlhuda.com` | Public site | Merge to `main` |

### 11.2 Infrastructure Diagram

```
GitHub Repo
    │
    ├── PR → Vercel Preview Deployment (automatic)
    │
    └── Merge to main → Vercel Production Deployment
                              │
                    ┌─────────▼──────────┐
                    │  Vercel Edge         │
                    │  Next.js SSR/SSG     │
                    │  Edge Functions      │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼─────┐  ┌──────▼──────┐  ┌───▼──────────┐
    │  Supabase     │  │ Sanity CDN  │  │ Cloudflare   │
    │  PostgreSQL   │  │ (CMS Data)  │  │ CDN + DNS    │
    │  + Auth       │  └─────────────┘  └──────────────┘
    └───────────────┘
```

### 11.3 Environment Variables

```bash
# Next.js
NEXT_PUBLIC_APP_URL=https://noorlhuda.com
NEXT_PUBLIC_APP_NAME="Noor Al-Huda"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server only

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token  # Server only

# External APIs
NEXT_PUBLIC_QURAN_API_BASE=https://api.quran.com/api/v4
SUNNAH_API_KEY=your_sunnah_key  # Server only

# Email
RESEND_API_KEY=your_resend_key  # Server only
ADMIN_EMAIL=admin@noorlhuda.com

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=noorlhuda.com
```

### 11.4 Estimated Monthly Costs (at Launch)

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| Supabase | Free tier (500MB) | $0 |
| Sanity.io | Free (250k API calls) | $0 |
| Cloudflare | Free | $0 |
| Domain Name | Custom domain | ~$12/year ($1/month) |
| Resend (email) | Free (3,000 emails/month) | $0 |
| **Total** | | **~$1/month** |

> 💡 Scale plan: Upgrade Supabase to Pro ($25/mo) when users exceed 50,000 monthly active. Upgrade Vercel to Pro ($20/mo) when traffic exceeds Hobby limits.

---

## 12. Glossary

| Term | Arabic | Definition |
|---|---|---|
| **Dawah** | دعوة | Islamic outreach and invitation of others to learn about Islam |
| **Quran** | القرآن | The holy scripture of Islam, revealed to Prophet Muhammad ﷺ |
| **Surah** | سورة | A chapter of the Quran (114 total) |
| **Ayah** | آية | A verse within a Surah (6,236 total) |
| **Juz** | جزء | One of 30 equal parts of the Quran (also called Para) |
| **Bismillah** | بسملة | "In the name of Allah, the Most Gracious, the Most Merciful" — opening of each Surah |
| **Hadith** | حديث | Recorded sayings, actions, and approvals of Prophet Muhammad ﷺ |
| **Isnad** | إسناد | The chain of narrators of a Hadith |
| **Sahih** | صحيح | Authentic — the highest grade of Hadith authenticity |
| **Hasan** | حسن | Good — second highest Hadith grade |
| **Da'if** | ضعيف | Weak — Hadith with deficiency in chain or text |
| **Kutub al-Sittah** | الكتب الستة | The Six Books: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah |
| **Tafsir** | تفسير | Exegesis / detailed commentary on the meaning of Quran |
| **Aqeedah** | عقيدة | Islamic theology / creed |
| **Fiqh** | فقه | Islamic jurisprudence / religious law |
| **Seerah** | سيرة | Biography of Prophet Muhammad ﷺ |
| **Akhlaq** | أخلاق | Islamic ethics and moral character |
| **Salah** | صلاة | Islamic prayer (5 times daily) |
| **Zakat** | زكاة | Obligatory Islamic charity (2.5% of wealth annually) |
| **Hajj** | حج | Pilgrimage to Mecca (one of the Five Pillars) |
| **Dhikr** | ذكر | Remembrance of Allah through phrases and supplications |
| **Nasheed** | نشيد | Islamic a cappella vocal music / chant |
| **SSG** | — | Static Site Generation — pages pre-rendered at build time |
| **SSR** | — | Server-Side Rendering — pages rendered on each request |
| **CMS** | — | Content Management System — admin interface for non-technical editors |
| **RTL** | — | Right-to-Left — text direction for Arabic, Urdu, and related scripts |
| **PWA** | — | Progressive Web Application — installable, offline-capable web app |

---

*بَارَكَ اللَّهُ فِيكُمْ — May Allah bless your work*

*© 2026 Noor Al-Huda Islamic Platform — Spreading Knowledge, Illuminating Hearts*
