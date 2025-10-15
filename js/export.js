// Import/Export Utilities
class ExportManager {
    constructor() {
        // Most export functionality is already in individual modules
        // This file provides centralized utilities and full database backup
    }

    // Export entire database
    async exportFullDatabase() {
        try {
            const data = await db.exportAllData();

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `perfumer-organ-backup-${this.getDateString()}.json`;
            a.click();

            URL.revokeObjectURL(url);

            return { success: true, message: 'Database exported successfully' };
        } catch (error) {
            console.error('Export failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Import full database
    async importFullDatabase(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data format');
            }

            // Confirm with user
            const confirmMessage = `
This will import:
- ${data.ingredients?.length || 0} ingredients
- ${data.compositions?.length || 0} compositions
- ${data.wheels?.length || 0} fragrance wheels

Do you want to:
[OK] Merge with existing data
[Cancel] Cancel import
            `.trim();

            if (!confirm(confirmMessage)) {
                return { success: false, message: 'Import cancelled by user' };
            }

            // Import data
            const result = await db.importData(data);

            // Refresh all views
            if (result.success) {
                await this.refreshAllViews();
            }

            return result;
        } catch (error) {
            console.error('Import failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Export ingredients as CSV
    async exportIngredientsCSV() {
        try {
            const ingredients = await db.getAllIngredients();

            // CSV headers
            const headers = [
                'Name', 'Family', 'Subfamily', 'Note Type',
                'Intensity', 'Price per ML', 'Supplier', 'CAS', 'Notes'
            ];

            // Convert to CSV
            const csvRows = [headers.join(',')];

            ingredients.forEach(ing => {
                const row = [
                    this.escapeCsv(ing.name),
                    this.escapeCsv(ing.family),
                    this.escapeCsv(ing.subfamily),
                    this.escapeCsv(ing.noteType),
                    ing.intensity || '',
                    ing.pricePerMl || '',
                    this.escapeCsv(ing.supplier),
                    this.escapeCsv(ing.cas),
                    this.escapeCsv(ing.notes)
                ];
                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ingredients-${this.getDateString()}.csv`;
            a.click();

            URL.revokeObjectURL(url);

            return { success: true, message: 'CSV exported successfully' };
        } catch (error) {
            console.error('CSV export failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Export composition as formatted text/recipe
    async exportCompositionAsRecipe(composition) {
        const recipe = this.formatCompositionAsRecipe(composition);

        const blob = new Blob([recipe], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${composition.name.replace(/\s+/g, '-')}-recipe.txt`;
        a.click();

        URL.revokeObjectURL(url);
    }

    formatCompositionAsRecipe(composition) {
        const lines = [];

        lines.push('═══════════════════════════════════════════════════');
        lines.push(`  ${composition.name}`);
        lines.push('═══════════════════════════════════════════════════');
        lines.push('');

        // Summary
        lines.push('SUMMARY');
        lines.push('───────────────────────────────────────────────────');
        lines.push(`Total Volume: ${composition.totals.ml.toFixed(2)} ml (${composition.totals.drops} drops)`);
        lines.push(`Total Cost: $${composition.totals.cost.toFixed(2)}`);
        lines.push(`Cost per ML: $${composition.totals.costPerMl.toFixed(2)}`);
        lines.push(`Harmony Score: ${composition.harmonyScore}%`);
        lines.push('');

        // Ingredients
        lines.push('FORMULA');
        lines.push('───────────────────────────────────────────────────');

        // Group by note type
        const byNoteType = { top: [], middle: [], base: [] };

        composition.ingredients.forEach(ing => {
            const ingredient = ing.ingredientName;
            const noteType = ing.noteType || 'middle';
            byNoteType[noteType].push(ing);
        });

        // Top notes
        if (byNoteType.top.length > 0) {
            lines.push('\nTOP NOTES:');
            byNoteType.top.forEach(ing => {
                lines.push(`  ${ing.ingredientName.padEnd(30)} ${ing.amount.toFixed(0)} drops (${ing.percentage.toFixed(1)}%)`);
            });
        }

        // Middle notes
        if (byNoteType.middle.length > 0) {
            lines.push('\nMIDDLE NOTES:');
            byNoteType.middle.forEach(ing => {
                lines.push(`  ${ing.ingredientName.padEnd(30)} ${ing.amount.toFixed(0)} drops (${ing.percentage.toFixed(1)}%)`);
            });
        }

        // Base notes
        if (byNoteType.base.length > 0) {
            lines.push('\nBASE NOTES:');
            byNoteType.base.forEach(ing => {
                lines.push(`  ${ing.ingredientName.padEnd(30)} ${ing.amount.toFixed(0)} drops (${ing.percentage.toFixed(1)}%)`);
            });
        }

        lines.push('');
        lines.push('───────────────────────────────────────────────────');
        lines.push(`Created: ${new Date(composition.created).toLocaleString()}`);
        lines.push(`Version: ${composition.version || 1}`);
        lines.push('═══════════════════════════════════════════════════');

        return lines.join('\n');
    }

    // Validate import data structure
    validateImportData(data) {
        // Check if it's a full export or just ingredients/compositions
        if (data.version || data.exportDate) {
            // Full export format
            return true;
        }

        // Check if it's an array of ingredients
        if (Array.isArray(data)) {
            return true;
        }

        // Check if it has ingredients array
        if (data.ingredients && Array.isArray(data.ingredients)) {
            return true;
        }

        return false;
    }

    // Refresh all views after import
    async refreshAllViews() {
        if (window.organManager) {
            await organManager.refreshIngredients();
        }

        if (window.libraryManager) {
            await libraryManager.refreshLibrary();
        }

        if (window.wheelRenderer) {
            await wheelRenderer.init();
            wheelRenderer.render();
        }

        if (window.app) {
            await app.refreshDashboard();
        }
    }

    // Utility functions
    escapeCsv(value) {
        if (value === null || value === undefined) return '';

        const str = String(value);

        // If contains comma, quote, or newline, wrap in quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    // Generate scaling calculator (for production)
    generateScalingCalculator(composition, targetMl) {
        const currentMl = composition.totals.ml;
        const scaleFactor = targetMl / currentMl;

        const scaled = {
            name: `${composition.name} (Scaled to ${targetMl}ml)`,
            targetVolume: targetMl,
            scaleFactor: scaleFactor,
            ingredients: composition.ingredients.map(ing => ({
                name: ing.ingredientName,
                originalDrops: ing.amount,
                scaledDrops: Math.round(ing.amount * scaleFactor),
                scaledMl: ((ing.amount / 20) * scaleFactor).toFixed(2),
                cost: (ing.cost * scaleFactor).toFixed(2)
            })),
            totalCost: (composition.totals.cost * scaleFactor).toFixed(2)
        };

        return scaled;
    }

    // Export scaled recipe
    async exportScaledRecipe() {
        if (!window.composer || composer.formula.length === 0) {
            app.showError('No composition loaded');
            return;
        }

        const targetMl = prompt('Enter target volume in ML (e.g., 100 for a 100ml bottle):', '100');

        if (!targetMl) return;

        const target = parseFloat(targetMl);
        if (isNaN(target) || target <= 0) {
            app.showError('Invalid volume');
            return;
        }

        // Get current composition
        const totals = composer.calculateTotals();

        const scaleFactor = target / totals.totalMl;

        const lines = [];
        lines.push('═══════════════════════════════════════════════════');
        lines.push(`  ${composer.compositionName} - SCALED RECIPE`);
        lines.push('═══════════════════════════════════════════════════');
        lines.push('');
        lines.push(`Original Volume: ${totals.totalMl.toFixed(2)} ml`);
        lines.push(`Target Volume: ${target.toFixed(2)} ml`);
        lines.push(`Scale Factor: ${scaleFactor.toFixed(2)}x`);
        lines.push('');
        lines.push('INGREDIENTS');
        lines.push('───────────────────────────────────────────────────');

        composer.formula.forEach(item => {
            const originalMl = item.amount / composer.DROPS_PER_ML;
            const scaledMl = originalMl * scaleFactor;
            const scaledDrops = Math.round(item.amount * scaleFactor);
            const cost = composer.calculateItemCost(item) * scaleFactor;

            lines.push(`${item.ingredient.name}`);
            lines.push(`  ${scaledMl.toFixed(2)} ml (${scaledDrops} drops) - $${cost.toFixed(2)}`);
        });

        lines.push('');
        lines.push('───────────────────────────────────────────────────');
        lines.push(`Total Cost: $${(totals.totalCost * scaleFactor).toFixed(2)}`);
        lines.push('═══════════════════════════════════════════════════');

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${composer.compositionName}-scaled-${target}ml.txt`;
        a.click();

        URL.revokeObjectURL(url);
    }
}

// Initialize export manager
window.exportManager = new ExportManager();

// Add global helper for scaling
function exportScaledRecipe() {
    if (window.exportManager) {
        exportManager.exportScaledRecipe();
    }
}
