/**
 * Noor Al-Huda — Core Application Logic
 * Vanilla JavaScript
 */

// --- GLOBAL UTILITIES (Top Level) ---

(function() {
    const url = window.location.href;
    if (url.endsWith('index.html')) {
        const newUrl = url.replace('index.html', '');
        window.history.replaceState(null, '', newUrl);
    } else if (url.includes('index.html?')) {
        const newUrl = url.replace('index.html?', '?');
        window.history.replaceState(null, '', newUrl);
    } else if (url.includes('index.html#')) {
        const newUrl = url.replace('index.html#', '#');
        window.history.replaceState(null, '', newUrl);
    }
})();

window.copyToClipboard = function(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) alert("Text copied to clipboard!");
        else throw new Error("Copy command unsuccessful");
    } catch (err) {
        console.error('Copy failed', err);
        prompt("Sharing failed. You can copy the text manually:", text);
    }
    document.body.removeChild(textArea);
};

window.updateIcon = function(iconEl, state) {
    if (!iconEl) return;
    const isCircle = iconEl.parentElement.classList.contains('listen-btn') || 
                     iconEl.parentElement.classList.contains('pill') || 
                     iconEl.classList.contains('ph-play-circle') ||
                     iconEl.classList.contains('ph-pause-circle');

    const classesToRemove = ['ph-play', 'ph-pause', 'ph-play-circle', 'ph-pause-circle', 'ph-stop-circle', 'ph-spinner-gap', 'ph-spin'];
    iconEl.classList.remove(...classesToRemove);
    
    if (state === 'play') iconEl.classList.add(isCircle ? 'ph-pause-circle' : 'ph-pause');
    else if (state === 'loading') iconEl.classList.add('ph-spinner-gap', 'ph-spin');
    else iconEl.classList.add(isCircle ? 'ph-play-circle' : 'ph-play');
};

window.updatePlayerUI = function(isHidden) {
    const playerBar = document.getElementById('playerBar');
    if (!playerBar) return;
    playerBar.classList.toggle('hidden', isHidden);
    document.body.classList.toggle('player-hidden', isHidden);
    localStorage.setItem('playerHidden', isHidden);
    const toggleBtn = document.getElementById('player-toggle-btn');
    if (toggleBtn) toggleBtn.classList.toggle('active', !isHidden);
};

window.toggleSidebar = function(forceOpen) {
    const sidebar = document.querySelector('.quran-sidebar');
    const overlay = document.getElementById('quran-sidebar-overlay');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('open');
    const newState = forceOpen !== undefined ? forceOpen : !isOpen;

    sidebar.classList.toggle('open', newState);
    if (overlay) overlay.classList.toggle('open', newState);
    document.body.style.overflow = newState ? 'hidden' : '';
};

// Global Audio State
const globalAudio = new Audio();
window.globalAudio = globalAudio;
let currentAudioIcon = null;
let currentAudioText = "";
let isAudioUnlocked = false;

// Progress Bar Sync
window.updateProgressBar = function(percent) {
    const fill = document.getElementById('player-progress-fill');
    const dot = document.getElementById('player-progress-dot');
    if (fill) fill.style.width = `${percent}%`;
    if (dot) dot.style.left = `${percent}%`;
};

