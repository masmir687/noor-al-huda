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

    const getVideoPageUrl = () => {
        return window.location.pathname.endsWith('.html') ? 'videos.html' : 'videos';
    };

    // 3. Load Q&A List with Filtering
    const loadQA = () => {
        if (document.getElementById('qa-grid')) {
            let qaData = [];
            let currentFilter = 'all';

            const getLocalized = (obj, key) => {
                const activeLang = localStorage.getItem('lang') || 'en';
                const keyBn = key + 'Bn';
                if (activeLang === 'bn' && obj[keyBn]) return obj[keyBn];
                return obj[key] || "";
            };

            const renderQA = (filter = 'all') => {
                currentFilter = filter;
                const activeLang = localStorage.getItem('lang') || 'en';
                const t = (window.i18n && window.i18n.translations[activeLang]) || {};
                
                const filteredData = filter === 'all' 
                    ? qaData 
                    : qaData.filter(qa => qa.category === filter);

                const html = filteredData.map(qa => {
                    const tag = getLocalized(qa, 'tag');
                    const question = getLocalized(qa, 'question');
                    const excerpt = getLocalized(qa, 'excerpt');
                    const videoCount = qa.videos || 0;

                    return `
                        <div class="qa-card" id="qa-ref-${qa.id}" style="margin-bottom: 0;">
                            <span class="qa-tag">${tag}</span>
                            <h3 class="qa-q">${question}</h3>
                            <p style="font-size: 13px; color: var(--stone); margin-bottom: 15px;">${excerpt}</p>
                            <div class="qa-meta" style="padding-top: 15px; border-top: 1px solid var(--sand);">
                                <div class="video-indicator"><i class="ph ph-play"></i></div>
                                <span>${videoCount} ${t.video_answer || 'video answer'}${videoCount !== 1 ? 's' : ''}</span>
                                <span style="color: var(--stone); margin-left: 15px;"><i class="ph ph-check-circle" style="color: var(--em)"></i> ${t.verified_by_scholars || 'Verified by Scholars'}</span>
                                <a href="?id=${qa.id}" class="read-more" data-id="${qa.id}" data-t="read_full_answer">${t.read_full_answer || 'Read Full Answer'} <i class="ph ph-arrow-right"></i></a>
                            </div>
                        </div>
                    `;
                }).join('');
                
                render('qa-grid', html || `<div style="text-align: center; width: 100%; color: var(--stone); padding: 40px;">No questions found in this category.</div>`);
                
                // Add event listeners for "Read Full Answer"
                document.querySelectorAll('.read-more').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const qaId = parseInt(link.getAttribute('data-id'));
                        const qa = qaData.find(item => item.id === qaId);
                        if (qa) {
                            showQAModal(qa);
                            const newUrl = window.location.pathname + '?id=' + qa.id;
                            window.history.pushState({ qaId: qa.id }, '', newUrl);
                        }
                    });
                });

                if (window.i18n) window.i18n.translatePage(activeLang);
            };

            const showQAModal = (qa) => {
                const activeLang = localStorage.getItem('lang') || 'en';
                const modal = document.getElementById('qaModal');
                const title = document.getElementById('qa-modal-title');
                const body = document.getElementById('qa-modal-body');
                const shareBtn = document.getElementById('qa-modal-share');

                if (modal && title && body) {
                    title.textContent = getLocalized(qa, 'question');
                    
                    let answerHtml = `<p>${getLocalized(qa, 'answer')}</p>`;
                    
                    if (qa.videoUrls && qa.videoUrls.length > 0) {
                        answerHtml += `<div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed var(--sand);">`;
                        answerHtml += `<h4 style="font-size: 14px; margin-bottom: 10px; color: var(--emd);"><i class="ph ph-video-camera"></i> Related Video Lessons:</h4>`;
                        answerHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
                        
                        qa.videoUrls.forEach((vUrl, index) => {
                            let linkHref = `${getVideoPageUrl()}?url=${encodeURIComponent(vUrl)}`;
                            try {
                                const urlObj = new URL(vUrl);
                                if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
                                    linkHref = `${getVideoPageUrl()}?v=${urlObj.searchParams.get('v')}`;
                                } else if (urlObj.hostname.includes('youtu.be')) {
                                    linkHref = `${getVideoPageUrl()}?v=${urlObj.pathname.substring(1)}`;
                                }
                            } catch(e) {}
                            
                            answerHtml += `<a href="${linkHref}" class="video-link-item" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--gold); font-weight: 600; font-size: 13px;">
                                <i class="ph ph-play-circle" style="font-size: 18px;"></i> Watch Video Lesson ${qa.videoUrls.length > 1 ? index + 1 : ''}
                            </a>`;
                        });
                        
                        answerHtml += `</div></div>`;
                    }
                    
                    body.innerHTML = answerHtml;
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    if (shareBtn) {
                        shareBtn.onclick = (e) => {
                            const ar = ""; 
                            const tr = getLocalized(qa, 'answer');
                            const ref = getLocalized(qa, 'question');
                            window.performShare(shareBtn, { ar, tr, ref }, activeLang, e);
                        };
                    }
                }
            };

            const closeModal = () => {
                const modal = document.getElementById('qaModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                    const cleanUrl = window.location.pathname;
                    window.history.pushState({}, '', cleanUrl);
                }
            };

            const modal = document.getElementById('qaModal');
            const closeBtn = document.getElementById('qa-modal-close');
            if (closeBtn) closeBtn.onclick = closeModal;
            if (modal) {
                modal.onclick = (e) => { if (e.target === modal) closeModal(); };
            }

            fetch('data/qa.json')
                .then(res => res.json())
                .then(data => {
                    qaData = data;
                    renderQA();
                    
                    const params = new URLSearchParams(window.location.search);
                    if (params.has('id')) {
                        const targetId = parseInt(params.get('id'));
                        const targetQA = qaData.find(q => q.id === targetId);
                        if (targetQA) {
                            showQAModal(targetQA);
                        }
                    }

                    const filterBtns = document.querySelectorAll('.filter-btn');
                    filterBtns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            filterBtns.forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            renderQA(btn.getAttribute('data-category'));
                        });
                    });

                    document.addEventListener('languageChanged', () => {
                        renderQA(currentFilter);
                    });
                }).catch(e => console.error("Error loading Q&A data:", e));
        }
    };

    loadQA();

    // 4. Load Videos
    if (document.getElementById('videos-grid')) {
        const lang = localStorage.getItem('lang') || 'en';
        fetch('data/videos.json')
            .then(res => res.json())
            .then(data => {
                const html = data.map(vid => `
                    <a href="${getVideoPageUrl()}?id=${vid.id}" class="vid-card" style="text-decoration: none; color: inherit; display: block;">
                        <div class="vid-thumb vid-thumb-large" style="background: ${vid.gradient}">
                            <div class="play-btn"><i class="ph ph-play"></i></div>
                            <span class="vid-dur">${vid.duration}</span>
                        </div>
                        <div class="vid-info">
                            <h4 class="vid-title" style="font-size: 16px;">${lang === 'bn' && vid.titleBn ? vid.titleBn : vid.title}</h4>
                            <span class="speaker-badge">${lang === 'bn' && vid.speakerBn ? vid.speakerBn : vid.speaker}</span>
                        </div>
                    </a>
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
                                <a href="${getVideoPageUrl()}?url=${encodeURIComponent(pod.url)}" class="btn btn-gold listen-btn" style="padding: 6px 16px; font-size: 12px; display: flex; align-items: center; gap: 8px; text-decoration: none;">
                                    <i class="ph ph-play-circle" style="font-size: 16px;"></i> 
                                    <span data-t="play_episode">${t.play_episode || 'Play Episode'}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('');
                render('media-grid', html);
            }).catch(e => console.error("Error loading Media data:", e));
    }
});
