// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // Load saved theme from localStorage or database
        this.loadTheme();
        this.attachEventListeners();
    }

    async loadTheme() {
        // Try localStorage first for instant load
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Try database
            try {
                const dbTheme = await db.getSetting('theme');
                if (dbTheme) {
                    this.setTheme(dbTheme);
                }
            } catch (error) {
                console.log('Using default theme');
            }
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Update toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }

        // Save to both localStorage and database
        localStorage.setItem('theme', theme);

        // Save to database (async, no need to wait)
        if (db.db) {
            db.saveSetting('theme', theme).catch(err =>
                console.error('Failed to save theme to database:', err)
            );
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    attachEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    getTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager
window.themeManager = new ThemeManager();
