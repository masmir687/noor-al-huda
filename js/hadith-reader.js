/**
 * Noor Al-Huda — Dynamic Hadith Reader
 * Optimized for Instant Interactivity & Background Indexing
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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

    // State
    let collectionId = 'bukhari';
    let currentBook = 1; 
    let allHadiths = []; 
    let filteredHadiths = []; 
    let globalData = null; 
    let collectionMeta = null;
    let isIndexLoaded = false;
    let indexPromise = null;

    // Pagination
    let currentPage = 1;
    let itemsPerPage = 50;
    let totalPages = 1;

    // Language
    let currentLang = localStorage.getItem('lang') || 'en';

    // Sequential Play State
    let isPlayingSequentially = false;
    let currentPlayIndex = -1;

    // Helper for paths
    const getBasePath = () => {
        // If we are in a collection subdirectory (e.g., /collection/bukhari/index.html)
        // we need to go up two levels to reach the root, then into data/
        if (window.location.pathname.includes('/collection/')) {
            return '../../data/';
        }
        // Otherwise, if we are at the root (e.g., /hadith.html), data/ is in the same directory
        return 'data/';
    };

    // 1. Initialize
    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        collectionId = (window.COLLECTION_ID || urlParams.get('id') || 'bukhari').trim();
        const basePath = getBasePath();

        try {
            // Load Metadata
            const res = await fetch(`${basePath}${collectionId}_meta.json`);
            if (!res.ok) throw new Error(`Metadata not found (HTTP ${res.status})`);
            collectionMeta = await res.json();
            
            // Setup Basic UI
            if (authorSpan) authorSpan.textContent = collectionMeta.author;
            updateDocumentTitle();
            
            renderSidebar();
            
            // Load Volume 1 immediately
            await loadBook(1);

            // Start Background Indexing if available
            if (collectionMeta.indexFile) {
                loadIndexInBackground();
            }

        } catch (error) {
            console.error("Init failed:", error);
            if (headerEn) headerEn.textContent = "Load Error";
            hadithContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--stone);">
                    <i class="ph ph-warning-circle" style="font-size: 48px; color: var(--gold); margin-bottom: 20px; display: block;"></i>
                    <h3 style="font-size: 24px; margin-bottom: 10px;">Collection Unavailable</h3>
                    <p>Failed to load <b>${collectionId}</b> collection.</p>
                    <p style="font-size: 14px; opacity: 0.7; margin-top: 10px;">Error: ${error.message}</p>
                    <p style="font-size: 11px; opacity: 0.5; margin-top: 15px;">Target Path: ${basePath}${collectionId}_meta.json</p>
                    <a href="${window.COLLECTION_ID ? '../../' : ''}hadith.html" class="btn btn-gold" style="margin-top: 25px; display: inline-block;">Explore Other Collections</a>
                </div>
            `;
        }
    }

    function updateDocumentTitle() {
        if (!collectionMeta) return;
        const title = currentLang === 'bn' ? collectionMeta.titleBn : collectionMeta.titleEn;
        document.title = `${title || collectionMeta.titleEn} — Noor Al-Huda`;
    }

    // 2. Load Content (Volume or Global)
    async function loadBook(bookNumber) {
        if (!collectionMeta) return;
        currentBook = bookNumber;
        const basePath = getBasePath();
        const loadingText = (window.i18n && window.i18n.translations[currentLang].loading) || "Loading Hadiths...";
        hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--gold);"><i class="ph ph-spinner-gap ph-spin" style="font-size: 32px;"></i><p style="margin-top:10px;">${loadingText}</p></div>`;
        if (resultsMeta) resultsMeta.style.display = 'none';
        
        // Stop playback when changing books
        stopSequentialPlay();

        // Update Headers
        if (bookNumber === 0) {
            if (headerAr) headerAr.textContent = "البحث العام";
            if (headerEn) {
                headerEn.setAttribute('data-t', 'global_search');
                headerEn.textContent = (window.i18n && window.i18n.translations[currentLang].global_search) || "Global Search & Filtering";
            }
        } else {
            const bMeta = collectionMeta.books.find(b => b.number === bookNumber);
            if (bMeta) {
                if (headerAr) headerAr.textContent = bMeta.nameAr;
                if (headerEn) {
                    headerEn.removeAttribute('data-t');
                    headerEn.textContent = currentLang === 'bn' ? bMeta.nameBn : bMeta.nameEn;
                }
            }
        }
        if (headerMeta) headerMeta.textContent = currentLang === 'bn' ? collectionMeta.titleBn : collectionMeta.titleEn;

        try {
            if (bookNumber === 0) {
                if (isIndexLoaded) {
                    allHadiths = globalData.hadiths;
                    applyFilters();
                } else {
                    hadithContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="ph ph-circle-notch ph-spin" style="font-size: 24px;"></i><p>Indexing entire collection...</p></div>';
                    if (!indexPromise) loadIndexInBackground();
                }
            } else {
                const bMeta = collectionMeta.books.find(b => b.number === bookNumber);
                if (!bMeta) throw new Error(`Book ${bookNumber} configuration missing`);
                const path = `${basePath}${collectionId}/${bMeta.file}`;
                const res = await fetch(path);
                if (!res.ok) throw new Error(`Data file not found (HTTP ${res.status})`);
                const data = await res.json();
                allHadiths = data.hadiths;
                applyFilters();
            }
        } catch (error) {
            console.error("Load book failed:", error);
            hadithContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--error);">Data file error: ${error.message}</div>`;
        }
    }

    // 3. Background Indexing
    function loadIndexInBackground() {
        if (indexPromise || !collectionMeta.indexFile) return;
        const basePath = getBasePath();
        
        indexPromise = fetch(`${basePath}${collectionId}/${collectionMeta.indexFile}`)
            .then(res => res.json())
            .then(data => {
                globalData = data;
                isIndexLoaded = true;
                populateFilters(globalData.hadiths);
                if (currentBook === 0) {
                    allHadiths = globalData.hadiths;
                    applyFilters();
                }
            })
            .catch(e => {
                console.error("Index background load failed", e);
                indexPromise = null;
            });
    }

    // 4. Sidebar & Filters
    function renderSidebar() {
        bookListContainer.innerHTML = '';
        const globalBtn = createSidebarLink(0, "Global Search", "البحث العام");
        bookListContainer.appendChild(globalBtn);

        collectionMeta.books.forEach(book => {
            bookListContainer.appendChild(createSidebarLink(book.number, book.nameEn, book.nameAr));
        });
    }

    function createSidebarLink(num, en, ar) {
        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        const bMeta = collectionMeta?.books?.find(b => b.number === num);
        const name = currentLang === 'bn' && bMeta ? bMeta.nameBn : en;
        const a = document.createElement('a');
        a.href = '#';
        a.className = `surah-item ${num === currentBook ? 'active' : ''}`;
        if (num === 0) {
            const globalSearchText = t.global_search || 'Global Search';
            a.innerHTML = `<span class="surah-number"><i class="ph ph-magnifying-glass"></i></span><span class="surah-name" data-t="global_search">${globalSearchText}</span>`;
        } else {
            a.innerHTML = `<span class="surah-number">${num}</span><span class="surah-name">${name}</span>`;
        }
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('active'));
            a.classList.add('active');
            loadBook(num);
            document.querySelector('.quran-content').scrollTop = 0;
            const sb = document.querySelector('.quran-sidebar');
            if (sb) sb.classList.remove('open');
        });
        return a;
    }

    function populateFilters(hadiths) {
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

    // 5. Rendering
    function renderPage(page) {
        currentPage = page;
        hadithContainer.innerHTML = '';
        stopSequentialPlay();

        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredHadiths.length);
        const batch = filteredHadiths.slice(start, end);

        let html = '';
        const t = (window.i18n && window.i18n.translations[currentLang]) || {};

        batch.forEach((h, idx) => {
            const grade = (h.grade || '').toLowerCase();
            const gradeClass = grade === 'sahih' ? 'badge-sah' : grade === 'hasan' ? 'badge-has' : 'badge-daif';
            const gradeText = t[grade] || h.grade;
            const content = currentLang === 'bn' && h.bengali ? h.bengali : h.english;
            const collectionTitle = (currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn) || 'Hadith';

            html += `
            <div class="hadith-card" style="margin-bottom: 30px;" data-number="${h.number}" data-idx="${idx}">
                <p class="hadith-ar" dir="rtl">${h.arabic}</p>
                <p class="hadith-en">${content}</p>
                <div class="hadith-meta">
                    <div>
                        <span class="narrator">${t.narrated_by || 'Narrated by'} ${h.narrator}</span>
                        <span class="ref">${collectionTitle} · ${t.hadith || 'Hadith'} ${h.number}</span>
                    </div>
                    <span class="grade-badge ${gradeClass}">${gradeText || '...'}</span>
                </div>
                <div class="hadith-btns" style="margin-top: 15px;">
                    <button class="btn-sm listen-btn"><i class="ph ph-play-circle"></i> <span data-t="listen">${t.listen || 'Listen'}</span></button>
                    <button class="btn-sm share-btn outline"><i class="ph ph-share-network"></i> <span data-t="share">${t.share || 'Share'}</span></button>
                    <button class="btn-sm bookmark-btn outline" data-id="${collectionId}_${h.number}"><i class="ph ph-bookmark-simple"></i></button>
                </div>
            </div>`;
        });

        hadithContainer.innerHTML = html;
        if (window.i18n) window.i18n.translatePage(currentLang);

        // Add Listeners
        hadithContainer.querySelectorAll('.hadith-card').forEach(async card => {
            const idx = parseInt(card.dataset.idx);
            const hData = batch[idx];
            const bookmarkBtn = card.querySelector('.bookmark-btn');
            const bid = bookmarkBtn.dataset.id;

            // Check existing bookmark
            const existing = await window.BookmarkDB.get(bid);
            if (existing) {
                bookmarkBtn.querySelector('i').classList.replace('ph-bookmark-simple', 'ph-bookmark-simple-fill');
                bookmarkBtn.style.color = 'var(--gold)';
            }

            bookmarkBtn.addEventListener('click', async () => {
                const item = {
                    id: bid,
                    type: 'hadith',
                    collectionId: collectionId,
                    number: hData.number,
                    textAr: hData.arabic,
                    textEn: hData.english,
                    textBn: hData.bengali,
                    narrator: hData.narrator,
                    grade: hData.grade,
                    title: collectionTitle
                };
                const added = await window.BookmarkDB.toggle(item);
                const icon = bookmarkBtn.querySelector('i');
                if (added) {
                    icon.classList.replace('ph-bookmark-simple', 'ph-bookmark-simple-fill');
                    bookmarkBtn.style.color = 'var(--gold)';
                } else {
                    icon.classList.replace('ph-bookmark-simple-fill', 'ph-bookmark-simple');
                    bookmarkBtn.style.color = '';
                }
            });

            card.querySelector('.listen-btn')?.addEventListener('click', (e) => {
                stopSequentialPlay();
                const icon = e.currentTarget.querySelector('i');
                const content = currentLang === 'bn' && hData.bengali ? hData.bengali : hData.english;
                window.toggleSpeech(content, icon, currentLang);
            });

            card.querySelector('.share-btn')?.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                const originalContent = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Generating...';
                
                const content = currentLang === 'bn' && hData.bengali ? hData.bengali : hData.english;
                const title = (currentLang === 'bn' ? collectionMeta?.titleBn : collectionMeta?.titleEn) || 'Hadith';
                const metaText = `${title} — Hadith ${hData.number}`;
                const template = document.getElementById('share-card-template');
                if (template) {
                    document.getElementById('sc-arabic').textContent = hData.arabic;
                    document.getElementById('sc-translation').textContent = content;
                    document.getElementById('sc-meta').textContent = metaText;
                    document.getElementById('sc-url').textContent = window.location.origin + window.location.pathname;
                    
                    try {
                        const canvas = await html2canvas(template, { scale: 2, useCORS: true });
                        canvas.toBlob(async (blob) => {
                            const collectionNameClean = collectionId.charAt(0).toUpperCase() + collectionId.slice(1);
                            const fileName = `${collectionNameClean}_Hadith_${hData.number}.png`;
                            const file = new File([blob], fileName, { type: 'image/png' });
                            
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({ files: [file], title: metaText, text: `Shared from Noor Al-Huda` });
                            } else {
                                const link = document.createElement('a'); link.download = fileName;
                                link.href = URL.createObjectURL(blob); link.click();
                            }
                            btn.innerHTML = originalContent;
                        }, 'image/png');
                    } catch (err) { btn.innerHTML = '<i class="ph ph-warning"></i> Error'; setTimeout(() => btn.innerHTML = originalContent, 2000); }
                }
            });
        });
        renderPagination();
    }

    function renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }
        let html = `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}"><i class="ph ph-caret-left"></i></button>`;
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
        if (startPage > 1) { html += `<button class="page-btn" data-page="1">1</button>`; if (startPage > 2) html += `<span class="page-dots">...</span>`; }
        for (let i = startPage; i <= endPage; i++) html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        if (endPage < totalPages) { if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`; html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`; }
        html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}"><i class="ph ph-caret-right"></i></button>`;
        container.innerHTML = html;
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => { if (!btn.classList.contains('disabled')) renderPage(parseInt(btn.dataset.page)); });
        });
    }

    // 6. Sequential Playback
    if (mainPlayBtn) {
        mainPlayBtn.addEventListener('click', () => {
            if (isPlayingSequentially) {
                stopSequentialPlay();
            } else {
                startSequentialPlay();
            }
        });
    }

    function startSequentialPlay() {
        isPlayingSequentially = true;
        updateMainPlayIcon('play');
        const playerBar = document.getElementById('playerBar');
        if (playerBar) {
            playerBar.classList.remove('hidden');
            document.body.classList.remove('player-hidden');
            const spb = document.getElementById('show-player-btn');
            if (spb) spb.classList.add('hidden');
        }
        playHadithAtIndex(0);
    }

    function stopSequentialPlay() {
        isPlayingSequentially = false;
        currentPlayIndex = -1;
        updateMainPlayIcon('pause');
        window.toggleSpeech("", null); 
        document.querySelectorAll('.hadith-card').forEach(c => c.style.borderColor = 'var(--sand)');
        updateProgressBar(0, 0);
        // Note: toggleSpeech("", null) will handle hiding the playerBar and body class
    }

    function playHadithAtIndex(index) {
        const cards = hadithContainer.querySelectorAll('.hadith-card');
        const playerBar = document.getElementById('playerBar');
        if (!isPlayingSequentially || index >= cards.length) {
            stopSequentialPlay();
            return;
        }
        currentPlayIndex = index;
        const card = cards[index];
        const start = (currentPage - 1) * itemsPerPage;
        const hData = filteredHadiths[start + index];
        if (!hData) return;

        const content = currentLang === 'bn' && hData.bengali ? hData.bengali : hData.english;
        const icon = card.querySelector('.listen-btn i');
        
        document.querySelectorAll('.hadith-card').forEach(c => c.style.borderColor = 'var(--sand)');
        card.style.borderColor = 'var(--gold)';
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Show player
        if (playerBar) {
            playerBar.classList.remove('hidden');
            document.body.classList.remove('player-hidden');
            const spb = document.getElementById('show-player-btn');
            if (spb) spb.classList.add('hidden');
        }

        // Update Progress Bar
        updateProgressBar(index + 1, cards.length);

        window.toggleSpeech(content, icon, currentLang, () => {
            if (isPlayingSequentially) playHadithAtIndex(index + 1);
        });
    }

    function updateMainPlayIcon(state) {
        if (!mainPlayBtn) return;
        const icon = mainPlayBtn.querySelector('i');
        if (typeof window.updateIcon === 'function') {
            window.updateIcon(icon, state);
        }
    }

    function updateProgressBar(current, total) {
        const fill = document.getElementById('player-progress-fill');
        const dot = document.getElementById('player-progress-dot');
        const curText = document.getElementById('player-progress-current');
        const totText = document.getElementById('player-progress-total');

        if (curText) curText.textContent = current;
        if (totText) totText.textContent = total;

        if (fill && dot && total > 0) {
            const percent = (current / total) * 100;
            fill.style.width = `${percent}%`;
            dot.style.left = `${percent}%`;
        } else if (fill && dot) {
            fill.style.width = '0%';
            dot.style.left = '0%';
        }
    }

    // 7. Events
    document.getElementById('category-filter')?.addEventListener('change', applyFilters);
    document.getElementById('narrator-filter')?.addEventListener('change', applyFilters);
    document.getElementById('tag-filter')?.addEventListener('change', applyFilters);
    document.getElementById('global-search')?.addEventListener('input', applyFilters);
    document.getElementById('items-per-page')?.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        totalPages = Math.ceil(filteredHadiths.length / itemsPerPage);
        renderPage(1);
    });

    // Interactive Seeking
    const progressBar = document.querySelector('.player-progress .bar');
    if (progressBar) {
        progressBar.style.cursor = 'pointer';
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percentage = x / width;
            const cards = hadithContainer.querySelectorAll('.hadith-card');
            if (cards.length > 0) {
                const targetIndex = Math.floor(percentage * cards.length);
                const safeIndex = Math.max(0, Math.min(targetIndex, cards.length - 1));
                if (!isPlayingSequentially) { isPlayingSequentially = true; updateMainPlayIcon('play'); }
                playHadithAtIndex(safeIndex);
            }
        });
    }

    const sbOverlay = document.getElementById('quran-sidebar-overlay'), sbToggle = document.getElementById('mobile-sidebar-toggle'), sidebar = document.querySelector('.quran-sidebar');
    if (sbToggle) sbToggle.onclick = () => sidebar.classList.toggle('open');
    if (sbOverlay) sbOverlay.onclick = () => sidebar.classList.remove('open');

    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        updateDocumentTitle();
        renderSidebar();
        loadBook(currentBook);
    });

    init();
});
