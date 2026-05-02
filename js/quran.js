document.addEventListener('DOMContentLoaded', () => {
    // Only run on quran page
    if (!document.querySelector('.quran-layout')) return;

    const surahListContainer = document.getElementById('surah-list-container');
    const quranContainer = document.getElementById('quran-container');
    const surahHeaderAr = document.getElementById('surah-header-ar');
    const surahHeaderEn = document.getElementById('surah-header-en');
    const surahHeaderMeta = document.getElementById('surah-header-meta');
    const translationSelect = document.getElementById('translation-select');
    
    let currentSurah = 1;
    let currentTranslation = 'en.sahih'; // Default Sahih International
    
    // Fetch all 114 Surahs for Sidebar
    async function loadSurahList() {
        try {
            const res = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await res.json();
            surahListContainer.innerHTML = ''; // Clear hardcoded
            
            data.data.forEach(surah => {
                const a = document.createElement('a');
                a.href = '#';
                a.className = `surah-item ${surah.number === currentSurah ? 'active' : ''}`;
                a.dataset.number = surah.number;
                a.innerHTML = `
                    <span class="surah-number">${surah.number}</span>
                    <span class="surah-name">${surah.englishName}</span>
                    <span class="surah-name-ar">${surah.name.replace('سُورَةُ ', '')}</span>
                `;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('active'));
                    a.classList.add('active');
                    currentSurah = surah.number;
                    
                    // Scroll to top of content
                    document.querySelector('.quran-content').scrollTop = 0;
                    
                    loadSurah(currentSurah, currentTranslation);
                    closeSidebar(); // Close sidebar on mobile after selection
                });
                surahListContainer.appendChild(a);
            });
        } catch (error) {
            console.error("Error loading Surah list", error);
            surahListContainer.innerHTML = '<div style="color: var(--error); padding: 20px;">Failed to load Surahs. Please check network connection.</div>';
        }
    }

    async function loadSurah(surahNumber, translationCode) {
        const loadingText = (window.i18n && window.i18n.translations[localStorage.getItem('lang') || 'en'].loading_revelation) || "Loading Revelation...";
        quranContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--gold);"><i class="ph ph-spinner-gap ph-spin" style="font-size: 32px; display: inline-block; animation: spin 1s linear infinite;"></i><p style="margin-top:10px;">${loadingText}</p></div>`;
        
        // Custom spin animation if not exists
        if (!document.getElementById('spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } } .ph-spin { animation: spin 1s linear infinite; }';
            document.head.appendChild(style);
        }

        try {
            // Fetch Arabic and Translation in parallel
            const [arRes, trRes] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationCode}`)
            ]);
            
            const arData = await arRes.json();
            const trData = await trRes.json();
            
            const surahAr = arData.data;
            const surahTr = trData.data;

            // Update Header
            surahHeaderAr.textContent = surahAr.name;
            surahHeaderEn.textContent = `Surah ${surahAr.englishName} (${surahAr.englishNameTranslation})`;
            surahHeaderMeta.textContent = `${surahAr.revelationType} · ${surahAr.numberOfAyahs} Ayahs`;
            
            // Update Player Subtitle
            document.querySelector('.player-title').textContent = `Surah ${surahAr.englishName}`;

            // Render Ayahs
            let html = '';
            
            // Render Bismillah if not Surah 1 or 9
            if (surahNumber !== 1 && surahNumber !== 9) {
                html += `
                <div class="bismillah-container">
                    <button class="ayah-btn play-bismillah"><i class="ph ph-play"></i></button>
                    <div class="bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                </div>`;
            }

            for (let i = 0; i < surahAr.ayahs.length; i++) {
                let ayahArText = surahAr.ayahs[i].text;
                let ayahTrText = surahTr.ayahs[i].text;
                
                // Strip the Bismillah from the first Ayah string if it's included (Al-Quran Cloud quirk)
                if (surahNumber !== 1 && i === 0 && ayahArText.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ")) {
                    ayahArText = ayahArText.replace("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ", "");
                }

                html += `
                <div class="ayah-row" data-ayah="${i+1}">
                    <div class="ayah-header">
                        <div class="ayah-badge">${i+1}</div>
                        <div class="ayah-actions">
                            <button class="ayah-btn play-ayah" data-surah="${surahNumber}" data-ayah="${i+1}"><i class="ph ph-play"></i></button>
                            <button class="ayah-btn share-ayah" data-surah="${surahNumber}" data-ayah="${i+1}"><i class="ph ph-share-network"></i></button>
                            <button class="ayah-btn bookmark-btn" data-id="quran_${surahNumber}_${i+1}" data-type="quran"><i class="ph ph-bookmark-simple"></i></button>
                        </div>
                    </div>
                    <div class="ayah-text-ar">${ayahArText}</div>
                    <div class="ayah-text-tr">${ayahTrText}</div>
                </div>`;
            }
            
            quranContainer.innerHTML = html;
            attachAudioListeners(); // Re-attach audio events to the new buttons
            attachShareListeners(); // Attach share events
            attachBookmarkListeners(); // Attach bookmark events
            
        } catch (error) {
            console.error("Error loading Surah", error);
            quranContainer.innerHTML = '<div style="text-align: center; color: var(--error); padding: 20px;">Failed to load Surah. Please check your network connection.</div>';
        }
    }

    async function attachBookmarkListeners() {
        const btns = document.querySelectorAll('.bookmark-btn');
        for (const btn of btns) {
            const id = btn.dataset.id;
            const isBookmarked = await window.BookmarkDB.get(id);
            if (isBookmarked) {
                btn.querySelector('i').classList.replace('ph-bookmark-simple', 'ph-bookmark-simple-fill');
                btn.style.color = 'var(--gold)';
            }

            btn.addEventListener('click', async () => {
                const row = btn.closest('.ayah-row');
                const item = {
                    id: id,
                    type: 'quran',
                    surah: currentSurah,
                    ayah: btn.parentElement.parentElement.parentElement.dataset.ayah,
                    textAr: row.querySelector('.ayah-text-ar').textContent,
                    textTr: row.querySelector('.ayah-text-tr').textContent,
                    title: surahHeaderEn.textContent.split('(')[0].trim()
                };
                
                const added = await window.BookmarkDB.toggle(item);
                const icon = btn.querySelector('i');
                if (added) {
                    icon.classList.replace('ph-bookmark-simple', 'ph-bookmark-simple-fill');
                    btn.style.color = 'var(--gold)';
                } else {
                    icon.classList.replace('ph-bookmark-simple-fill', 'ph-bookmark-simple');
                    btn.style.color = '';
                }
            });
        }
    }


    function attachShareListeners() {
        const shareBtns = document.querySelectorAll('.share-ayah');
        shareBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const surahNum = btn.dataset.surah;
                const ayahNum = btn.dataset.ayah;
                const row = btn.closest('.ayah-row');
                const arText = row.querySelector('.ayah-text-ar').textContent;
                const trText = row.querySelector('.ayah-text-tr').textContent;
                const surahName = surahHeaderEn.textContent.split('(')[0].trim();
                const metaText = `${surahName} (${surahNum}:${ayahNum})`;
                
                const originalContent = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i>';

                const template = document.getElementById('share-card-template');
                if (template) {
                    document.getElementById('sc-arabic').textContent = arText;
                    document.getElementById('sc-translation').textContent = trText;
                    document.getElementById('sc-meta').textContent = metaText;
                    document.getElementById('sc-url').textContent = window.location.origin + window.location.pathname;

                    try {
                        const canvas = await html2canvas(template, { scale: 2, useCORS: true });
                        canvas.toBlob(async (blob) => {
                            const fileName = `Quran_${surahNum}_${ayahNum}.png`;
                            const file = new File([blob], fileName, { type: 'image/png' });
                            
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    files: [file],
                                    title: metaText,
                                    text: `Shared from Noor Al-Huda`
                                });
                            } else {
                                const link = document.createElement('a');
                                link.download = fileName;
                                link.href = URL.createObjectURL(blob);
                                link.click();
                            }
                            btn.innerHTML = originalContent;
                        }, 'image/png');
                    } catch (err) {
                        console.error("Quran share failed", err);
                        btn.innerHTML = '<i class="ph ph-warning"></i>';
                        setTimeout(() => btn.innerHTML = originalContent, 2000);
                    }
                }
            });
        });
    }


    // Handle translation change
    if (translationSelect) {
        translationSelect.addEventListener('change', (e) => {
            currentTranslation = e.target.value;
            loadSurah(currentSurah, currentTranslation);
        });

        // Auto-switch to Bengali translation if site language is BN
        if (localStorage.getItem('lang') === 'bn') {
            currentTranslation = 'bn.bengali';
            translationSelect.value = 'bn.bengali';
        }
    }

    // Listen for global language changes
    document.addEventListener('languageChanged', (e) => {
        const lang = e.detail.lang;
        if (lang === 'bn' && translationSelect) {
            currentTranslation = 'bn.bengali';
            translationSelect.value = 'bn.bengali';
            loadSurah(currentSurah, currentTranslation);
        } else if (lang === 'en' && translationSelect) {
            currentTranslation = 'en.sahih';
            translationSelect.value = 'en.sahih';
            loadSurah(currentSurah, currentTranslation);
        }
    });

    // Handle reciter change
    const reciterSelect = document.getElementById('reciter-select');
    let currentReciter = 'Abdurrahmaan_As-Sudais_192kbps';
    if (reciterSelect) {
        reciterSelect.addEventListener('change', (e) => {
            currentReciter = e.target.value;
            const reciterName = e.target.options[e.target.selectedIndex].text;
            document.querySelector('.player-sub').textContent = reciterName;
            
            // Stop current audio if playing to prevent playing old reciter
            if (currentAyahBtn && !quranAudio.paused) {
                quranAudio.pause();
                currentAyahBtn.querySelector('i').classList.replace('ph-pause', 'ph-play');
                document.querySelector('.play-main i').classList.replace('ph-pause', 'ph-play');
            }
        });
    }

    // Handle font size change
    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            const size = e.target.value;
            quranContainer.className = ''; // Remove all classes
            quranContainer.classList.add(`font-${size}`);
        });
        // Init font
        quranContainer.classList.add(`font-${fontSizeSelect.value}`);
    }

    // --- Mobile Sidebar Logic ---
    const sidebar = document.querySelector('.quran-sidebar');
    const overlay = document.getElementById('quran-sidebar-overlay');
    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');

    function toggleSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
        }
    }

    function closeSidebar() {
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }

    if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Initialize Page
    loadSurahList();
    loadSurah(currentSurah, currentTranslation);
    
    // --- Audio Playback Engine (High Quality MP3s via EveryAyah) ---
    const quranAudio = new Audio();
    window.quranAudio = quranAudio;
    let currentAyahBtn = null;
    let currentAyahIndex = -1;
    let allAyahButtons = [];

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

    function attachAudioListeners() {
        allAyahButtons = document.querySelectorAll('.play-ayah');
        const mainPlayBtn = document.querySelector('.play-main');
        const mainPlayIcon = mainPlayBtn.querySelector('i');
        const bismillahBtn = document.querySelector('.play-bismillah');
        let isBismillahPlaying = false;
        
        // --- Sync with global settings ---
        const speedSelect = document.getElementById('speed-select');
        const volSlider = document.getElementById('volume-slider');
        
        if (speedSelect) {
            quranAudio.playbackRate = parseFloat(speedSelect.value);
            speedSelect.addEventListener('change', (e) => {
                quranAudio.playbackRate = parseFloat(e.target.value);
            });
        }
        if (volSlider) {
            quranAudio.volume = parseFloat(volSlider.value);
            volSlider.addEventListener('input', (e) => {
                quranAudio.volume = parseFloat(e.target.value);
            });
        }
        
        // Formatter for EveryAyah CDN URLs (e.g. 002255.mp3)
        function formatSurahAyah(surah, ayah) {
            return String(surah).padStart(3, '0') + String(ayah).padStart(3, '0');
        }

        // Update Progress Bar
        const playerProgress = document.querySelector('.player-progress');
        const timeDisplays = playerProgress.querySelectorAll('.time');
        const fillBar = playerProgress.querySelector('.fill');
        const dot = playerProgress.querySelector('.dot');

        quranAudio.addEventListener('timeupdate', () => {
            const percent = (quranAudio.currentTime / quranAudio.duration) * 100 || 0;
            fillBar.style.width = `${percent}%`;
            dot.style.left = `${percent}%`;
            timeDisplays[0].textContent = formatTime(quranAudio.currentTime);
            timeDisplays[1].textContent = formatTime(quranAudio.duration);
        });

        // The core playback function
        function playAyah(btn, index) {
            const playerBar = document.getElementById('playerBar');
            const body = document.body;
            isBismillahPlaying = false;
            currentAyahIndex = index;
            const surah = btn.dataset.surah;
            const ayah = btn.dataset.ayah;
            const icon = btn.querySelector('i');
            
            // Reset all icons
            document.querySelectorAll('.play-ayah i').forEach(i => i.classList.replace('ph-pause', 'ph-play'));
            if (bismillahBtn) bismillahBtn.querySelector('i').classList.replace('ph-pause', 'ph-play');
            
            if (currentAyahBtn === btn && !quranAudio.paused) {
                // Pause
                quranAudio.pause();
                icon.classList.replace('ph-pause', 'ph-play');
                mainPlayIcon.classList.replace('ph-pause', 'ph-play');
            } else {
                // Play
                if (currentAyahBtn !== btn) {
                    quranAudio.src = `https://everyayah.com/data/${currentReciter}/${formatSurahAyah(surah, ayah)}.mp3`;
                }
                
                quranAudio.play().catch(e => {
                    console.error("Audio play failed:", e);
                    alert("Audio playback blocked by browser. Please interact with the page first.");
                });
                
                icon.classList.replace('ph-play', 'ph-pause');
                mainPlayIcon.classList.replace('ph-play', 'ph-pause');
                currentAyahBtn = btn;

                // Ensure player is shown
                if (playerBar) {
                    playerBar.classList.remove('hidden');
                    body.classList.remove('player-hidden');
                    const spb = document.getElementById('show-player-btn');
                    if (spb) spb.classList.add('hidden');
                }
                
                // Highlight active row visually
                document.querySelectorAll('.ayah-row').forEach(r => r.style.backgroundColor = 'transparent');
                const activeRow = btn.closest('.ayah-row');
                activeRow.style.backgroundColor = 'rgba(232, 184, 75, 0.05)';
                activeRow.style.borderRadius = '12px';
                
                // Auto-scroll to active Ayah
                activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Bismillah play logic
        function playBismillah() {
            if (!bismillahBtn) return;
            const playerBar = document.getElementById('playerBar');
            const body = document.body;
            const icon = bismillahBtn.querySelector('i');
            
            // Reset Ayah icons
            document.querySelectorAll('.play-ayah i').forEach(i => i.classList.replace('ph-pause', 'ph-play'));
            document.querySelectorAll('.ayah-row').forEach(r => r.style.backgroundColor = 'transparent');
            
            if (isBismillahPlaying && !quranAudio.paused) {
                quranAudio.pause();
                icon.classList.replace('ph-pause', 'ph-play');
                mainPlayIcon.classList.replace('ph-pause', 'ph-play');
            } else {
                if (!isBismillahPlaying) {
                    quranAudio.src = `https://everyayah.com/data/${currentReciter}/001001.mp3`;
                }
                
                quranAudio.play().catch(e => console.error("Audio play failed:", e));
                icon.classList.replace('ph-play', 'ph-pause');
                mainPlayIcon.classList.replace('ph-play', 'ph-pause');
                isBismillahPlaying = true;
                currentAyahBtn = null; // No ayah is playing
                currentAyahIndex = -1;

                // Ensure player is shown
                if (playerBar) {
                    playerBar.classList.remove('hidden');
                    body.classList.remove('player-hidden');
                    const spb = document.getElementById('show-player-btn');
                    if (spb) spb.classList.add('hidden');
                }
            }
        }

        if (bismillahBtn) {
            bismillahBtn.addEventListener('click', playBismillah);
        }

        // Attach click to each new Ayah button
        allAyahButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => playAyah(btn, index));
        });

        // Handle auto-advance
        quranAudio.onended = () => {
            const playerBar = document.getElementById('playerBar');
            const body = document.body;
            if (isBismillahPlaying) {
                if (bismillahBtn) bismillahBtn.querySelector('i').classList.replace('ph-pause', 'ph-play');
                isBismillahPlaying = false;
                if (allAyahButtons.length > 0) {
                    playAyah(allAyahButtons[0], 0);
                }
            } else {
                if (currentAyahBtn) {
                    currentAyahBtn.querySelector('i').classList.replace('ph-pause', 'ph-play');
                }
                
                currentAyahIndex++;
                if (currentAyahIndex < allAyahButtons.length) {
                    playAyah(allAyahButtons[currentAyahIndex], currentAyahIndex);
                } else {
                    mainPlayIcon.classList.replace('ph-pause', 'ph-play');
                    currentAyahBtn = null;
                    currentAyahIndex = -1;
                    // Global player stays visible
                }
            }
        };

        // Replace main play button to remove old listeners securely
        const newMainPlayBtn = mainPlayBtn.cloneNode(true);
        mainPlayBtn.parentNode.replaceChild(newMainPlayBtn, mainPlayBtn);
        const newMainIcon = newMainPlayBtn.querySelector('i');

        newMainPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid conflicts
            const playerBar = document.getElementById('playerBar');
            const body = document.body;
            if (quranAudio.src && !quranAudio.paused) {
                quranAudio.pause();
                newMainIcon.classList.replace('ph-pause', 'ph-play');
                if (currentAyahBtn) currentAyahBtn.querySelector('i').classList.replace('ph-pause', 'ph-play');
                if (isBismillahPlaying && bismillahBtn) bismillahBtn.querySelector('i').classList.replace('ph-pause', 'ph-play');
            } else if (quranAudio.src && quranAudio.paused) {
                quranAudio.play().catch(e => console.error("Playback failed:", e));
                newMainIcon.classList.replace('ph-play', 'ph-pause');
                if (currentAyahBtn) currentAyahBtn.querySelector('i').classList.replace('ph-play', 'ph-pause');
                if (isBismillahPlaying && bismillahBtn) bismillahBtn.querySelector('i').classList.replace('ph-play', 'ph-pause');
                if (playerBar) {
                    playerBar.classList.remove('hidden');
                    body.classList.remove('player-hidden');
                }
            } else {
                // If nothing loaded yet, play Bismillah if it exists, else play first Ayah
                if (bismillahBtn) {
                    playBismillah();
                } else if (allAyahButtons.length > 0) {
                    playAyah(allAyahButtons[0], 0);
                }
            }
        });
    }
});