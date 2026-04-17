MEAL PLANNER PRO — SETUP GUIDE
===============================

QUICK START
-----------
1. Go to Google Sheets → New spreadsheet
2. Import these CSV files in order:
   a. recipes.csv  → rename sheet to "Recipes"
   b. planner.csv  → rename sheet to "Planner"
   c. grocery.csv  → rename sheet to "Grocery"
   d. dashboard.csv → rename sheet to "Dashboard"
3. For the Dashboard to auto-link, use VLOOKUP from the Recipes sheet

HOW TO USE
----------
PLANNER SHEET
- Each day (Monday–Sunday) has columns for Breakfast, Lunch, Dinner, Snacks
- Click a cell → type to search Recipes by name
- Use =VLOOKUP(A2, Recipes!A:K, 4, FALSE) to pull calories into the Calories row above

RECIPES SHEET
- 30 recipes included (expand to 500+ easily)
- Image URLs are Unsplash direct links — click to preview
- To add new recipes: see scripts/add-recipe.js

GROCERY SHEET
- Manually type ingredients you need
- Checkbox column (Checked) — use "x" to mark as purchased
- Grouped by Produce / Meat / Dairy / Pantry / Other

DASHBOARD SHEET
- Weekly calorie total (pulls from Planner's Calories row)
- Meal count per day
- Filter buttons (UI only — actual filtering requires Google Apps Script)

TO ADD MORE IMAGES
------------------
Run from the meal_planner directory:
  node scripts/add-recipe.js "Recipe Name" "Breakfast" "American" 320 "5 min" "10 min" 1 "bread|avocado|eggs" "avocado toast"

The script:
1. Searches Unsplash for the food query
2. Downloads a free image (no attribution needed)
3. Saves it to sheets/images/
4. Appends the recipe row to recipes.csv with the image URL

IMAGE RULES
-----------
✓ Unsplash — free for commercial use, no attribution required
✓ Pexels — free for commercial use
✓ Pixabay — free for commercial use
✗ Never scrape from blogs, Pinterest, or Google Images
✗ Never use images with watermarks

CSV COLUMNS EXPLAINED
--------------------
recipes.csv:
  Name           — Recipe title
  Category       — Breakfast | Lunch | Dinner | Snack
  Ethnicity      — American | Mexican | Italian | Asian | Indian | Mediterranean | Middle Eastern | Japanese | Thai | Brazilian
  Calories       — Per serving
  PrepTime       — e.g. "5 min"
  CookTime       — e.g. "20 min"
  Servings       — Number of portions
  Ingredients    — Pipe-separated (|)
  IngredientCategory — Pipe-separated, matches Ingredients order
  ImageURL       — Unsplash direct download link
  Notes          — Cooking tips

planner.csv:
  Day            — Monday through Sunday
  Meal           — Row label (Meal | Calories)
  Breakfast/Lunch/Dinner/Snacks — VLOOKUP cells pointing to Recipes

grocery.csv:
  Category       — Produce | Meat | Dairy | Pantry | Other
  Item           — Ingredient name
  Needed         — TRUE (spacer for print layout)
  Checked        — x when purchased