window.updateProgressTime = function(current, total) {
    const timeC = document.getElementById('player-progress-current');
    const timeT = document.getElementById('player-progress-total');
    
    if (timeC) {
        if (typeof current === 'string') timeC.textContent = current;
        else {
            const m = Math.floor(current / 60), s = Math.floor(current % 60);
            timeC.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
    }
    if (timeT && total !== undefined) {
        if (typeof total === 'string') timeT.textContent = total;
        else {
            const m = Math.floor(total / 60), s = Math.floor(total % 60);
            timeT.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
    }
};

globalAudio.addEventListener('timeupdate', () => {
    if (window.hadithPlaybackActive) return; // Handled by hadith script
    const cur = globalAudio.currentTime;
    const dur = globalAudio.duration;
    if (!dur) return;
    const p = (cur / dur) * 100;
    window.updateProgressBar(p);
    window.updateProgressTime(cur);
});

globalAudio.addEventListener('loadedmetadata', () => {
    if (window.hadithPlaybackActive) return;
    const dur = globalAudio.duration;
    window.updateProgressTime(0, dur);

    // Ensure playback rate is maintained
    const speedS = document.getElementById('speed-select');
    if (speedS) globalAudio.playbackRate = parseFloat(speedS.value);
});

window.toggleSpeech = function(textToRead, playIconElement, lang = 'ar', onEnd = null) {
    if (!textToRead) {
        window.speechSynthesis.cancel();
        if (!globalAudio.paused) { globalAudio.pause(); globalAudio.currentTime = 0; }
        if (window.quranAudio) window.quranAudio.pause();
        if (currentAudioIcon) window.updateIcon(currentAudioIcon, 'pause');
        currentAudioText = ""; currentAudioIcon = null;
        return;
    }
    window.updatePlayerUI(false);
    
    if (currentAudioText === textToRead) {
        window.speechSynthesis.cancel();
        if (!globalAudio.paused) { globalAudio.pause(); globalAudio.currentTime = 0; }
        window.updateIcon(playIconElement, 'pause');
        const mainPlay = document.querySelector('.play-main i');
        if (mainPlay && mainPlay !== playIconElement) window.updateIcon(mainPlay, 'pause');
        currentAudioText = ""; currentAudioIcon = null;
        return;
    }
    
    window.speechSynthesis.cancel();
    if (!globalAudio.paused) { globalAudio.pause(); globalAudio.currentTime = 0; }
    if (window.quranAudio) window.quranAudio.pause();
    if (currentAudioIcon) window.updateIcon(currentAudioIcon, 'pause');
    
    currentAudioText = textToRead;
    currentAudioIcon = playIconElement;

    const speed = parseFloat(document.getElementById('speed-select')?.value || "1.0");
    const vol = parseFloat(document.getElementById('volume-slider')?.value || "1.0");
    globalAudio.volume = vol;

    if ((lang === 'en' || lang === 'bn') && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        utterance.rate = speed;
        utterance.volume = vol;
        utterance.onstart = () => { 
            window.updateIcon(playIconElement, 'play');
            const mainPlay = document.querySelector('.play-main i');
            if (mainPlay && mainPlay !== playIconElement) window.updateIcon(mainPlay, 'play'); 
        };
        utterance.onend = () => { 
            if (currentAudioText === textToRead) { 
                window.updateIcon(playIconElement, 'pause');
                const mainPlay = document.querySelector('.play-main i');
                if (mainPlay && mainPlay !== playIconElement) window.updateIcon(mainPlay, 'pause'); 
                currentAudioText = ""; currentAudioIcon = null; 
                if (onEnd) onEnd();
            } 
        };
        window.speechSynthesis.speak(utterance);
    } else {
        const encodedText = encodeURIComponent(textToRead.substring(0, 500));
        globalAudio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
        globalAudio.playbackRate = speed;
        globalAudio.onended = () => { 
            if (currentAudioIcon) window.updateIcon(currentAudioIcon, 'pause');
            const mainPlay = document.querySelector('.play-main i');
            if (mainPlay && mainPlay !== currentAudioIcon) window.updateIcon(mainPlay, 'pause');
            currentAudioText = ""; currentAudioIcon = null; 
            if (onEnd) onEnd();
        };
        globalAudio.play().then(() => { 
            window.updateIcon(playIconElement, 'play');
            const mainPlay = document.querySelector('.play-main i');
            if (mainPlay && mainPlay !== playIconElement) window.updateIcon(mainPlay, 'play'); 
        }).catch(console.error);
    }
};


window.performShare = async function(btn, data, lang, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i>';
    
    const { ar, tr, ref } = data;
    const t = (window.i18n && window.i18n.translations[lang]) || {};
    const appName = t.brand_name || "NOOR AL-HUDA";
    const shareText = `${ref}

${ar}

${tr}

Shared from ${appName}`;

    try {
        const template = document.getElementById('share-card-template');
        if (!template) throw new Error("Template missing");
        if (!window.html2canvas) throw new Error("Library missing");

        // Sync Template Data
        const scAr = document.getElementById('sc-arabic'), scTr = document.getElementById('sc-translation');
        const scApp = document.getElementById('sc-app-name'), scMeta = document.getElementById('sc-meta'), scUrl = document.getElementById('sc-url');

        if (scAr) scAr.textContent = ar || "";
        if (scTr) scTr.textContent = tr || "";
        if (scApp) scApp.textContent = appName;
        if (scMeta) scMeta.textContent = ref;
        if (scUrl) scUrl.textContent = window.location.origin + window.location.pathname;

        // Ensure template is visible to html2canvas but not to user
        template.style.opacity = "1";
        template.style.top = "0"; // Bring to top for reliable capture

        const canvas = await html2canvas(template, { 
            scale: 2, 
            useCORS: true, 
            allowTaint: true,
            logging: false,
            backgroundColor: "#0F4A31",
            width: 600,
            height: template.offsetHeight || 800
        });
        
        template.style.top = "-10000px"; // Hide again

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error("Blob failed");

        let fileName = "NoorAlHuda_Share.png";
        if (data.type === 'Quran' && data.surah && data.ayah) {
            fileName = `NoorAlHuda_Quran_${data.surah}_${data.ayah}.png`;
        } else if (data.collection && data.number) {
            const coll = data.collection.charAt(0).toUpperCase() + data.collection.slice(1);
            fileName = `NoorAlHuda_${coll}_${data.number}.png`;
        } else {
            fileName = `NoorAlHuda_${Date.now()}.png`;
        }

        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: appName });
        } else {
            const link = document.createElement('a');
            link.download = fileName; link.href = URL.createObjectURL(blob);
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            setTimeout(() => alert("Image generated! Check downloads."), 500);
        }
    } catch (err) {
        console.warn("Share engine fallback:", err);
        if (navigator.share) {
            try { await navigator.share({ title: appName, text: shareText, url: window.location.href }); }
            catch (e) { window.copyToClipboard(shareText); }
        } else {
            window.copyToClipboard(shareText);
        }
    } finally {
        btn.innerHTML = originalContent;
    }
};


