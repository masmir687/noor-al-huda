/**
 * Noor Al-Huda — Dynamic Hadith Reader
 * Optimized for Instant Interactivity & Background Indexing
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const hadithContainer = document.getElementById('hadith-container');
    const bookListContainer = document.getElementById('book-list-container');
    const headerAr = document.getElementById('book-header-ar');
    const headerEn = document.getElementById('book-header-en');
    const headerMeta = document.getElementById('book-header-meta');
    const authorSpan = document.getElementById('collection-author');
    const resultsMeta = document.getElementById('results-meta');
    const matchCountSpan = document.getElementById('match-count');
    const mainPlayBtn = document.querySelector('.play-main');
    
    if (!bookListContainer) return;

    // --- State ---
    let collectionId = 'bukhari';
    let currentBook = 1; 
    let allHadiths = []; 
    let filteredHadiths = []; 
    let globalData = null; 
    let collectionMeta = null;
    let isIndexLoaded = false;
    let indexPromise = null;
    let volumeCache = {}; 
    let isSystemScrolling = false;

    // Pagination
    let currentPage = 1;
    let totalPages = 1;
    let itemsPerPage = 50;
    // Language
    let currentLang = localStorage.getItem('lang') || 'en';

    // sequential Playback State
    let currentBatch = [];
    let currentPlayingIndex = -1;
    let isSequentialActive = false;

    // --- Path/URL Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    collectionId = (window.COLLECTION_ID || urlParams.get('id') || 'bukhari').trim();
    const numberParam = urlParams.get('number');
    let specificIdParam = urlParams.get('id');

    // --- Persistence ---
    function savePlaybackState() {
        const state = {
            collectionId,
            currentBook,
            currentPage,
            index: currentPlayingIndex,
            active: isSequentialActive
        };
        localStorage.setItem(`hadith_playback_state_${collectionId}`, JSON.stringify(state));
    }

    function resumePlaybackState() {
        const saved = localStorage.getItem(`hadith_playback_state_${collectionId}`);
        if (!saved) return;
        const state = JSON.parse(saved);
        if (state.collectionId === collectionId && state.currentBook === currentBook && state.currentPage === currentPage) {
            if (state.active && state.index >= 0) {
                currentPlayingIndex = state.index;
                updateSequentialUI();
            }
        }
    }

    // --- sequential Playback Core ---
    function updateSequentialUI() {
        if (currentPlayingIndex < 0 || !currentBatch[currentPlayingIndex]) return;

        window.hadithPlaybackActive = true;
        const total = currentBatch.length;
        const current = currentPlayingIndex + 1;
        const percent = (current / total) * 100;

        if (window.updateProgressBar) window.updateProgressBar(percent);
        if (window.updateProgressTime) window.updateProgressTime(`${current}`, `${total}`);

        // Update Skip Buttons
        if (window.updateSkipButtons) {
            const canBack = currentPage > 1 || currentPlayingIndex > 0;
            const canForward = currentPage < totalPages || currentPlayingIndex < currentBatch.length - 1;
            window.updateSkipButtons(canBack, canForward);
        }

        // Highlight active card
        hadithContainer.querySelectorAll('.hadith-card').forEach(c => c.classList.remove('active-playing'));
        const activeCard = document.getElementById(`hadith-${currentBatch[currentPlayingIndex].id}`);
        if (activeCard) {
            activeCard.classList.add('active-playing');
            scrollToElement(`hadith-${currentBatch[currentPlayingIndex].id}`);
        }

        const title = document.querySelector('.player-title');
        const sub = document.querySelector('.player-sub');
        if (title) title.textContent = `${currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn} · ${current}`;
        if (sub) sub.textContent = `Hadith ${currentBatch[currentPlayingIndex].number}`;
    }

    window.playNextHadith = function() {
        if (isSequentialActive && currentPlayingIndex < currentBatch.length - 1) {
            window.playHadith(currentPlayingIndex + 1);
        } else if (isSequentialActive && currentPage < totalPages) {
            // Next Page
            renderPage(currentPage + 1).then(() => {
                window.playHadith(0);
            });
        } else {
            stopSequentialPlay();
        }
    };

    window.playHadith = async function(index, sequential = true) {
        if (index < 0 || index >= currentBatch.length) {
            if (sequential && currentPage < totalPages) {
                renderPage(currentPage + 1).then(() => window.playHadith(0, true));
                return;
            }
            stopSequentialPlay();
            return;
        }
        currentPlayingIndex = index;
        isSequentialActive = sequential;

        const h = currentBatch[index];
        localStorage.setItem('active_media_type', 'hadith');

        // If still patching, wait briefly
        if (!h.english || h.english.includes("No text available") || h.english.includes("Loading from mirror")) {
            const card = document.getElementById(`hadith-${h.id}`);
            if (card) card.querySelector('.hadith-en').innerHTML = `<i class="ph ph-spinner-gap ph-spin"></i> Preparing audio...`;

            // Wait up to 5 seconds for background patch
            for (let i = 0; i < 50; i++) {
                if (h.english && !h.english.includes("No text available") && !h.english.includes("Loading from mirror")) break;
                await new Promise(r => setTimeout(r, 100));
            }
        }

        const content = currentLang === 'bn' && h.bengali ? h.bengali : h.english;
        const card = document.getElementById(`hadith-${h.id}`);
        const icon = card?.querySelector('.listen-btn i');
        const textEl = card?.querySelector('.hadith-en');

        if (window.toggleSpeech) {
            window.toggleSpeech(content, icon || null, currentLang, () => {
                if (isSequentialActive) window.playNextHadith();
            }, textEl);
            updateSequentialUI();
            savePlaybackState();
        }
    };

    function loadBook(bookNumber) {
        if (!collectionMeta) return;
        currentBook = bookNumber;
        updateSidebarSelection();
        const basePath = getBasePath();
        const loadingText = (window.i18n && window.i18n.translations[currentLang].loading) || "Loading Hadiths...";
        hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--gold);"><i class="ph ph-spinner-gap ph-spin" style="font-size: 32px;"></i><p>${loadingText}</p></div>`;
        if (resultsMeta) resultsMeta.style.display = 'none';
        
        // Only stop if we aren't resuming a global hadith session
        const state = JSON.parse(localStorage.getItem('persistent_audio_state') || "{}");
        if (state.type !== 'hadith') {
            stopSequentialPlay();
        }

        if (bookNumber === 0) {
            if (headerAr) headerAr.textContent = "البحث العام";
            if (headerEn) headerEn.textContent = (window.i18n && window.i18n.translations[currentLang].global_search) || "Global Search";
        } else {
            const bMeta = collectionMeta.books.find(b => b.number === bookNumber);
            if (bMeta) {
                if (headerAr) headerAr.textContent = bMeta.nameAr;
                if (headerEn) headerEn.textContent = currentLang === 'bn' ? bMeta.nameBn : bMeta.nameEn;
            }
        }
        if (headerMeta) headerMeta.textContent = currentLang === 'bn' ? collectionMeta.titleBn : collectionMeta.titleEn;

        // Update Player Content for the current Book
        const pTitle = document.querySelector('.player-title');
        const pSub = document.querySelector('.player-sub');
        if (pTitle) pTitle.textContent = currentLang === 'bn' ? collectionMeta.titleBn : collectionMeta.titleEn;
        if (pSub) {
            if (bookNumber === 0) pSub.textContent = (window.i18n && window.i18n.translations[currentLang].global_search) || "Global Search";
            else {
                const b = collectionMeta.books.find(b => b.number === bookNumber);
                pSub.textContent = currentLang === 'bn' ? b.nameBn : b.nameEn;
            }
        }

        try {
            if (bookNumber === 0) {
                if (!indexPromise) loadIndexInBackground();
                if (indexPromise) await indexPromise;
                allHadiths = globalData ? globalData.hadiths : [];
            } else {
                const bMeta = collectionMeta.books.find(b => b.number === bookNumber);
                const path = `${basePath}${collectionId}/${bMeta.file}`;
                if (!indexPromise) loadIndexInBackground();
                const [res, _] = await Promise.all([fetch(path), indexPromise || Promise.resolve()]);
                const contentData = await res.json();
                allHadiths = contentData.hadiths.map(h => {
                    const meta = (globalData && globalData.hadiths) ? globalData.hadiths.find(m => m.id === h.id) : {};
                    return { ...meta, ...h };
                });
            }
            await applyFilters();
        } catch (error) {
            hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--error);">Error loading data.</div>`;
        }
    }

    function loadIndexInBackground() {
        if (indexPromise || !collectionMeta.indexFile) return;
        const basePath = getBasePath();
        // Add cache buster to ensure metadata updates are reflected immediately
        indexPromise = fetch(`${basePath}${collectionId}/${collectionMeta.indexFile}?v=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                globalData = data;
                isIndexLoaded = true;
                populateFilters(globalData.hadiths);
                return data;
            })
            .catch(e => {
                console.error("Index Load Failed:", e);
                isIndexLoaded = false;
                throw e;
            });
    }

    function populateFilters(hadiths) {
        if (!hadiths || !Array.isArray(hadiths)) return;
        const cats = new Set(), nars = new Set(), tags = new Set();
        const placeholders = ["Narrated by Prophet's Companion", "Prophet's Companion", "Unknown", "his father", "the same chain of transmitters", "this hadith"];
        
        hadiths.forEach(h => {
            if (h.category) cats.add(h.category.trim());
            if (h.narrator && !placeholders.some(p => h.narrator.includes(p))) {
                nars.add(h.narrator.trim());
            }
            if (h.tags) h.tags.split(',').forEach(t => {
                const trimmed = t.trim();
                if (trimmed) tags.add(trimmed);
            });
        });
        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        const cf = document.getElementById('category-filter'), nf = document.getElementById('narrator-filter'), tf = document.getElementById('tag-filter');
        
        if (cf) cf.innerHTML = `<option value="all">${t.all_categories || 'All Categories'}</option>` + Array.from(cats).sort().map(c => `<option value="${c}">${c}</option>`).join('');
        if (nf) nf.innerHTML = `<option value="all">${t.all_narrators || 'All Narrators'}</option>` + Array.from(nars).sort().map(n => `<option value="${n}">${n}</option>`).join('');
        if (tf) tf.innerHTML = `<option value="all">${t.all_tags || 'All Tags'}</option>` + Array.from(tags).sort().map(t => `<option value="${t}">${t}</option>`).join('');
    }

    async function applyFilters() {
        const query = document.getElementById('global-search')?.value.toLowerCase() || '';
        const cat = document.getElementById('category-filter')?.value || 'all';
        const nar = document.getElementById('narrator-filter')?.value || 'all';
        const tag = document.getElementById('tag-filter')?.value || 'all';
        
        filteredHadiths = allHadiths.filter(h => {
            const mCat = cat === 'all' || h.category === cat;
            const mNar = nar === 'all' || h.narrator === nar;
            const mTag = tag === 'all' || (h.tags && h.tags.split(',').map(t => t.trim()).includes(tag));
            const text = (h.english || '') + (h.arabic || '') + (h.narrator || '') + (h.bengali || '');
            const mQuery = !query || text.toLowerCase().includes(query);
            return mCat && mNar && mTag && mQuery;
        });

        totalPages = Math.ceil(filteredHadiths.length / itemsPerPage);
        
        // Jump to correct page if specific ID is present
        let targetPage = 1;
        if (specificIdParam) {
            const idx = filteredHadiths.findIndex(h => h.id == specificIdParam);
            if (idx >= 0) {
                targetPage = Math.floor(idx / itemsPerPage) + 1;
            }
        }

        currentPage = targetPage;
        if (resultsMeta) {
            resultsMeta.style.display = 'flex';
            matchCountSpan.textContent = filteredHadiths.length;
        }
        await renderPage(targetPage);
    }

    async function renderPage(page) {
        currentPage = page;
        hadithContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const batch = filteredHadiths.slice(start, start + itemsPerPage);
        currentBatch = batch; 

        // 1. Fetch missing from local volumes
        const missing = batch.filter(h => !h.english || h.english.includes("No text available") || h.english.includes("Loading from mirror"));
        if (missing.length > 0) {
            const vols = [...new Set(missing.map(h => h.vol))];
            const basePath = getBasePath();
            await Promise.all(vols.map(async v => {
                if (volumeCache[v] || !v) return;
                try {
                    const b = collectionMeta.books.find(b => b.number === v);
                    if (!b) return;
                    const res = await fetch(`${basePath}${collectionId}/${b.file}`);
                    const data = await res.json();
                    volumeCache[v] = data.hadiths;
                } catch(e) {}
            }));
            batch.forEach(h => { 
                if (h.vol && volumeCache[h.vol]) {
                    const full = volumeCache[h.vol].find(c => c.id === h.id);
                    if (full && (!h.english || h.english.includes("No text available") || h.english.includes("Loading from mirror"))) Object.assign(h, full);
                }
            });
        }

        // 2. Render Cards
        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        batch.forEach((h, idx) => {
            const grade = (h.grade || '').toLowerCase();
            const gradeClass = grade === 'sahih' ? 'badge-sah' : grade === 'hasan' ? 'badge-has' : 'badge-daif';
            
            const isMissing = !h.english || h.english.includes("No text available") || h.english.includes("Loading from mirror");
            const displayEn = isMissing ? `<span class="missing-text" data-idx="${idx}"><i class="ph ph-spinner-gap ph-spin"></i> Loading from mirror...</span>` : h.english;
            const displayBn = isMissing ? displayEn : (h.bengali || h.english);

            hadithContainer.insertAdjacentHTML('beforeend', `
            <section class="hadith-card" id="hadith-${h.id}" data-id="${h.id}" data-idx="${idx}">
                <p class="hadith-ar" dir="rtl">${h.arabic}</p>
                <p class="hadith-en">${currentLang === 'bn' ? displayBn : displayEn}</p>
                <div class="hadith-meta">
                    <div>
                        <span class="narrator">${t.narrated_by || 'Narrated by'} ${h.narrator}</span>
                        <span class="ref">${(currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn)} · ${t.hadith_single || 'Hadith'} ${h.number}</span>
                    </div>
                    <span class="grade-badge ${gradeClass}">${t[grade] || h.grade}</span>
                </div>
                <div class="hadith-btns" style="margin-top: 15px;">
                    <button class="btn-sm listen-btn"><i class="ph ph-play-circle"></i> <span>${t.listen || 'Listen'}</span></button>
                    <button class="btn-sm share-btn outline"><i class="ph ph-share-network"></i> <span>${t.share || 'Share'}</span></button>
                    <button class="btn-sm bookmark-btn outline" data-id="${collectionId}_${h.id}"><i class="ph ph-bookmark-simple"></i></button>
                </div>
            </section>`);
        });

        attachCardListeners(batch);
        renderPagination();
        resumePlaybackState();
        initScrollObserver();

        // 3. Patch missing from Mirror (Background)
        patchFromMirror(batch);
    }

    function initScrollObserver() {
        const options = {
            root: window.innerWidth > 769 ? document.querySelector('.quran-content') : null,
            rootMargin: '-45% 0px -45% 0px',
            threshold: 0
        };
        const observer = new IntersectionObserver((entries) => {
            if (isSystemScrolling) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.dataset.id;
                    const hash = `#hadith-${id}`;
                    if (window.location.hash !== hash) {
                        const newUrl = window.location.pathname + window.location.search + hash;
                        history.replaceState(null, null, newUrl);
                    }
                }
            });
        }, options);
        document.querySelectorAll('.hadith-card').forEach(card => observer.observe(card));
    }

    async function patchFromMirror(batch) {
        const toPatch = batch.filter(h => !h.english || h.english.includes("No text available") || h.english.includes("Loading from mirror"));
        if (toPatch.length === 0) return;

        for (const h of toPatch) {
            try {
                // Fawaz Ahmed API uses different collection keys
                const apiMap = { 'bukhari': 'eng-bukhari', 'muslim': 'eng-muslim', 'tirmidhi': 'eng-tirmidhi', 'abudawud': 'eng-abudawud', 'nasai': 'eng-nasai', 'ibnmajah': 'eng-ibnmajah' };
                const araMap = { 'bukhari': 'ara-bukhari', 'muslim': 'ara-muslim', 'tirmidhi': 'ara-tirmidhi', 'abudawud': 'ara-abudawud', 'nasai': 'ara-nasai', 'ibnmajah': 'ara-ibnmajah' };
                
                const colKey = apiMap[collectionId];
                const araKey = araMap[collectionId];
                if (!colKey) continue;

                // Fetch English & Arabic in parallel
                const [enRes, arRes] = await Promise.all([
                    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${colKey}/${h.number}.json`),
                    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${araKey}/${h.number}.json`)
                ]);

                const enData = await enRes.json();
                const arData = await arRes.json();

                if (enData.hadiths && enData.hadiths[0]) {
                    h.english = enData.hadiths[0].text || "(Content not available in mirror)";
                    h.arabic = arData.hadiths?.[0]?.text || h.arabic;
                    
                    // Update UI
                    const card = document.getElementById(`hadith-${h.id}`);
                    if (card) {
                        card.querySelector('.hadith-ar').textContent = h.arabic;
                        card.querySelector('.hadith-en').textContent = (currentLang === 'bn' && h.bengali) ? h.bengali : h.english;
                    }
                }
            } catch(e) {
                h.english = "(Content not available in mirror)";
                const card = document.getElementById(`hadith-${h.id}`);
                if (card) card.querySelector('.hadith-en').textContent = h.english;
            }
        }
    }

    function attachCardListeners(batch) {
        hadithContainer.querySelectorAll('.hadith-card').forEach(card => {
            const index = parseInt(card.dataset.idx);
            const hData = batch[index];
            if (!hData) return;
            const bookmarkBtn = card.querySelector('.bookmark-btn');
            const listenBtn = card.querySelector('.listen-btn');
            const shareBtn = card.querySelector('.share-btn');
            const t = (window.i18n && window.i18n.translations[currentLang]) || {};

            window.BookmarkDB?.get(bookmarkBtn.dataset.id).then(exists => {
                if (exists) {
                    btn.classList.add('active');
                }
            });

            bookmarkBtn.onclick = async (e) => {
                e.stopPropagation();
                const item = {
                    id: bookmarkBtn.dataset.id, 
                    type: 'hadith', 
                    collectionId,
                    number: hData.number, 
                    vol: hData.vol
                };
                const added = await window.BookmarkDB.toggle(item);
                bookmarkBtn.classList.toggle('active', added);
            };

            listenBtn.onclick = (e) => {
                e.stopPropagation();
                scrollToElement(`hadith-${hData.id}`);
                window.playHadith(index, false); // Single play
            };

            // Share (Robust Implementation)
            shareBtn.onclick = async (e) => {
                const ar = card.querySelector('.hadith-ar')?.textContent || "";
                const tr = card.querySelector('.hadith-en')?.textContent || "";
                const title = currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn;
                const ref = `${title} · Hadith ${hData.number}`;
                
                if (window.performShare) {
                    window.performShare(shareBtn, { ar, tr, ref, collection: collectionId, number: hData.number }, currentLang, e);
                } else {
                    console.error("Share engine not loaded");
                }
            };
        });
    }

    

    function renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }
        let html = '';
        for (let i = 1; i <= Math.min(totalPages, 10); i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        container.innerHTML = html;
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.onclick = () => renderPage(parseInt(btn.dataset.page));
        });
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
        
        if (window.innerWidth <= 768) {
            window.scrollTo({ top: window.pageYOffset + rect.top - 100, behavior: 'smooth' });
        } else if (container) {
            const containerRect = container.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top;
            container.scrollTo({ top: container.scrollTop + relativeTop - 150, behavior: 'smooth' });
        }

        // Update URL hash directly since observer is paused
        if (elementId.startsWith('hadith-')) {
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
        currentLang = e.detail.lang;
        updateDocumentTitle();
        renderSidebar();
        loadBook(currentBook);
        if (globalData) populateFilters(globalData.hadiths);
    });

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
        if (toggleBtn) { e.preventDefault(); openSidebar(); }
        else if (e.target.id === 'quran-sidebar-overlay') closeSidebar();
    });

    function getBasePath() {
        return window.location.pathname.includes('/collection/') ? '../../data/' : 'data/';
    }

    function updateSidebarSelection() {
        document.querySelectorAll('.surah-item').forEach(el => {
            el.classList.toggle('active', parseInt(el.dataset.number) === currentBook);
        });
    }

    function updateDocumentTitle() {
        if (collectionMeta) {
            const title = currentLang === 'bn' ? collectionMeta.titleBn : collectionMeta.titleEn;
            document.title = `${title} — Noor Al-Huda`;
        }
    }

    async function init() {
        const basePath = getBasePath();
        try {
            // Fetch collection metadata
            const res = await fetch(`${basePath}${collectionId}_meta.json`);
            collectionMeta = await res.json();
            
            if (authorSpan) authorSpan.textContent = collectionMeta.author;
            
            updateDocumentTitle();
            renderSidebar();
            
            // Handle initial load from URL
            const bookToLoad = parseInt(numberParam) || 1;
            loadBook(bookToLoad);
        } catch (error) {
            console.error("Initialization failed:", error);
            hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--error);">Error initializing collection data.</div>`;
        }
    }

    function renderSidebar() {
        if (!bookListContainer || !collectionMeta) return;
        bookListContainer.innerHTML = '';
        
        const t = (window.i18n && window.i18n.translations[currentLang]) || {};

        // Add "All Hadiths" (Global) option
        const globalA = document.createElement('a');
        globalA.href = '#';
        globalA.className = `surah-item ${currentBook === 0 ? 'active' : ''}`;
        globalA.innerHTML = `
            <span class="surah-number"><i class="ph ph-infinity"></i></span>
            <span class="surah-name">${t.all_hadiths || "All Hadiths (Full)"}</span>
        `;
        globalA.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('active'));
            globalA.classList.add('active');
            loadBook(0);
            if (window.innerWidth <= 768) closeSidebar();
        };
        bookListContainer.appendChild(globalA);

        collectionMeta.books.forEach(book => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = `surah-item ${book.number === currentBook ? 'active' : ''}`;
            a.dataset.number = book.number;
            a.innerHTML = `<span class="surah-number">${book.number}</span><span class="surah-name">${currentLang === 'bn' ? (book.nameBn || book.nameEn) : book.nameEn}</span>`;
            a.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
                loadBook(book.number);
                if (window.innerWidth <= 768) closeSidebar();
            };
            bookListContainer.appendChild(a);
        });
    }

    function stopSequentialPlay() {
        window.toggleSpeech("", null);
    }

    if (mainPlayBtn) {
        mainPlayBtn.onclick = () => {
            const startIndex = currentPlayingIndex >= 0 ? currentPlayingIndex : 0;
            window.playHadith(startIndex, true); // Sequential mode
        };
    }

    
    // --- Filter Listeners ---
    ['global-search', 'category-filter', 'narrator-filter', 'tag-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onchange = el.oninput = applyFilters;
    });

    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.onchange = (e) => {
            itemsPerPage = parseInt(e.target.value);
            applyFilters();
        };
    }

    init();
});