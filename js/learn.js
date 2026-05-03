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
                tabs.forEach(t => t.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
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
            grid.innerHTML = '<div style="text-align: center; width: 100%; color: var(--stone);">No tutorials available for this section.</div>';
            return;
        }

        let html = '';

        tutorials.forEach((item, index) => {
            let title = typeof item.title === 'string' ? item.title : (item.title[currentLang] || item.title['en'] || "Tutorial");
            let body = typeof item.body === 'string' ? item.body : (item.body[currentLang] || item.body['en'] || "Content not available");
            let iconClass = 'ph ph-book-open';
            if (currentCategory === 'faith') iconClass = 'ph ph-shield-check';
            if (currentCategory === 'salah') iconClass = 'ph ph-mosque';
            if (currentCategory === 'adab') iconClass = 'ph ph-heart';

            html += `
            <div class="learn-card">
                <div class="learn-img">
                    <i class="${iconClass}"></i>
                </div>
                <div class="learn-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <span class="learn-tag">${currentCategory}</span>
                            <h3 class="learn-title">${title}</h3>
                        </div>
                        <button class="btn-sm listen-btn" title="Listen"><i class="ph ph-play-circle"></i></button>
                    </div>
                    <div class="learn-desc">
                        ${body}
                    </div>
                </div>
            </div>`;
        });

        grid.innerHTML = html;

        // Attach listen button functionality
        grid.querySelectorAll('.learn-card').forEach(card => {
            const listenBtn = card.querySelector('.listen-btn');
            const desc = card.querySelector('.learn-desc');
            if (listenBtn && desc) {
                listenBtn.onclick = (e) => {
                    e.preventDefault();
                    const icon = listenBtn.querySelector('i');
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