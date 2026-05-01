/**
 * Noor Al-Huda — Functional Logic
 * Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Language Management ---
    let currentLang = localStorage.getItem('lang') || 'en';
    
    function initLanguage() {
        if (window.i18n) {
            window.i18n.translatePage(currentLang);
        }
    }

    const langBtn = document.querySelector('.lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'bn' : 'en';
            localStorage.setItem('lang', currentLang);
            if (window.i18n) {
                window.i18n.translatePage(currentLang);
                // Trigger a re-render of dynamic content if necessary
                document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
            }
        });
    }

    // Run on load
    initLanguage();

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
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });
    }

    // Close menu when a link is clicked
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuBtn) menuBtn.querySelector('i').classList.replace('ph-x', 'ph-list');
            });
        });
    }

    // --- Prayer Times Auto-Next ---
    function updateNextPrayer() {
        const now = new Date();
        const hour = now.getHours();
        const items = document.querySelectorAll('.prayer-item');
        
        items.forEach(item => item.classList.remove('next'));
        items.forEach(item => {
            const nextBadge = item.querySelector('.pt-next');
            if (nextBadge) nextBadge.remove();
        });

        let nextIdx = 0;
        if (hour >= 5 && hour < 12) nextIdx = 1; 
        else if (hour >= 12 && hour < 16) nextIdx = 2; 
        else if (hour >= 16 && hour < 19) nextIdx = 3; 
        else if (hour >= 19 && hour < 21) nextIdx = 4; 
        else nextIdx = 0; 

        const nextItem = items[nextIdx];
        if (nextItem) {
            nextItem.classList.add('next');
            const span = document.createElement('span');
            span.className = 'pt-next';
            span.textContent = 'Next ●';
            nextItem.appendChild(span);
        }
    }
    updateNextPrayer();

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Global Audio Player ---
    const synth = new Audio();
    let currentIcon = null;
    let currentText = "";
    let audioUnlocked = false;
    let playbackSpeed = 1.0;
    let playbackVolume = 1.0;

    function updateAudioSettings() {
        synth.volume = playbackVolume;
        synth.playbackRate = playbackSpeed;
    }

    window.updateIcon = function(iconEl, state) {
        if (!iconEl) return;
        const classesToRemove = ['ph-play', 'ph-pause', 'ph-play-circle', 'ph-pause-circle', 'ph-stop-circle', 'ph-spinner-gap', 'ph-spin'];
        iconEl.classList.remove(...classesToRemove);
        const isCircle = iconEl.parentElement.classList.contains('listen-btn') || iconEl.classList.contains('ph-play-circle') || iconEl.parentElement.classList.contains('pill');
        if (state === 'play') iconEl.classList.add(isCircle ? 'ph-pause-circle' : 'ph-pause');
        else if (state === 'loading') iconEl.classList.add('ph-spinner-gap', 'ph-spin');
        else iconEl.classList.add(isCircle ? 'ph-play-circle' : 'ph-play');
    };

    function unlockAudio() {
        if (audioUnlocked) return;
        synth.play().then(() => { synth.pause(); audioUnlocked = true; }).catch(() => {});
    }
    document.addEventListener('click', unlockAudio, { once: true });

    window.toggleSpeech = function(textToRead, playIconElement, lang = 'ar', callback = null) {
        const playerBar = document.getElementById('playerBar');

        if (!textToRead) {
            window.speechSynthesis.cancel();
            if (!synth.paused) {
                synth.pause();
                synth.currentTime = 0;
            }
            if (currentIcon) updateIcon(currentIcon, 'pause');
            currentText = "";
            currentIcon = null;
            if (playerBar) playerBar.classList.remove('active');
            return;
        }
        unlockAudio();

        // Show player bar when playing
        if (playerBar) playerBar.classList.add('active');

        // 1. If clicking the SAME button that is already playing, STOP it
        if (currentText === textToRead) {
            window.speechSynthesis.cancel();
            if (!synth.paused) {
                synth.pause();
                synth.currentTime = 0;
            }
            updateIcon(playIconElement, 'pause');
            currentText = "";
            currentIcon = null;
            // Optionally hide it immediately or keep it active but paused
            return;
        }

        // 2. If switching to a NEW text, stop current playback first
        window.speechSynthesis.cancel();
        if (!synth.paused) {
            synth.pause();
            synth.currentTime = 0;
        }
        if (currentIcon) updateIcon(currentIcon, 'pause');

        currentText = textToRead;
        currentIcon = playIconElement;

        // 3. Play the new content
        if ((lang === 'en' || lang === 'bn') && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
            utterance.rate = playbackSpeed;
            utterance.volume = playbackVolume;
            utterance.onstart = () => updateIcon(playIconElement, 'play');
            utterance.onend = () => {
                if (currentText === textToRead) {
                    updateIcon(playIconElement, 'pause');
                    currentText = "";
                    currentIcon = null;
                    if (callback) callback();
                    // Don't auto-hide here if sequential is going to trigger next one
                    if (!callback && playerBar) playerBar.classList.remove('active');
                }
            };
            utterance.onerror = (e) => {
                console.error("SpeechSynthesis error:", e);
                playWithGoogleTTS(textToRead, playIconElement, lang === 'bn' ? 'bn' : 'en', callback);
            };
            window.speechSynthesis.speak(utterance);
        } else {
            playWithGoogleTTS(textToRead, playIconElement, lang, callback);
        }
    };

    function playWithGoogleTTS(text, icon, lang, callback = null) {
        const encodedText = encodeURIComponent(text.substring(0, 500));
        synth.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
        synth.playbackRate = playbackSpeed;
        synth.volume = playbackVolume;

        synth.onended = () => {
            if (currentIcon) updateIcon(currentIcon, 'pause');
            currentText = "";
            currentIcon = null;
            const playerBar = document.getElementById('playerBar');
            if (!callback && playerBar) playerBar.classList.remove('active');
            if (callback) callback();
        };

        synth.play()
            .then(() => updateIcon(icon, 'play'))
            .catch(e => {
                console.error("Audio play failed:", e);
            });
    };

    // Close Player Button
    const playerCloseBtn = document.getElementById('player-close');
    if (playerCloseBtn) {
        playerCloseBtn.addEventListener('click', () => {
            window.toggleSpeech("", null); // This will cancel speech and remove 'active' class
        });
    }

    const speedSelect = document.getElementById('speed-select');
    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            playbackSpeed = parseFloat(e.target.value);
            updateAudioSettings();
        });
    }

    const volSlider = document.getElementById('volume-slider');
    const volIcon = document.getElementById('volume-icon');
    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            playbackVolume = parseFloat(e.target.value);
            updateAudioSettings();
            if (volIcon) {
                if (playbackVolume === 0) volIcon.className = 'ph ph-speaker-slash';
                else if (playbackVolume < 0.5) volIcon.className = 'ph ph-speaker-low';
                else volIcon.className = 'ph ph-speaker-high';
            }
        });
    }

    // 1. Bottom Player Button (Non-Quran/Non-Collection Pages)
    const playBtn = document.querySelector('.play-main');
    const hasCustomPlayer = document.querySelector('.quran-layout') || document.getElementById('hadith-container');
    if (playBtn && !hasCustomPlayer) {
        playBtn.addEventListener('click', () => {
            const icon = playBtn.querySelector('i');
            const translationElement = document.querySelector('.ayah-tr') || document.querySelector('.hadith-en');
            const arabicElement = document.querySelector('.ayah-ar') || document.querySelector('.hadith-ar');
            if (translationElement) toggleSpeech(translationElement.textContent, icon, currentLang);
            else if (arabicElement) toggleSpeech(arabicElement.textContent, icon, 'ar');
            else toggleSpeech("بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", icon, 'ar');
        });
    }

    // 2. Inline Listen Buttons
    const listenBtns = document.querySelectorAll('.listen-btn, .pill:has(.ph-play-circle)');
    listenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            const section = btn.closest('section') || btn.closest('.ayah-day') || btn.closest('.hadith-card');
            if (section) {
                const tr = section.querySelector('.ayah-tr') || section.querySelector('.hadith-en') || section.querySelector('.ayah-text-tr');
                const ar = section.querySelector('.ayah-ar') || section.querySelector('.hadith-ar') || section.querySelector('.ayah-text-ar');
                if (tr) toggleSpeech(tr.textContent, icon, currentLang);
                else if (ar) toggleSpeech(ar.textContent, icon, 'ar');
            }
        });
    });

    // 3. Share Buttons (Global/Homepage)
    const shareBtns = document.querySelectorAll('.share-btn, .pill:has(.ph-share-network), button:has(.ph-share-network)');
    shareBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = btn.closest('section') || btn.closest('.ayah-day') || btn.closest('.hadith-card');
            if (section) {
                const tr = section.querySelector('.ayah-tr') || section.querySelector('.hadith-en') || section.querySelector('.ayah-text-tr');
                const ar = section.querySelector('.ayah-ar') || section.querySelector('.hadith-ar') || section.querySelector('.ayah-text-ar');
                const title = section.querySelector('.section-label')?.textContent || "Featured Content";
                const ref = section.querySelector('.ayah-ref') || section.querySelector('.ref');
                const metaText = `${title} — ${ref ? ref.textContent : 'Noor Al-Huda'}`;

                const originalContent = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i>';

                const template = document.getElementById('share-card-template');
                if (template && window.html2canvas) {
                    document.getElementById('sc-arabic').textContent = ar ? ar.textContent : "";
                    document.getElementById('sc-translation').textContent = tr ? tr.textContent : "";
                    document.getElementById('sc-meta').textContent = metaText;
                    document.getElementById('sc-url').textContent = window.location.origin + window.location.pathname;

                    try {
                        const canvas = await html2canvas(template, { scale: 2, useCORS: true });
                        canvas.toBlob(async (blob) => {
                            const fileName = `NoorAlHuda_Share.png`;
                            const file = new File([blob], fileName, { type: 'image/png' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({ files: [file], title: metaText });
                            } else {
                                const link = document.createElement('a'); link.download = fileName;
                                link.href = URL.createObjectURL(blob); link.click();
                            }
                            btn.innerHTML = originalContent;
                        }, 'image/png');
                    } catch (err) { btn.innerHTML = originalContent; }
                } else {
                    const shareText = `${metaText}\n\n${ar ? ar.textContent : ''}\n\n${tr ? tr.textContent : ''}\n\nShared from Noor Al-Huda`;
                    if (navigator.share) navigator.share({ title: title, text: shareText, url: window.location.href });
                    btn.innerHTML = originalContent;
                }
            }
        });
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(reg => console.log('SW Registered')).catch(err => {});
        });
    }
});