// --- SERVICE WORKER REGISTRATION & UPDATES ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('SW Registered with scope:', reg.scope);

            // Check for updates periodically (Lazy background check)
            setInterval(() => {
                reg.update();
            }, 60 * 60 * 1000); // Every hour

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available!
                        showUpdateNotification();
                    }
                });
            });
        }).catch(err => {
            console.error('SW Registration failed:', err);
        });
    });
}

function showUpdateNotification() {
    const lang = localStorage.getItem('lang') || 'en';
    const msg = lang === 'bn' ? 'নূর আল-হুদা আপডেট হয়েছে! নতুন ফিচার দেখতে রিলোড করুন।' : 'Noor Al-Huda has been updated! Please reload to see the latest version.';
    const btnText = lang === 'bn' ? 'রিলোড' : 'Reload Now';
    
    const div = document.createElement('div');
    div.className = 'update-notification';
    div.innerHTML = `
        <div class="update-content">
            <i class="ph ph-sparkle"></i>
            <span>${msg}</span>
            <button id="reload-app-btn" class="btn btn-gold btn-sm">${btnText}</button>
        </div>
    `;
    document.body.appendChild(div);
    
    const btn = document.getElementById('reload-app-btn');
    if (btn) {
        btn.onclick = () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage('skipWaiting');
            }
            window.location.reload();
        };
    }
}

// --- DOM READY LOGIC ---

