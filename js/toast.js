// Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="toastManager.close(this.parentElement)">&times;</button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.close(toast);
            }, duration);
        }

        return toast;
    }

    close(toast) {
        if (!toast) return;

        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    // Enhanced confirm dialog (returns Promise)
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'toast-confirm-overlay';

            const dialog = document.createElement('div');
            dialog.className = 'toast-confirm-dialog';

            dialog.innerHTML = `
                <div class="toast-confirm-header">
                    <h3>${this.escapeHtml(title)}</h3>
                </div>
                <div class="toast-confirm-body">
                    <p>${this.escapeHtml(message)}</p>
                </div>
                <div class="toast-confirm-actions">
                    <button class="btn btn-secondary toast-confirm-cancel">Cancel</button>
                    <button class="btn btn-primary toast-confirm-ok">Confirm</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Animate in
            setTimeout(() => {
                overlay.classList.add('toast-confirm-show');
            }, 10);

            const cleanup = () => {
                overlay.classList.remove('toast-confirm-show');
                setTimeout(() => {
                    if (overlay.parentElement) {
                        overlay.parentElement.removeChild(overlay);
                    }
                }, 300);
            };

            // Cancel button
            dialog.querySelector('.toast-confirm-cancel').addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            // Confirm button
            dialog.querySelector('.toast-confirm-ok').addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            // Click outside to cancel
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            });

            // Escape key to cancel
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve(false);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.close(toast));
    }
}

// Initialize toast manager
window.toastManager = new ToastManager();
