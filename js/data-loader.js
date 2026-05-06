/**
 * Noor Al-Huda — Dynamic Data Loader
 * Fetches content from JSON files and renders it into the DOM.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Helper to render HTML strings
    const render = (containerId, htmlString) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = htmlString;
        }
    };

    // 1. Load Hadith Books
    const loadHadithBooks = () => {
        if (document.getElementById('hadith-grid')) {
            const lang = localStorage.getItem('lang') || 'en';
            fetch('data/hadith.json')
                .then(res => res.json())
                .then(data => {
                    const html = data.map(book => `
                        <a href="collection/${book.id}/" class="collection-card">
                            <h2 class="collection-title-ar">${book.titleAr}</h2>
                            <h3 class="collection-title">${lang === 'bn' ? book.titleBn : book.titleEn}</h3>
                            <p class="collection-author">${book.author}</p>
                            <div class="collection-meta">
                                <span>${book.count} <span data-t="hadith">Hadiths</span></span>
                                <span><span data-t="browse_collection">Browse Collection</span> <i class="ph ph-arrow-right"></i></span>
                            </div>
                        </a>
                    `).join('');
                    render('hadith-grid', html);
                    
                    // Re-translate new elements
                    if (window.i18n) window.i18n.translatePage(lang);
                }).catch(e => console.error("Error loading Hadith data:", e));
        }
    };

    loadHadithBooks();
    document.addEventListener('languageChanged', loadHadithBooks);

    // 2. Load Learning Tutorials
    if (document.getElementById('learn-grid')) {
        const lang = localStorage.getItem('lang') || 'en';
        fetch('data/learn.json')
            .then(res => res.json())
            .then(data => {
                const t = (window.i18n && window.i18n.translations[lang]) || {};
                const html = data.map(tut => `
                    <a href="#" class="learn-card">
                        <div class="learn-img" style="background-color: ${tut.color};">
                            <i class="ph ${tut.icon}"></i>
                        </div>
                        <div class="learn-content">
                            <span class="learn-tag">${lang === 'bn' && tut.tagBn ? tut.tagBn : tut.tag}</span>
                            <h3 class="learn-title">${lang === 'bn' && tut.titleBn ? tut.titleBn : tut.title}</h3>
                            <p class="learn-desc">${lang === 'bn' && tut.descriptionBn ? tut.descriptionBn : tut.description}</p>
                            <div class="learn-meta">
                                <span><i class="ph ph-clock"></i> ${tut.time}</span>
                                <span style="margin-left: auto; color: var(--em); font-weight: 700;" data-t="start_learning">${t.start_learning || 'Start Learning'} <i class="ph ph-arrow-right"></i></span>
                            </div>
                        </div>
                    </a>
                `).join('');
                render('learn-grid', html);
            }).catch(e => console.error("Error loading Learn data:", e));
    }

    // 3. Load Q&A List
    if (document.getElementById('qa-grid')) {
        const lang = localStorage.getItem('lang') || 'en';
        fetch('data/qa.json')
            .then(res => res.json())
            .then(data => {
                const t = (window.i18n && window.i18n.translations[lang]) || {};
                const html = data.map(qa => `
                    <div class="qa-card" style="margin-bottom: 0;">
                        <span class="qa-tag">${lang === 'bn' && qa.tagBn ? qa.tagBn : qa.tag}</span>
                        <h3 class="qa-q">${lang === 'bn' && qa.questionBn ? qa.questionBn : qa.question}</h3>
                        <p style="font-size: 13px; color: var(--stone); margin-bottom: 15px;">${lang === 'bn' && qa.excerptBn ? qa.excerptBn : qa.excerpt}</p>
                        <div class="qa-meta" style="padding-top: 15px; border-top: 1px solid var(--sand);">
                            <div class="video-indicator"><i class="ph ph-play"></i></div>
                            <span>${qa.videos} ${t.video_answer || 'video answer'}${qa.videos > 1 ? 's' : ''}</span>
                            <span style="color: var(--stone); margin-left: 15px;"><i class="ph ph-check-circle" style="color: var(--em)"></i> ${t.verified_by_scholars || 'Verified by Scholars'}</span>
                            <a href="#" class="read-more" data-t="read_full_answer">${t.read_full_answer || 'Read Full Answer'} <i class="ph ph-arrow-right"></i></a>
                        </div>
                    </div>
                `).join('');
                render('qa-grid', html);
            }).catch(e => console.error("Error loading Q&A data:", e));
    }

    // 4. Load Videos
    if (document.getElementById('videos-grid')) {
        const lang = localStorage.getItem('lang') || 'en';
        fetch('data/videos.json')
            .then(res => res.json())
            .then(data => {
                const html = data.map(vid => `
                    <div class="vid-card" onclick="window.openVideo('${vid.url}')">
                        <div class="vid-thumb vid-thumb-large" style="background: ${vid.gradient}">
                            <div class="play-btn"><i class="ph ph-play"></i></div>
                            <span class="vid-dur">${vid.duration}</span>
                        </div>
                        <div class="vid-info">
                            <h4 class="vid-title" style="font-size: 16px;">${lang === 'bn' && vid.titleBn ? vid.titleBn : vid.title}</h4>
                            <span class="speaker-badge">${lang === 'bn' && vid.speakerBn ? vid.speakerBn : vid.speaker}</span>
                        </div>
                    </div>
                `).join('');
                render('videos-grid', html);
            }).catch(e => console.error("Error loading Videos data:", e));
    }

    // 5. Load Media / Podcasts
    if (document.getElementById('media-grid')) {
        const lang = localStorage.getItem('lang') || 'en';
        fetch('data/media.json')
            .then(res => res.json())
            .then(data => {
                const t = (window.i18n && window.i18n.translations[lang]) || {};
                const html = data.map(pod => `
                    <div class="podcast-card">
                        <div class="podcast-cover" style="background: ${pod.gradient}">
                            <i class="ph ${pod.icon}"></i>
                        </div>
                        <div class="podcast-info">
                            <span style="font-size: 10px; color: var(--em); font-weight: 700; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">${pod.episode}</span>
                            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 10px; color: var(--ink);">${lang === 'bn' && pod.titleBn ? pod.titleBn : pod.title}</h3>
                            <p style="font-size: 13px; color: var(--stone); margin-bottom: 20px;">${lang === 'bn' && pod.descriptionBn ? pod.descriptionBn : pod.description}</p>
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
                                <span style="font-size: 11px; font-weight: 700; color: var(--emd);">${pod.series}</span>
                                <button onclick="window.openVideo('${pod.url}')" class="btn btn-gold listen-btn" style="padding: 6px 16px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                                    <i class="ph ph-play-circle" style="font-size: 16px;"></i> 
                                    <span data-t="play_episode">${t.play_episode || 'Play Episode'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
                render('media-grid', html);
            }).catch(e => console.error("Error loading Media data:", e));
    }
});