// Global Selection Fix: Clear selection on single tap to prevent accidental highlights/popups
// This ensures that only long-press or double-tap triggers selection mode.
document.addEventListener('click', (e) => {
    if (e.detail === 1) { // Single click
        const sel = window.getSelection();
        if (sel && sel.type === 'Range' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            // Check if the target or its parent is a selectable content area
            const isContent = e.target.closest('.ayah-text-ar, .ayah-text-tr, .hadith-ar, .hadith-en, .tafsir-content, .learn-desc, .qa-answer');
            if (!isContent) {
                sel.removeAllRanges();
            }
        }
    }
}, true);

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('lang') || 'en';
    const path = window.location.pathname;
    
    // 1. Language Init
    if (window.i18n) window.i18n.translatePage(currentLang);

    // 2. Language Modal Injection
    const modalHTML = `
        <div class="lang-modal-overlay" id="langModal">
            <div class="lang-modal">
                <div class="lang-modal-header">
                    <span class="lang-modal-title" data-t="select_language">Select Language</span>
                    <button class="lang-close"><i class="ph ph-x"></i></button>
                </div>
                <div class="lang-options">
                    <div class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en"><span class="lang-code">ENG</span><span class="lang-name">English</span><i class="ph ph-check lang-check"></i></div>
                    <div class="lang-option ${currentLang === 'bn' ? 'active' : ''}" data-lang="bn"><span class="lang-code">BNG</span><span class="lang-name">বাংলা (Bengali)</span><i class="ph ph-check lang-check"></i></div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const langModal = document.getElementById('langModal');
    const langBtn = document.querySelector('.lang-btn');
    if (langBtn) langBtn.onclick = () => langModal.classList.add('active');
    if (langModal) {
        langModal.querySelector('.lang-close').onclick = () => langModal.classList.remove('active');
        langModal.onclick = (e) => { if (e.target === langModal) langModal.classList.remove('active'); };
        langModal.querySelectorAll('.lang-option').forEach(opt => {
            opt.onclick = () => {
                const l = opt.dataset.lang; currentLang = l; localStorage.setItem('lang', l);
                langModal.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active', o.dataset.lang === l));
                if (window.i18n) window.i18n.translatePage(l);
                document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: l } }));
                setTimeout(() => langModal.classList.remove('active'), 250);
            };
        });
    }

    // 3. Theme
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            const nt = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', nt); localStorage.setItem('theme', nt);
            const icon = themeToggle.querySelector('i');
            if (nt === 'dark') icon.classList.replace('ph-moon', 'ph-sun');
            else icon.classList.replace('ph-sun', 'ph-moon');
        };
    }

    // 4. Mobile Menu
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn) {
        menuBtn.onclick = () => {
            navLinks.classList.toggle('active');
            const i = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) i.classList.replace('ph-list', 'ph-x');
            else i.classList.replace('ph-x', 'ph-list');
        };
    }

    // 5. Floating Player Button (Created early so UI sync works)
    let playerToggleBtn = null;
    const isQuran = path.includes('/quran/') || path.includes('quran.html') || window.SURAH_ID;
    const isHadith = path.includes('/collection/') || path.includes('hadith.html');
    const shouldShowPlayer = isQuran || isHadith;
    const isExcludedPage = !shouldShowPlayer;
    
    if (!isExcludedPage) {
        playerToggleBtn = document.createElement('button');
        playerToggleBtn.id = 'player-toggle-btn';
        playerToggleBtn.className = 'player-toggle-btn';
        playerToggleBtn.innerHTML = '<i class="ph ph-headphones"></i>';
        playerToggleBtn.setAttribute('aria-label', 'Toggle Player');
        document.body.appendChild(playerToggleBtn);

        const savedPos = JSON.parse(localStorage.getItem('playerTogglePos'));
        if (savedPos) {
            let x = Math.max(20, Math.min(savedPos.x, window.innerWidth - 60));
            let y = Math.max(70, Math.min(savedPos.y, window.innerHeight - 60));
            playerToggleBtn.style.left = `${x}px`;
            playerToggleBtn.style.top = `${y}px`;
            playerToggleBtn.style.bottom = 'auto';
            playerToggleBtn.style.right = 'auto';
        }

        let isDragging = false, dragStartX, dragStartY, buttonStartX, buttonStartY, hasMoved = false;

        playerToggleBtn.onpointerdown = (e) => {
            isDragging = true; hasMoved = false;
            dragStartX = e.clientX; dragStartY = e.clientY;
            const rect = playerToggleBtn.getBoundingClientRect();
            buttonStartX = rect.left; buttonStartY = rect.top;
            playerToggleBtn.setPointerCapture(e.pointerId);
            playerToggleBtn.style.transition = 'none';
        };

        playerToggleBtn.onpointermove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
            playerToggleBtn.style.left = `${buttonStartX + dx}px`;
            playerToggleBtn.style.top = `${buttonStartY + dy}px`;
        };

        playerToggleBtn.onpointerup = (e) => {
            isDragging = false;
            playerToggleBtn.style.transition = '';
            playerToggleBtn.releasePointerCapture(e.pointerId);
            if (hasMoved) {
                const rect = playerToggleBtn.getBoundingClientRect();
                localStorage.setItem('playerTogglePos', JSON.stringify({ x: rect.left, y: rect.top }));
            } else {
                const pb = document.getElementById('playerBar');
                if (pb) window.updatePlayerUI(pb.classList.contains('hidden') ? false : true);
            }
        };
    }

    // 6. Player Controls & Initial State Sync
    const savedPlayerHidden = localStorage.getItem('playerHidden');
    // Default to visible (false) if never set
    window.updatePlayerUI(savedPlayerHidden === 'true');
    
    const closeP = document.getElementById('player-close');
    if (closeP) closeP.onclick = () => {
        if (window.quranAudio) window.quranAudio.pause();
        window.toggleSpeech("", null);
        window.updatePlayerUI(true);
        if (window.onPlayerClose) window.onPlayerClose();
    };

    const speedS = document.getElementById('speed-select');
    if (speedS) {
        speedS.addEventListener('change', (e) => {
            const val = parseFloat(e.target.value);
            globalAudio.playbackRate = val;
            if (window.quranAudio) window.quranAudio.playbackRate = val;
            localStorage.setItem('playbackSpeed', val);
        });
        // Restore saved speed
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
            speedS.value = savedSpeed;
            globalAudio.playbackRate = parseFloat(savedSpeed);
        }
    }

    // Skip Hooks & State Management
    window.updateSkipButtons = function(canBack, canForward) {
        document.querySelectorAll('.pc-btn').forEach(btn => {
            const isBack = btn.querySelector('.ph-skip-back');
            const isForward = btn.querySelector('.ph-skip-forward');
            if (isBack) {
                btn.style.opacity = canBack ? '1' : '0.3';
                btn.style.pointerEvents = canBack ? 'auto' : 'none';
            }
            if (isForward) {
                btn.style.opacity = canForward ? '1' : '0.3';
                btn.style.pointerEvents = canForward ? 'auto' : 'none';
            }
        });
    };

    document.querySelectorAll('.pc-btn').forEach(btn => {
        if (btn.querySelector('.ph-skip-back')) {
            btn.onclick = () => { if (window.onPlayerSkipBack) window.onPlayerSkipBack(); };
        }
        if (btn.querySelector('.ph-skip-forward')) {
            btn.onclick = () => { if (window.onPlayerSkipForward) window.onPlayerSkipForward(); };
        }
        if (btn.id === 'player-playlist-btn' || btn.querySelector('.ph-list-bullets')) {
            btn.onclick = () => { if (window.toggleSidebar) window.toggleSidebar(); };
        }
    });

    const volSlider = document.getElementById('volume-slider');
    const volIcon = document.getElementById('volume-icon');
    if (volSlider) {
        const updateVol = (val) => {
            globalAudio.volume = val;
            if (window.quranAudio) window.quranAudio.volume = val;
            if (volIcon) {
                if (val == 0) volIcon.className = 'ph ph-speaker-slash';
                else if (val < 0.5) volIcon.className = 'ph ph-speaker-low';
                else volIcon.className = 'ph ph-speaker-high';
            }
            localStorage.setItem('playbackVolume', val);
        };
        volSlider.addEventListener('input', (e) => updateVol(parseFloat(e.target.value)));
        
        // Restore saved volume
        const savedVol = localStorage.getItem('playbackVolume');
        if (savedVol) {
            volSlider.value = savedVol;
            updateVol(parseFloat(savedVol));
        }
    }

    const playMainBtn = document.querySelector('.play-main');
    if (playMainBtn) {
        playMainBtn.onclick = () => {
            const isLib = document.querySelector('.quran-layout') || document.getElementById('hadith-container');
            if (isLib) return; // Handled by page scripts
            
            if (globalAudio.src && !globalAudio.paused) {
                globalAudio.pause();
                window.updateIcon(playMainBtn.querySelector('i'), 'pause');
            } else if (globalAudio.src) {
                globalAudio.play();
                window.updateIcon(playMainBtn.querySelector('i'), 'play');
            }
        };
    }

    // 7. Global Listen & Share Listeners
    document.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.share-btn, .share-ayah');
        if (shareBtn && !shareBtn.querySelector('.ph-spin')) {
            const isLib = document.querySelector('.quran-layout') || document.getElementById('hadith-container');
            if (!isLib || (!shareBtn.classList.contains('share-ayah') && !shareBtn.classList.contains('share-btn'))) {
                const card = shareBtn.closest('section, .ayah-day, .hadith-card, .featured-card');
                if (card) {
                    const ar = card.querySelector('.ayah-ar, .hadith-ar, .ayah-text-ar')?.textContent || "";
                    const tr = card.querySelector('.ayah-tr, .hadith-en, .ayah-text-tr')?.textContent || "";
                    const ref = card.querySelector('.ayah-ref, .ref')?.textContent || "Revelation";
                    
                    const surah = shareBtn.dataset.surah || card.dataset.surah;
                    const ayah = shareBtn.dataset.ayah || card.dataset.ayah;
                    const coll = shareBtn.dataset.collection || card.dataset.collection;
                    const num = shareBtn.dataset.number || card.dataset.number;
                    const type = (surah && ayah) ? 'Quran' : (coll ? 'Hadith' : null);

                    window.performShare(shareBtn, { ar, tr, ref, type, surah, ayah, collection: coll, number: num }, currentLang, e);
                }
            }
        }

        const listenBtn = e.target.closest('.listen-btn, .pill:has(.ph-play-circle)');
        if (listenBtn) {
            const isLib = document.querySelector('.quran-layout') || document.getElementById('hadith-container');
            if (!isLib) {
                const card = listenBtn.closest('section, .ayah-day, .hadith-card, .podcast-card');
                if (card) {
                    const ar = card.querySelector('.ayah-ar, .hadith-ar')?.textContent || "";
                    const tr = card.querySelector('.ayah-tr, .hadith-en')?.textContent || "";
                    window.toggleSpeech(tr || ar, listenBtn.querySelector('i'), currentLang);
                }
            }
        }

        const tafsirBtn = e.target.closest('.tafsir-btn, .context-btn');
        if (tafsirBtn) {
            const surah = tafsirBtn.dataset.surah;
            const ayah = tafsirBtn.dataset.ayah;
            if (surah && ayah) {
                window.toggleTafsir(surah, ayah, tafsirBtn);
            }
        }

        const closeTafsir = e.target.closest('.close-tafsir');
        if (closeTafsir) {
            const container = closeTafsir.closest('.tafsir-container');
            if (container) container.classList.remove('active');
        }
    });

    window.toggleTafsir = async function(surah, ayah, btn) {
        const container = document.getElementById(`tafsir-${surah}-${ayah}`);
        if (!container) return;

        const isContext = btn.classList.contains('context-btn');
        const type = isContext ? 'context' : 'tafsir';

        if (container.classList.contains('active') && container.dataset.activeType === type) {
            container.classList.remove('active');
            return;
        }

        container.classList.add('active');
        container.dataset.activeType = type;
        const contentDiv = container.querySelector('.tafsir-content');
        const titleSpan = container.querySelector('.tafsir-title');
        
        const lang = localStorage.getItem('lang') || 'en';
        
        let tafsirId, tafsirName;

        if (isContext) {
            tafsirId = lang === 'bn' ? 165 : 168; // Ahsanul Bayaan (Bn) / Ma'arif al-Qur'an (En)
            tafsirName = lang === 'bn' ? "প্রেক্ষাপট (Ahsanul Bayaan)" : "Context (Ma'arif al-Qur'an)";
        } else {
            tafsirId = lang === 'bn' ? 166 : 169; // Abu Bakr Zakaria (Bn) / Ibn Kathir (En)
            tafsirName = lang === 'bn' ? "তাফসীর আবু বকর যাকারিয়া" : "Tafsir Ibn Kathir";
        }

        titleSpan.textContent = tafsirName;
        
        if (container.dataset.loadedType === type && container.dataset.loadedId === tafsirId.toString()) return;

        contentDiv.innerHTML = `<div style="padding: 20px; text-align: center;"><i class="ph ph-spinner-gap ph-spin" style="font-size: 24px; color: var(--gold);"></i></div>`;

        try {
            const res = await fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`);
            const data = await res.json();
            
            if (data.tafsir && data.tafsir.text) {
                contentDiv.innerHTML = data.tafsir.text;
                container.dataset.loadedType = type;
                container.dataset.loadedId = tafsirId.toString();
            } else {
                throw new Error("Content not available");
            }
        } catch (err) {
            contentDiv.innerHTML = `<div style="padding: 10px; color: var(--error); font-size: 14px;">Information not available for this Ayah yet.</div>`;
        }
    };

    // 8. Page Cleanups
    if (isExcludedPage) {
        const pb = document.getElementById('playerBar');
        if (pb) pb.remove();
        document.body.classList.add('player-restricted');
    }

    // 9. Splash
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
            setTimeout(() => { splash.style.display = 'none'; }, 600);
        }, 1500);
    }
});
