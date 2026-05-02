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
    let itemsPerPage = 50;
    let totalPages = 1;

    // Language
    let currentLang = localStorage.getItem('lang') || 'en';
    let isPlayingSequentially = false;

    // --- Path/URL Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    collectionId = (window.COLLECTION_ID || urlParams.get('id') || 'bukhari').trim();
    const numberParam = urlParams.get('number');
    let specificIdParam = urlParams.get('id');
    if (!specificIdParam && window.location.hash.startsWith('#hadith-')) {
        specificIdParam = window.location.hash.replace('#hadith-', '');
    }

    const getBasePath = () => {
        if (window.location.pathname.includes('/collection/')) return '../../data/';
        return 'data/';
    };

    // --- Initialization ---
    async function init() {
        const basePath = getBasePath();
        try {
            const res = await fetch(`${basePath}${collectionId}_meta.json`);
            if (!res.ok) throw new Error(`Metadata not found`);
            collectionMeta = await res.json();
            
            if (authorSpan) authorSpan.textContent = collectionMeta.author;
            updateDocumentTitle();
            renderSidebar();
            
            if (numberParam || specificIdParam) {
                loadIndexInBackground();
                if (indexPromise) await indexPromise;
                if (globalData && globalData.hadiths) {
                    const target = specificIdParam 
                        ? globalData.hadiths.find(h => h.id == specificIdParam)
                        : globalData.hadiths.find(h => h.number == numberParam);

                    if (target) {
                        await loadBook(target.vol);
                        scrollToElement(`hadith-${target.id}`);
                    } else await loadBook(1);
                } else await loadBook(1);
            } else await loadBook(1);
            if (collectionMeta.indexFile && !indexPromise) loadIndexInBackground();
        } catch (error) {
            console.error("Hadith Init Failed:", error);
            if (headerEn) headerEn.textContent = "Load Error";
        }
    }

    function updateDocumentTitle() {
        if (!collectionMeta) return;
        const title = currentLang === 'bn' ? collectionMeta.titleBn : collectionMeta.titleEn;
        document.title = `${title || collectionMeta.titleEn} — Noor Al-Huda`;
    }

    // --- Data Loading ---
    async function loadBook(bookNumber) {
        if (!collectionMeta) return;
        currentBook = bookNumber;
        const basePath = getBasePath();
        const loadingText = (window.i18n && window.i18n.translations[currentLang].loading) || "Loading Hadiths...";
        hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--gold);"><i class="ph ph-spinner-gap ph-spin" style="font-size: 32px;"></i><p>${loadingText}</p></div>`;
        if (resultsMeta) resultsMeta.style.display = 'none';
        stopSequentialPlay();

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
            applyFilters();
        } catch (error) {
            hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--error);">Error loading data.</div>`;
        }
    }

    function loadIndexInBackground() {
        if (indexPromise || !collectionMeta.indexFile) return;
        const basePath = getBasePath();
        indexPromise = fetch(`${basePath}${collectionId}/${collectionMeta.indexFile}`)
            .then(res => res.json())
            .then(data => {
                globalData = data;
                isIndexLoaded = true;
                populateFilters(globalData.hadiths);
                return data;
            });
    }

    function populateFilters(hadiths) {
        if (!hadiths) return;
        const cats = new Set(), nars = new Set(), tags = new Set();
        hadiths.forEach(h => {
            if (h.category) cats.add(h.category);
            if (h.narrator && h.narrator !== "Narrated by Prophet's Companion") nars.add(h.narrator);
            if (h.tags) h.tags.split(',').forEach(t => tags.add(t.trim()));
        });
        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        const cf = document.getElementById('category-filter'), nf = document.getElementById('narrator-filter'), tf = document.getElementById('tag-filter');
        if (cf) cf.innerHTML = `<option value="all">${t.all_categories || 'All Categories'}</option>` + Array.from(cats).sort().map(c => `<option value="${c}">${c}</option>`).join('');
        if (nf) nf.innerHTML = `<option value="all">${t.all_narrators || 'All Narrators'}</option>` + Array.from(nars).sort().map(n => `<option value="${n}">${n}</option>`).join('');
        if (tf) tf.innerHTML = `<option value="all">${t.all_tags || 'All Tags'}</option>` + Array.from(tags).sort().map(t => `<option value="${t}">${t}</option>`).join('');
    }

    function applyFilters() {
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

        currentPage = 1;
        totalPages = Math.ceil(filteredHadiths.length / itemsPerPage);
        if (resultsMeta) {
            resultsMeta.style.display = 'flex';
            matchCountSpan.textContent = filteredHadiths.length;
        }
        renderPage(1);
    }

    async function renderPage(page) {
        currentPage = page;
        hadithContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const batch = filteredHadiths.slice(start, start + itemsPerPage);

        const missing = batch.filter(h => !h.english);
        if (missing.length > 0) {
            const vols = [...new Set(missing.map(h => h.vol))];
            const basePath = getBasePath();
            await Promise.all(vols.map(async v => {
                if (volumeCache[v]) return;
                const res = await fetch(`${basePath}${collectionId}/${collectionMeta.books.find(b => b.number === v).file}`);
                const data = await res.json();
                volumeCache[v] = data.hadiths;
            }));
            batch.forEach(h => { if (!h.english) Object.assign(h, volumeCache[h.vol]?.find(c => c.id === h.id)); });
        }

        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        batch.forEach((h, idx) => {
            const grade = (h.grade || '').toLowerCase();
            const gradeClass = grade === 'sahih' ? 'badge-sah' : grade === 'hasan' ? 'badge-has' : 'badge-daif';
            hadithContainer.insertAdjacentHTML('beforeend', `
            <section class="hadith-card" id="hadith-${h.id}" data-id="${h.id}" data-idx="${idx}">
                <p class="hadith-ar" dir="rtl">${h.arabic}</p>
                <p class="hadith-en">${currentLang === 'bn' && h.bengali ? h.bengali : h.english}</p>
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
    }

    function attachCardListeners(batch) {
        hadithContainer.querySelectorAll('.hadith-card').forEach(card => {
            const hData = batch[parseInt(card.dataset.idx)];
            if (!hData) return;
            const bookmarkBtn = card.querySelector('.bookmark-btn');
            const listenBtn = card.querySelector('.listen-btn');
            const shareBtn = card.querySelector('.share-btn');
            const t = (window.i18n && window.i18n.translations[currentLang]) || {};

            window.BookmarkDB?.get(bookmarkBtn.dataset.id).then(exists => {
                if (exists) {
                    bookmarkBtn.querySelector('i').className = 'ph ph-bookmark-simple-fill';
                    bookmarkBtn.style.color = 'var(--gold)';
                    bookmarkBtn.classList.add('active');
                }
            });

            bookmarkBtn.onclick = async (e) => {
                e.stopPropagation();
                const item = {
                    id: bookmarkBtn.dataset.id, type: 'hadith', collectionId,
                    number: hData.number, textAr: hData.arabic, textEn: hData.english, textBn: hData.bengali,
                    narrator: hData.narrator, grade: hData.grade,
                    title: (currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn)
                };
                const added = await window.BookmarkDB.toggle(item);
                bookmarkBtn.querySelector('i').className = added ? 'ph ph-bookmark-simple-fill' : 'ph ph-bookmark-simple';
                bookmarkBtn.style.color = added ? 'var(--gold)' : '';
                bookmarkBtn.classList.toggle('active', added);
            };

            listenBtn.onclick = (e) => {
                e.stopPropagation();
                scrollToElement(`hadith-${hData.id}`);
                const content = currentLang === 'bn' && hData.bengali ? hData.bengali : hData.english;
                if (window.toggleSpeech) window.toggleSpeech(content, listenBtn.querySelector('i'), currentLang);
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
        if (window.innerWidth <= 768) window.scrollTo({ top: window.pageYOffset + rect.top - 100, behavior: 'smooth' });
        else if(container) container.scrollTo({ top: container.scrollTop + rect.top - 200, behavior: 'smooth' });
        targetEl.classList.add('highlight-pulse');
        setTimeout(() => { isSystemScrolling = false; targetEl.classList.remove('highlight-pulse'); }, 3000);
    }

    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        updateDocumentTitle();
        renderSidebar();
        loadBook(currentBook);
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
            const firstListenBtn = hadithContainer.querySelector('.listen-btn');
            if (firstListenBtn) firstListenBtn.click();
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
            itemsPerPagePerPage = parseInt(e.target.value);
            itemsPerPage = itemsPerPagePerPage; // local var update
            applyFilters();
        };
    }

    init();
});