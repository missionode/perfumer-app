// Interactive Tutorial System
class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;

        this.steps = [
            {
                title: 'Welcome to Perfumer\'s Organ! 🌸',
                message: 'Let\'s take a quick tour of your digital fragrance composition workspace. Click Next to begin!',
                target: null,
                position: 'center',
                action: null
            },
            {
                title: 'Dashboard Overview',
                message: 'Your dashboard shows key statistics: total ingredients, compositions, inventory value, and fragrance families at a glance.',
                target: '#dashboard .dashboard-grid',
                position: 'bottom',
                action: () => app.switchTab('dashboard')
            },
            {
                title: 'Fragrance Wheel',
                message: 'Explore the fragrance wheel to understand scent families and their relationships. Click on any segment to see compatible notes.',
                target: '[data-tab="wheel"]',
                position: 'bottom',
                action: null
            },
            {
                title: 'Ingredient Organ',
                message: 'Your ingredient library. Add, edit, search, and organize all your fragrance materials here. You can import/export ingredients too!',
                target: '[data-tab="organ"]',
                position: 'bottom',
                action: null
            },
            {
                title: 'Composition Builder',
                message: 'This is where the magic happens! Build your fragrance formulas, adjust measurements, and see real-time harmony scores.',
                target: '[data-tab="compose"]',
                position: 'bottom',
                action: null
            },
            {
                title: 'Harmony Meter',
                message: 'The animated harmony meter shows how well your ingredients work together. Aim for 75% or higher for great compositions!',
                target: '.harmony-panel',
                position: 'left',
                action: () => app.switchTab('compose'),
                highlight: true
            },
            {
                title: 'Note Balance',
                message: 'Perfect your fragrance pyramid! Top notes (20-30%), Middle notes (40-50%), Base notes (20-30%) create a balanced composition.',
                target: '.balance-panel',
                position: 'top',
                action: () => app.switchTab('compose')
            },
            {
                title: 'Cost Breakdown',
                message: 'See the cost distribution of your ingredients at a glance with this interactive pie chart. Hover over slices for details!',
                target: '.cost-breakdown-panel',
                position: 'left',
                action: () => app.switchTab('compose')
            },
            {
                title: 'Measurement Modes',
                message: 'Switch between drops and milliliters to work in your preferred unit. The app handles conversions automatically!',
                target: '.mode-toggle',
                position: 'bottom',
                action: () => app.switchTab('compose')
            },
            {
                title: 'Composition Library',
                message: 'Save and manage all your creations here. Edit, duplicate, or export your compositions anytime.',
                target: '[data-tab="library"]',
                position: 'bottom',
                action: null
            },
            {
                title: 'Settings & Data',
                message: 'Customize your currency, drops per ML, theme, and manage your data (import/export/backup) from here.',
                target: '#settingsBtn',
                position: 'bottom',
                action: null
            },
            {
                title: 'Theme Toggle',
                message: 'Switch between light and dark mode for comfortable viewing in any environment.',
                target: '#themeToggle',
                position: 'bottom',
                action: null
            },
            {
                title: 'You\'re All Set! ✨',
                message: 'That\'s everything! Start by adding ingredients in the Organ tab, then create your first composition. Happy perfuming!',
                target: null,
                position: 'center',
                action: null
            }
        ];
    }

    start() {
        // Check if user has seen tutorial
        const hasSeenTutorial = localStorage.getItem('perfumer_tutorial_completed');
        if (hasSeenTutorial) {
            const restart = confirm('You\'ve already completed the tutorial. Would you like to see it again?');
            if (!restart) return;
        }

        this.currentStep = 0;
        this.isActive = true;
        this.createOverlay();
        this.showStep(0);
    }

    createOverlay() {
        // Create semi-transparent overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorialOverlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100vw';
        this.overlay.style.height = '100vh';
        this.overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        this.overlay.style.zIndex = '9999';
        this.overlay.style.backdropFilter = 'blur(2px)';
        this.overlay.style.transition = 'opacity 0.3s ease';
        this.overlay.style.opacity = '0';

        document.body.appendChild(this.overlay);

        // Fade in
        setTimeout(() => {
            this.overlay.style.opacity = '1';
        }, 10);
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            this.complete();
            return;
        }

        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];

        // Execute step action if any
        if (step.action) {
            step.action();
        }

        // Wait a moment for DOM updates if switching tabs
        setTimeout(() => {
            this.renderTooltip(step, stepIndex);
            this.highlightTarget(step.target, step.highlight);
        }, step.action ? 300 : 0);
    }

    renderTooltip(step, stepIndex) {
        // Remove existing tooltip
        if (this.tooltip) {
            this.tooltip.remove();
        }

        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';
        this.tooltip.style.position = 'fixed';
        this.tooltip.style.background = 'var(--bg-card)';
        this.tooltip.style.border = '2px solid var(--primary)';
        this.tooltip.style.borderRadius = 'var(--radius-lg)';
        this.tooltip.style.padding = 'var(--spacing-lg)';
        this.tooltip.style.maxWidth = '90vw'; // Responsive max width
        this.tooltip.style.width = window.innerWidth < 1024 ? 'calc(100vw - 40px)' : '400px';
        this.tooltip.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        this.tooltip.style.zIndex = '10000';
        this.tooltip.style.animation = 'tutorialFadeIn 0.3s ease';

        // Position tooltip
        if (step.position === 'center') {
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
        } else if (step.target) {
            this.positionTooltip(step.target, step.position);
        } else {
            // Default center
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
        }

        // Build tooltip content
        const progress = `${stepIndex + 1} / ${this.steps.length}`;

        this.tooltip.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm); flex-wrap: wrap; gap: var(--spacing-xs);">
                    <h3 style="margin: 0; color: var(--primary); font-size: var(--font-size-lg); flex: 1; min-width: 200px;">${this.escapeHtml(step.title)}</h3>
                    <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">${progress}</span>
                </div>
                <p style="margin: 0; line-height: 1.6; color: var(--text-primary);">${this.escapeHtml(step.message)}</p>
            </div>
            <div class="tutorial-buttons">
                ${stepIndex > 0 ? '<button class="tutorial-btn tutorial-btn-secondary" id="tutorialPrev">← Previous</button>' : ''}
                <button class="tutorial-btn tutorial-btn-secondary" id="tutorialSkip">Skip Tour</button>
                <button class="tutorial-btn tutorial-btn-primary" id="tutorialNext">
                    ${stepIndex === this.steps.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
            </div>
        `;

        // Add CSS for tutorial buttons
        const style = document.createElement('style');
        style.textContent = `
            @keyframes tutorialFadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            .tutorial-tooltip[style*="center"] {
                transform: translate(-50%, -50%) !important;
            }

            .tutorial-buttons {
                display: flex;
                gap: var(--spacing-sm);
                justify-content: flex-end;
                flex-wrap: wrap;
            }

            .tutorial-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                border: none;
                border-radius: var(--radius-md);
                font-size: var(--font-size-sm);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                flex-shrink: 0;
            }

            .tutorial-btn-primary {
                background: var(--primary);
                color: white;
            }

            .tutorial-btn-primary:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            }

            .tutorial-btn-secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .tutorial-btn-secondary:hover {
                background: var(--bg-tertiary);
            }

            .tutorial-highlight {
                position: relative;
                z-index: 10000 !important;
                box-shadow: 0 0 0 4px var(--primary), 0 0 0 8px rgba(139, 92, 246, 0.3) !important;
                border-radius: var(--radius-md) !important;
            }

            /* Responsive styles for mobile and tablets */
            @media (max-width: 1024px) {
                .tutorial-tooltip {
                    max-width: calc(100vw - 40px) !important;
                    width: calc(100vw - 40px) !important;
                }

                .tutorial-buttons {
                    justify-content: stretch;
                }

                .tutorial-btn {
                    flex: 1;
                    min-width: 0;
                    padding: var(--spacing-sm) var(--spacing-md);
                }
            }

            @media (max-width: 768px) {
                .tutorial-btn#tutorialPrev {
                    flex-basis: 100%;
                    order: -1;
                }
            }

            @media (max-width: 480px) {
                .tutorial-buttons {
                    flex-direction: column;
                }

                .tutorial-btn {
                    width: 100%;
                }
            }
        `;

        if (!document.getElementById('tutorialStyles')) {
            style.id = 'tutorialStyles';
            document.head.appendChild(style);
        }

        document.body.appendChild(this.tooltip);

        // Attach event listeners
        const nextBtn = document.getElementById('tutorialNext');
        const prevBtn = document.getElementById('tutorialPrev');
        const skipBtn = document.getElementById('tutorialSkip');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skip());
        }

        // Add resize listener to reposition tooltip
        this.resizeHandler = () => {
            if (this.tooltip && step.target) {
                this.positionTooltip(step.target, step.position);
            }
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    positionTooltip(targetSelector, position) {
        const target = document.querySelector(targetSelector);
        if (!target) {
            // Fallback to center
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = target.getBoundingClientRect();

        // Get tooltip dimensions after it's been added to DOM
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Margins from viewport edges
        const margin = 20;

        // On mobile and small tablets, force bottom positioning for left/right tooltips to avoid overflow
        // Also check if the target is in the right sidebar of compose view (narrow space)
        const isMobile = viewportWidth < 1024; // Increased from 768 to 1024 for better tablet support
        const isInRightPanel = target.closest('.compose-right');

        if ((isMobile || isInRightPanel) && (position === 'left' || position === 'right')) {
            position = 'bottom';
        }

        let left, top, transform;

        switch (position) {
            case 'top':
                left = rect.left + rect.width / 2;
                top = rect.top - margin;
                transform = 'translate(-50%, -100%)';

                // Check if tooltip would overflow top
                if (top - tooltipHeight < margin) {
                    // Switch to bottom
                    top = rect.bottom + margin;
                    transform = 'translateX(-50%)';

                    // If bottom also overflows
                    if (top + tooltipHeight > viewportHeight - margin) {
                        // On large screens, center vertically; on mobile, keep at bottom with scroll
                        if (viewportWidth >= 1024) {
                            top = viewportHeight / 2;
                            transform = 'translate(-50%, -50%)';
                        } else {
                            // On mobile/tablet, constrain to bottom but allow scrolling
                            top = viewportHeight - tooltipHeight - margin;
                            transform = 'translateX(-50%)';
                        }
                    }
                }
                break;

            case 'bottom':
                left = rect.left + rect.width / 2;
                top = rect.bottom + margin;
                transform = 'translateX(-50%)';

                // Check if tooltip would overflow bottom
                if (top + tooltipHeight > viewportHeight - margin) {
                    // Switch to top
                    top = rect.top - margin;
                    transform = 'translate(-50%, -100%)';

                    // If top also overflows
                    if (top - tooltipHeight < margin) {
                        // On large screens, center vertically; on mobile, keep at top with scroll
                        if (viewportWidth >= 1024) {
                            top = viewportHeight / 2;
                            transform = 'translate(-50%, -50%)';
                        } else {
                            // On mobile/tablet, constrain to top but allow scrolling
                            top = margin + tooltipHeight / 2;
                            transform = 'translate(-50%, -50%)';
                        }
                    }
                }
                break;

            case 'left':
                left = rect.left - margin;
                top = rect.top + rect.height / 2;
                transform = 'translate(-100%, -50%)';

                // Check if tooltip would overflow left
                if (left - tooltipWidth < margin) {
                    // Try switching to right first
                    if (rect.right + margin + tooltipWidth < viewportWidth - margin) {
                        left = rect.right + margin;
                        transform = 'translateY(-50%)';
                    } else {
                        // If both sides don't work, use bottom
                        left = rect.left + rect.width / 2;
                        top = rect.bottom + margin;
                        transform = 'translateX(-50%)';

                        // Ensure it doesn't overflow bottom
                        if (top + tooltipHeight > viewportHeight - margin) {
                            // Try top instead
                            top = rect.top - margin;
                            transform = 'translate(-50%, -100%)';

                            // If top also overflows
                            if (top - tooltipHeight < margin) {
                                // On large screens, center in viewport; on mobile, keep at top
                                if (viewportWidth >= 1024) {
                                    top = viewportHeight / 2;
                                    left = viewportWidth / 2;
                                    transform = 'translate(-50%, -50%)';
                                } else {
                                    // On mobile, keep at top edge
                                    top = margin + tooltipHeight / 2;
                                    transform = 'translate(-50%, -50%)';
                                }
                            }
                        }
                    }
                }

                // For left/right positions, check vertical overflow
                if (transform.includes('translateY') || transform.includes('translate(-100%')) {
                    if (top - tooltipHeight / 2 < margin) {
                        top = margin + tooltipHeight / 2;
                    } else if (top + tooltipHeight / 2 > viewportHeight - margin) {
                        top = viewportHeight - margin - tooltipHeight / 2;
                    }
                }
                break;

            case 'right':
                left = rect.right + margin;
                top = rect.top + rect.height / 2;
                transform = 'translateY(-50%)';

                // Check if tooltip would overflow right
                if (left + tooltipWidth > viewportWidth - margin) {
                    // Try switching to left first
                    if (rect.left - margin - tooltipWidth > margin) {
                        left = rect.left - margin;
                        transform = 'translate(-100%, -50%)';
                    } else {
                        // If both sides don't work, use bottom
                        left = rect.left + rect.width / 2;
                        top = rect.bottom + margin;
                        transform = 'translateX(-50%)';

                        // Ensure it doesn't overflow bottom
                        if (top + tooltipHeight > viewportHeight - margin) {
                            // Try top instead
                            top = rect.top - margin;
                            transform = 'translate(-50%, -100%)';

                            // If top also overflows
                            if (top - tooltipHeight < margin) {
                                // On large screens, center in viewport; on mobile, keep at top
                                if (viewportWidth >= 1024) {
                                    top = viewportHeight / 2;
                                    left = viewportWidth / 2;
                                    transform = 'translate(-50%, -50%)';
                                } else {
                                    // On mobile, keep at top edge
                                    top = margin + tooltipHeight / 2;
                                    transform = 'translate(-50%, -50%)';
                                }
                            }
                        }
                    }
                }

                // For left/right positions, check vertical overflow
                if (transform.includes('translateY') || transform.includes('translate(-100%')) {
                    if (top - tooltipHeight / 2 < margin) {
                        top = margin + tooltipHeight / 2;
                    } else if (top + tooltipHeight / 2 > viewportHeight - margin) {
                        top = viewportHeight - margin - tooltipHeight / 2;
                    }
                }
                break;

            default:
                left = rect.left + rect.width / 2;
                top = rect.bottom + margin;
                transform = 'translateX(-50%)';
        }

        // Final boundary checks for horizontal positioning
        if (transform.includes('translateX(-50%)') || transform.includes('translate(-50%')) {
            // Check left boundary
            if (left - tooltipWidth / 2 < margin) {
                left = margin + tooltipWidth / 2;
            }
            // Check right boundary
            if (left + tooltipWidth / 2 > viewportWidth - margin) {
                left = viewportWidth - margin - tooltipWidth / 2;
            }
        }

        // Final boundary checks for vertical positioning - CRITICAL SAFETY NET
        // This ensures NO tooltip ever goes beyond viewport bounds
        if (transform === 'translateX(-50%)') {
            // Bottom-positioned tooltip
            if (top + tooltipHeight > viewportHeight - margin) {
                top = viewportHeight - tooltipHeight - margin;
            }
        } else if (transform === 'translate(-50%, -100%)') {
            // Top-positioned tooltip
            if (top - tooltipHeight < margin) {
                top = margin + tooltipHeight;
            }
        } else if (transform === 'translate(-50%, -50%)') {
            // Center-positioned tooltip
            if (top - tooltipHeight / 2 < margin) {
                top = margin + tooltipHeight / 2;
            }
            if (top + tooltipHeight / 2 > viewportHeight - margin) {
                top = viewportHeight - tooltipHeight / 2 - margin;
            }
        }

        // Apply positioning
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.transform = transform;
    }

    highlightTarget(targetSelector, shouldHighlight = false) {
        // Remove previous highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        if (!targetSelector || !shouldHighlight) return;

        const target = document.querySelector(targetSelector);
        if (target) {
            target.classList.add('tutorial-highlight');
        }
    }

    next() {
        this.showStep(this.currentStep + 1);
    }

    previous() {
        this.showStep(this.currentStep - 1);
    }

    skip() {
        const confirmed = confirm('Are you sure you want to skip the tutorial?');
        if (confirmed) {
            this.complete(true);
        }
    }

    complete(skipped = false) {
        this.isActive = false;

        // Remove resize handler
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        // Remove overlay and tooltip
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 300);
        }

        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }

        // Remove highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // Mark as completed
        if (!skipped) {
            localStorage.setItem('perfumer_tutorial_completed', 'true');
            if (window.toastManager) {
                toastManager.success('Tutorial completed! You\'re ready to create amazing fragrances.');
            }
        }

        // Return to dashboard
        app.switchTab('dashboard');
    }

    reset() {
        localStorage.removeItem('perfumer_tutorial_completed');
        if (window.toastManager) {
            toastManager.info('Tutorial progress reset. Click "Help" to restart the tutorial.');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize tutorial manager
window.tutorialManager = new TutorialManager();

// Check if this is first visit
document.addEventListener('DOMContentLoaded', () => {
    const hasSeenTutorial = localStorage.getItem('perfumer_tutorial_completed');

    // Auto-start tutorial for new users after a brief delay
    if (!hasSeenTutorial) {
        setTimeout(() => {
            const shouldStart = confirm(
                'Welcome to Perfumer\'s Organ! 🌸\n\n' +
                'Would you like a quick guided tour of the features?\n\n' +
                'This will only take 2-3 minutes.'
            );

            if (shouldStart) {
                tutorialManager.start();
            } else {
                localStorage.setItem('perfumer_tutorial_completed', 'true');
            }
        }, 1500);
    }
});
