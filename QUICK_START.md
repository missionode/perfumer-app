# Quick Start Guide - Perfumer's Organ

## 🚀 Launch the App

1. **Open the app:**
   - Double-click `index.html` in your file browser, OR
   - Right-click `index.html` → Open With → Your preferred browser

2. **First time setup:**
   - The app will automatically load 20 sample ingredients
   - The fragrance wheel will be initialized with 8 families
   - You're ready to start creating!

## 📋 Quick Tutorial (5 minutes)

### Step 1: Explore the Dashboard
- View your statistics (ingredients, compositions, inventory value)
- Notice the quick action buttons

### Step 2: Check the Fragrance Wheel
- Click the **"Wheel"** tab
- Click on any colored segment to learn about that fragrance family
- See compatible families and subfamilies

### Step 3: Browse Your Ingredient Organ
- Click the **"Organ"** tab
- You'll see 20 pre-loaded sample ingredients
- Try searching for "jasmine" or "vanilla"
- Filter by family (e.g., "Floral") or note type (e.g., "Base")

### Step 4: Create Your First Composition
1. Click the **"Compose"** tab
2. Name your composition (e.g., "My First Perfume")
3. Click **"+ Add Ingredient"**
4. Type a number (1-20) or ingredient name
5. Add 3-5 ingredients
6. Adjust amounts using the +/- buttons
7. Watch the harmony score and note balance update in real-time
8. Click **"Save Composition"**

### Step 5: Try "Feeling Lucky"
1. On the Dashboard or Compose tab
2. Click **"🎲 Feeling Lucky"**
3. A random composition will be generated automatically
4. Review the harmony score
5. Adjust and save if you like it!

## 🎨 Theme Toggle

- Click the ☀️/🌙 icon in the top-right corner
- Switch between light and dark modes
- Your preference is saved automatically

## 💡 Pro Tips

### Measurement Modes
- **Drops mode:** Perfect for lab samples and experiments
- **ML mode:** Use for larger production batches
- Toggle using the switch in the Compose tab

### Harmony Scoring
- **90-100%:** Excellent harmony (highly compatible notes)
- **75-89%:** Good harmony (well-balanced)
- **60-74%:** Moderate harmony (some adjustments recommended)
- **Below 60%:** Low harmony (ingredients may clash)

### Note Balance
- **Ideal ratios:**
  - Top notes: 20-30%
  - Middle notes: 40-50%
  - Base notes: 20-30%
- The app will warn you if your balance is off

### Pricing
- All costs are automatically calculated
- See total cost, cost per ML, and per-ingredient costs
- Perfect for budgeting samples or production runs

## 📤 Export & Import

### Export Your Data
- **All ingredients:** Organ tab → Export button
- **All compositions:** Library tab → Export All
- **Single composition:** Compose tab → Export button

### Import Data
- **Ingredients:** Organ tab → Import button → Select JSON file
- **Full backup:** Library tab → Import button

### Scaling Recipes
- In the Compose tab, you can export scaled versions
- Just specify target volume (e.g., 100ml for a bottle)
- Perfect for production planning

## 🔧 Troubleshooting

### Data Not Saving?
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check that IndexedDB is enabled in your browser settings

### Wheel Not Displaying?
- Refresh the page (F5 or Cmd+R)
- Check browser console for errors (F12)

### Sample Data Not Loading?
- Check that `data/sample-ingredients.json` file exists
- Refresh the page

## 🎯 Next Steps

1. **Customize your ingredient library:**
   - Add your own ingredients in the Organ tab
   - Update prices to match your suppliers
   - Add detailed notes

2. **Build a composition library:**
   - Create multiple versions of compositions
   - Experiment with different ratios
   - Use "Feeling Lucky" for inspiration

3. **Upgrade the fragrance wheel:**
   - Edit `data/default-wheel.json` to add custom families
   - Update compatibility matrices
   - Add more subfamilies

4. **Export for safety:**
   - Regularly export your full database
   - Keep backups of your compositions
   - Share formulas with colleagues

## 🌟 Advanced Features

### Version Control
- Each save creates a new version
- Version numbers increment automatically
- Keep track of formula iterations

### Family Distribution
- The mini wheel in Compose tab shows your formula's family breakdown
- Helps visualize harmony at a glance

### Ingredient Intensity
- 1-10 scale indicates potency
- Use intensity to guide your amounts
- High-intensity ingredients (8-10) need less quantity

## 📱 Mobile Use

- The app is fully responsive
- Works on tablets and phones
- Touch-friendly interface
- Pinch-to-zoom on the wheel (if needed)

## ❓ Need Help?

- Check the full `README.md` for detailed documentation
- Review the code in `js/` folder for advanced customization
- All data stays on your device (offline-first design)

---

**Enjoy creating beautiful fragrances! 🌸✨**
