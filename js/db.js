// IndexedDB Database Wrapper
const DB_NAME = 'PerfumerOrganDB';
const DB_VERSION = 1;

class PerfumerDB {
    constructor() {
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject('Database failed to open');
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist

                // Fragrance Wheels Store
                if (!db.objectStoreNames.contains('wheels')) {
                    const wheelStore = db.createObjectStore('wheels', { keyPath: 'id' });
                    wheelStore.createIndex('version', 'version', { unique: false });
                }

                // Ingredients Store
                if (!db.objectStoreNames.contains('ingredients')) {
                    const ingredientStore = db.createObjectStore('ingredients', { keyPath: 'id' });
                    ingredientStore.createIndex('name', 'name', { unique: false });
                    ingredientStore.createIndex('family', 'family', { unique: false });
                    ingredientStore.createIndex('noteType', 'noteType', { unique: false });
                    ingredientStore.createIndex('subfamily', 'subfamily', { unique: false });
                }

                // Compositions Store
                if (!db.objectStoreNames.contains('compositions')) {
                    const compositionStore = db.createObjectStore('compositions', { keyPath: 'id' });
                    compositionStore.createIndex('name', 'name', { unique: false });
                    compositionStore.createIndex('created', 'created', { unique: false });
                    compositionStore.createIndex('version', 'version', { unique: false });
                }

                // Settings Store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                console.log('Database schema created');
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Specific methods for Ingredients
    async addIngredient(ingredient) {
        ingredient.id = ingredient.id || this.generateId();
        ingredient.created = ingredient.created || new Date().toISOString();
        return this.add('ingredients', ingredient);
    }

    async updateIngredient(ingredient) {
        ingredient.updated = new Date().toISOString();
        return this.update('ingredients', ingredient);
    }

    async deleteIngredient(id) {
        return this.delete('ingredients', id);
    }

    async getAllIngredients() {
        return this.getAll('ingredients');
    }

    async getIngredientsByFamily(family) {
        return this.getByIndex('ingredients', 'family', family);
    }

    async getIngredientsByNoteType(noteType) {
        return this.getByIndex('ingredients', 'noteType', noteType);
    }

    async searchIngredients(query) {
        const allIngredients = await this.getAllIngredients();
        const lowerQuery = query.toLowerCase();
        return allIngredients.filter(ing =>
            ing.name.toLowerCase().includes(lowerQuery) ||
            (ing.family && ing.family.toLowerCase().includes(lowerQuery)) ||
            (ing.notes && ing.notes.toLowerCase().includes(lowerQuery))
        );
    }

    // Specific methods for Compositions
    async addComposition(composition) {
        composition.id = composition.id || this.generateId();
        composition.created = composition.created || new Date().toISOString();
        composition.version = composition.version || 1;
        return this.add('compositions', composition);
    }

    async updateComposition(composition) {
        composition.updated = new Date().toISOString();
        return this.update('compositions', composition);
    }

    async deleteComposition(id) {
        return this.delete('compositions', id);
    }

    async getAllCompositions() {
        const compositions = await this.getAll('compositions');
        // Sort by created date, newest first
        return compositions.sort((a, b) =>
            new Date(b.created) - new Date(a.created)
        );
    }

    async searchCompositions(query) {
        const allCompositions = await this.getAllCompositions();
        const lowerQuery = query.toLowerCase();
        return allCompositions.filter(comp =>
            comp.name.toLowerCase().includes(lowerQuery)
        );
    }

    // Specific methods for Fragrance Wheels
    async saveWheel(wheel) {
        wheel.id = wheel.id || 'default';
        return this.update('wheels', wheel);
    }

    async getWheel(id = 'default') {
        return this.get('wheels', id);
    }

    // Settings methods
    async saveSetting(key, value) {
        return this.update('settings', { key, value });
    }

    async getSetting(key) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : null;
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Export all data
    async exportAllData() {
        const data = {
            version: DB_VERSION,
            exportDate: new Date().toISOString(),
            ingredients: await this.getAllIngredients(),
            compositions: await this.getAllCompositions(),
            wheels: await this.getAll('wheels'),
            settings: await this.getAll('settings')
        };
        return data;
    }

    // Import data
    async importData(data) {
        try {
            // Import ingredients
            if (data.ingredients && Array.isArray(data.ingredients)) {
                for (const ingredient of data.ingredients) {
                    await this.update('ingredients', ingredient);
                }
            }

            // Import compositions
            if (data.compositions && Array.isArray(data.compositions)) {
                for (const composition of data.compositions) {
                    await this.update('compositions', composition);
                }
            }

            // Import wheels
            if (data.wheels && Array.isArray(data.wheels)) {
                for (const wheel of data.wheels) {
                    await this.update('wheels', wheel);
                }
            }

            // Import settings
            if (data.settings && Array.isArray(data.settings)) {
                for (const setting of data.settings) {
                    await this.update('settings', setting);
                }
            }

            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Clear all data
    async clearAllData() {
        await this.clear('ingredients');
        await this.clear('compositions');
        return { success: true, message: 'All data cleared' };
    }

    // Get database statistics
    async getStats() {
        const ingredients = await this.getAllIngredients();
        const compositions = await this.getAllCompositions();

        const totalValue = ingredients.reduce((sum, ing) =>
            sum + (parseFloat(ing.pricePerMl) || 0), 0
        );

        const familyCounts = {};
        ingredients.forEach(ing => {
            familyCounts[ing.family] = (familyCounts[ing.family] || 0) + 1;
        });

        return {
            totalIngredients: ingredients.length,
            totalCompositions: compositions.length,
            inventoryValue: totalValue,
            fragranceFamilies: Object.keys(familyCounts).length,
            familyBreakdown: familyCounts
        };
    }
}

// Create global database instance
const db = new PerfumerDB();
