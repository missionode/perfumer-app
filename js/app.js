// Main Application Controller
class PerfumerApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.fragranceWheel = null;
        this.currentComposition = null;
        this.init();
    }

    async init() {
        console.log('Initializing Perfumer App...');

        // Initialize database
        try {
            await db.init();
            console.log('Database initialized');
        } catch (error) {
            console.error('Database initialization failed:', error);
            this.showError('Failed to initialize database');
            return;
        }

        // Load fragrance wheel
        await this.loadFragranceWheel();

        // Load sample ingredients if database is empty
        await this.loadSampleDataIfNeeded();

        // Initialize UI components
        this.attachEventListeners();

        // Initialize settings manager
        if (window.settingsManager) {
            console.log('Initializing settings manager...');
            await settingsManager.loadSettings();
        }

        // Initialize wheel renderer
        if (window.wheelRenderer) {
            console.log('Initializing wheel renderer...');
            await wheelRenderer.init();
        } else {
            console.warn('Wheel renderer not found');
        }

        // Load initial view
        this.switchTab('dashboard');
        await this.refreshDashboard();

        console.log('App initialized successfully');
    }

    async loadFragranceWheel() {
        try {
            // Try to load from database first
            let wheel = await db.getWheel('default');

            if (!wheel) {
                // Load from JSON file
                const response = await fetch('data/default-wheel.json');
                wheel = await response.json();

                // Save to database
                await db.saveWheel(wheel);
                console.log('Fragrance wheel loaded from file and saved to database');
            } else {
                console.log('Fragrance wheel loaded from database');
            }

            this.fragranceWheel = wheel;

            // Populate family dropdowns
            this.populateFamilySelects();
        } catch (error) {
            console.error('Failed to load fragrance wheel:', error);
            this.showError('Failed to load fragrance wheel');
        }
    }

    async loadSampleDataIfNeeded() {
        try {
            const ingredients = await db.getAllIngredients();

            if (ingredients.length === 0) {
                console.log('Loading sample ingredients...');

                // Load sample ingredients
                const response = await fetch('data/sample-ingredients.json');
                const sampleIngredients = await response.json();

                for (const ingredient of sampleIngredients) {
                    // Mark as sample data
                    ingredient.isSample = true;
                    await db.addIngredient(ingredient);
                }

                console.log(`Loaded ${sampleIngredients.length} sample ingredients`);
            }
        } catch (error) {
            console.error('Failed to load sample data:', error);
        }
    }

    populateFamilySelects() {
        if (!this.fragranceWheel) return;

        const familySelects = [
            document.getElementById('ingredientFamily'),
            document.getElementById('familyFilter')
        ];

        familySelects.forEach(select => {
            if (!select) return;

            // Clear existing options (except first)
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Add family options
            this.fragranceWheel.families.forEach(family => {
                const option = document.createElement('option');
                option.value = family.id;
                option.textContent = family.name;
                select.appendChild(option);
            });
        });
    }

    attachEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Modal close
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                if (window.tutorialManager) {
                    tutorialManager.start();
                }
            });
        }

        // Search and filters (will be handled by individual modules)
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === tabName);
        });

        // Load tab content
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.refreshDashboard();
                break;
            case 'wheel':
                if (window.wheelRenderer) {
                    wheelRenderer.render();
                }
                break;
            case 'organ':
                if (window.organManager) {
                    await organManager.refreshIngredients();
                }
                break;
            case 'compose':
                if (window.composer) {
                    composer.refresh();
                }
                break;
            case 'library':
                if (window.libraryManager) {
                    await libraryManager.refreshLibrary();
                }
                break;
        }
    }

    async refreshDashboard() {
        try {
            const stats = await db.getStats();

            // Update stat cards
            document.getElementById('totalIngredients').textContent = stats.totalIngredients;
            document.getElementById('totalCompositions').textContent = stats.totalCompositions;
            document.getElementById('inventoryValue').textContent = this.formatPrice(stats.inventoryValue);
            document.getElementById('fragranceFamilies').textContent = stats.fragranceFamilies;

            // Load recent compositions
            const compositions = await db.getAllCompositions();
            const recentCompositions = compositions.slice(0, 5);

            const recentContainer = document.getElementById('recentCompositions');
            if (recentCompositions.length === 0) {
                recentContainer.innerHTML = '<p class="empty-state">No compositions yet. Start creating in the Compose tab!</p>';
            } else {
                recentContainer.innerHTML = recentCompositions.map(comp => `
                    <div class="composition-card" onclick="app.loadComposition('${comp.id}')">
                        <div class="card-header">
                            <h3 class="card-title">${this.escapeHtml(comp.name)}</h3>
                            <span class="card-badge">v${comp.version}</span>
                        </div>
                        <div class="card-info">
                            <div class="card-row">
                                <span>Ingredients:</span>
                                <span>${comp.ingredients.length}</span>
                            </div>
                            <div class="card-row">
                                <span>Total Cost:</span>
                                <span>${this.formatPrice(comp.totals.cost)}</span>
                            </div>
                            <div class="card-row">
                                <span>Harmony:</span>
                                <span>${comp.harmonyScore}%</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }

    async loadComposition(id) {
        try {
            const composition = await db.get('compositions', id);
            if (composition && window.composer) {
                composer.loadComposition(composition);
                this.switchTab('compose');
            }
        } catch (error) {
            console.error('Failed to load composition:', error);
            this.showError('Failed to load composition');
        }
    }

    showModal(modalId) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById(modalId);

        if (overlay && modal) {
            overlay.classList.remove('hidden');
        }
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        // Reset forms
        const forms = overlay.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }

    showError(message) {
        if (window.toastManager) {
            toastManager.error(message);
        } else {
            alert('Error: ' + message);
        }
    }

    showSuccess(message) {
        if (window.toastManager) {
            toastManager.success(message);
        } else {
            alert('Success: ' + message);
        }
    }

    showWarning(message) {
        if (window.toastManager) {
            toastManager.warning(message);
        } else {
            alert('Warning: ' + message);
        }
    }

    showInfo(message) {
        if (window.toastManager) {
            toastManager.info(message);
        } else {
            alert(message);
        }
    }

    showSettings() {
        if (window.settingsManager) {
            settingsManager.showSettings();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getFragranceWheel() {
        return this.fragranceWheel;
    }

    getFamilyColor(familyId) {
        if (!this.fragranceWheel) return '#cccccc';

        const family = this.fragranceWheel.families.find(f => f.id === familyId);
        return family ? family.color : '#cccccc';
    }

    getFamilyName(familyId) {
        if (!this.fragranceWheel) return familyId;

        const family = this.fragranceWheel.families.find(f => f.id === familyId);
        return family ? family.name : familyId;
    }

    getCompatibleFamilies(familyId) {
        if (!this.fragranceWheel || !this.fragranceWheel.compatibility) return [];
        return this.fragranceWheel.compatibility[familyId] || [];
    }

    formatPrice(price) {
        if (window.settingsManager) {
            return settingsManager.formatPrice(price);
        }
        return `$${price.toFixed(2)}`;
    }
}

// Global helper function for tab switching (used in HTML)
function switchTab(tabName) {
    if (window.app) {
        app.switchTab(tabName);
    }
}

// Global helper function for modal closing (used in HTML)
function closeModal() {
    if (window.app) {
        app.closeModal();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PerfumerApp();
});
