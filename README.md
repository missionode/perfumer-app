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
- **Enhanced hover tooltips:**
  - Large, readable font sizes
  - Detailed family and subfamily information
  - Compatible family suggestions
  - Color-coded compatibility tags
- **🆕 Wheel-to-Composition Workflow:**
  - Click any family segment to view available ingredients from that family
  - Browse ingredients by family with instant filtering
  - **Staging area** for building compositions:
    - Add ingredients from multiple families
    - Real-time simplified harmony scoring
    - Visual family indicators with color-coding
    - Add/remove ingredients freely before committing
  - One-click transfer to Composition Builder
  - Confirmation dialog prevents accidental overwrites
  - Seamless workflow from exploration to creation

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
- **🆕 Enhanced selection system:**
  - Click anywhere on ingredient card to select
  - No checkbox clutter - clean card design
  - Multi-select with visual highlighting
  - Select all / Deselect all actions
  - Bulk delete with confirmation
  - Prevents accidental deletions with smart click handling
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

### ⚙️ Settings & Preferences
- **Multi-currency support:**
  - 20+ major world currencies (USD, EUR, GBP, INR, JPY, CNY, etc.)
  - Automatic currency symbol formatting
  - Proper symbol positioning (prefix/suffix based on locale)
  - Real-time price updates across all views
- **Drops per ML configuration:**
  - Adjustable conversion rate (15-25 drops/ML)
  - Default: 20 drops per ML
  - Applies to all composition calculations
- **Theme selection:**
  - Light and dark mode toggle
  - Persistent preference (localStorage + IndexedDB)
  - Smooth theme transitions
- **Data management:**
  - Export all data (full database backup)
  - Import full database from JSON
  - Flush sample data (removes pre-loaded samples only)
  - Clear all data with double confirmation

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
│   ├── settings.js         # Settings & preferences
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

**Method 1: Direct Composition Builder**

1. Navigate to the **Compose** tab
2. Enter a composition name
3. Choose measurement mode (Drops or ML)
4. Click **"+ Add Ingredient"** and select from your organ
5. Adjust amounts using +/- buttons
6. Monitor harmony score and note balance
7. Click **"Save Composition"** when satisfied

**Method 2: 🆕 Wheel-Based Composition (NEW!)**

1. Navigate to the **Wheel** tab
2. Click any **family segment** (outer ring) on the fragrance wheel
3. View all ingredients available in that family below the wheel
4. Click **"+ Add"** on ingredients you want to use
5. Selected ingredients appear in the **"Ready for Composition"** staging area
6. **Repeat** for multiple families (mix and match!)
7. Watch the **harmony score** update in real-time
8. Remove ingredients using the **"Remove"** button if needed
9. Click **"✨ Create Composition"** when ready
10. System transfers to Compose tab with all selected ingredients
11. Fine-tune quantities, adjust ratios, and save

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

**Full Database:**
- Settings → **"Export All Data"** → Complete database backup with metadata

**Scaled Recipes:**
- In Compose tab, create custom scaling for production volumes

#### Managing Settings

1. Click the **⚙️ Settings** button (top navigation)
2. **Change Currency:**
   - Select from 20+ supported currencies
   - Click "Save Settings"
   - All prices update immediately
3. **Adjust Drops per ML:**
   - Set between 15-25 drops per ML
   - Matches your specific materials and equipment
4. **Change Theme:**
   - Click Light or Dark theme button
   - Theme switches instantly
5. **Data Management:**
   - **Flush Sample Data:** Removes 20 pre-loaded samples only
   - **Export All Data:** Full backup with timestamp
   - **Import Data:** Restore from backup file
   - **Clear All Data:** Nuclear option (requires double confirmation)

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

- **Default:** 1 drop = 0.05 ML (20 drops per ML)
- **Configurable:** Adjustable from 15-25 drops per ML in Settings
- Note: Actual drop size varies by viscosity; adjust in settings for your specific materials

## Currency Support

### Supported Currencies

USD ($), EUR (€), GBP (£), JPY (¥), CNY (¥), INR (₹), AUD ($), CAD ($), CHF (Fr), SEK (kr), NOK (kr), DKK (kr), SGD ($), HKD ($), NZD ($), KRW (₩), MXN ($), BRL (R$), ZAR (R), RUB (₽)

### Formatting Rules

- **Prefix currencies:** USD, EUR, GBP, INR, etc. → `$10.50`, `€10.50`, `₹10.50`
- **Suffix currencies:** SEK, NOK, DKK → `10.50 kr`
- All prices display with 2 decimal places
- Currency changes update all prices throughout the application instantly

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with IndexedDB support

## Key Features Summary

✅ **Offline-first** - Works completely offline with IndexedDB
✅ **Multi-currency** - 20+ currencies with proper formatting
✅ **Card-based selection** - Click anywhere on cards to select (no checkbox clutter)
✅ **Bulk operations** - Select and delete multiple ingredients
✅ **Dark mode** - Full theme support with persistence
✅ **Sample data** - 20 pre-loaded ingredients to get started
✅ **Enhanced tooltips** - Large, readable wheel segment information (centered display)
✅ **Configurable drops** - Adjust conversion rate to match your materials
✅ **Real-time calculations** - Automatic cost, harmony, and balance updates
✅ **Version control** - Track composition iterations
✅ **Random generator** - AI-assisted "Feeling Lucky" compositions
✅ **🆕 Wheel-to-composition workflow** - Build compositions directly from fragrance wheel
✅ **🆕 Staging area** - Pre-compose with real-time harmony scoring
✅ **🆕 Multi-family mixing** - Select ingredients from multiple families before committing

## Future Enhancements

- PDF export for compositions
- Ingredient inventory tracking (quantity on hand)
- Multi-language support
- Cloud sync (optional)
- Collaborative features
- Advanced analytics and insights
- Custom fragrance wheel creation
- Aroma chemical database integration
- Batch calculator for production scaling
- Mobile app (PWA)

## License

This is a personal/educational project. Feel free to use and modify as needed.

## Credits

Created for perfumers, by perfumers (with AI assistance).

Fragrance classification based on established fragrance wheel systems.

## Support

For issues or questions, refer to the codebase or extend functionality as needed.

---

**Happy Composing! 🌸**
