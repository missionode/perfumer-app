// Feeling Lucky - Random Composition Generator
class LuckyGenerator {
    constructor() {
        this.init();
    }

    init() {
        // Attach to lucky button
        const luckyBtn = document.getElementById('luckyBtn');
        if (luckyBtn) {
            luckyBtn.addEventListener('click', () => this.generateRandomComposition());
        }
    }

    async generateRandomComposition() {
        try {
            const ingredients = await db.getAllIngredients();

            if (ingredients.length < 3) {
                app.showError('Need at least 3 ingredients to generate a random composition');
                return;
            }

            const wheel = app.getFragranceWheel();
            if (!wheel) {
                app.showError('Fragrance wheel data not available');
                return;
            }

            // Step 1: Pick a random primary family
            const families = wheel.families;
            const primaryFamily = families[Math.floor(Math.random() * families.length)];

            // Step 2: Get compatible families
            const compatibleFamilies = app.getCompatibleFamilies(primaryFamily.id);

            // Step 3: Select 2-3 compatible families to work with
            const numFamilies = Math.min(3, 1 + Math.floor(Math.random() * 2)); // 1-2 additional families
            const selectedFamilies = [primaryFamily.id];

            while (selectedFamilies.length < numFamilies && compatibleFamilies.length > 0) {
                const randomIndex = Math.floor(Math.random() * compatibleFamilies.length);
                const family = compatibleFamilies.splice(randomIndex, 1)[0];
                if (family) {
                    selectedFamilies.push(family);
                }
            }

            // Step 4: Get note type suggestions
            const noteTypes = wheel.noteTypeSuggestions || {
                top: ['fresh', 'citrus', 'green'],
                middle: ['floral', 'fruity', 'spicy'],
                base: ['woody', 'oriental', 'gourmand']
            };

            // Step 5: Select ingredients for each note type
            const composition = [];

            // Top notes (20-30% - aim for 25%)
            const topIngredients = this.getIngredientsForNoteType(ingredients, 'top', selectedFamilies);
            const topCount = Math.max(1, Math.min(topIngredients.length, 1 + Math.floor(Math.random() * 2)));

            for (let i = 0; i < topCount; i++) {
                const ing = topIngredients[Math.floor(Math.random() * topIngredients.length)];
                if (ing && !composition.find(c => c.id === ing.id)) {
                    composition.push(ing);
                }
            }

            // Middle notes (40-50% - aim for 45%)
            const middleIngredients = this.getIngredientsForNoteType(ingredients, 'middle', selectedFamilies);
            const middleCount = Math.max(1, Math.min(middleIngredients.length, 2 + Math.floor(Math.random() * 2)));

            for (let i = 0; i < middleCount; i++) {
                const ing = middleIngredients[Math.floor(Math.random() * middleIngredients.length)];
                if (ing && !composition.find(c => c.id === ing.id)) {
                    composition.push(ing);
                }
            }

            // Base notes (20-30% - aim for 30%)
            const baseIngredients = this.getIngredientsForNoteType(ingredients, 'base', selectedFamilies);
            const baseCount = Math.max(1, Math.min(baseIngredients.length, 1 + Math.floor(Math.random() * 2)));

            for (let i = 0; i < baseCount; i++) {
                const ing = baseIngredients[Math.floor(Math.random() * baseIngredients.length)];
                if (ing && !composition.find(c => c.id === ing.id)) {
                    composition.push(ing);
                }
            }

            if (composition.length === 0) {
                app.showError('Could not generate composition with available ingredients');
                return;
            }

            // Step 6: Calculate amounts based on ideal ratios
            const totalDrops = 20 + Math.floor(Math.random() * 30); // 20-50 drops total
            const amounts = this.calculateIdealAmounts(composition, totalDrops);

            // Step 7: Generate name
            const name = this.generateCompositionName(primaryFamily, composition);

            // Step 8: Load into composer
            if (window.composer) {
                composer.clearComposition();
                composer.compositionName = name;

                const nameInput = document.getElementById('compositionName');
                if (nameInput) {
                    nameInput.value = name;
                }

                composition.forEach((ing, index) => {
                    composer.formula.push({
                        ingredient: ing,
                        amount: amounts[index]
                    });
                });

                composer.updateDisplay();

                app.switchTab('compose');

                app.showSuccess(`Generated "${name}" with ${composition.length} ingredients!`);
            }

        } catch (error) {
            console.error('Failed to generate random composition:', error);
            app.showError('Failed to generate composition');
        }
    }

    getIngredientsForNoteType(allIngredients, noteType, selectedFamilies) {
        let filtered = allIngredients.filter(ing => ing.noteType === noteType);

        // Prefer ingredients from selected families, but allow others if not enough
        const fromSelectedFamilies = filtered.filter(ing =>
            selectedFamilies.includes(ing.family)
        );

        return fromSelectedFamilies.length > 0 ? fromSelectedFamilies : filtered;
    }

    calculateIdealAmounts(composition, totalDrops) {
        // Count notes by type
        const counts = { top: 0, middle: 0, base: 0 };
        composition.forEach(ing => {
            counts[ing.noteType || 'middle']++;
        });

        // Target percentages
        const targets = {
            top: 0.25,    // 25%
            middle: 0.45, // 45%
            base: 0.30    // 30%
        };

        // Calculate drops per note type
        const dropsPerType = {
            top: Math.round(totalDrops * targets.top),
            middle: Math.round(totalDrops * targets.middle),
            base: Math.round(totalDrops * targets.base)
        };

        // Distribute among ingredients
        const amounts = composition.map(ing => {
            const noteType = ing.noteType || 'middle';
            const count = counts[noteType];
            const typeDrops = dropsPerType[noteType];

            // Distribute evenly with slight randomization
            const baseAmount = Math.floor(typeDrops / count);
            const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1

            return Math.max(1, baseAmount + variation);
        });

        return amounts;
    }

    generateCompositionName(primaryFamily, ingredients) {
        const adjectives = [
            'Mystic', 'Eternal', 'Velvet', 'Silk', 'Golden', 'Silver',
            'Midnight', 'Dawn', 'Twilight', 'Secret', 'Hidden', 'Wild',
            'Gentle', 'Bold', 'Soft', 'Warm', 'Cool', 'Fresh'
        ];

        const nouns = [
            'Dream', 'Whisper', 'Echo', 'Shadow', 'Light', 'Memory',
            'Garden', 'Forest', 'Ocean', 'Sky', 'Breeze', 'Mist',
            'Rose', 'Lily', 'Jasmine', 'Amber', 'Musk', 'Bloom'
        ];

        // Use family name or random
        const useFamilyName = Math.random() > 0.5;

        if (useFamilyName) {
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const familyName = primaryFamily.name;
            return `${adj} ${familyName}`;
        } else {
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            return `${adj} ${noun}`;
        }
    }

    // Generate multiple options and let user choose
    async generateMultipleOptions() {
        // Future enhancement: generate 3 options and show in a modal for user to pick
        alert('Multiple options feature - coming soon!');
    }
}

// Initialize
window.luckyGenerator = new LuckyGenerator();
