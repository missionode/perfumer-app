// Composition Builder
class Composer {
    constructor() {
        this.formula = [];
        this.compositionName = 'Untitled Composition';
        this.isDropMode = true; // true = drops, false = ml
        this.DROPS_PER_ML = 20; // Standard conversion
        this.currentCompositionId = null;
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Measurement mode toggle
        const modeToggle = document.getElementById('measurementMode');
        if (modeToggle) {
            modeToggle.addEventListener('change', (e) => {
                this.isDropMode = !e.target.checked;
                this.updateDisplay();
            });
        }

        // Composition name input
        const nameInput = document.getElementById('compositionName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.compositionName = e.target.value || 'Untitled Composition';
            });
        }

        // Add ingredient to formula
        const addIngBtn = document.getElementById('addIngredientToFormula');
        if (addIngBtn) {
            addIngBtn.addEventListener('click', () => this.showIngredientPicker());
        }

        // Save composition
        const saveBtn = document.getElementById('saveComposition');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveComposition());
        }

        // Clear composition
        const clearBtn = document.getElementById('clearComposition');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearComposition());
        }

        // Export composition
        const exportBtn = document.getElementById('exportComposition');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportComposition());
        }
    }

    async showIngredientPicker() {
        try {
            const ingredients = await organManager.getIngredientsForPicker();

            if (ingredients.length === 0) {
                app.showError('No ingredients available. Add ingredients in the Organ tab first.');
                return;
            }

            // Create a simple picker (could be enhanced with a modal)
            const selected = prompt(
                'Enter ingredient name or number:\n\n' +
                ingredients.map((ing, idx) => `${idx + 1}. ${ing.name}`).join('\n')
            );

            if (!selected) return;

            // Try to parse as number first
            const num = parseInt(selected);
            let ingredient;

            if (!isNaN(num) && num > 0 && num <= ingredients.length) {
                ingredient = ingredients[num - 1];
            } else {
                // Search by name
                ingredient = ingredients.find(ing =>
                    ing.name.toLowerCase().includes(selected.toLowerCase())
                );
            }

            if (ingredient) {
                this.addIngredientToFormula(ingredient);
            } else {
                app.showError('Ingredient not found');
            }
        } catch (error) {
            console.error('Failed to show ingredient picker:', error);
            app.showError('Failed to load ingredients');
        }
    }

    addIngredientToFormula(ingredient) {
        // Check if already in formula
        const existing = this.formula.find(item => item.ingredient.id === ingredient.id);

        if (existing) {
            // Increase amount
            existing.amount += this.isDropMode ? 1 : 0.05;
        } else {
            // Add new
            this.formula.push({
                ingredient: ingredient,
                amount: this.isDropMode ? 1 : 0.05 // 1 drop or 0.05 ml
            });
        }

        this.updateDisplay();
    }

    removeIngredientFromFormula(ingredientId) {
        this.formula = this.formula.filter(item => item.ingredient.id !== ingredientId);
        this.updateDisplay();
    }

    updateIngredientAmount(ingredientId, change) {
        const item = this.formula.find(item => item.ingredient.id === ingredientId);
        if (!item) return;

        const increment = this.isDropMode ? 1 : 0.05;
        item.amount += change * increment;

        // Ensure minimum of 1 drop or 0.05ml
        if (item.amount < increment) {
            item.amount = increment;
        }

        this.updateDisplay();
    }

    updateDisplay() {
        this.renderFormula();
        this.calculateTotals();
        this.calculateBalance();
        this.calculateHarmony();
        this.updateMiniWheel();
    }

    renderFormula() {
        const formulaList = document.getElementById('formulaList');
        if (!formulaList) return;

        if (this.formula.length === 0) {
            formulaList.innerHTML = '<p class="empty-state">Add ingredients to start building your composition</p>';
            return;
        }

        formulaList.innerHTML = this.formula.map(item => {
            const displayAmount = this.isDropMode
                ? Math.round(item.amount)
                : item.amount.toFixed(2);

            const unit = this.isDropMode ? 'drops' : 'ml';
            const percentage = this.calculatePercentage(item.amount);
            const cost = this.calculateItemCost(item);

            return `
                <div class="formula-item">
                    <div class="formula-item-info">
                        <div class="formula-item-name">${this.escapeHtml(item.ingredient.name)}</div>
                        <div class="formula-item-meta">
                            ${percentage.toFixed(1)}% • ${app.formatPrice(cost)} • ${item.ingredient.noteType}
                        </div>
                    </div>
                    <div class="formula-item-controls">
                        <div class="formula-item-amount">
                            <button class="amount-btn" onclick="composer.updateIngredientAmount('${item.ingredient.id}', -1)">-</button>
                            <span class="amount-value">${displayAmount} ${unit}</span>
                            <button class="amount-btn" onclick="composer.updateIngredientAmount('${item.ingredient.id}', 1)">+</button>
                        </div>
                        <button class="formula-item-remove" onclick="composer.removeIngredientFromFormula('${item.ingredient.id}')">
                            ×
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculatePercentage(amount) {
        const total = this.formula.reduce((sum, item) => sum + item.amount, 0);
        return total > 0 ? (amount / total) * 100 : 0;
    }

    calculateItemCost(item) {
        const ml = this.isDropMode ? item.amount / this.DROPS_PER_ML : item.amount;
        return ml * (item.ingredient.pricePerMl || 0);
    }

    calculateTotals() {
        const totalAmountRaw = this.formula.reduce((sum, item) => sum + item.amount, 0);
        const totalCost = this.formula.reduce((sum, item) => sum + this.calculateItemCost(item), 0);

        let totalDisplay, totalMl;

        if (this.isDropMode) {
            totalDisplay = `${Math.round(totalAmountRaw)} drops`;
            totalMl = totalAmountRaw / this.DROPS_PER_ML;
        } else {
            totalDisplay = `${totalAmountRaw.toFixed(2)} ml`;
            totalMl = totalAmountRaw;
        }

        const costPerMl = totalMl > 0 ? totalCost / totalMl : 0;

        // Update UI
        document.getElementById('totalAmount').textContent = totalDisplay;
        document.getElementById('totalCost').textContent = app.formatPrice(totalCost);
        document.getElementById('costPerMl').textContent = app.formatPrice(costPerMl);

        return { totalAmountRaw, totalMl, totalCost, costPerMl };
    }

    calculateBalance() {
        const noteTypes = { top: 0, middle: 0, base: 0 };

        this.formula.forEach(item => {
            const noteType = item.ingredient.noteType || 'middle';
            noteTypes[noteType] += item.amount;
        });

        const total = noteTypes.top + noteTypes.middle + noteTypes.base;

        if (total === 0) {
            // Reset bars
            document.getElementById('topNoteBar').style.width = '0%';
            document.getElementById('middleNoteBar').style.width = '0%';
            document.getElementById('baseNoteBar').style.width = '0%';
            document.getElementById('topNotePercent').textContent = '0%';
            document.getElementById('middleNotePercent').textContent = '0%';
            document.getElementById('baseNotePercent').textContent = '0%';
            return;
        }

        const topPercent = (noteTypes.top / total) * 100;
        const middlePercent = (noteTypes.middle / total) * 100;
        const basePercent = (noteTypes.base / total) * 100;

        // Update bars
        document.getElementById('topNoteBar').style.width = `${topPercent}%`;
        document.getElementById('middleNoteBar').style.width = `${middlePercent}%`;
        document.getElementById('baseNoteBar').style.width = `${basePercent}%`;

        document.getElementById('topNotePercent').textContent = `${topPercent.toFixed(0)}%`;
        document.getElementById('middleNotePercent').textContent = `${middlePercent.toFixed(0)}%`;
        document.getElementById('baseNotePercent').textContent = `${basePercent.toFixed(0)}%`;

        // Provide suggestions
        const suggestions = document.getElementById('balanceSuggestions');
        if (suggestions) {
            let message = 'Ideal ratios: Top 20-30%, Middle 40-50%, Base 20-30%';

            if (topPercent < 15 || topPercent > 35) {
                message = '⚠️ Top notes are outside ideal range (20-30%)';
            } else if (middlePercent < 35 || middlePercent > 55) {
                message = '⚠️ Middle notes are outside ideal range (40-50%)';
            } else if (basePercent < 15 || basePercent > 35) {
                message = '⚠️ Base notes are outside ideal range (20-30%)';
            } else {
                message = '✓ Excellent note balance!';
            }

            suggestions.innerHTML = `<p class="suggestion-text">${message}</p>`;
        }

        return { topPercent, middlePercent, basePercent };
    }

    calculateHarmony() {
        if (this.formula.length === 0) {
            document.getElementById('harmonyScore').textContent = '0';
            document.getElementById('harmonyMessage').textContent = 'Add ingredients to calculate harmony';
            this.updateHarmonyCircle(0);
            return;
        }

        // Calculate harmony based on family compatibility
        const wheel = app.getFragranceWheel();
        if (!wheel || !wheel.compatibility) {
            return;
        }

        let compatiblePairs = 0;
        let totalPairs = 0;

        // Check all ingredient pairs
        for (let i = 0; i < this.formula.length; i++) {
            for (let j = i + 1; j < this.formula.length; j++) {
                const family1 = this.formula[i].ingredient.family;
                const family2 = this.formula[j].ingredient.family;

                totalPairs++;

                // Same family is always compatible
                if (family1 === family2) {
                    compatiblePairs++;
                } else {
                    // Check compatibility matrix
                    const compatible = wheel.compatibility[family1];
                    if (compatible && compatible.includes(family2)) {
                        compatiblePairs++;
                    }
                }
            }
        }

        const harmonyScore = totalPairs > 0 ? Math.round((compatiblePairs / totalPairs) * 100) : 100;

        // Update UI
        document.getElementById('harmonyScore').textContent = harmonyScore;

        let message = '';
        if (harmonyScore >= 90) {
            message = '✓ Excellent harmony! These notes work beautifully together.';
        } else if (harmonyScore >= 75) {
            message = '✓ Good harmony. Well-balanced composition.';
        } else if (harmonyScore >= 60) {
            message = '⚠️ Moderate harmony. Consider adjusting some notes.';
        } else {
            message = '⚠️ Low harmony. Some ingredients may clash.';
        }

        document.getElementById('harmonyMessage').textContent = message;
        this.updateHarmonyCircle(harmonyScore);

        return harmonyScore;
    }

    updateHarmonyCircle(score) {
        const circle = document.querySelector('.harmony-circle');
        if (!circle) return;

        const gradient = `conic-gradient(var(--primary) ${score}%, var(--bg-tertiary) ${score}%)`;
        circle.style.background = gradient;
    }

    updateMiniWheel() {
        if (window.wheelRenderer) {
            wheelRenderer.renderMiniWheel('miniWheelCanvas', this.formula.map(item => item.ingredient));
        }
    }

    async saveComposition() {
        if (this.formula.length === 0) {
            app.showError('Cannot save empty composition');
            return;
        }

        const totals = this.calculateTotals();
        const balance = this.calculateBalance();
        const harmonyScore = this.calculateHarmony();

        const composition = {
            name: this.compositionName,
            mode: this.isDropMode ? 'drops' : 'ml',
            ingredients: this.formula.map(item => ({
                ingredientId: item.ingredient.id,
                ingredientName: item.ingredient.name,
                amount: item.amount,
                percentage: this.calculatePercentage(item.amount),
                cost: this.calculateItemCost(item)
            })),
            totals: {
                drops: this.isDropMode ? Math.round(totals.totalAmountRaw) : Math.round(totals.totalMl * this.DROPS_PER_ML),
                ml: totals.totalMl,
                cost: totals.totalCost,
                costPerMl: totals.costPerMl
            },
            balance: balance,
            harmonyScore: harmonyScore
        };

        try {
            if (this.currentCompositionId) {
                // Update existing
                composition.id = this.currentCompositionId;
                const existing = await db.get('compositions', this.currentCompositionId);
                composition.version = (existing.version || 1) + 1;
                composition.created = existing.created;
                await db.updateComposition(composition);
                app.showSuccess('Composition updated successfully');
            } else {
                // Create new
                await db.addComposition(composition);
                app.showSuccess('Composition saved successfully');
            }

            await app.refreshDashboard();
        } catch (error) {
            console.error('Failed to save composition:', error);
            app.showError('Failed to save composition');
        }
    }

    async loadComposition(composition) {
        this.currentCompositionId = composition.id;
        this.compositionName = composition.name;

        // Update name input
        const nameInput = document.getElementById('compositionName');
        if (nameInput) {
            nameInput.value = composition.name;
        }

        // Set mode
        this.isDropMode = composition.mode === 'drops';
        const modeToggle = document.getElementById('measurementMode');
        if (modeToggle) {
            modeToggle.checked = !this.isDropMode;
        }

        // Load ingredients
        this.formula = [];
        for (const item of composition.ingredients) {
            const ingredient = await db.get('ingredients', item.ingredientId);
            if (ingredient) {
                this.formula.push({
                    ingredient: ingredient,
                    amount: item.amount
                });
            }
        }

        this.updateDisplay();
    }

    clearComposition() {
        if (this.formula.length > 0 && !confirm('Clear current composition?')) {
            return;
        }

        this.formula = [];
        this.compositionName = 'Untitled Composition';
        this.currentCompositionId = null;

        const nameInput = document.getElementById('compositionName');
        if (nameInput) {
            nameInput.value = 'Untitled Composition';
        }

        this.updateDisplay();
    }

    async exportComposition() {
        if (this.formula.length === 0) {
            app.showError('Nothing to export');
            return;
        }

        const totals = this.calculateTotals();
        const balance = this.calculateBalance();
        const harmonyScore = this.calculateHarmony();

        const exportData = {
            name: this.compositionName,
            exportDate: new Date().toISOString(),
            mode: this.isDropMode ? 'drops' : 'ml',
            ingredients: this.formula.map(item => ({
                name: item.ingredient.name,
                family: item.ingredient.family,
                noteType: item.ingredient.noteType,
                amount: item.amount,
                percentage: this.calculatePercentage(item.amount).toFixed(2),
                cost: this.calculateItemCost(item).toFixed(2)
            })),
            totals: {
                drops: Math.round(totals.totalMl * this.DROPS_PER_ML),
                ml: totals.totalMl.toFixed(2),
                cost: totals.totalCost.toFixed(2),
                costPerMl: totals.costPerMl.toFixed(2)
            },
            balance: {
                top: balance.topPercent.toFixed(1) + '%',
                middle: balance.middlePercent.toFixed(1) + '%',
                base: balance.basePercent.toFixed(1) + '%'
            },
            harmonyScore: harmonyScore
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.compositionName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    refresh() {
        this.updateDisplay();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Library Manager (for viewing saved compositions)
class LibraryManager {
    constructor() {
        this.compositions = [];
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const searchInput = document.getElementById('librarySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCompositions(e.target.value);
            });
        }

        const importBtn = document.getElementById('importCompositionsBtn');
        const exportBtn = document.getElementById('exportAllCompositionsBtn');

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importCompositions());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAllCompositions());
        }
    }

    async refreshLibrary() {
        this.compositions = await db.getAllCompositions();
        this.renderLibrary(this.compositions);
    }

    searchCompositions(query) {
        if (!query) {
            this.renderLibrary(this.compositions);
            return;
        }

        const filtered = this.compositions.filter(comp =>
            comp.name.toLowerCase().includes(query.toLowerCase())
        );

        this.renderLibrary(filtered);
    }

    renderLibrary(compositions) {
        const library = document.getElementById('compositionLibrary');
        if (!library) return;

        if (compositions.length === 0) {
            library.innerHTML = '<p class="empty-state">No saved compositions yet. Create one in the Compose tab!</p>';
            return;
        }

        library.innerHTML = compositions.map(comp => `
            <div class="composition-card">
                <div class="card-header">
                    <h3 class="card-title">${this.escapeHtml(comp.name)}</h3>
                    <span class="card-badge">v${comp.version || 1}</span>
                </div>
                <div class="card-info">
                    <div class="card-row">
                        <span>Ingredients:</span>
                        <span>${comp.ingredients.length}</span>
                    </div>
                    <div class="card-row">
                        <span>Total:</span>
                        <span>${comp.totals.ml.toFixed(2)} ml (${comp.totals.drops} drops)</span>
                    </div>
                    <div class="card-row">
                        <span>Cost:</span>
                        <span>${app.formatPrice(comp.totals.cost)}</span>
                    </div>
                    <div class="card-row">
                        <span>Harmony:</span>
                        <span>${comp.harmonyScore}%</span>
                    </div>
                    <div class="card-row">
                        <span>Created:</span>
                        <span>${new Date(comp.created).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="libraryManager.loadComposition('${comp.id}')">
                        📝 Edit
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="libraryManager.duplicateComposition('${comp.id}')">
                        📋 Duplicate
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="libraryManager.deleteComposition('${comp.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadComposition(id) {
        const composition = await db.get('compositions', id);
        if (composition && window.composer) {
            composer.loadComposition(composition);
            app.switchTab('compose');
        }
    }

    async duplicateComposition(id) {
        const composition = await db.get('compositions', id);
        if (!composition) return;

        const duplicate = { ...composition };
        delete duplicate.id;
        duplicate.name = composition.name + ' (Copy)';
        duplicate.version = 1;

        await db.addComposition(duplicate);
        await this.refreshLibrary();
        app.showSuccess('Composition duplicated');
    }

    async deleteComposition(id) {
        if (!confirm('Delete this composition?')) return;

        await db.deleteComposition(id);
        await this.refreshLibrary();
        await app.refreshDashboard();
        app.showSuccess('Composition deleted');
    }

    async importCompositions() {
        // Similar to ingredient import
        alert('Import functionality - to be implemented');
    }

    async exportAllCompositions() {
        const data = await db.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfumer-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
window.composer = new Composer();
window.libraryManager = new LibraryManager();
