/**
 * Noor Al-Huda — Media Session Manager
 * Handles background play controls via the Media Session API
 */

(function() {
    const MediaSessionManager = {
        init() {
            if (!('mediaSession' in navigator)) return;

            this.setupHandlers();
        },

        setupHandlers() {
            const actions = [
                ['play', () => {
                    if (window.quranAudio && window.quranAudio.src) {
                        window.quranAudio.play();
                    } else if (window.globalAudio && window.globalAudio.src) {
                        window.globalAudio.play();
                    } else if (window.speechSynthesis && window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    }
                }],
                ['pause', () => {
                    if (window.quranAudio && !window.quranAudio.paused) {
                        window.quranAudio.pause();
                    } else if (window.globalAudio && !window.globalAudio.paused) {
                        window.globalAudio.pause();
                    } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
                        window.speechSynthesis.pause();
                    }
                }],
                ['previoustrack', () => {
                    if (window.onPlayerSkipBack) window.onPlayerSkipBack();
                }],
                ['nexttrack', () => {
                    if (window.onPlayerSkipForward) window.onPlayerSkipForward();
                }],
                ['seekbackward', (details) => {
                    const audio = this.getActiveAudio();
                    if (audio) {
                        audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0);
                    }
                }],
                ['seekforward', (details) => {
                    const audio = this.getActiveAudio();
                    if (audio) {
                        audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration);
                    }
                }],
                ['stop', () => {
                    const audio = this.getActiveAudio();
                    if (audio) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                }]
            ];

            actions.forEach(([action, handler]) => {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.warn(`Media Session Action "${action}" failed:`, error);
                }
            });
        },

        getActiveAudio() {
            if (window.quranAudio && window.quranAudio.src && !window.quranAudio.paused) return window.quranAudio;
            if (window.globalAudio && window.globalAudio.src && !window.globalAudio.paused) return window.globalAudio;
            return null;
        },

        updateMetadata(data) {
            if (!('mediaSession' in navigator)) return;

            const lang = localStorage.getItem('lang') || 'en';
            const appName = lang === 'bn' ? 'নূর আল-হুদা' : 'Noor Al-Huda';
            
            // Get base path for icons
            const isSubDir = window.location.pathname.includes('/quran/') || window.location.pathname.includes('/collection/');
            const iconPath = isSubDir ? '../../images/' : 'images/';

            navigator.mediaSession.metadata = new MediaMetadata({
                title: data.title || appName,
                artist: data.artist || appName,
                album: data.album || appName,
                artwork: [
                    { src: iconPath + 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: iconPath + 'icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });
        },

        updatePlaybackState(state) {
            if (!('mediaSession' in navigator)) return;
            navigator.mediaSession.playbackState = state; // 'playing', 'paused', or 'none'
        },

        updatePositionState() {
            if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
            const audio = this.getActiveAudio();
            if (audio && !isNaN(audio.duration) && isFinite(audio.duration) && isFinite(audio.currentTime)) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        playbackRate: audio.playbackRate,
                        position: audio.currentTime
                    });
                } catch (e) {
                    console.warn('Error updating position state:', e);
                }
            }
        }
    };

    window.MediaSessionManager = MediaSessionManager;
    MediaSessionManager.init();
})();
