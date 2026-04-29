/**
 * Noor Al-Huda — Functional Logic
 * Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('ph-moon', 'ph-sun');
        } else {
            icon.classList.replace('ph-sun', 'ph-moon');
        }
    }

    // --- Mobile Menu ---
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('ph-list', 'ph-x');
        } else {
            icon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').classList.replace('ph-x', 'ph-list');
        });
    });

    // --- Prayer Times Auto-Next ---
    // Simple logic to simulate "Next" prayer highlighting
    function updateNextPrayer() {
        const now = new Date();
        const hour = now.getHours();
        const items = document.querySelectorAll('.prayer-item');
        
        // Remove all next classes first
        items.forEach(item => item.classList.remove('next'));
        items.forEach(item => {
            const nextBadge = item.querySelector('.pt-next');
            if (nextBadge) nextBadge.remove();
        });

        let nextIdx = 0;
        if (hour >= 5 && hour < 12) nextIdx = 1; // Dhuhr
        else if (hour >= 12 && hour < 16) nextIdx = 2; // Asr
        else if (hour >= 16 && hour < 19) nextIdx = 3; // Maghrib
        else if (hour >= 19 && hour < 21) nextIdx = 4; // Isha
        else nextIdx = 0; // Fajr next day

        const nextItem = items[nextIdx];
        if (nextItem) {
            nextItem.classList.add('next');
            const span = document.createElement('span');
            span.className = 'pt-next';
            span.textContent = 'Next ●';
            nextItem.appendChild(span);
        }
    }

    // Run once on load
    updateNextPrayer();

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Global Audio Player (Persistent Player using Google TTS / Audio API) ---
    const synth = new Audio();
    
    function toggleSpeech(textToRead, playIconElement) {
        if (!synth.paused && synth.src) {
            // Pause
            synth.pause();
            if(playIconElement) playIconElement.classList.replace('ph-pause', 'ph-play');
            if(playIconElement && playIconElement.classList.contains('ph-pause-circle')) playIconElement.classList.replace('ph-pause-circle', 'ph-play-circle');
        } else if (synth.paused && synth.src && synth.currentTime > 0 && !synth.ended) {
            // Resume
            synth.play().catch(e => console.error("Playback failed:", e));
            if(playIconElement) playIconElement.classList.replace('ph-play', 'ph-pause');
            if(playIconElement && playIconElement.classList.contains('ph-play-circle')) playIconElement.classList.replace('ph-play-circle', 'ph-pause-circle');
        } else {
            // Start speaking (Fetch from Google TTS to bypass OS missing Arabic voices)
            // Note: split long texts if needed, but for Ayah/Hadith of the day it should fit within 200 chars
            const encodedText = encodeURIComponent(textToRead.substring(0, 200));
            synth.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodedText}`;
            
            synth.onended = () => {
                if(playIconElement) playIconElement.classList.replace('ph-pause', 'ph-play');
                if(playIconElement && playIconElement.classList.contains('ph-pause-circle')) playIconElement.classList.replace('ph-pause-circle', 'ph-play-circle');
            };

            synth.play().catch(e => {
                console.error("Audio play failed. Check browser autoplay policies or connection:", e);
                alert("Browser blocked audio playback or network issue. Try interacting with the page first.");
            });
            
            if(playIconElement) playIconElement.classList.replace('ph-play', 'ph-pause');
            if(playIconElement && playIconElement.classList.contains('ph-play-circle')) playIconElement.classList.replace('ph-play-circle', 'ph-pause-circle');
        }
    }

    // 1. Bottom Persistent Player Button
    const playBtn = document.querySelector('.play-main');
    if (playBtn && !document.querySelector('.play-ayah')) {
        playBtn.addEventListener('click', () => {
            const icon = playBtn.querySelector('i');
            const ayahArElement = document.querySelector('.ayah-ar') || document.querySelector('.hadith-ar');
            const textToRead = ayahArElement ? ayahArElement.textContent : "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
            toggleSpeech(textToRead, icon);
        });
    }

    // 2. Inline Listen Buttons (e.g. Ayah of the day)
    const listenBtns = document.querySelectorAll('.listen-btn');
    listenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            // Find nearest Arabic text
            const section = btn.closest('section');
            const textEl = section ? (section.querySelector('.ayah-ar') || section.querySelector('.hadith-ar')) : null;
            const textToRead = textEl ? textEl.textContent : "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
            
            toggleSpeech(textToRead, icon);
        });
    });

    // --- Dynamic Module Interactions ---
    const modCards = document.querySelectorAll('.mod-card');
    modCards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('.mod-name').textContent;
            console.log(`Navigating to ${name} section...`);
            // Here you would navigate to the specific module page
        });
    });

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.error('ServiceWorker registration failed: ', err);
            });
        });
    }

    console.log('Noor Al-Huda initialized successfully.');
});
