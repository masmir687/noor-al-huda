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
    const sidebar = document.querySelector('.quran-sidebar');
    const overlay = document.getElementById('quran-sidebar-overlay');
    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
    
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
    let currentPlayIndex = -1;

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
            if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

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
                    } else {
                        await loadBook(1);
                    }
                } else {
                    await loadBook(1);
                }
            } else {
                await loadBook(1);
            }
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

    // --- Filters ---
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
        const cat = document.getElementById('category-filter')?.value || 'all';
        const nar = document.getElementById('narrator-filter')?.value || 'all';
        const tag = document.getElementById('tag-filter')?.value || 'all';
        const query = document.getElementById('global-search')?.value.toLowerCase() || '';
        
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
        if (filteredHadiths.length === 0) {
            const noResultsText = (window.i18n && window.i18n.translations[currentLang].no_results) || "No results found.";
            hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--stone);">${noResultsText}</div>`;
            return;
        }
        renderPage(1);
    }

    // --- Rendering ---
    async function renderPage(page) {
        currentPage = page;
        hadithContainer.innerHTML = '';
        stopSequentialPlay();
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredHadiths.length);
        const batch = filteredHadiths.slice(start, end);

        // Lazy load content if missing
        const missing = batch.filter(h => !h.english);
        if (missing.length > 0) {
            const vols = [...new Set(missing.map(h => h.vol))];
            const basePath = getBasePath();
            await Promise.all(vols.map(async v => {
                if (volumeCache[v]) return;
                const bMeta = collectionMeta.books.find(b => b.number === v);
                const res = await fetch(`${basePath}${collectionId}/${bMeta.file}`);
                const data = await res.json();
                volumeCache[v] = data.hadiths;
            }));
            batch.forEach(h => {
                if (!h.english) {
                    const content = volumeCache[h.vol]?.find(c => c.id === h.id);
                    if (content) Object.assign(h, content);
                }
            });
        }

        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        let html = '';
        batch.forEach((h, idx) => {
            const grade = (h.grade || '').toLowerCase();
            const gradeClass = grade === 'sahih' ? 'badge-sah' : grade === 'hasan' ? 'badge-has' : 'badge-daif';
            html += `
            <section class="hadith-card" id="hadith-${h.id}" data-id="${h.id}" data-number="${h.number}" data-idx="${idx}">
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
            </section>`;
        });
        hadithContainer.innerHTML = html;
        if (window.i18n) window.i18n.translatePage(currentLang);
        initScrollObserver();
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
                window.toggleSpeech(content, e.currentTarget.querySelector('i'), currentLang);
            };

            shareBtn.onclick = async (e) => {
                e.stopPropagation();
                const ar = card.querySelector('.hadith-ar');
                const en = card.querySelector('.hadith-en');
                const title = currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn;
                const ref = `${title} · Hadith ${hData.number}`;
                const metaText = `${ref} — Noor Al-Huda`;

                const originalContent = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i>';

                const template = document.getElementById('share-card-template');
                if (template && window.html2canvas) {
                    document.getElementById('sc-arabic').textContent = ar ? ar.textContent : "";
                    document.getElementById('sc-translation').textContent = en ? en.textContent : "";
                    document.getElementById('sc-meta').textContent = metaText;
                    document.getElementById('sc-url').textContent = window.location.origin + window.location.pathname;

                    try {
                        const canvas = await html2canvas(template, { scale: 2, useCORS: true });
                        canvas.toBlob(async (blob) => {
                            const fileName = `NoorAlHuda_Hadith_${collectionId}_${hData.number}.png`;
                            const file = new File([blob], fileName, { type: 'image/png' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({ files: [file], title: metaText });
                            } else {
                                const link = document.createElement('a'); link.download = fileName;
                                link.href = URL.createObjectURL(blob); link.click();
                            }
                            shareBtn.innerHTML = originalContent;
                        }, 'image/png');
                    } catch (err) { 
                        console.error("Share failed:", err);
                        shareBtn.innerHTML = originalContent; 
                    }
                } else {
                    const shareText = `${metaText}\n\n${ar ? ar.textContent : ''}\n\n${en ? en.textContent : ''}\n\nShared from Noor Al-Huda`;
                    if (navigator.share) {
                        navigator.share({ title: ref, text: shareText, url: window.location.href });
                    } else {
                        navigator.clipboard.writeText(shareText);
                        alert("Text copied to clipboard!");
                    }
                    shareBtn.innerHTML = originalContent;
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

    // --- Sequential Playback ---
    if (mainPlayBtn) {
        mainPlayBtn.onclick = () => {
            if (isPlayingSequentially) stopSequentialPlay();
            else startSequentialPlay();
        };
    }

    function startSequentialPlay() {
        isPlayingSequentially = true;
        const playerBar = document.getElementById('playerBar');
        if (playerBar) {
            playerBar.classList.remove('hidden');
            document.body.classList.remove('player-hidden');
        }
        playHadithAtIndex(0);
    }

    function stopSequentialPlay() {
        isPlayingSequentially = false;
        window.toggleSpeech("", null);
    }

    function playHadithAtIndex(index) {
        const cards = hadithContainer.querySelectorAll('.hadith-card');
        if (!isPlayingSequentially || index >= cards.length) { stopSequentialPlay(); return; }
        const hData = filteredHadiths[(currentPage - 1) * itemsPerPage + index];
        if (!hData) return;
        scrollToElement(`hadith-${hData.id}`);
        const content = currentLang === 'bn' && hData.bengali ? hData.bengali : hData.english;
        window.toggleSpeech(content, cards[index].querySelector('.listen-btn i'), currentLang, () => {
            if (isPlayingSequentially) playHadithAtIndex(index + 1);
        });
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
                    const hash = `#hadith-${entry.target.dataset.id}`;
                    if (window.location.hash !== hash) history.replaceState(null, null, hash);
                }
            });
        }, options);
        document.querySelectorAll('.hadith-card').forEach(card => observer.observe(card));
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
            if (window.innerWidth <= 768) window.scrollTo({ top: window.pageYOffset + rect.top - (window.innerHeight / 2) + (rect.height / 2), behavior: i === 0 ? 'smooth' : 'auto' });
            else container.scrollTo({ top: container.scrollTop + rect.top - container.getBoundingClientRect().top - (container.offsetHeight / 2) + (rect.height / 2), behavior: i === 0 ? 'smooth' : 'auto' });
            await new Promise(r => setTimeout(r, i === 0 ? 1000 : 300));
        }
        targetEl.classList.add('highlight-pulse');
        setTimeout(() => { isSystemScrolling = false; setTimeout(() => targetEl.classList.remove('highlight-pulse'), 3000); }, 500);
    }

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#hadith-')) scrollToElement(hash.substring(1));
    });

    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        updateDocumentTitle();
        renderSidebar();
        loadBook(currentBook);
    });

    // --- Sidebar Logic ---
    function openSidebar() {
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileToggleBtn) mobileToggleBtn.onclick = openSidebar;
    if (overlay) overlay.onclick = closeSidebar;

    function renderSidebar() {
        if (!bookListContainer || !collectionMeta) return;
        bookListContainer.innerHTML = '';
        
        collectionMeta.books.forEach(book => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = `surah-item ${book.number === currentBook ? 'active' : ''}`;
            a.dataset.number = book.number;
            a.innerHTML = `
                <span class="surah-number">${book.number}</span>
                <span class="surah-name">${currentLang === 'bn' ? (book.nameBn || book.nameEn) : book.nameEn}</span>
            `;
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

    init();
});