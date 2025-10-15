# Perfumer's Organ - Digital Fragrance Composer

A comprehensive web application for perfumers to manage ingredients, create compositions, and explore fragrance harmony based on the fragrance wheel system.

## Features

### 📊 Dashboard
- Real-time statistics (total ingredients, compositions, inventory value)
- Recent compositions overview
- Quick action buttons

### 🎨 Fragrance Wheel Explorer
- Interactive SVG fragrance wheel with 8 major families
- Expanded subfamilies for detailed classification
- Family compatibility visualization
- Click segments to explore families and subfamilies

### 🧪 Ingredient Organ
- Complete ingredient library management (CRUD operations)
- Detailed ingredient profiles:
  - Name, family, subfamily
  - Note type (top/middle/base)
  - Intensity rating (1-10)
  - Price per ML
  - Supplier, CAS number
  - Descriptive notes
- Advanced filtering and search
- Sorting by name, price, intensity, or family
- Import/Export in JSON format

### ✨ Composition Builder
- **Dual measurement modes:**
  - Drops mode (for lab/sampling)
  - ML mode (for production)
  - Automatic conversion (1 drop = 0.05ml)
- **Real-time calculations:**
  - Automatic percentage calculation
  - Total cost tracking
  - Cost per ML
  - Ingredient-level costing
- **Harmony analysis:**
  - Fragrance wheel-based compatibility scoring
  - Visual harmony meter (0-100%)
  - Suggestions for improvement
- **Note pyramid visualization:**
  - Top/Middle/Base note distribution
  - Ideal ratio suggestions (20-30% / 40-50% / 20-30%)
  - Color-coded balance bars
- **Composition wheel:**
  - Mini wheel showing family distribution
  - Active families highlighted
- Version control for compositions
- Export compositions as JSON or formatted recipe

### 🎲 Feeling Lucky Generator
- AI-assisted random composition generation
- Uses fragrance wheel compatibility matrix
- Respects ideal note ratios
- Generates harmonious combinations (target 75%+ harmony)
- Creative naming system
- One-click generation

### 📚 Composition Library
- Browse all saved compositions
- Search by name
- View complete composition details
- Edit, duplicate, or delete compositions
- Export individual compositions

### 🌓 Dark Mode
- Toggle between light and dark themes
- Persistent theme preference (localStorage + IndexedDB)
- Smooth transitions

### 💾 Data Management
- **IndexedDB for local persistence** (offline-first)
- **Import/Export capabilities:**
  - Full database backup/restore
  - Individual ingredient export/import
  - Composition export as JSON or formatted text
  - CSV export for ingredients
- **Scaling calculator:**
  - Scale recipes to any production volume
  - Automatic cost recalculation

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties (CSS variables) for theming
- **Vanilla JavaScript** - No frameworks, no build tools
- **IndexedDB** - Client-side persistent storage
- **SVG** - Interactive fragrance wheel rendering

## File Structure

```
perfumer-app/
├── index.html              # Main HTML shell
├── css/
│   ├── variables.css       # CSS variables and theming
│   ├── layout.css          # Layout and responsive design
│   ├── components.css      # UI components
│   └── wheel.css           # Fragrance wheel styles
├── js/
│   ├── app.js              # Main application controller
│   ├── db.js               # IndexedDB wrapper
│   ├── wheel.js            # SVG wheel renderer
│   ├── organ.js            # Ingredient management
│   ├── composer.js         # Composition builder + library
│   ├── lucky.js            # Random generator
│   ├── theme.js            # Theme management
│   └── export.js           # Import/export utilities
├── data/
│   ├── default-wheel.json  # Fragrance wheel data
│   └── sample-ingredients.json  # Sample ingredient library
└── README.md
```

## Getting Started

### Installation

1. Download or clone the repository
2. No build process required - just open `index.html` in a modern browser

### Usage

#### Adding Ingredients

1. Navigate to the **Organ** tab
2. Click **"+ Add Ingredient"**
3. Fill in the ingredient details:
   - Name (required)
   - Family and subfamily
   - Note type (top/middle/base)
   - Intensity (1-10)
   - Price per ML
   - Optional: Supplier, CAS number, notes
4. Click **"Save Ingredient"**

#### Creating a Composition

1. Navigate to the **Compose** tab
2. Enter a composition name
3. Choose measurement mode (Drops or ML)
4. Click **"+ Add Ingredient"** and select from your organ
5. Adjust amounts using +/- buttons
6. Monitor harmony score and note balance
7. Click **"Save Composition"** when satisfied

#### Using "Feeling Lucky"

1. Click the **"🎲 Feeling Lucky"** button (Dashboard or Compose tab)
2. System generates a random composition based on:
   - Compatible fragrance families
   - Ideal note ratios
   - Available ingredients
3. Review and adjust as needed
4. Save or regenerate

#### Exporting Data

**Ingredients:**
- Organ tab → **"Export"** button → JSON file download

**Compositions:**
- Library tab → **"Export All"** → Full backup
- Compose tab → **"Export"** → Current composition as JSON

**Scaled Recipes:**
- In Compose tab, create custom scaling for production volumes

## Fragrance Wheel Structure

### 8 Major Families

1. **Floral** - White Floral, Rose, Powdery
2. **Fresh** - Citrus, Aquatic, Green
3. **Woody** - Sandalwood, Cedar, Vetiver, Oud
4. **Oriental** - Amber, Spicy, Incense
5. **Fruity** - Berry, Stone Fruit, Tropical
6. **Gourmand** - Vanilla, Caramel, Chocolate, Almond
7. **Aromatic** - Lavender, Herbal, Fougère
8. **Animalic** - Musk, Leather, Ambergris

### Compatibility Matrix

The system includes a built-in compatibility matrix that suggests which families work well together, enabling the harmony scoring algorithm.

## Pricing Calculations

- **Cost per item:** `Price per ML × ML used`
- **Total cost:** Sum of all ingredient costs
- **Cost per ML:** `Total cost ÷ Total ML`
- **Scaling:** Linear multiplication by scale factor

## Drop Conversion

- **Standard:** 1 drop = 0.05 ML (20 drops per ML)
- Note: Actual drop size varies by viscosity; this is a standard approximation

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with IndexedDB support

## Future Enhancements

- PDF export for compositions
- Ingredient inventory tracking (quantity on hand)
- Multi-language support
- Cloud sync (optional)
- Collaborative features
- Advanced analytics and insights
- Custom fragrance wheel creation
- Aroma chemical database integration

## License

This is a personal/educational project. Feel free to use and modify as needed.

## Credits

Created for perfumers, by perfumers (with AI assistance).

Fragrance classification based on established fragrance wheel systems.

## Support

For issues or questions, refer to the codebase or extend functionality as needed.

---

**Happy Composing! 🌸**
