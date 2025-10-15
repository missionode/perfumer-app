// Settings Manager
class SettingsManager {
    constructor() {
        this.settings = {
            currency: 'USD',
            dropsPerMl: 20,
            theme: 'light'
        };

        this.initialized = false;

        this.currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CNY': '¥',
            'INR': '₹',
            'AUD': '$',
            'CAD': '$',
            'CHF': 'Fr',
            'SEK': 'kr',
            'NOK': 'kr',
            'DKK': 'kr',
            'SGD': '$',
            'HKD': '$',
            'NZD': '$',
            'KRW': '₩',
            'MXN': '$',
            'BRL': 'R$',
            'ZAR': 'R',
            'RUB': '₽'
        };

        this.init();
    }

    async init() {
        if (!this.initialized) {
            this.attachEventListeners();
            this.initialized = true;
        }
    }

    async loadSettings() {
        try {
            // Load from database
            const currency = await db.getSetting('currency');
            const dropsPerMl = await db.getSetting('dropsPerMl');
            const theme = await db.getSetting('theme');

            if (currency) this.settings.currency = currency;
            if (dropsPerMl) this.settings.dropsPerMl = parseInt(dropsPerMl);
            if (theme) this.settings.theme = theme;

            // Update composer drops per ML
            if (window.composer && dropsPerMl) {
                composer.DROPS_PER_ML = parseInt(dropsPerMl);
            }

            console.log('Settings loaded:', this.settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    attachEventListeners() {
        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
        }

        // Theme buttons
        const lightBtn = document.getElementById('lightThemeBtn');
        const darkBtn = document.getElementById('darkThemeBtn');

        if (lightBtn) {
            lightBtn.addEventListener('click', () => {
                if (window.themeManager) {
                    themeManager.setTheme('light');
                }
            });
        }

        if (darkBtn) {
            darkBtn.addEventListener('click', () => {
                if (window.themeManager) {
                    themeManager.setTheme('dark');
                }
            });
        }

        // Data management buttons
        const exportAllBtn = document.getElementById('exportAllDataBtn');
        const importAllBtn = document.getElementById('importAllDataBtn');
        const flushSampleBtn = document.getElementById('flushSampleDataBtn');
        const clearAllBtn = document.getElementById('clearAllDataBtn');

        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllData());
        }

        if (importAllBtn) {
            importAllBtn.addEventListener('click', () => this.importAllData());
        }

        if (flushSampleBtn) {
            flushSampleBtn.addEventListener('click', () => this.flushSampleData());
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    async handleSaveSettings(e) {
        e.preventDefault();

        const currencySelect = document.getElementById('currencySelect');
        const dropsPerMlInput = document.getElementById('dropsPerMlInput');

        this.settings.currency = currencySelect.value;
        this.settings.dropsPerMl = parseInt(dropsPerMlInput.value);

        // Save to database
        await db.saveSetting('currency', this.settings.currency);
        await db.saveSetting('dropsPerMl', this.settings.dropsPerMl);

        // Update composer
        if (window.composer) {
            composer.DROPS_PER_ML = this.settings.dropsPerMl;
            composer.updateDisplay();
        }

        app.showSuccess('Settings saved successfully');
        app.closeModal();

        // Refresh displays
        await app.refreshDashboard();
        if (window.organManager) {
            await organManager.refreshIngredients();
        }
    }

    showSettings() {
        // Ensure settings are loaded first
        console.log('Showing settings. Current settings:', this.settings);

        // Populate form with current settings
        const currencySelect = document.getElementById('currencySelect');
        const dropsPerMlInput = document.getElementById('dropsPerMlInput');

        if (currencySelect) {
            currencySelect.value = this.settings.currency;
            console.log('Set currency to:', this.settings.currency);
        }

        if (dropsPerMlInput) {
            dropsPerMlInput.value = this.settings.dropsPerMl;
            console.log('Set drops per ML to:', this.settings.dropsPerMl);
        }

        // Update theme button states
        const currentTheme = window.themeManager ? themeManager.getTheme() : 'light';
        const lightBtn = document.getElementById('lightThemeBtn');
        const darkBtn = document.getElementById('darkThemeBtn');

        if (lightBtn && darkBtn) {
            if (currentTheme === 'light') {
                lightBtn.style.borderColor = 'var(--primary)';
                lightBtn.style.fontWeight = 'bold';
                darkBtn.style.borderColor = 'var(--border-color)';
                darkBtn.style.fontWeight = 'normal';
            } else {
                darkBtn.style.borderColor = 'var(--primary)';
                darkBtn.style.fontWeight = 'bold';
                lightBtn.style.borderColor = 'var(--border-color)';
                lightBtn.style.fontWeight = 'normal';
            }
        }

        // Show settings modal
        const overlay = document.getElementById('modalOverlay');
        const settingsModal = document.getElementById('settingsModal');

        if (overlay && settingsModal) {
            // Hide other modals
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });

            settingsModal.style.display = 'block';
            overlay.classList.remove('hidden');
        }
    }

    async exportAllData() {
        if (window.exportManager) {
            const result = await exportManager.exportFullDatabase();
            if (result.success) {
                app.showSuccess('All data exported successfully');
            } else {
                app.showError('Failed to export data');
            }
        }
    }

    async importAllData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (window.exportManager) {
                const result = await exportManager.importFullDatabase(file);
                if (result.success) {
                    app.showSuccess('Data imported successfully');
                    await app.refreshDashboard();
                } else {
                    app.showError(result.message);
                }
            }
        };

        input.click();
    }

    async flushSampleData() {
        const confirmed = confirm(
            'Remove sample ingredients?\n\n' +
            'This will delete the 20 pre-loaded sample ingredients.\n' +
            'Your custom ingredients will NOT be affected.\n\n' +
            'Continue?'
        );

        if (!confirmed) return;

        try {
            const allIngredients = await db.getAllIngredients();
            let deletedCount = 0;

            // Delete only ingredients marked as sample
            for (const ingredient of allIngredients) {
                if (ingredient.isSample === true) {
                    await db.deleteIngredient(ingredient.id);
                    deletedCount++;
                }
            }

            app.showSuccess(`Removed ${deletedCount} sample ingredients`);

            // Refresh displays
            if (window.organManager) {
                await organManager.refreshIngredients();
            }
            await app.refreshDashboard();

        } catch (error) {
            console.error('Failed to flush sample data:', error);
            app.showError('Failed to remove sample data');
        }
    }

    async clearAllData() {
        const confirmed = confirm(
            'Are you sure you want to delete ALL data?\n\n' +
            'This will permanently delete:\n' +
            '- All ingredients\n' +
            '- All compositions\n' +
            '- All settings\n\n' +
            'This action cannot be undone!'
        );

        if (!confirmed) return;

        const doubleConfirm = confirm('Are you ABSOLUTELY sure? Type YES to confirm.');

        if (!doubleConfirm) return;

        try {
            await db.clearAllData();
            await db.saveSetting('currency', 'USD');
            await db.saveSetting('dropsPerMl', 20);

            app.showSuccess('All data cleared. Reloading...');

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Failed to clear data:', error);
            app.showError('Failed to clear data');
        }
    }

    getCurrency() {
        return this.settings.currency;
    }

    getCurrencySymbol() {
        return this.currencySymbols[this.settings.currency] || '$';
    }

    formatPrice(price) {
        const symbol = this.getCurrencySymbol();
        const formatted = price.toFixed(2);

        // For currencies where symbol comes after
        if (['SEK', 'NOK', 'DKK'].includes(this.settings.currency)) {
            return `${formatted} ${symbol}`;
        }

        // For most currencies, symbol comes before
        return `${symbol}${formatted}`;
    }

    getDropsPerMl() {
        return this.settings.dropsPerMl;
    }
}

// Initialize settings manager
window.settingsManager = new SettingsManager();
