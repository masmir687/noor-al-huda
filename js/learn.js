/**
 * Noor Al-Huda — Learning Center Logic
 * Dynamically loads structured tutorial JSON files and handles tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('learn-grid');
    const tabs = document.querySelectorAll('.learn-tab');
    let currentCategory = 'faith';
    let currentLang = localStorage.getItem('lang') || 'en';

    function init() {
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                tabs.forEach(t => {
                    t.classList.remove('btn-gold');
                    t.classList.add('btn-outline');
                    t.classList.remove('active');
                });
                const target = e.currentTarget;
                target.classList.add('btn-gold', 'active');
                target.classList.remove('btn-outline');
                currentCategory = target.dataset.category;
                loadCategory(currentCategory);
            };
        });

        loadCategory(currentCategory);
    }

    async function loadCategory(category) {
        grid.innerHTML = '<div style="text-align: center; width: 100%; color: var(--gold); grid-column: 1 / -1;"><i class="ph ph-spinner-gap ph-spin" style="font-size:32px;"></i></div>';
        try {
            const res = await fetch(`data/learn/${category}.json`);
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            renderTutorials(data);
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<div style="text-align: center; color: var(--error); grid-column: 1 / -1;">Failed to load tutorials.</div>';
        }
    }

    function renderTutorials(tutorials) {
        if (!tutorials || tutorials.length === 0) {
            grid.innerHTML = '<div style="text-align: center; width: 100%; color: var(--stone); grid-column: 1 / -1;">No tutorials available for this section.</div>';
            return;
        }

        const t = (window.i18n && window.i18n.translations[currentLang]) || {};
        let html = '';

        tutorials.forEach((item, index) => {
            // Check if title has nested translations
            let title = typeof item.title === 'string' ? item.title : (item.title[currentLang] || item.title['en'] || "Tutorial");
            let body = typeof item.body === 'string' ? item.body : (item.body[currentLang] || item.body['en'] || "Content not available");
            
            html += `
            <div class="qa-card" style="padding: 30px; display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; border-bottom: 1px solid var(--sand); padding-bottom: 15px;">
                    <h3 style="color: var(--obsidian); margin: 0; font-size: 1.4rem;">${title}</h3>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-sm listen-btn" title="Listen"><i class="ph ph-play-circle"></i></button>
                    </div>
                </div>
                <div class="learn-desc" style="color: var(--ink); line-height: 1.8;">
                    ${body}
                </div>
            </div>`;
        });

        grid.innerHTML = html;

        // Attach listen button functionality
        grid.querySelectorAll('.qa-card').forEach(card => {
            const listenBtn = card.querySelector('.listen-btn');
            const desc = card.querySelector('.learn-desc');
            if (listenBtn && desc) {
                listenBtn.onclick = (e) => {
                    e.stopPropagation();
                    const icon = listenBtn.querySelector('i');
                    // Simple text extraction (removes HTML tags)
                    const text = desc.innerText;
                    window.toggleSpeech(text, icon, currentLang);
                };
            }
        });
    }

    // Re-render when language changes
    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        loadCategory(currentCategory);
    });

    init();
});