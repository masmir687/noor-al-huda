/**
 * Noor Al-Huda — Bookmarks Page Logic
 * Renders bookmarks and handles removal/listening
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bookmarks-container');
    let currentLang = localStorage.getItem('lang') || 'en';

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
        bookmarks.sort((a, b) => b.timestamp - a.timestamp);

        let html = '';
        bookmarks.forEach(item => {
            const isHadith = item.type === 'hadith';
            const typeLabel = isHadith ? 'Hadith' : 'Quran';
            const refText = isHadith ? `${item.title} · ${typeLabel} ${item.number}` : `${item.title} (${item.surah}:${item.ayah})`;
            const content = currentLang === 'bn' && item.textBn ? item.textBn : (item.textEn || item.english || "");
            
            html += `
                <div class="hadith-card" data-id="${item.id}" style="margin-bottom: 25px; cursor: pointer;">
                    <div class="qa-tag" style="margin-bottom: 10px; background-color: var(--parch); color: var(--gold); border: 1px solid var(--sand);">${typeLabel}</div>
                    <p class="hadith-ar" dir="rtl">${item.textAr}</p>
                    <p class="hadith-en">${content}</p>
                    <div class="hadith-meta">
                        <div>
                            ${isHadith && item.narrator ? `<span class="narrator">Narrated by ${item.narrator}</span>` : ''}
                            <span class="ref">${refText}</span>
                        </div>
                        <div class="hadith-btns" style="margin-top: 15px;">
                            <button class="btn-sm listen-btn"><i class="ph ph-play-circle"></i> <span data-t="listen">Listen</span></button>
                            <button class="btn-sm remove-btn outline" style="color: var(--error); border-color: rgba(220, 38, 38, 0.2);"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        attachListeners(bookmarks);
        
        // Translate labels
        if (window.i18n) window.i18n.translatePage(currentLang);
    }

    function attachListeners(bookmarks) {
        container.querySelectorAll('.hadith-card').forEach(card => {
            const id = card.dataset.id;
            const item = bookmarks.find(b => b.id === id);

            // Navigation Logic (Clicking the card)
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking buttons
                if (e.target.closest('button')) return;

                if (item.type === 'quran') {
                    // Navigate to Quran with Surah and Ayah context
                    window.location.href = `quran.html?surah=${item.surah}&ayah=${item.ayah}`;
                } else if (item.type === 'hadith') {
                    // Navigate to specific collection page
                    const collectionPath = `collection/${item.collectionId}/index.html`;
                    window.location.href = `${collectionPath}?number=${item.number}`;
                }
            });

            // Listen
            card.querySelector('.listen-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                const icon = e.currentTarget.querySelector('i');
                const content = currentLang === 'bn' && item.textBn ? item.textBn : (item.textEn || item.english || "");
                window.toggleSpeech(content, icon, currentLang);
            });

            // Remove
            card.querySelector('.remove-btn').addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent card click
                if (confirm('Remove this bookmark?')) {
                    await window.BookmarkDB.remove(id);
                    card.remove();
                    if (container.querySelectorAll('.hadith-card').length === 0) {
                        loadBookmarks();
                    }
                }
            });
        });
    }

    // Handle language changes
    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        loadBookmarks();
    });

    // Wait for DB to be ready
    const checkDB = setInterval(() => {
        if (window.BookmarkDB && window.BookmarkDB.db) {
            clearInterval(checkDB);
            loadBookmarks();
        }
    }, 100);
});