/**
 * Noor Al-Huda — Bookmarks Manager
 * Uses IndexedDB for local persistent storage
 */

const BookmarkDB = {
    dbName: 'NoorAlHudaDB',
    dbVersion: 1,
    storeName: 'bookmarks',
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => reject('Database error: ' + event.target.errorCode);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
        });
    },

    async toggle(item) {
        if (!this.db) await this.init();
        const existing = await this.get(item.id);
        if (existing) {
            return this.remove(item.id);
        } else {
            return this.add(item);
        }
    },

    add(item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({ ...item, timestamp: Date.now() });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    },

    remove(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(false); // Returning false to indicate removed
            request.onerror = () => reject(null);
        });
    },

    get(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(null);
        });
    },

    getAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject([]);
        });
    }
};

// Global instance
window.BookmarkDB = BookmarkDB;
BookmarkDB.init().catch(console.error);
