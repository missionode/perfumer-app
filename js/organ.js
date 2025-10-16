// Ingredient Organ Manager
class OrganManager {
    constructor() {
        this.allIngredients = [];
        this.filteredIngredients = [];
        this.selectedIngredients = new Set();
        this.currentFilters = {
            search: '',
            family: '',
            noteType: '',
            sortBy: 'name'
        };
        this.editingIngredient = null;
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Add ingredient button
        const addBtn = document.getElementById('addIngredientBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddIngredientModal());
        }

        // Search input
        const searchInput = document.getElementById('organSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Family filter
        const familyFilter = document.getElementById('familyFilter');
        if (familyFilter) {
            familyFilter.addEventListener('change', (e) => {
                this.currentFilters.family = e.target.value;
                this.applyFilters();
            });
        }

        // Note type filter
        const noteTypeFilter = document.getElementById('noteTypeFilter');
        if (noteTypeFilter) {
            noteTypeFilter.addEventListener('change', (e) => {
                this.currentFilters.noteType = e.target.value;
                this.applyFilters();
            });
        }

        // Sort by
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Ingredient form
        const form = document.getElementById('ingredientForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Family select change to populate subfamilies
        const familySelect = document.getElementById('ingredientFamily');
        if (familySelect) {
            familySelect.addEventListener('change', (e) => {
                this.updateSubfamilyOptions(e.target.value);
            });
        }

        // Import/Export buttons
        const importBtn = document.getElementById('importIngredientsBtn');
        const exportBtn = document.getElementById('exportIngredientsBtn');

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importIngredients());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportIngredients());
        }

