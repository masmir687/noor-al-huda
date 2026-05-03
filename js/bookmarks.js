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
    },

    async export() {
        const data = await this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `NoorAlHuda_Bookmarks_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject('Failed to read file');
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data)) {
                        throw new Error('Invalid backup file format. Expected an array of bookmarks.');
                    }
                    
                    await this.ensureDB();
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    const store = transaction.objectStore(this.storeName);
                    
                    let count = 0;
                    data.forEach(item => {
                        if (item && item.id) {
                            // Use put to overwrite duplicates or add new ones
                            store.put(item);
                            count++;
                        }
                    });
                    
                    transaction.oncomplete = () => {
                        console.log(`Import successful: ${count} items processed.`);
                        resolve(count);
                    };
                    
                    transaction.onerror = (event) => {
                        console.error("Import transaction error:", event.target.error);
                        reject('Database error during import: ' + event.target.error);
                    };

                    transaction.onabort = (event) => {
                        console.warn("Import transaction aborted:", event.target.error);
                        reject('Import aborted');
                    };
                } catch (err) {
                    console.error("Import parsing error:", err);
                    reject('Failed to parse backup file: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
    },

    async clearAll() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    }
};

// Global instance
window.BookmarkDB = BookmarkDB;
BookmarkDB.init().catch(console.error);
