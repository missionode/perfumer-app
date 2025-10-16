// Fragrance Wheel Renderer
class WheelRenderer {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.wheelData = null;
        this.selectedFamily = null;
        this.selectedFamilies = new Set(); // Track multiple selected families
        this.stagingIngredients = []; // Ingredients ready for composition
        this.svgNS = 'http://www.w3.org/2000/svg';
        this.centerX = 300;
        this.centerY = 300;
        this.outerRadius = 250;
        this.innerRadius = 80;
        this.middleRadius = 165;
        this.init();
    }

    async init() {
        this.attachEventListeners();

        // Wait for app to be ready
        if (!window.app || !app.fragranceWheel) {
            console.log('Waiting for app to initialize...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.wheelData = app.getFragranceWheel();
        if (!this.wheelData) {
            console.error('No fragrance wheel data available');
            return;
        }
        console.log('Wheel data loaded:', this.wheelData.families.length, 'families');
    }

    attachEventListeners() {
        // Create Composition button
        const createBtn = document.getElementById('createCompositionBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.transferToComposer());
        }

        // Clear Staging button
        const clearBtn = document.getElementById('clearStagingBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearStaging());
        }
    }

    render() {
        console.log('Render called, wheelData:', !!this.wheelData);
        if (!this.wheelData) {
            this.init().then(() => {
                if (this.wheelData) {
                    this.drawWheel();
                }
            });
        } else {
            this.drawWheel();
        }
    }

    drawWheel() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.error('Canvas element not found:', this.canvasId);
            return;
        }

        if (!this.wheelData || !this.wheelData.families) {
            console.error('Wheel data not available for drawing');
            return;
        }

        console.log('Drawing wheel with', this.wheelData.families.length, 'families');

        // Clear existing content
        canvas.innerHTML = '';

        // Create SVG element
        const svg = document.createElementNS(this.svgNS, 'svg');
        svg.setAttribute('width', '600');
        svg.setAttribute('height', '600');
        svg.setAttribute('viewBox', '0 0 600 600');
        svg.classList.add('wheel-svg');

        const families = this.wheelData.families;
        const familyCount = families.length;
        const anglePerFamily = 360 / familyCount;

        // Draw each family segment
        families.forEach((family, index) => {
            const startAngle = index * anglePerFamily;
            const endAngle = (index + 1) * anglePerFamily;

            // Draw main family segment
            this.drawSegment(
                svg,
                this.centerX,
                this.centerY,
                this.middleRadius,
                this.outerRadius,
                startAngle,
                endAngle,
                family.color,
                family,
                'family'
            );

            // Draw subfamily segments if they exist
            if (family.subfamilies && family.subfamilies.length > 0) {
                const subfamilyAngle = anglePerFamily / family.subfamilies.length;

                family.subfamilies.forEach((subfamily, subIndex) => {
                    const subStartAngle = startAngle + (subIndex * subfamilyAngle);
                    const subEndAngle = subStartAngle + subfamilyAngle;

                    this.drawSegment(
                        svg,
                        this.centerX,
                        this.centerY,
                        this.innerRadius,
                        this.middleRadius,
                        subStartAngle,
                        subEndAngle,
                        this.lightenColor(family.color, 30),
                        { ...subfamily, parentFamily: family },
                        'subfamily'
                    );

                    // Add subfamily text
                    this.addText(
                        svg,
                        this.centerX,
                        this.centerY,
                        (this.innerRadius + this.middleRadius) / 2,
                        (subStartAngle + subEndAngle) / 2,
                        subfamily.name,
                        'wheel-subfamily-text'
                    );
                });
            }

            // Add family name text
            this.addText(
                svg,
                this.centerX,
                this.centerY,
                (this.middleRadius + this.outerRadius) / 2,
                (startAngle + endAngle) / 2,
                family.name,
                'wheel-text'
            );
        });

        // Draw center circle
        const centerCircle = document.createElementNS(this.svgNS, 'circle');
        centerCircle.setAttribute('cx', this.centerX);
        centerCircle.setAttribute('cy', this.centerY);
        centerCircle.setAttribute('r', this.innerRadius);
        centerCircle.classList.add('wheel-center');
        svg.appendChild(centerCircle);

        // Add center text
        const centerText = document.createElementNS(this.svgNS, 'text');
        centerText.setAttribute('x', this.centerX);
        centerText.setAttribute('y', this.centerY);
        centerText.classList.add('wheel-center-text');
        centerText.textContent = 'Fragrance';
        svg.appendChild(centerText);

        const centerText2 = document.createElementNS(this.svgNS, 'text');
        centerText2.setAttribute('x', this.centerX);
        centerText2.setAttribute('y', this.centerY + 20);
        centerText2.classList.add('wheel-center-text');
        centerText2.textContent = 'Wheel';
        svg.appendChild(centerText2);

        canvas.appendChild(svg);

        // Draw legend
        this.drawLegend();
    }

    drawSegment(svg, cx, cy, innerR, outerR, startAngle, endAngle, color, data, type) {
        const path = this.createArcPath(cx, cy, innerR, outerR, startAngle, endAngle);

        const pathElement = document.createElementNS(this.svgNS, 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('fill', color);
        pathElement.classList.add('wheel-segment');
        pathElement.dataset.type = type;
        pathElement.dataset.id = data.id;

        // Add event listeners
        pathElement.addEventListener('click', () => this.onSegmentClick(data, type));
        pathElement.addEventListener('mouseenter', (e) => this.onSegmentHover(e, data, type));
        pathElement.addEventListener('mouseleave', () => this.onSegmentLeave());

        svg.appendChild(pathElement);
    }

    createArcPath(cx, cy, innerR, outerR, startAngle, endAngle) {
        const startAngleRad = (startAngle - 90) * Math.PI / 180;
        const endAngleRad = (endAngle - 90) * Math.PI / 180;

        const x1 = cx + innerR * Math.cos(startAngleRad);
        const y1 = cy + innerR * Math.sin(startAngleRad);
        const x2 = cx + outerR * Math.cos(startAngleRad);
        const y2 = cy + outerR * Math.sin(startAngleRad);
        const x3 = cx + outerR * Math.cos(endAngleRad);
        const y3 = cy + outerR * Math.sin(endAngleRad);
        const x4 = cx + innerR * Math.cos(endAngleRad);
        const y4 = cy + innerR * Math.sin(endAngleRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `
            M ${x1} ${y1}
            L ${x2} ${y2}
            A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}
            L ${x4} ${y4}
            A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}
            Z
        `;
    }

    addText(svg, cx, cy, radius, angle, text, className) {
        const angleRad = (angle - 90) * Math.PI / 180;
        const x = cx + radius * Math.cos(angleRad);
        const y = cy + radius * Math.sin(angleRad);

        const textElement = document.createElementNS(this.svgNS, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('transform', `rotate(${angle}, ${x}, ${y})`);
        textElement.classList.add(className);
        textElement.textContent = text;

        svg.appendChild(textElement);
    }

    async onSegmentClick(data, type) {
        let familyId;

        if (type === 'family') {
            familyId = data.id;
            this.selectedFamily = familyId;
        } else if (type === 'subfamily') {
            // For subfamily, use parent family
            familyId = data.parentFamily.id;
            this.selectedFamily = familyId;
        }

        // Add to selected families set
        this.selectedFamilies.add(familyId);

        // Update info panel
        const infoPanel = document.getElementById('wheelInfo');
        if (!infoPanel) return;

        let html = '';

        if (type === 'family') {
            const compatible = app.getCompatibleFamilies(data.id);

            html = `
                <h3>${data.name}</h3>
                <p>${data.description || ''}</p>
                ${data.subfamilies ? `
                    <div style="margin-top: 1rem;">
                        <strong>Subfamilies:</strong>
                        <ul style="margin-top: 0.5rem;">
                            ${data.subfamilies.map(sub => `<li>${sub.name}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${compatible.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <strong>Compatible with:</strong>
                        <div class="compatible-tags" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                            ${compatible.map(c => {
                                const familyName = app.getFamilyName(c);
                                return `<span class="compatible-tag">${familyName}</span>`;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        } else if (type === 'subfamily') {
            html = `
                <h3>${data.name}</h3>
                <p><strong>Family:</strong> ${data.parentFamily.name}</p>
                <p>${data.description || ''}</p>
                ${data.notes ? `
                    <div style="margin-top: 1rem;">
                        <strong>Common notes:</strong>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                            ${data.notes.map(note => `
                                <span class="compatible-tag">${note}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }

        infoPanel.innerHTML = html;

        // Show family ingredients
        await this.showFamilyIngredients(familyId);

        // Show staging area
        this.showStagingArea();
    }

    onSegmentHover(event, data, type) {
        // Create or update tooltip
        let tooltip = document.getElementById('wheelTooltip');

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'wheelTooltip';
            tooltip.className = 'wheel-tooltip';
            document.body.appendChild(tooltip);
        }

        // Build tooltip content
        let content = '';
        if (type === 'family') {
            const compatible = app.getCompatibleFamilies(data.id);
            content = `
                <h4>${data.name}</h4>
                <p>${data.description || 'Fragrance family'}</p>
                ${compatible.length > 0 ? `
                    <div class="compatible-list">
                        <strong>Compatible with:</strong>
                        <div class="compatible-tags">
                            ${compatible.map(c => {
                                const familyName = app.getFamilyName(c);
                                return `<span class="compatible-tag">${familyName}</span>`;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        } else if (type === 'subfamily') {
            content = `
                <h4>${data.name}</h4>
                <p style="font-size: 0.9rem;"><strong>Family:</strong> ${data.parentFamily.name}</p>
                <p>${data.description || ''}</p>
                ${data.notes && data.notes.length > 0 ? `
                    <div class="compatible-list">
                        <strong>Common notes:</strong>
                        <div class="compatible-tags">
                            ${data.notes.slice(0, 5).map(note => `
                                <span class="compatible-tag">${note}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }

        tooltip.innerHTML = content;

        // Get canvas element and its center position
        const canvas = document.getElementById(this.canvasId);
        if (canvas) {
            const rect = canvas.getBoundingClientRect();

            // Calculate center of canvas
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Position tooltip at center, accounting for tooltip size
            // We need to offset by half the tooltip width/height to truly center it
            tooltip.style.left = centerX + 'px';
            tooltip.style.top = centerY + 'px';
            tooltip.style.transform = 'translate(-50%, -50%)';
        }

        tooltip.classList.add('visible');

        // Track mouse movement
        this.currentTooltip = tooltip;
    }

    onSegmentLeave() {
        const tooltip = document.getElementById('wheelTooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    drawLegend() {
        const wheelInfo = document.getElementById('wheelInfo');
        if (!wheelInfo) return;

        // Legend is now part of the info panel and updates on click
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    renderMiniWheel(canvasId, activeIngredients = []) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !this.wheelData) return;

        // Clear existing
        canvas.innerHTML = '';

        // Create smaller SVG
        const svg = document.createElementNS(this.svgNS, 'svg');
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '200');
        svg.setAttribute('viewBox', '0 0 200 200');
        svg.classList.add('mini-wheel-svg');

        const cx = 100;
        const cy = 100;
        const radius = 80;

        const families = this.wheelData.families;
        const familyCount = families.length;
        const anglePerFamily = 360 / familyCount;

        // Count ingredients per family
        const familyCounts = {};
        activeIngredients.forEach(ing => {
            familyCounts[ing.family] = (familyCounts[ing.family] || 0) + 1;
        });

        // Draw segments
        families.forEach((family, index) => {
            const startAngle = index * anglePerFamily - 90;
            const endAngle = (index + 1) * anglePerFamily - 90;

            const startRad = startAngle * Math.PI / 180;
            const endRad = endAngle * Math.PI / 180;

            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);

            const largeArc = anglePerFamily > 180 ? 1 : 0;

            const path = `
                M ${cx} ${cy}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
            `;

            const pathElement = document.createElementNS(this.svgNS, 'path');
            pathElement.setAttribute('d', path);
            pathElement.setAttribute('fill', family.color);
            pathElement.classList.add('mini-wheel-segment');

            if (familyCounts[family.id]) {
                pathElement.classList.add('active');
            }

            svg.appendChild(pathElement);
        });

        // Center circle
        const centerCircle = document.createElementNS(this.svgNS, 'circle');
        centerCircle.setAttribute('cx', cx);
        centerCircle.setAttribute('cy', cy);
        centerCircle.setAttribute('r', '30');
        centerCircle.setAttribute('fill', 'var(--bg-card)');
        svg.appendChild(centerCircle);

        canvas.appendChild(svg);
    }

    // Staging Area Methods
    async showFamilyIngredients(familyId) {
        const familyIngredientsSection = document.getElementById('familyIngredients');
        const familyIngredientList = document.getElementById('familyIngredientList');

        if (!familyIngredientsSection || !familyIngredientList) return;

        // Get all ingredients from organ
        const allIngredients = await db.getAllIngredients();

        // Filter by family
        const familyIngredients = allIngredients.filter(ing => ing.family === familyId);

        if (familyIngredients.length === 0) {
            familyIngredientList.innerHTML = '<p class="empty-state">No ingredients available in this family</p>';
            familyIngredientsSection.style.display = 'block';
            return;
        }

        // Render ingredients
        familyIngredientList.innerHTML = familyIngredients.map(ing => {
            const isInStaging = this.stagingIngredients.some(s => s.id === ing.id);
            return `
                <div class="family-ingredient-item" data-id="${ing.id}">
                    <div class="family-ingredient-info">
                        <div class="family-ingredient-name">${this.escapeHtml(ing.name)}</div>
                        <div class="family-ingredient-meta">
                            ${ing.noteType} • Intensity: ${ing.intensity}/10
                        </div>
                    </div>
                    <button class="family-ingredient-add"
                            ${isInStaging ? 'disabled' : ''}
                            onclick="wheelRenderer.addToStaging('${ing.id}')">
                        ${isInStaging ? 'Added' : '+ Add'}
                    </button>
                </div>
            `;
        }).join('');

        familyIngredientsSection.style.display = 'block';
    }

    async addToStaging(ingredientId) {
        // Get ingredient data
        const ingredient = await db.get('ingredients', ingredientId);
        if (!ingredient) return;

        // Check if already in staging
        if (this.stagingIngredients.some(s => s.id === ingredientId)) {
            return;
        }

        // Add to staging
        this.stagingIngredients.push(ingredient);

        // Update displays
        this.renderStagingList();
        this.calculateStagingHarmony();

        // Refresh family ingredients to update buttons
        if (this.selectedFamily) {
            await this.showFamilyIngredients(this.selectedFamily);
        }
    }

    removeFromStaging(ingredientId) {
        // Remove from staging array
        this.stagingIngredients = this.stagingIngredients.filter(ing => ing.id !== ingredientId);

        // Update displays
        this.renderStagingList();
        this.calculateStagingHarmony();

        // Refresh family ingredients to update buttons
        if (this.selectedFamily) {
            this.showFamilyIngredients(this.selectedFamily);
        }
    }

    showStagingArea() {
        const stagingArea = document.getElementById('stagingArea');
        if (stagingArea) {
            stagingArea.style.display = 'block';
        }
        this.renderStagingList();
    }

    renderStagingList() {
        const stagingList = document.getElementById('stagingList');
        const createBtn = document.getElementById('createCompositionBtn');

        if (!stagingList) return;

        if (this.stagingIngredients.length === 0) {
            stagingList.innerHTML = '<p class="empty-state">Select ingredients from families above to start composing</p>';
            if (createBtn) createBtn.disabled = true;
            return;
        }

        stagingList.innerHTML = this.stagingIngredients.map(ing => {
            const familyColor = app.getFamilyColor(ing.family);
            const familyName = app.getFamilyName(ing.family);

            return `
                <div class="staging-item" data-id="${ing.id}">
                    <div class="staging-item-info">
                        <div class="staging-item-family-indicator" style="background: ${familyColor};"></div>
                        <div class="staging-item-details">
                            <div class="staging-item-name">${this.escapeHtml(ing.name)}</div>
                            <div class="staging-item-meta">
                                ${familyName} • ${ing.noteType} • ${ing.intensity}/10
                            </div>
                        </div>
                    </div>
                    <button class="staging-item-remove" onclick="wheelRenderer.removeFromStaging('${ing.id}')">
                        Remove
                    </button>
                </div>
            `;
        }).join('');

        if (createBtn) createBtn.disabled = false;
    }

    calculateStagingHarmony() {
        const harmonyScoreEl = document.getElementById('stagingHarmonyScore');
        if (!harmonyScoreEl) return;

        if (this.stagingIngredients.length === 0) {
            harmonyScoreEl.textContent = '0%';
            return;
        }

        // Simplified harmony calculation
        // Count families present
        const familiesUsed = new Set(this.stagingIngredients.map(ing => ing.family));

        if (familiesUsed.size === 1) {
            // Single family = good harmony
            harmonyScoreEl.textContent = '85%';
            return;
        }

        // Check compatibility between families
        let compatibilityScore = 0;
        let comparisons = 0;

        const familiesArray = Array.from(familiesUsed);
        for (let i = 0; i < familiesArray.length; i++) {
            for (let j = i + 1; j < familiesArray.length; j++) {
                comparisons++;
                const compatible = app.getCompatibleFamilies(familiesArray[i]);
                if (compatible.includes(familiesArray[j])) {
                    compatibilityScore++;
                }
            }
        }

        const harmonyPercent = comparisons > 0 ? Math.round((compatibilityScore / comparisons) * 100) : 50;
        harmonyScoreEl.textContent = `${harmonyPercent}%`;
    }

    async clearStaging() {
        if (this.stagingIngredients.length === 0) return;

        const confirmed = await toastManager.confirm(
            'Clear all selected ingredients from staging area?',
            'Clear Staging'
        );

        if (!confirmed) return;

        this.stagingIngredients = [];
        this.renderStagingList();
        this.calculateStagingHarmony();

        // Refresh family ingredients if any family is selected
        if (this.selectedFamily) {
            this.showFamilyIngredients(this.selectedFamily);
        }
    }

    async transferToComposer() {
        if (this.stagingIngredients.length === 0) return;

        // Check if composer has existing ingredients
        if (window.composer && composer.formula.length > 0) {
            const confirmed = await toastManager.confirm(
                'The composition builder already has ingredients. Do you want to replace them with the staged ingredients?',
                'Replace Composition'
            );

            if (!confirmed) return;
        }

        // Switch to compose tab
        app.switchTab('compose');

        // Transfer ingredients to composer
        if (window.composer) {
            // Clear existing composition
            composer.clearComposition();

            // Add each staged ingredient
            for (const ingredient of this.stagingIngredients) {
                await composer.addIngredientToFormula(ingredient);
            }

            app.showSuccess(`Added ${this.stagingIngredients.length} ingredients to composition`);

            // Clear staging
            this.stagingIngredients = [];
            this.renderStagingList();
            this.calculateStagingHarmony();
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize wheel renderer
window.wheelRenderer = new WheelRenderer('wheelCanvas');
console.log('WheelRenderer created');
