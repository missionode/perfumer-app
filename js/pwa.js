// PWA Manager - Service Worker & Install Prompt
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.registration = null;
        this.init();
    }

    async init() {
        // Check if already installed
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;

        if (this.isInstalled) {
            console.log('[PWA] App is installed');
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('[PWA] Service Worker registered:', this.registration.scope);

                // Check for updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log('[PWA] Message from SW:', event.data);
                });

            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        }

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Install prompt triggered');
            e.preventDefault();
            this.deferredPrompt = e;

            // Show custom install button after a delay
            if (!this.isInstalled) {
                setTimeout(() => {
                    this.showInstallPrompt();
                }, 5000); // Show after 5 seconds
            }
        });

        // Track installation
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.isInstalled = true;
            this.deferredPrompt = null;

            if (window.toastManager) {
                toastManager.success('App installed! You can now use it offline.');
            }

            // Remove install banner if present
            this.hideInstallBanner();
        });

        // Handle URL parameters for shortcuts
        this.handleShortcuts();
    }

    showInstallPrompt() {
        if (!this.deferredPrompt || this.isInstalled) return;

        // Create install banner
        const banner = document.createElement('div');
        banner.id = 'pwaInstallBanner';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: var(--spacing-lg) var(--spacing-xl);
            border-radius: var(--radius-lg);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            z-index: 9998;
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
            max-width: 500px;
            animation: slideUpFade 0.3s ease;
        `;

        banner.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: var(--font-size-base); margin-bottom: 4px;">
                    📱 Install Perfumer's Organ
                </div>
                <div style="font-size: var(--font-size-sm); opacity: 0.9;">
                    Install the app for offline access and a better experience!
                </div>
            </div>
            <button id="pwaInstallBtn" style="
                background: white;
                color: var(--primary);
                border: none;
                padding: var(--spacing-sm) var(--spacing-lg);
                border-radius: var(--radius-md);
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            ">
                Install
            </button>
            <button id="pwaDismissBtn" style="
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.5);
                color: white;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: var(--font-size-sm);
            ">
                ✕
            </button>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUpFade {
                from {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }

            #pwaInstallBtn:hover {
                transform: scale(1.05);
            }
        `;

        if (!document.getElementById('pwaInstallStyles')) {
            style.id = 'pwaInstallStyles';
            document.head.appendChild(style);
        }

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('pwaInstallBtn').addEventListener('click', () => {
            this.promptInstall();
        });

        document.getElementById('pwaDismissBtn').addEventListener('click', () => {
            this.hideInstallBanner();
            localStorage.setItem('pwa_install_dismissed', 'true');
        });

        // Auto-hide after 30 seconds
        setTimeout(() => {
            this.hideInstallBanner();
        }, 30000);
    }

    hideInstallBanner() {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            banner.style.animation = 'slideUpFade 0.3s ease reverse';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            if (window.toastManager) {
                toastManager.info('App is already installed or install prompt is not available.');
            }
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWA] Install outcome:', outcome);

        if (outcome === 'accepted') {
            console.log('[PWA] User accepted install');
        } else {
            console.log('[PWA] User dismissed install');
        }

        // Clear the deferred prompt
        this.deferredPrompt = null;
        this.hideInstallBanner();
    }

    showUpdateNotification() {
        if (!window.toastManager) return;

        // Create custom update notification
        const updateToast = toastManager.info(
            'A new version is available! Click to update.',
            0 // Don't auto-dismiss
        );

        // Add click handler to update
        updateToast.style.cursor = 'pointer';
        updateToast.addEventListener('click', () => {
            this.updateApp();
        });
    }

    async updateApp() {
        if (!this.registration || !this.registration.waiting) return;

        // Tell service worker to skip waiting
        this.registration.waiting.postMessage({ action: 'skipWaiting' });

        // Reload the page when the new service worker activates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });

        if (window.toastManager) {
            toastManager.info('Updating app...');
        }
    }

    async clearCache() {
        if (!this.registration) return;

        try {
            const channel = new MessageChannel();

            return new Promise((resolve, reject) => {
                channel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        if (window.toastManager) {
                            toastManager.success('Cache cleared successfully');
                        }
                        resolve();
                    } else {
                        reject(new Error('Failed to clear cache'));
                    }
                };

                this.registration.active.postMessage(
                    { action: 'clearCache' },
                    [channel.port2]
                );
            });
        } catch (error) {
            console.error('[PWA] Failed to clear cache:', error);
            if (window.toastManager) {
                toastManager.error('Failed to clear cache');
            }
        }
    }

    handleShortcuts() {
        // Check if app was launched from a shortcut
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');

        if (tab && window.app) {
            // Wait for app to initialize
            setTimeout(() => {
                if (app.switchTab) {
                    app.switchTab(tab);
                }
            }, 500);
        }
    }

    async checkOnlineStatus() {
        if (navigator.onLine) {
            if (window.toastManager) {
                toastManager.success('Back online!');
            }
        } else {
            if (window.toastManager) {
                toastManager.warning('You are offline. Some features may be limited.');
            }
        }
    }

    isStandalone() {
        return this.isInstalled;
    }
}

// Initialize PWA Manager
window.pwaManager = new PWAManager();

// Monitor online/offline status
window.addEventListener('online', () => {
    console.log('[PWA] Online');
    if (window.pwaManager) {
        pwaManager.checkOnlineStatus();
    }
});

window.addEventListener('offline', () => {
    console.log('[PWA] Offline');
    if (window.pwaManager) {
        pwaManager.checkOnlineStatus();
    }
});

// Add PWA info to settings
document.addEventListener('DOMContentLoaded', () => {
    // Add install button to settings if not installed
    const checkPWAButton = setInterval(() => {
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm && window.pwaManager) {
            clearInterval(checkPWAButton);

            if (!pwaManager.isStandalone()) {
                // Add PWA section to settings
                const pwaSection = document.createElement('div');
                pwaSection.className = 'form-group';
                pwaSection.innerHTML = `
                    <label>Progressive Web App</label>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary" id="installPWABtn">
                            📱 Install as App
                        </button>
                        <small class="form-text">Install for offline access and a native app experience</small>
                    </div>
                `;

                // Insert before data management section
                const dataManagementSection = settingsForm.querySelector('[style*="Data Management"]')?.parentElement;
                if (dataManagementSection) {
                    settingsForm.insertBefore(pwaSection, dataManagementSection);
                } else {
                    settingsForm.appendChild(pwaSection);
                }

                // Add click handler
                document.getElementById('installPWABtn')?.addEventListener('click', () => {
                    pwaManager.promptInstall();
                });
            }
        }
    }, 100);

    setTimeout(() => clearInterval(checkPWAButton), 5000);
});
