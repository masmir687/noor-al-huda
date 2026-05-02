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
    const sidebar = document.querySelector('.quran-sidebar');
    const overlay = document.getElementById('quran-sidebar-overlay');
    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
    
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
            if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            
            await loadSurahList();
            
            // Sync UI
            if (translationSelect) translationSelect.value = currentTranslation;
            if (reciterSelect) reciterSelect.value = currentReciter;
            if (fontSizeSelect) quranContainer.classList.add(`font-${fontSizeSelect.value}`);

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
        try {
            const res = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await res.json();
            surahListContainer.innerHTML = '';
            
            data.data.forEach(surah => {
                const a = document.createElement('a');
                const targetPath = window.SURAH_ID ? `../../quran/${surah.number}/index.html` : `quran/${surah.number}/index.html`;
                a.href = targetPath;
                a.className = `surah-item ${surah.number === currentSurah ? 'active' : ''}`;
                a.dataset.number = surah.number;
                a.innerHTML = `
                    <span class="surah-number">${surah.number}</span>
                    <span class="surah-name">${surah.englishName}</span>
                    <span class="surah-name-ar">${surah.name.replace('سُورَةُ ', '')}</span>
                `;
                a.onclick = (e) => {
                    if (parseInt(a.dataset.number) === currentSurah) {
                        e.preventDefault();
                        closeSidebar();
                    }
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

            surahHeaderAr.textContent = surahAr.name;
            surahHeaderEn.textContent = `Surah ${surahAr.englishName} (${surahAr.englishNameTranslation})`;
            surahHeaderMeta.textContent = `${surahAr.revelationType} · ${surahAr.numberOfAyahs} Ayahs`;
            document.querySelector('.player-title').textContent = `Surah ${surahAr.englishName}`;

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
                            <button class="ayah-btn play-ayah" data-surah="${surahNumber}" data-ayah="${i+1}"><i class="ph ph-play"></i></button>
                            <button class="ayah-btn share-ayah" data-surah="${surahNumber}" data-ayah="${i+1}"><i class="ph ph-share-network"></i></button>
                            <button class="ayah-btn bookmark-btn" data-id="quran_${surahNumber}_${i+1}"><i class="ph ph-bookmark-simple"></i></button>
                        </div>
                    </div>
                    <div class="ayah-text-ar">${arText}</div>
                    <div class="ayah-text-tr">${surahTr.ayahs[i].text}</div>
                </section>`;
            }
            quranContainer.innerHTML = html;
            
            // Re-bind all dynamic elements
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
        // --- Sync with global settings ---
        const speedSelect = document.getElementById('speed-select');
        const volSlider = document.getElementById('volume-slider');
        
        if (speedSelect) {
            quranAudio.playbackRate = parseFloat(speedSelect.value);
            speedSelect.onchange = (e) => {
                quranAudio.playbackRate = parseFloat(e.target.value);
            };
        }
        if (volSlider) {
            quranAudio.volume = parseFloat(volSlider.value);
            volSlider.oninput = (e) => {
                quranAudio.volume = parseFloat(e.target.value);
            };
        }

        // Update Progress Bar
        const fillBar = document.querySelector('.player-progress .fill');
        const dot = document.querySelector('.player-progress .dot');
        const timeDisplays = document.querySelectorAll('.player-progress .time');

        quranAudio.ontimeupdate = () => {
            if (!fillBar) return;
            const percent = (quranAudio.currentTime / quranAudio.duration) * 100 || 0;
            fillBar.style.width = `${percent}%`;
            if (dot) dot.style.left = `${percent}%`;
            if (timeDisplays.length >= 2) {
                timeDisplays[0].textContent = formatTime(quranAudio.currentTime);
                timeDisplays[1].textContent = formatTime(quranAudio.duration);
            }
        };

        // Play Ayah
        allAyahButtons.forEach((btn, index) => {
            btn.onclick = () => playAyah(btn, index);
        });

        // Bismillah
        if (bismillahBtn) bismillahBtn.onclick = playBismillah;

        // Bookmark
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
                    id: id,
                    type: 'quran',
                    surah: currentSurah,
                    ayah: row.dataset.ayah,
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

        // Share (Simplified)
        document.querySelectorAll('.share-ayah').forEach(btn => {
            btn.onclick = async () => {
                const row = btn.closest('.ayah-row');
                const ar = row.querySelector('.ayah-text-ar');
                const tr = row.querySelector('.ayah-text-tr');
                const ref = `Surah ${surahHeaderEn.textContent.split('(')[0].trim()} [${row.dataset.ayah}]`;
                const metaText = `${ref} — Noor Al-Huda`;

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
                            const fileName = `NoorAlHuda_Ayah_${currentSurah}_${row.dataset.ayah}.png`;
                            const file = new File([blob], fileName, { type: 'image/png' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({ files: [file], title: metaText });
                            } else {
                                const link = document.createElement('a'); link.download = fileName;
                                link.href = URL.createObjectURL(blob); link.click();
                            }
                            btn.innerHTML = originalContent;
                        }, 'image/png');
                    } catch (err) { 
                        console.error("Share failed:", err);
                        btn.innerHTML = originalContent; 
                    }
                } else {
                    const shareText = `${metaText}\n\n${ar ? ar.textContent : ''}\n\n${tr ? tr.textContent : ''}\n\nShared from Noor Al-Huda`;
                    if (navigator.share) {
                        navigator.share({ title: ref, text: shareText, url: window.location.href });
                    } else {
                        // Fallback: Copy to clipboard
                        navigator.clipboard.writeText(shareText);
                        alert("Link and text copied to clipboard!");
                    }
                    btn.innerHTML = originalContent;
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
            quranAudio.src = `https://everyayah.com/data/${currentReciter}/${surah}${ayah}.mp3`;
            quranAudio.play().catch(console.error);
            btn.querySelector('i').className = 'ph ph-pause';
            if (mainPlayIcon) mainPlayIcon.className = 'ph ph-pause';
            currentAyahBtn = btn;
            isBismillahPlaying = false;
            
            // Auto-Scroll to playing Ayah
            scrollToElement(`ayah-${btn.dataset.ayah}`);
            
            const playerBar = document.getElementById('playerBar');
            if (playerBar) {
                playerBar.classList.remove('hidden');
                document.body.classList.remove('player-hidden');
            }
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

    // --- Scroll & Sync ---
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
        for (let a = 0; a < 60; a++) {
            targetEl = document.getElementById(elementId);
            if (targetEl && targetEl.offsetHeight > 0) break;
            await new Promise(r => setTimeout(r, 100));
        }
        if (!targetEl) { isSystemScrolling = false; return; }

        const container = document.querySelector('.quran-content');
        for (let i = 0; i < 4; i++) {
            const rect = targetEl.getBoundingClientRect();
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: window.pageYOffset + rect.top - (window.innerHeight / 2) + (rect.height / 2), behavior: i === 0 ? 'smooth' : 'auto' });
            } else {
                const cRect = container.getBoundingClientRect();
                container.scrollTo({ top: container.scrollTop + rect.top - cRect.top - (container.offsetHeight / 2) + (rect.height / 2), behavior: i === 0 ? 'smooth' : 'auto' });
            }
            await new Promise(r => setTimeout(r, i === 0 ? 1000 : 300));
        }
        targetEl.classList.add('highlight-pulse');
        setTimeout(() => { isSystemScrolling = false; setTimeout(() => targetEl.classList.remove('highlight-pulse'), 3000); }, 500);
    }

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#ayah-')) scrollToElement(hash.substring(1));
    });

    init();
});