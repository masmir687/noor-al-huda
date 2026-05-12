document.addEventListener('DOMContentLoaded', () => {
    // Only run on quran page
    if (!document.querySelector('.quran-layout')) return;

    // --- DOM Elements ---
    const surahListContainer = document.getElementById('surah-list-container');
    const quranContainer = document.getElementById('quran-container');
    const surahHeaderAr = document.getElementById('surah-header-ar');
    const surahHeaderEn = document.getElementById('surah-header-en');
    const surahHeaderMeta = document.getElementById('surah-header-meta');
    const translationSelect = document.getElementById('translation-select');
    const reciterSelect = document.getElementById('reciter-select');
    const fontSizeSelect = document.getElementById('font-size-select');
    const mainPlayBtn = document.querySelector('.play-main');
    const mainPlayIcon = mainPlayBtn?.querySelector('i');
    
    // --- State ---
    let currentSurah = 1;
    let currentTranslation = localStorage.getItem('quran-translation') || 'en.sahih';
    let currentReciter = localStorage.getItem('quran-reciter') || 'Abdurrahmaan_As-Sudais_192kbps';
    let currentAyahBtn = null;
    let currentAyahIndex = -1;
    let allAyahButtons = [];
    let isBismillahPlaying = false;
    let isSystemScrolling = false;
    let bismillahBtn = null;

    const quranAudio = window.globalAudio;
    window.quranAudio = quranAudio;

    // Progress Bar Sync
    quranAudio.addEventListener('timeupdate', () => {
        if (window.MediaSessionManager) window.MediaSessionManager.updatePositionState();
        const cur = quranAudio.currentTime;
        const dur = quranAudio.duration;
        if (!dur) return;
        const p = (cur / dur) * 100;
        const fill = document.getElementById('player-progress-fill');
        const dot = document.getElementById('player-progress-dot');
        const timeC = document.getElementById('player-progress-current');
        if (fill) fill.style.width = `${p}%`;
        if (dot) dot.style.left = `${p}%`;
        if (timeC) {
            const m = Math.floor(cur / 60), s = Math.floor(cur % 60);
            timeC.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
    });

    quranAudio.addEventListener('loadedmetadata', () => {
        const dur = quranAudio.duration;
        const timeT = document.getElementById('player-progress-total');
        if (timeT && dur) {
            const m = Math.floor(dur / 60), s = Math.floor(dur % 60);
            timeT.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
        
        // Ensure playback rate is maintained after source change
        const speedS = document.getElementById('speed-select');
        if (speedS) quranAudio.playbackRate = parseFloat(speedS.value);
    });

    // --- Bengali Surah Names ---
    const surahNamesBn = ["আল-ফাতিহা", "আল-বাকারাহ", "আল-ইমরান", "আন-নিসা", "আল-মায়িদাহ", "আল-আনআম", "আল-আরাফ", "আল-আনফাল", "আত-তাওবাহ", "ইউনুস", "হুদ", "ইউসুফ", "আর-রাদ", "ইব্রাহীম", "হিজর", "আন-নাহল", "আল-ইসরা", "আল-কাহফ", "মারইয়াম", "ত্বোয়া-হা", "আল-আম্বিয়া", "আল-হাজ্জ", "আল-মুমিনুন", "আন-নূর", "আল-ফুরকান", "আশ-শুআরা", "আন-নামল", "আল-কাসাস", "আল-আনকাবূত", "আর-রূম", "লুকমান", "আস-সাজদাহ", "আল-আহযাব", "সাবা", "ফাতির", "ইয়াসীন", "আস-সাফফাত", "ছোয়াদ", "আয-যুমার", "গাফির", "ফুসসিলাত", "আশ-শূরা", "আয-যুখরুফ", "আদ-দুখান", "আল-জাসিয়াহ", "আল-আহক্বাফ", "মুহাম্মদ", "আল-ফাতহ", "আল-হুজুরাত", "ক্বাফ", "আয-যারিয়াত", "আত্ব তূর", "আন-নাজম", "আল-কামার", "আর-রহমান", "আল-ওয়াকিয়াহ", "আল-হাদীদ", "আল-মুজাদিলাহ", "আল-হাশর", "আল-মুমতাহিনাহ", "আস-সাফ", "আল-জুমুআহ", "আল-মুনাফিকূন", "আত-তাগাবুন", "আত্ব-ত্বালাক", "আত-তাহরীম", "আল-মুলক", "আল-কলম", "আল-হাক্কাহ", "আল-মাআরিজ", "নূহ", "আল-জ্বিন", "আল-মুযযাম্মিল", "আল-মুদ্দাসসির", "আল-ক্বিয়ামাহ", "আল-ইনসান", "আল-মুরসাাত", "আন-নাবা", "আন-নাযিয়াত", "আবাসা", "আত-তাকভীর", "আল-ইনফিতার", "আল-মুতাপফিফীন", "আল-ইনশিকাক", "আল-বুরূজ", "আত-তারিক", "আল-আলা", "আল-গাশিয়াহ", "আল-ফজর", "আল-বালাদ", "আশ-শামস", "আল-লাইল", "আদ-দুহা", "আশ-শরহ", "আত-তীন", "আল-আলাক", "আল-কদর", "আল-বায়্যিনাহ", "আয-যিলযাল", "আল-আদিয়াত", "আল-ক্বারিআহ", "আত-তাকাসুর", "আল-আসর", "আল-হুমাযাহ", "আল-ফীল", "কুরাইশ", "আল-মাউন", "আল-কাউসার", "আল-কাফিরূন", "আন-নাসর", "আল-লাহাব", "আল-ইখলাস", "আল-ফালাক", "আন-নাস"];

    // --- Path/URL Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const surahParam = window.SURAH_ID || urlParams.get('surah');
    let ayahParam = urlParams.get('ayah');
    if (!ayahParam && window.location.hash.startsWith('#ayah-')) {
        ayahParam = window.location.hash.replace('#ayah-', '');
    }
    currentSurah = parseInt(surahParam) || 1;

    // Handle Global Player Skips (Surah level)
    window.onPlayerSkipBack = () => {
        if (currentSurah > 1) navigateToSurah(currentSurah - 1);
    };
    window.onPlayerSkipForward = () => {
        if (currentSurah < 114) navigateToSurah(currentSurah + 1);
    };

    function navigateToSurah(num) {
        const target = window.SURAH_ID ? `../../quran/${num}/` : `?surah=${num}`;
        window.location.href = target;
    }

    function updateSkipUI() {
        if (window.updateSkipButtons) {
            window.updateSkipButtons(currentSurah > 1, currentSurah < 114);
        }
    }

    // --- Initialization ---
    async function init() {
        try {
            updateSkipUI();
            // Restore saved settings
            const rawSpeed = localStorage.getItem('playbackSpeed') || "1";
            const rawVol = localStorage.getItem('playbackVolume') || "1";
            const savedSpeed = parseFloat(rawSpeed).toString();
            const savedVol = parseFloat(rawVol).toString();
            
            if (!isNaN(parseFloat(savedSpeed))) quranAudio.playbackRate = parseFloat(savedSpeed);
            if (!isNaN(parseFloat(savedVol))) quranAudio.volume = parseFloat(savedVol);

            const speedS = document.getElementById('speed-select');
            if (speedS) speedS.value = savedSpeed;

            const volS = document.getElementById('volume-slider');
            if (volS) volS.value = savedVol;

            await loadSurahList();
            
            if (translationSelect) {
                const lang = localStorage.getItem('lang') || 'en';
                // Sync translation with global language choice
                if (lang === 'bn' && !currentTranslation.startsWith('bn.')) {
                    currentTranslation = 'bn.bengali';
                } else if (lang === 'en' && !currentTranslation.startsWith('en.')) {
                    currentTranslation = 'en.sahih';
                }
                translationSelect.value = currentTranslation;
                localStorage.setItem('quran-translation', currentTranslation);
                
                translationSelect.onchange = (e) => {
                    currentTranslation = e.target.value;
                    localStorage.setItem('quran-translation', currentTranslation);
                    loadSurah(currentSurah, currentTranslation);
                };
            }
            if (reciterSelect) {
                reciterSelect.value = currentReciter;
                reciterSelect.onchange = (e) => {
                    currentReciter = e.target.value;
                    localStorage.setItem('quran-reciter', currentReciter);
                };
            }
            if (fontSizeSelect) {
                fontSizeSelect.onchange = (e) => {
                    quranContainer.className = `font-${e.target.value}`;
                    localStorage.setItem('quran-font-size', e.target.value);
                };
                quranContainer.className = `font-${fontSizeSelect.value}`;
            }

            // Restore last played Surah if landing on Surah 1 from a general link
            const urlParams = new URLSearchParams(window.location.search);
            let shouldRestore = false;
            
            if (window.SURAH_ID === 1 && !urlParams.has('ayah') && !window.location.hash.startsWith('#ayah-')) {
                shouldRestore = true;
            }
            if (!window.SURAH_ID && !urlParams.has('surah')) {
                shouldRestore = true;
            }

            if (shouldRestore) {
                const savedState = localStorage.getItem('quran_playback_state');
                if (savedState) {
                    try {
                        const state = JSON.parse(savedState);
                        if (state && state.surah && parseInt(state.surah) !== 1) {
                            // Redirect to the saved surah instead of staying on Surah 1
                            const prefix = window.SURAH_ID ? '../../' : '';
                            window.location.replace(`${prefix}quran/${state.surah}/`);
                            return; // Stop execution
                        }
                    } catch(e) {}
                }
            }

            document.querySelectorAll('.surah-item').forEach(el => {
                el.classList.toggle('active', parseInt(el.dataset.number) === currentSurah);
            });
            
            await loadSurah(currentSurah, currentTranslation);

            if (ayahParam) {
                scrollToElement(`ayah-${ayahParam}`);
            } else {
                // If there's a saved ayah for this surah, scroll to it automatically
                const savedState = localStorage.getItem('quran_playback_state');
                if (savedState) {
                    try {
                        const state = JSON.parse(savedState);
                        if (state && parseInt(state.surah) === currentSurah && state.ayahIndex !== undefined) {
                            scrollToElement(`ayah-${parseInt(state.ayahIndex) + 1}`);
                        }
                    } catch(e) {}
                }
            }
        } catch (err) {
            console.error("Quran Init Failed:", err);
            quranContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--error);">
                    <i class="ph ph-warning-circle" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>Something went wrong</h3>
                    <p>${err.message || "Failed to initialize Quran reader."}</p>
                    <button onclick="window.location.reload()" class="btn btn-gold" style="margin-top: 20px;">Retry</button>
                </div>
            `;
        }
    }

    async function loadSurahList() {
        const lang = localStorage.getItem('lang') || 'en';
        try {
            const res = await fetch('https://api.alquran.cloud/v1/surah');
            if (!res.ok) throw new Error("Failed to fetch Surah list");
            const data = await res.json();
            surahListContainer.innerHTML = '';
            
            data.data.forEach(surah => {
                const a = document.createElement('a');
                const targetPath = window.SURAH_ID ? `../../quran/${surah.number}/` : `quran/${surah.number}/`;
                const displayTitle = lang === 'bn' ? surahNamesBn[surah.number - 1] : surah.englishName;
                a.href = targetPath;
                a.className = `surah-item ${surah.number === currentSurah ? 'active' : ''}`;
                a.dataset.number = surah.number;
                a.innerHTML = `
                    <span class="surah-number">${surah.number}</span>
                    <div class="surah-info">
                        <span class="surah-name">${displayTitle}</span>
                        <span class="surah-translation">${surah.englishNameTranslation}</span>
                    </div>
                    <span class="surah-name-ar">${surah.name.replace('سُورَةُ ', '')}</span>
                `;
                a.onclick = (e) => {
                    if (parseInt(a.dataset.number) === currentSurah) {
                        e.preventDefault();
                    }
                    if (window.innerWidth <= 768) closeSidebar();
                };
                surahListContainer.appendChild(a);
            });
        } catch (error) {
            console.error("loadSurahList error:", error);
            surahListContainer.innerHTML = '<div style="color: var(--error); padding: 20px;">Failed to load Surahs.</div>';
            throw error; // Propagate to init catch
        }
    }

    async function loadSurah(surahNumber, translationCode) {
        const lang = localStorage.getItem('lang') || 'en';
        const loadingText = (window.i18n && window.i18n.translations[lang].loading_revelation) || "Loading Revelation...";
        quranContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--gold);"><i class="ph ph-spinner-gap ph-spin" style="font-size: 32px;"></i><p>${loadingText}</p></div>`;

        try {
            const [arRes, trRes] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationCode}`)
            ]);

            if (!arRes.ok || !trRes.ok) throw new Error("Failed to fetch Ayah data");

            const arData = await arRes.json();
            const trData = await trRes.json();
            const surahAr = arData.data;
            const surahTr = trData.data;

            const displayTitle = lang === 'bn' ? surahNamesBn[surahNumber - 1] : surahAr.englishName;
            const t = (window.i18n && window.i18n.translations[lang]) || { surah: "Surah" };
            surahHeaderAr.textContent = surahAr.name;
            surahHeaderEn.textContent = `${t.surah} ${displayTitle} (${surahAr.englishNameTranslation})`;
            surahHeaderMeta.textContent = `${surahAr.revelationType} · ${surahAr.numberOfAyahs} Ayahs`;
            
            const playerTitle = document.querySelector('.player-title');
            const playerSub = document.querySelector('.player-sub');
            const reciterName = reciterSelect?.options[reciterSelect.selectedIndex]?.text || "Recitation";
            
            if (playerTitle) playerTitle.textContent = `${t.surah} ${displayTitle}`;
            if (playerSub) playerSub.textContent = reciterName;
            
            document.title = `${t.surah} ${displayTitle} — Noor Al-Huda`;

            let html = '';
            if (surahNumber !== 1 && surahNumber !== 9) {
                html += `
                <div class="bismillah-container" id="bismillah-container">
                    <button class="ayah-btn play-bismillah"><i class="ph ph-play"></i></button>
                    <div class="bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                </div>`;
            }

            for (let i = 0; i < surahAr.ayahs.length; i++) {
                let arText = surahAr.ayahs[i].text;
                if (surahNumber !== 1 && i === 0 && arText.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ")) {
                    arText = arText.replace("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ", "");
                }
                html += `
                <section class="ayah-row" id="ayah-${i+1}" data-ayah="${i+1}">
                    <div class="ayah-header">
                        <div class="ayah-badge">${i+1}</div>
                        <div class="ayah-actions">
                            <button class="ayah-btn play-ayah" data-surah="${surahNumber}" data-ayah="${i+1}" title="Play Audio"><i class="ph ph-play"></i></button>
                            <button class="ayah-btn context-btn" data-surah="${surahNumber}" data-ayah="${i+1}" title="Read Context"><i class="ph ph-book-open"></i></button>
                            <button class="ayah-btn tafsir-btn" data-surah="${surahNumber}" data-ayah="${i+1}" title="View Tafsir"><i class="ph ph-eye"></i></button>
                            <button class="ayah-btn share-ayah" data-surah="${surahNumber}" data-ayah="${i+1}" title="Share Ayah"><i class="ph ph-share-network"></i></button>
                            <button class="ayah-btn bookmark-btn" data-id="quran_${surahNumber}_${i+1}" title="Bookmark Ayah"><i class="ph ph-bookmark-simple"></i></button>
                        </div>
                    </div>
                    <div class="ayah-text-ar">${arText}</div>
                    <div class="ayah-text-tr">${surahTr.ayahs[i].text}</div>
                    <div class="tafsir-container" id="tafsir-${surahNumber}-${i+1}">
                        <div class="tafsir-header">
                            <span class="tafsir-title">Tafsir</span>
                            <button class="ayah-btn close-tafsir"><i class="ph ph-x"></i></button>
                        </div>
                        <div class="tafsir-content">
                            <!-- Content loaded via JS -->
                        </div>
                    </div>
                </section>`;
            }
            quranContainer.innerHTML = html;
            
            allAyahButtons = document.querySelectorAll('.play-ayah');
            bismillahBtn = document.querySelector('.play-bismillah');
            
            attachButtonListeners();
            if (window.i18n) window.i18n.translatePage(lang);
            initScrollObserver();
            
        } catch (error) {
            quranContainer.innerHTML = '<div style="text-align: center; color: var(--error); padding: 20px;">Error loading Surah.</div>';
        }
    }

    function attachButtonListeners() {
        allAyahButtons.forEach((btn, index) => {
            btn.onclick = () => playAyah(btn, index);
        });

        if (bismillahBtn) bismillahBtn.onclick = playBismillah;

        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const id = btn.dataset.id;
            window.BookmarkDB?.get(id).then(exists => {
                if (exists) {
                    btn.classList.add('active');
                }
            });

            btn.onclick = async (e) => {
                e.stopPropagation();
                const row = btn.closest('.ayah-row');
                const item = {
                    id: id, 
                    type: 'quran', 
                    surah: currentSurah, 
                    ayah: row.dataset.ayah
                };
                const added = await window.BookmarkDB.toggle(item);
                btn.classList.toggle('active', added);
            };
        });

        // Share (Robust Implementation)
        document.querySelectorAll('.share-ayah').forEach(btn => {
            btn.onclick = async (e) => {
                const row = btn.closest('.ayah-row');
                if (!row) return;
                const ar = row.querySelector('.ayah-text-ar')?.textContent || "";
                const tr = row.querySelector('.ayah-text-tr')?.textContent || "";
                const surahH = document.getElementById('surah-header-en');
                const ref = `Surah ${surahH ? surahH.textContent.split('(')[0].trim() : 'Quran'} [${row.dataset.ayah || "1"}]`;
                
                const lang = localStorage.getItem('lang') || 'en';
                if (window.performShare) {
                    window.performShare(btn, { ar, tr, ref, type: 'Quran', surah: row.dataset.ayah ? btn.dataset.surah : null, ayah: row.dataset.ayah }, lang, e);
                } else {
                    console.error("Share engine not loaded");
                }
            };
        });
    }

    

    // --- Audio Logic ---
    let isGlobalPlay = false;

    function updateAllAudioButtons() {
        const isPaused = quranAudio.paused;
        
        // Reset all buttons and styles first
        document.querySelectorAll('.play-ayah i, .play-bismillah i').forEach(i => {
            i.className = 'ph ph-play';
        });
        document.querySelectorAll('.ayah-row, .bismillah-container').forEach(el => {
            el.classList.remove('active-playing');
        });

        // Update the active one if playing
        if (!isPaused) {
            if (isBismillahPlaying && bismillahBtn) {
                bismillahBtn.querySelector('i').className = 'ph ph-pause';
                const container = bismillahBtn.closest('.bismillah-container');
                if (container) container.classList.add('active-playing');
            } else if (currentAyahBtn) {
                currentAyahBtn.querySelector('i').className = 'ph ph-pause';
                const row = currentAyahBtn.closest('.ayah-row');
                if (row) row.classList.add('active-playing');
            }
        } else if (currentAyahBtn || (isBismillahPlaying && bismillahBtn)) {
            // Even if paused, keep the active-playing style until a new ayah plays or it resets completely
            // Wait, the user wants "don't remove the green theme until the full section... read or played or completed"
            // If it's paused, keep it green. It only removes on complete or switch.
            if (isBismillahPlaying && bismillahBtn) {
                const container = bismillahBtn.closest('.bismillah-container');
                if (container) container.classList.add('active-playing');
            } else if (currentAyahBtn) {
                const row = currentAyahBtn.closest('.ayah-row');
                if (row) row.classList.add('active-playing');
            }
        }

        // Update main player icon
        if (mainPlayIcon) {
            mainPlayIcon.className = isPaused ? 'ph ph-play' : 'ph ph-pause';
        }
    }

    quranAudio.addEventListener('play', updateAllAudioButtons);
    quranAudio.addEventListener('pause', updateAllAudioButtons);

    window.playNextAyah = function() {
        if (currentAyahIndex < totalAyahs) {
            const nextBtn = document.querySelector(`.listen-btn[data-index="${currentAyahIndex + 1}"]`);
            if (nextBtn) playAyah(nextBtn, currentAyahIndex + 1, isGlobalPlay);
        } else {
            stopGlobalPlay();
        }
    };

    function playAyah(btn, index, isGlobal = false) {
        currentAyahIndex = index;
        isGlobalPlay = isGlobal;
        const surah = btn.dataset.surah.padStart(3, '0');
        const ayah = btn.dataset.ayah.padStart(3, '0');
        
        const lang = localStorage.getItem('lang') || 'en';
        const t = (window.i18n && window.i18n.translations[lang]) || { surah: "Surah" };
        const surahName = document.getElementById('surah-header-en')?.textContent.split('(')[0].trim() || "Quran";

        localStorage.setItem('active_media_type', 'quran');
        if (window.MediaSessionManager) {
            window.MediaSessionManager.updateMetadata({
                title: `${surahName} [${btn.dataset.ayah}]`,
                artist: reciterSelect?.options[reciterSelect.selectedIndex]?.text || "Recitation",
                album: t.surah || "Quran"
            });
            window.MediaSessionManager.updatePlaybackState('playing');
        }

        // Save current Ayah index to state for resuming later
        localStorage.setItem('quran_playback_state', JSON.stringify({
            surah: currentSurah,
            ayahIndex: index,
            isGlobal: isGlobal
        }));
        localStorage.setItem('quran_playback_state', JSON.stringify({ surah: currentSurah, ayahIndex: index }));

        if (currentAyahBtn === btn && !quranAudio.paused) {
            quranAudio.pause();
        } else {
            if (window.globalAudio) {
                window.globalAudio.pause();
                window.globalAudio.currentTime = 0;
            }
            if (window.toggleSpeech) window.toggleSpeech("", null);

            quranAudio.src = `https://everyayah.com/data/${currentReciter}/${surah}${ayah}.mp3`;
            
            // Sync settings after setting src
            const speed = document.getElementById('speed-select');
            const vol = document.getElementById('volume-slider');
            if (speed) quranAudio.playbackRate = parseFloat(speed.value);
            if (vol) quranAudio.volume = parseFloat(vol.value);

            currentAyahBtn = btn;
            isBismillahPlaying = false;
            quranAudio.play().catch(console.error);
            scrollToElement(`ayah-${btn.dataset.ayah}`);
            if (window.updatePlayerUI) window.updatePlayerUI(false);
        }
    }

    function playBismillah(isGlobal = true) {
        if (!bismillahBtn) return;
        isGlobalPlay = isGlobal;

        const lang = localStorage.getItem('lang') || 'en';
        const t = (window.i18n && window.i18n.translations[lang]) || { surah: "Surah" };
        const surahName = document.getElementById('surah-header-en')?.textContent.split('(')[0].trim() || "Quran";

        if (window.MediaSessionManager) {
            window.MediaSessionManager.updateMetadata({
                title: `${surahName} [Bismillah]`,
                artist: reciterSelect?.options[reciterSelect.selectedIndex]?.text || "Recitation",
                album: t.surah || "Quran"
            });
            window.MediaSessionManager.updatePlaybackState('playing');
        }

        if (isBismillahPlaying && !quranAudio.paused) {
            quranAudio.pause();
        } else {
            quranAudio.src = `https://everyayah.com/data/${currentReciter}/001001.mp3`;
            
            // Sync settings after setting src
            const speed = document.getElementById('speed-select');
            const vol = document.getElementById('volume-slider');
            if (speed) quranAudio.playbackRate = parseFloat(speed.value);
            if (vol) quranAudio.volume = parseFloat(vol.value);

            isBismillahPlaying = true;
            currentAyahBtn = null;
            quranAudio.play().catch(console.error);
            scrollToElement('bismillah-container');
        }
    }

    quranAudio.addEventListener('ended', () => {
        if (isBismillahPlaying) {
            isBismillahPlaying = false;
            // When Bismillah finishes during global play, resume from saved Ayah if available
            let targetIndex = 0;
            if (isGlobalPlay) {
                const savedState = localStorage.getItem('quran_playback_state');
                if (savedState) {
                    try {
                        const state = JSON.parse(savedState);
                        if (state && parseInt(state.surah) === currentSurah && state.ayahIndex !== undefined) {
                            targetIndex = parseInt(state.ayahIndex);
                        }
                    } catch(e) {}
                }
            }
            if (allAyahButtons.length > targetIndex) {
                playAyah(allAyahButtons[targetIndex], targetIndex, isGlobalPlay);
            } else if (allAyahButtons.length > 0) {
                playAyah(allAyahButtons[0], 0, isGlobalPlay);
            }
        } else {
            currentAyahIndex++;
            if (currentAyahIndex < allAyahButtons.length) {
                playAyah(allAyahButtons[currentAyahIndex], currentAyahIndex, isGlobalPlay);
            } else {
                if (isGlobalPlay && currentSurah < 114) {
                    // Global play continues to the next Surah automatically
                    if (window.onPlayerSkipForward) window.onPlayerSkipForward();
                } else {
                    if (mainPlayIcon) mainPlayIcon.className = 'ph ph-play';
                    currentAyahBtn = null;
                    updateAllAudioButtons();
                }
            }
        }
    });

    if (mainPlayBtn) {
        mainPlayBtn.onclick = () => {
            if (quranAudio.src && !quranAudio.paused) {
                quranAudio.pause();
            } else if (quranAudio.src && quranAudio.paused) {
                // Resume exactly where we paused on the same page, even if it was started individually
                isGlobalPlay = true; // Convert to global session
                quranAudio.play();
            } else {
                // Fresh start from global player
                isGlobalPlay = true;
                if (bismillahBtn) {
                    playBismillah(true);
                } else {
                    let targetIndex = 0;
                    const savedState = localStorage.getItem('quran_playback_state');
                    if (savedState) {
                        try {
                            const state = JSON.parse(savedState);
                            if (state && parseInt(state.surah) === currentSurah && state.ayahIndex !== undefined) {
                                targetIndex = parseInt(state.ayahIndex);
                            }
                        } catch(e) {}
                    }
                    if (allAyahButtons.length > targetIndex) playAyah(allAyahButtons[targetIndex], targetIndex, true);
                    else if (allAyahButtons.length > 0) playAyah(allAyahButtons[0], 0, true);
                }
            }
        };
    }

    // --- Sidebar & Scroll ---
    function openSidebar() {
        const _sidebar = document.querySelector('.quran-sidebar');
        const _overlay = document.getElementById('quran-sidebar-overlay');
        if (_sidebar) _sidebar.classList.add('open');
        if (_overlay) _overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        const _sidebar = document.querySelector('.quran-sidebar');
        const _overlay = document.getElementById('quran-sidebar-overlay');
        if (_sidebar) _sidebar.classList.remove('open');
        if (_overlay) _overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#mobile-sidebar-toggle') || e.target.closest('.sidebar-toggle-btn');
        const _overlay = document.getElementById('quran-sidebar-overlay');
        if (toggleBtn) { e.preventDefault(); openSidebar(); }
        else if (e.target === _overlay) closeSidebar();
    });

    function initScrollObserver() {
        const options = {
            root: window.innerWidth > 768 ? document.querySelector('.quran-content') : null,
            rootMargin: '-45% 0px -45% 0px',
            threshold: 0
        };
        const observer = new IntersectionObserver((entries) => {
            if (isSystemScrolling) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const hash = `#ayah-${entry.target.dataset.ayah}`;
                    if (window.location.hash !== hash) {
                        const newUrl = window.location.pathname + window.location.search + hash;
                        history.replaceState(null, null, newUrl);
                    }
                }
            });
        }, options);
        document.querySelectorAll('.ayah-row').forEach(row => observer.observe(row));
    }

    async function scrollToElement(elementId) {
        isSystemScrolling = true;
        let targetEl = null;
        for (let a = 0; a < 30; a++) {
            targetEl = document.getElementById(elementId);
            if (targetEl) break;
            await new Promise(r => setTimeout(r, 100));
        }
        if (!targetEl) { isSystemScrolling = false; return; }
        const container = document.querySelector('.quran-content');
        const rect = targetEl.getBoundingClientRect();
        if (window.innerWidth <= 768) window.scrollTo({ top: window.pageYOffset + rect.top - 100, behavior: 'smooth' });
        else if(container) container.scrollTo({ top: container.scrollTop + rect.top - 200, behavior: 'smooth' });
        
        // Update URL hash directly since observer is paused
        if (elementId.startsWith('ayah-')) {
            const hash = `#${elementId}`;
            if (window.location.hash !== hash) {
                const newUrl = window.location.pathname + window.location.search + hash;
                history.replaceState(null, null, newUrl);
            }
        }

        targetEl.classList.add('highlight-pulse');
        setTimeout(() => { isSystemScrolling = false; targetEl.classList.remove('highlight-pulse'); }, 3000);
    }

    document.addEventListener('languageChanged', (e) => {
        const lang = e.detail.lang;
        loadSurahList();
        if (lang === 'bn' && currentTranslation.startsWith('en.')) currentTranslation = 'bn.bengali';
        else if (lang === 'en' && currentTranslation.startsWith('bn.')) currentTranslation = 'en.sahih';
        if (translationSelect) translationSelect.value = currentTranslation;
        localStorage.setItem('quran-translation', currentTranslation);
        loadSurah(currentSurah, currentTranslation);
    });

    init();
});