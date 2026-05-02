/**
 * Noor Al-Huda — Bookmarks Manager
 * Uses IndexedDB for local persistent storage
 */

const BookmarkDB = {
    dbName: 'NoorAlHudaDB',
    dbVersion: 1,
    storeName: 'bookmarks',
    db: null,
    initPromise: null,

    init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject('Database error: ' + event.target.error);
            };

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

        return this.initPromise;
    },

    async ensureDB() {
        if (!this.db) {
            await this.init();
        }
    },

    async toggle(item) {
        await this.ensureDB();
        const existing = await this.get(item.id);
        if (existing) {
            await this.remove(item.id);
            return false; // Removed
        } else {
            await this.add(item);
            return true; // Added
        }
    },

    async add(item) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({ ...item, timestamp: Date.now() });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    },

    async remove(id) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    },

    async get(id) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    },

    async getAll() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
        });
    }
};

// Global instance
window.BookmarkDB = BookmarkDB;
BookmarkDB.init().catch(console.error);
