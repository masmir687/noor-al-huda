/**
 * Noor Al-Huda — Bookmarks Page Logic
 * Renders bookmarks and handles removal/listening
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bookmarks-container');
    let currentLang = localStorage.getItem('lang') || 'en';

    // Caches to prevent redundant fetching
    const surahCache = {};
    const volumeCache = {};
    const surahNamesCache = { en: null, bn: null };

    async function getSurahName(num, lang) {
        if (!surahNamesCache[lang]) {
            try {
                if (lang === 'bn') {
                    // Using the hardcoded array from quran.js (exported via window or duplicated for simplicity)
                    const names = ["আল-ফাতিহা", "আল-বাকারাহ", "আল-ইমরান", "আন-নিসা", "আল-মায়িদাহ", "আল-আনআম", "আল-আরাফ", "আল-আনফাল", "আত-তাওবাহ", "ইউনুস", "হুদ", "ইউসুফ", "আর-রাদ", "ইব্রাহীম", "হিজর", "আন-নাহল", "আল-ইসরা", "আল-কাহফ", "মারইয়াম", "ত্বোয়া-হা", "আল-আম্বিয়া", "আল-হাজ্জ", "আল-মুমিনুন", "আন-নূর", "আল-ফুরকান", "আশ-শুআরা", "আন-নামল", "আল-কাসাস", "আল-আনকাবূত", "আর-রূম", "লুকমান", "আস-সাজদাহ", "আল-আহযাব", "সাবা", "ফাতির", "ইয়াসীন", "আস-সাফফাত", "ছোয়াদ", "আয-যুমার", "গাফির", "ফুসসিলাত", "আশ-শূরা", "আয-যুখরুফ", "আদ-দুখান", "আল-জাসিয়াহ", "আল-আহক্বাফ", "মুহাম্মদ", "আল-ফাতহ", "আল-হুজুরাত", "ক্বাফ", "আয-যারিয়াত", "আত্ব তূর", "আন-নাজম", "আল-কামার", "আর-রহমান", "আল-ওয়াকিয়াহ", "আল-হাদীদ", "আল-মুজাদিলাহ", "আল-হাশর", "আল-মুমতাহিনাহ", "আস-সাফ", "আল-জুমুআহ", "আল-মুনাফিকূন", "আত-তাগাবুন", "আত্ব-ত্বালাক", "আত-তাহরীম", "আল-মুলক", "আল-কলম", "আল-হাক্কাহ", "আল-মাআরিজ", "নূহ", "আল-জ্বিন", "আল-মুযযাম্মিল", "আল-মুদ্দাসসির", "আল-ক্বিয়ামাহ", "আল-ইনসান", "আল-মুরসাাত", "আন-নাবা", "আন-নাযিয়াত", "আবাসা", "আত-তাকভীর", "আল-ইনফিতার", "আল-মুতাপফিফীন", "আল-ইনশিকাক", "আল-বুরূজ", "আত-তারিক", "আল-আলা", "আল-গাশিয়াহ", "আল-ফজর", "আল-বালাদ", "আশ-শামস", "আল-লাইল", "আদ-দুহা", "আশ-শরহ", "আত-তীন", "আল-আলাক", "আল-কদর", "আল-বায়্যিনাহ", "আয-যিলযাল", "আল-আদিয়াত", "আল-ক্বারিআহ", "আত-তাকাসুর", "আল-আসর", "আল-হুমাযাহ", "আল-ফীল", "কুরাইশ", "আল-মাউন", "আল-কাউসার", "আল-কাফিরূন", "আন-নাসর", "আল-লাহাব", "আল-ইখলাস", "আল-ফালাক", "আন-নাস"];
                    surahNamesCache.bn = names;
                } else {
                    const res = await fetch('https://api.alquran.cloud/v1/surah');
                    const data = await res.json();
                    surahNamesCache.en = data.data.map(s => s.englishName);
                }
            } catch (e) { return "Surah"; }
        }
        return (lang === 'bn' ? surahNamesCache.bn : surahNamesCache.en)?.[num - 1] || "Surah";
    }

    async function loadBookmarks() {
        if (!window.BookmarkDB) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">Bookmarks storage not initialized.</p>';
            return;
        }

        const bookmarks = await window.BookmarkDB.getAll();
        
        if (bookmarks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--stone);">
                    <i class="ph ph-bookmark-simple" style="font-size: 48px; color: var(--sand); margin-bottom: 20px; display: block;"></i>
                    <h3>No Bookmarks Yet</h3>
                    <p>Verses and Hadiths you bookmark will appear here.</p>
                    <a href="quran.html" class="btn btn-gold" style="margin-top: 20px; display: inline-block;">Explore Quran</a>
                </div>
            `;
            return;
        }

        // Sort by newest first
        bookmarks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Skeleton Render
        container.innerHTML = bookmarks.map(item => `
            <div class="hadith-card skeleton-card" id="card-${item.id}" data-id="${item.id}">
                <div style="height: 20px; width: 60px; background: var(--sand); border-radius: 4px; margin-bottom: 15px;"></div>
                <div style="height: 100px; width: 100%; background: var(--warm); border-radius: 8px; margin-bottom: 15px;"></div>
                <div style="height: 60px; width: 80%; background: var(--warm); border-radius: 8px;"></div>
            </div>
        `).join('');

        // Resolve each card asynchronously
        bookmarks.forEach(item => resolveAndRenderCard(item));
    }

    async function resolveAndRenderCard(item) {
        const cardEl = document.getElementById(`card-${item.id}`);
        if (!cardEl) return;

        try {
            let resolvedData = { ...item };
            const isHadith = item.type === 'hadith';

            if (isHadith) {
                // Fetch Hadith Content
                const cacheKey = `${item.collectionId}_v${item.vol}`;
                if (!volumeCache[cacheKey]) {
                    const res = await fetch(`data/${item.collectionId}/${item.collectionId}_v${item.vol}.json`);
                    if (!res.ok) throw new Error("Hadith file not found");
                    const data = await res.json();
                    volumeCache[cacheKey] = data.hadiths;
                }
                const h = volumeCache[cacheKey].find(x => x.id == item.id.split('_').slice(1).join('_'));
                if (h) Object.assign(resolvedData, { 
                    textAr: h.arabic, textEn: h.english, textBn: h.bengali, 
                    narrator: h.narrator, grade: h.grade 
                });
                
                // Fetch Meta for Title if missing
                if (!volumeCache[`${item.collectionId}_meta`]) {
                    const res = await fetch(`data/${item.collectionId}_meta.json`);
                    if (res.ok) volumeCache[`${item.collectionId}_meta`] = await res.json();
                }
                const meta = volumeCache[`${item.collectionId}_meta`];
                if (meta) resolvedData.title = currentLang === 'bn' ? meta.titleBn : meta.titleEn;

            } else {
                // Fetch Quran Content
                const lang = localStorage.getItem('lang') || 'en';
                const translationCode = lang === 'bn' ? 'bn.bengali' : 'en.sahih';
                const cacheKey = `${item.surah}_${item.ayah}_${translationCode}`;
                
                if (!surahCache[cacheKey]) {
                    // Try Quran.com API (primary)
                    // En: 20 (Sahih International), Bn: 161 (Ahsanul Bayaan)
                    const transId = lang === 'bn' ? 161 : 20;
                    try {
                        const [arRes, trRes] = await Promise.all([
                            fetch(`https://api.quran.com/api/v4/quran/verses/indopak?verse_key=${item.surah}:${item.ayah}`),
                            fetch(`https://api.quran.com/api/v4/verses/by_key/${item.surah}:${item.ayah}?translations=${transId}`)
                        ]);
                        
                        if (!arRes.ok || !trRes.ok) throw new Error("API Error");
                        
                        const arData = await arRes.json();
                        const trData = await trRes.json();
                        
                        surahCache[cacheKey] = {
                            ar: arData.verses?.[0]?.text_indopak || "Arabic text not found",
                            tr: trData.verse?.translations?.[0]?.text || trData.translations?.[0]?.text || ""
                        };

                        if (!surahCache[cacheKey].tr) throw new Error("No translation in payload");

                    } catch (apiErr) {
                        // Fallback: fetch from AlQuran Cloud
                        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${item.surah}:${item.ayah}/${translationCode}`);
                        const data = await res.json();
                        if (data.code === 200) {
                            surahCache[cacheKey] = {
                                ar: data.data.text, 
                                tr: data.data.text 
                            };
                        } else throw apiErr;
                    }
                }
                resolvedData.textAr = surahCache[cacheKey].ar;
                resolvedData.textTr = surahCache[cacheKey].tr;
                resolvedData.title = await getSurahName(item.surah, lang);
            }

            // Render Final HTML for this card
            const typeLabel = isHadith ? 'Hadith' : 'Quran';
            const refText = isHadith ? `${resolvedData.title || 'Collection'} · ${typeLabel} ${item.number}` : `${resolvedData.title} (${item.surah}:${item.ayah})`;
            const content = currentLang === 'bn' ? (resolvedData.textBn || resolvedData.textTr) : (resolvedData.textEn || resolvedData.textTr || "Content missing");

            cardEl.classList.remove('skeleton-card');
            cardEl.innerHTML = `
                <div class="qa-tag" style="margin-bottom: 10px; background-color: var(--parch); color: var(--gold); border: 1px solid var(--sand);">${typeLabel}</div>
                <p class="hadith-ar" dir="rtl">${resolvedData.textAr}</p>
                <p class="hadith-en">${content}</p>
                <div class="hadith-meta">
                    <div>
                        ${isHadith && resolvedData.narrator ? `<span class="narrator">Narrated by ${resolvedData.narrator}</span>` : ''}
                        <span class="ref">${refText}</span>
                    </div>
                    <div class="hadith-btns" style="margin-top: 15px;">
                        <button class="btn-sm listen-btn"><i class="ph ph-play-circle"></i> <span data-t="listen">Listen</span></button>
                        <button class="btn-sm share-btn outline"><i class="ph ph-share-network"></i> <span data-t="share">Share</span></button>
                        ${!isHadith ? `
                            <button class="btn-sm context-btn" data-surah="${item.surah}" data-ayah="${item.ayah}"><i class="ph ph-book-open"></i> <span data-t="read_context">Context</span></button>
                            <button class="btn-sm tafsir-btn" data-surah="${item.surah}" data-ayah="${item.ayah}"><i class="ph ph-eye"></i> <span data-t="tafsir">Tafsir</span></button>
                        ` : ''}
                        <button class="btn-sm remove-btn active outline"><i class="ph ph-bookmark-simple"></i></button>
                    </div>
                </div>
                ${!isHadith ? `<div class="tafsir-container" id="tafsir-${item.surah}-${item.ayah}"><div class="tafsir-header"><span class="tafsir-title">Tafsir</span><button class="ayah-btn close-tafsir"><i class="ph ph-x"></i></button></div><div class="tafsir-content"></div></div>` : ''}
            `;

            attachListenersToCard(cardEl, resolvedData);

        } catch (err) {
            console.error("Resolve failed for", item.id, err);
            cardEl.innerHTML = `<div style="padding: 20px; background: rgba(220, 38, 38, 0.05); border-radius: 8px; border: 1px solid rgba(220, 38, 38, 0.2);">
                <p style="color:var(--error); margin-bottom: 10px; font-weight: 700;">Resolution Failed</p>
                <p style="font-size: 12px; color: var(--stone);">Could not load content for <strong>${item.id}</strong>. This usually happens due to a network error or API limit. Please try refreshing.</p>
            </div>`;
        }
    }

    function attachListenersToCard(card, item) {
        // Navigation Logic
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            if (item.type === 'quran') {
                window.location.href = `quran/${item.surah}/?ayah=${item.ayah}#ayah-${item.ayah}`;
            } else {
                const collectionPath = `collection/${item.collectionId}/`;
                const uniqueId = item.id.split('_').slice(1).join('_');
                window.location.href = `${collectionPath}?number=${item.number}&id=${uniqueId}#hadith-${uniqueId}`;
            }
        });

        // Listen
        card.querySelector('.listen-btn').onclick = (e) => {
            e.stopPropagation();
            const icon = e.currentTarget.querySelector('i');
            const content = currentLang === 'bn' && item.textBn ? item.textBn : (item.textEn || item.textTr || "");
            window.toggleSpeech(content, icon, currentLang);
        };

        // Share
        card.querySelector('.share-btn').onclick = (e) => {
            e.stopPropagation();
            const ar = item.textAr;
            const tr = currentLang === 'bn' && item.textBn ? item.textBn : (item.textEn || item.textTr || "");
            const ref = card.querySelector('.ref').textContent;
            window.performShare(e.currentTarget, { 
                ar, tr, ref, type: item.type === 'quran' ? 'Quran' : 'Hadith',
                surah: item.surah, ayah: item.ayah, collection: item.collectionId, number: item.number 
            }, currentLang, e);
        };

        // Remove
        card.querySelector('.remove-btn').onclick = async (e) => {
            e.stopPropagation();
            if (confirm('Remove this bookmark?')) {
                await window.BookmarkDB.remove(item.id);
                card.style.opacity = '0';
                card.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    card.remove();
                    if (container.querySelectorAll('.hadith-card').length === 0) loadBookmarks();
                }, 300);
            }
        };
    }

    // --- Global Tools ---
    function initGlobalTools() {
        const exportBtn = document.getElementById('export-btn');
        const importInput = document.getElementById('import-input');
        const clearBtn = document.getElementById('clear-all-btn');

        if (exportBtn) {
            exportBtn.onclick = async () => {
                const data = await window.BookmarkDB.getAll();
                if (data.length === 0) return alert("No bookmarks to export.");
                window.BookmarkDB.export();
            };
        }

        if (importInput) {
            importInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file || !confirm(`Import bookmarks from "${file.name}"?`)) return;
                try {
                    const count = await window.BookmarkDB.import(file);
                    alert(`Successfully imported ${count} bookmarks.`);
                    loadBookmarks();
                } catch (err) { alert(`Import failed: ${err}`); }
                importInput.value = '';
            };
        }

        if (clearBtn) {
            clearBtn.onclick = async () => {
                if (confirm("DELETE ALL bookmarks? Type 'DELETE' to confirm.")) {
                    if (prompt("Type 'DELETE':") === 'DELETE') {
                        await window.BookmarkDB.clearAll();
                        loadBookmarks();
                    }
                }
            };
        }
    }

    initGlobalTools();

    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        loadBookmarks();
    });

    const checkDB = setInterval(() => {
        if (window.BookmarkDB && window.BookmarkDB.db) {
            clearInterval(checkDB);
            loadBookmarks();
        }
    }, 100);
});