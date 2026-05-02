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

    const quranAudio = new Audio();
    window.quranAudio = quranAudio;

    // Progress Bar Sync
    quranAudio.addEventListener('timeupdate', () => {
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

    // --- Initialization ---
    async function init() {
        try {
            // Restore saved settings
            const savedSpeed = localStorage.getItem('playbackSpeed') || "1.0";
            const savedVol = localStorage.getItem('playbackVolume') || "1.0";
            quranAudio.playbackRate = parseFloat(savedSpeed);
            quranAudio.volume = parseFloat(savedVol);

            const speedS = document.getElementById('speed-select');
            if (speedS) speedS.value = savedSpeed;

            const volS = document.getElementById('volume-slider');
            if (volS) volS.value = savedVol;

            await loadSurahList();
            
            if (translationSelect) {
                const lang = localStorage.getItem('lang') || 'en';
                if (lang === 'bn' && currentTranslation.startsWith('en.')) {
                    currentTranslation = 'bn.bengali';
                }
                translationSelect.value = currentTranslation;
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

            document.querySelectorAll('.surah-item').forEach(el => {
                el.classList.toggle('active', parseInt(el.dataset.number) === currentSurah);
            });
            
            await loadSurah(currentSurah, currentTranslation);

            if (ayahParam) {
                scrollToElement(`ayah-${ayahParam}`);
            }
        } catch (err) {
            console.error("Quran Init Failed:", err);
        }
    }

    async function loadSurahList() {
        const lang = localStorage.getItem('lang') || 'en';
        try {
            const res = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await res.json();
            surahListContainer.innerHTML = '';
            
            data.data.forEach(surah => {
                const a = document.createElement('a');
                const targetPath = window.SURAH_ID ? `../../quran/${surah.number}/index.html` : `quran/${surah.number}/index.html`;
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
            surahListContainer.innerHTML = '<div style="color: var(--error); padding: 20px;">Failed to load Surahs.</div>';
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
            if (playerTitle) playerTitle.textContent = `${t.surah} ${displayTitle}`;
            document.title = `${t.surah} ${displayTitle} — Noor Al-Huda`;

            let html = '';
            if (surahNumber !== 1 && surahNumber !== 9) {
                html += `
                <div class="bismillah-container">
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
                    btn.querySelector('i').className = 'ph ph-bookmark-simple-fill';
                    btn.style.color = 'var(--gold)';
                    btn.classList.add('active');
                }
            });

            btn.onclick = async (e) => {
                e.stopPropagation();
                const row = btn.closest('.ayah-row');
                const item = {
                    id: id, type: 'quran', surah: currentSurah, ayah: row.dataset.ayah,
                    textAr: row.querySelector('.ayah-text-ar').textContent,
                    textTr: row.querySelector('.ayah-text-tr').textContent,
                    title: surahHeaderEn.textContent.split('(')[0].trim()
                };
                const added = await window.BookmarkDB.toggle(item);
                const icon = btn.querySelector('i');
                icon.className = added ? 'ph ph-bookmark-simple-fill' : 'ph ph-bookmark-simple';
                btn.style.color = added ? 'var(--gold)' : '';
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
    function playAyah(btn, index) {
        currentAyahIndex = index;
        const surah = btn.dataset.surah.padStart(3, '0');
        const ayah = btn.dataset.ayah.padStart(3, '0');
        document.querySelectorAll('.play-ayah i, .play-bismillah i').forEach(i => i.className = 'ph ph-play');
        
        if (currentAyahBtn === btn && !quranAudio.paused) {
            quranAudio.pause();
            if (mainPlayIcon) mainPlayIcon.className = 'ph ph-play';
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

            quranAudio.play().catch(console.error);
            btn.querySelector('i').className = 'ph ph-pause';
            if (mainPlayIcon) mainPlayIcon.className = 'ph ph-pause';
            currentAyahBtn = btn;
            isBismillahPlaying = false;
            scrollToElement(`ayah-${btn.dataset.ayah}`);
            if (window.updatePlayerUI) window.updatePlayerUI(false);
        }
    }

    function playBismillah() {
        if (!bismillahBtn) return;
        document.querySelectorAll('.play-ayah i').forEach(i => i.className = 'ph ph-play');
        if (isBismillahPlaying && !quranAudio.paused) {
            quranAudio.pause();
            bismillahBtn.querySelector('i').className = 'ph ph-play';
            if (mainPlayIcon) mainPlayIcon.className = 'ph ph-play';
        } else {
            quranAudio.src = `https://everyayah.com/data/${currentReciter}/001001.mp3`;
            
            // Sync settings after setting src
            const speed = document.getElementById('speed-select');
            const vol = document.getElementById('volume-slider');
            if (speed) quranAudio.playbackRate = parseFloat(speed.value);
            if (vol) quranAudio.volume = parseFloat(vol.value);

            quranAudio.play().catch(console.error);
            bismillahBtn.querySelector('i').className = 'ph ph-pause';
            if (mainPlayIcon) mainPlayIcon.className = 'ph ph-pause';
            isBismillahPlaying = true;
            currentAyahBtn = null;
        }
    }

    quranAudio.onended = () => {
        if (isBismillahPlaying) {
            isBismillahPlaying = false;
            if (allAyahButtons.length > 0) playAyah(allAyahButtons[0], 0);
        } else {
            currentAyahIndex++;
            if (currentAyahIndex < allAyahButtons.length) {
                playAyah(allAyahButtons[currentAyahIndex], currentAyahIndex);
            } else {
                if (mainPlayIcon) mainPlayIcon.className = 'ph ph-play';
            }
        }
    };

    if (mainPlayBtn) {
        mainPlayBtn.onclick = () => {
            if (quranAudio.src && !quranAudio.paused) quranAudio.pause();
            else if (quranAudio.src) quranAudio.play();
            else if (bismillahBtn) playBismillah();
            else if (allAyahButtons.length > 0) playAyah(allAyahButtons[0], 0);
            if (mainPlayIcon) mainPlayIcon.className = quranAudio.paused ? 'ph ph-play' : 'ph ph-pause';
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
                    if (window.location.hash !== hash) history.replaceState(null, null, hash);
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