        // Bulk actions
        const selectAllBtn = document.getElementById('selectAllBtn');
        const deselectAllBtn = document.getElementById('deselectAllBtn');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAll());
        }

        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAll());
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.bulkDelete());
        }
    }

    async refreshIngredients() {
        try {
            this.allIngredients = await db.getAllIngredients();
            this.applyFilters();
        } catch (error) {
            console.error('Failed to load ingredients:', error);
        }
    }

    applyFilters() {
        let filtered = [...this.allIngredients];

        // Apply search filter
        if (this.currentFilters.search) {
            const search = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(ing =>
                ing.name.toLowerCase().includes(search) ||
                (ing.notes && ing.notes.toLowerCase().includes(search))
            );
        }

        // Apply family filter
        if (this.currentFilters.family) {
            filtered = filtered.filter(ing => ing.family === this.currentFilters.family);
        }

        // Apply note type filter
        if (this.currentFilters.noteType) {
            filtered = filtered.filter(ing => ing.noteType === this.currentFilters.noteType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentFilters.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return (a.pricePerMl || 0) - (b.pricePerMl || 0);
                case 'intensity':
                    return (b.intensity || 0) - (a.intensity || 0);
                case 'family':
                    return (a.family || '').localeCompare(b.family || '');
                default:
                    return 0;
            }
        });

        this.filteredIngredients = filtered;
        this.renderIngredients();
    }

    renderIngredients() {
        const grid = document.getElementById('ingredientGrid');
        if (!grid) return;

        if (this.filteredIngredients.length === 0) {
            grid.innerHTML = '<p class="empty-state">No ingredients found. Add your first ingredient!</p>';
            return;
        }

        grid.innerHTML = this.filteredIngredients.map(ing => {
            const familyColor = app.getFamilyColor(ing.family);
            const familyName = app.getFamilyName(ing.family);
            const isSelected = this.selectedIngredients.has(ing.id);

            return `
                <div class="ingredient-card ${isSelected ? 'selected' : ''}"
                     data-id="${ing.id}"
                     onclick="organManager.handleCardClick(event, '${ing.id}')">
                    <div class="card-header">
                        <h3 class="card-title">${this.escapeHtml(ing.name)}</h3>
                        <span class="card-badge badge-${ing.noteType}">${ing.noteType}</span>
                    </div>
                    <div class="card-info">
                        <div class="card-row">
                            <span>Family:</span>
                            <span style="color: ${familyColor}; font-weight: 600;">${familyName}</span>
                        </div>
                        ${ing.subfamily ? `
                            <div class="card-row">
                                <span>Subfamily:</span>
                                <span>${ing.subfamily}</span>
                            </div>
                        ` : ''}
                        <div class="card-row">
                            <span>Intensity:</span>
                            <span>${'★'.repeat(ing.intensity || 0)}${'☆'.repeat(10 - (ing.intensity || 0))}</span>
                        </div>
                        <div class="card-row">
                            <span>Price/ML:</span>
                            <span>${app.formatPrice(ing.pricePerMl || 0)}</span>
                        </div>
                        ${ing.notes ? `
                            <div class="card-row" style="margin-top: 0.5rem;">
                                <p style="font-size: 0.875rem; color: var(--text-secondary); font-style: italic;">
                                    ${this.escapeHtml(ing.notes).substring(0, 100)}${ing.notes.length > 100 ? '...' : ''}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-small btn-secondary"
                                onclick="event.stopPropagation(); organManager.editIngredient('${ing.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-small btn-secondary"
                                onclick="event.stopPropagation(); organManager.deleteIngredient('${ing.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddIngredientModal() {
        this.editingIngredient = null;

        // Reset form
        const form = document.getElementById('ingredientForm');
        if (form) form.reset();

        // Update modal title
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Add Ingredient';

        // Show modal
        app.showModal('ingredientModal');
    }

    async editIngredient(id) {
        try {
            const ingredient = await db.get('ingredients', id);
            if (!ingredient) return;

            this.editingIngredient = ingredient;

            // Populate form
            document.getElementById('ingredientName').value = ingredient.name || '';
            document.getElementById('ingredientFamily').value = ingredient.family || '';
            this.updateSubfamilyOptions(ingredient.family);
            document.getElementById('ingredientSubfamily').value = ingredient.subfamily || '';
            document.getElementById('ingredientNoteType').value = ingredient.noteType || '';
            document.getElementById('ingredientIntensity').value = ingredient.intensity || 5;
            document.getElementById('ingredientPrice').value = ingredient.pricePerMl || 0;
            document.getElementById('ingredientSupplier').value = ingredient.supplier || '';
            document.getElementById('ingredientCAS').value = ingredient.cas || '';
            document.getElementById('ingredientNotes').value = ingredient.notes || '';

            // Update modal title
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'Edit Ingredient';

            // Show modal
            app.showModal('ingredientModal');
        } catch (error) {
            console.error('Failed to load ingredient for editing:', error);
            app.showError('Failed to load ingredient');
        }
    }

    async deleteIngredient(id) {
        const confirmed = await toastManager.confirm(
            'Are you sure you want to delete this ingredient? This action cannot be undone.',
            'Delete Ingredient'
        );

        if (!confirmed) return;

        try {
            await db.deleteIngredient(id);
            await this.refreshIngredients();
            app.showSuccess('Ingredient deleted successfully');
        } catch (error) {
            console.error('Failed to delete ingredient:', error);
            app.showError('Failed to delete ingredient');
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('ingredientName').value,
            family: document.getElementById('ingredientFamily').value,
            subfamily: document.getElementById('ingredientSubfamily').value,
            noteType: document.getElementById('ingredientNoteType').value,
            intensity: parseInt(document.getElementById('ingredientIntensity').value),
            pricePerMl: parseFloat(document.getElementById('ingredientPrice').value),
            supplier: document.getElementById('ingredientSupplier').value,
            cas: document.getElementById('ingredientCAS').value,
            notes: document.getElementById('ingredientNotes').value
        };

        try {
            if (this.editingIngredient) {
                // Update existing ingredient
                formData.id = this.editingIngredient.id;
                formData.created = this.editingIngredient.created;
                await db.updateIngredient(formData);
                app.showSuccess('Ingredient updated successfully');
            } else {
                // Add new ingredient
                await db.addIngredient(formData);
                app.showSuccess('Ingredient added successfully');
            }

            app.closeModal();
            await this.refreshIngredients();
            await app.refreshDashboard();
        } catch (error) {
            console.error('Failed to save ingredient:', error);
            app.showError('Failed to save ingredient');
        }
    }

    updateSubfamilyOptions(familyId) {
        const subfamilySelect = document.getElementById('ingredientSubfamily');
        if (!subfamilySelect) return;

        // Clear existing options
        subfamilySelect.innerHTML = '<option value="">Select subfamily</option>';

        if (!familyId) return;

        // Find family in wheel data
        const wheel = app.getFragranceWheel();
        if (!wheel) return;

        const family = wheel.families.find(f => f.id === familyId);
        if (!family || !family.subfamilies) return;

        // Add subfamily options
        family.subfamilies.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            subfamilySelect.appendChild(option);
        });
    }

    async importIngredients() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                let importCount = 0;

                if (Array.isArray(data)) {
                    // Array of ingredients
                    for (const ing of data) {
                        await db.addIngredient(ing);
                        importCount++;
                    }
                } else if (data.ingredients && Array.isArray(data.ingredients)) {
                    // Full export format
                    for (const ing of data.ingredients) {
                        await db.addIngredient(ing);
                        importCount++;
                    }
                }

                await this.refreshIngredients();
                await app.refreshDashboard();
                app.showSuccess(`Imported ${importCount} ingredients successfully`);
            } catch (error) {
                console.error('Import failed:', error);
                app.showError('Failed to import ingredients. Please check the file format.');
            }
        };

        input.click();
    }

    async exportIngredients() {
        try {
            const ingredients = await db.getAllIngredients();

            const exportData = {
                exportDate: new Date().toISOString(),
                ingredientCount: ingredients.length,
                ingredients: ingredients
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `perfumer-ingredients-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);

            app.showSuccess('Ingredients exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            app.showError('Failed to export ingredients');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Method to get ingredients for composition builder
    async getIngredientsForPicker() {
        return await db.getAllIngredients();
    }

    // Multi-select methods
    handleCardClick(event, id) {
        // Don't toggle if clicking on buttons
        const target = event.target;

        // Check if click is on a button or inside a button
        if (target.tagName === 'BUTTON' || target.closest('button')) {
            return;
        }

        // Toggle selection
        this.toggleSelection(id);
    }

    toggleSelection(id) {
        if (this.selectedIngredients.has(id)) {
            this.selectedIngredients.delete(id);
        } else {
            this.selectedIngredients.add(id);
        }
        this.updateBulkActionsBar();
        this.renderIngredients();
    }

    selectAll() {
        this.filteredIngredients.forEach(ing => {
            this.selectedIngredients.add(ing.id);
        });
        this.updateBulkActionsBar();
        this.renderIngredients();
    }

    deselectAll() {
        this.selectedIngredients.clear();
        this.updateBulkActionsBar();
        this.renderIngredients();
    }

    updateBulkActionsBar() {
        const bulkBar = document.getElementById('bulkActionsBar');
        const selectedCount = document.getElementById('selectedCount');

        if (!bulkBar || !selectedCount) return;

        const count = this.selectedIngredients.size;

        if (count > 0) {
            bulkBar.style.display = 'block';
            selectedCount.textContent = `${count} selected`;
        } else {
            bulkBar.style.display = 'none';
        }
    }

    async bulkDelete() {
        const count = this.selectedIngredients.size;

        if (count === 0) {
            app.showError('No ingredients selected');
            return;
        }

        const confirmed = await toastManager.confirm(
            `Delete ${count} ingredient${count > 1 ? 's' : ''}? This action cannot be undone.`,
            'Bulk Delete'
        );

        if (!confirmed) return;

        try {
            // Delete all selected ingredients
            for (const id of this.selectedIngredients) {
                await db.deleteIngredient(id);
            }

            app.showSuccess(`Deleted ${count} ingredient${count > 1 ? 's' : ''}`);

            // Clear selection
            this.selectedIngredients.clear();
            this.updateBulkActionsBar();

            // Refresh displays
            await this.refreshIngredients();
            await app.refreshDashboard();
        } catch (error) {
            console.error('Failed to delete ingredients:', error);
            app.showError('Failed to delete ingredients');
        }
    }
}

// Initialize organ manager
window.organManager = new OrganManager();
