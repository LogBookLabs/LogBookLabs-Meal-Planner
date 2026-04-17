// Batch recipe+image generator
// Run: node generate-recipes.js [startIndex] [count]
// Generates recipes and AI images in batches

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'images', 'recipes', 'recipe-images.json');
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images', 'recipes');

// Recipe definitions — name, category, cuisine, calories, protein, cookTime, prepTime, servings, diet
const RECIPES = [
  // BREAKFAST (10)
  { name: "Greek Yogurt Parfait", category: "breakfast", cuisine: "Mediterranean", calories: 320, protein: "18g", cookTime: "5 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Avocado Toast with Eggs", category: "breakfast", cuisine: "American", calories: 420, protein: "22g", cookTime: "10 min", prepTime: "5 min", servings: 1, diet: "" },
  { name: "Bacon and Eggs", category: "breakfast", cuisine: "American", calories: 480, protein: "28g", cookTime: "15 min", prepTime: "5 min", servings: 1, diet: "" },
  { name: "Breakfast Quesadilla", category: "breakfast", cuisine: "Mexican", calories: 510, protein: "24g", cookTime: "10 min", prepTime: "5 min", servings: 1, diet: "" },
  { name: "Protein Smoothie Bowl", category: "breakfast", cuisine: "American", calories: 380, protein: "30g", cookTime: "0 min", prepTime: "8 min", servings: 1, diet: "vegetarian" },
  { name: "Oatmeal with Berries", category: "breakfast", cuisine: "American", calories: 290, protein: "10g", cookTime: "5 min", prepTime: "3 min", servings: 1, diet: "vegetarian" },
  { name: "Breakfast Burrito", category: "breakfast", cuisine: "Mexican", calories: 620, protein: "26g", cookTime: "15 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "French Toast", category: "breakfast", cuisine: "French", calories: 440, protein: "16g", cookTime: "15 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Pancakes", category: "breakfast", cuisine: "American", calories: 520, protein: "14g", cookTime: "20 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Egg Muffins", category: "breakfast", cuisine: "American", calories: 260, protein: "20g", cookTime: "25 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },

  // LUNCH (10)
  { name: "Chicken Caesar Salad", category: "lunch", cuisine: "American", calories: 450, protein: "38g", cookTime: "15 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "Tuna Sandwich", category: "lunch", cuisine: "American", calories: 380, protein: "30g", cookTime: "5 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "BLT Sandwich", category: "lunch", cuisine: "American", cuisine2: "American", calories: 520, protein: "22g", cookTime: "5 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "Veggie Wrap", category: "lunch", cuisine: "Mediterranean", calories: 340, protein: "12g", cookTime: "5 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Grilled Cheese and Tomato Soup", category: "lunch", cuisine: "American", calories: 580, protein: "20g", cookTime: "15 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Chicken Quinoa Bowl", category: "lunch", cuisine: "Mediterranean", calories: 510, protein: "40g", cookTime: "25 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "Falafel Pita", category: "lunch", cuisine: "Middle Eastern", calories: 490, protein: "18g", cookTime: "20 min", prepTime: "15 min", servings: 1, diet: "vegetarian" },
  { name: "Caprese Sandwich", category: "lunch", cuisine: "Italian", calories: 420, protein: "18g", cookTime: "5 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Asian Chicken Lettuce Wraps", category: "lunch", cuisine: "Asian", calories: 350, protein: "32g", cookTime: "15 min", prepTime: "15 min", servings: 1, diet: "" },
  { name: "Minestrone Soup", category: "lunch", cuisine: "Italian", calories: 280, protein: "14g", cookTime: "30 min", prepTime: "15 min", servings: 2, diet: "vegetarian" },

  // DINNER (30)
  { name: "Beef & Broccoli", category: "dinner", cuisine: "Asian", calories: 520, protein: "42g", cookTime: "25 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Pad Thai", category: "dinner", cuisine: "Thai", calories: 580, protein: "28g", cookTime: "25 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Chicken Stir Fry", category: "dinner", cuisine: "Asian", calories: 440, protein: "36g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Salmon with Asparagus", category: "dinner", cuisine: "American", calories: 480, protein: "44g", cookTime: "20 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "General Tso's Chicken", category: "dinner", cuisine: "Asian", calories: 620, protein: "38g", cookTime: "30 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Shrimp Tacos", category: "dinner", cuisine: "Mexican", calories: 490, protein: "32g", cookTime: "15 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Spaghetti Bolognese", category: "dinner", cuisine: "Italian", calories: 680, protein: "36g", cookTime: "40 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Chicken Alfredo", category: "dinner", cuisine: "Italian", calories: 720, protein: "44g", cookTime: "25 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Beef Tacos", category: "dinner", cuisine: "Mexican", calories: 540, protein: "30g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Grilled Salmon", category: "dinner", cuisine: "American", calories: 490, protein: "46g", cookTime: "15 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Chicken Parmesan", category: "dinner", cuisine: "Italian", calories: 640, protein: "48g", cookTime: "35 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Pork Chops with Sweet Potato", category: "dinner", cuisine: "American", calories: 580, protein: "40g", cookTime: "30 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Vegetable Lo Mein", category: "dinner", cuisine: "Asian", calories: 380, protein: "14g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "vegetarian" },
  { name: "BBQ Pulled Pork Sandwich", category: "dinner", cuisine: "American", calories: 620, protein: "38g", cookTime: "4 hrs", prepTime: "20 min", servings: 4, diet: "" },
  { name: "Shrimp Scampi", category: "dinner", cuisine: "Italian", calories: 480, protein: "34g", cookTime: "15 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Beef Burrito Bowl", category: "dinner", cuisine: "Mexican", calories: 590, protein: "36g", cookTime: "25 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Mushroom Risotto", category: "dinner", cuisine: "Italian", calories: 520, protein: "14g", cookTime: "35 min", prepTime: "10 min", servings: 2, diet: "vegetarian" },
  { name: "Lemon Herb Chicken", category: "dinner", cuisine: "Mediterranean", calories: 460, protein: "44g", cookTime: "30 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Thai Green Curry", category: "dinner", cuisine: "Thai", calories: 540, protein: "30g", cookTime: "25 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Stuffed Bell Peppers", category: "dinner", cuisine: "American", calories: 420, protein: "26g", cookTime: "45 min", prepTime: "20 min", servings: 2, diet: "" },
  { name: "Teriyaki Chicken", category: "dinner", cuisine: "Asian", calories: 510, protein: "40g", cookTime: "25 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Fish and Chips", category: "dinner", cuisine: "British", calories: 680, protein: "34g", cookTime: "30 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Chicken Fajitas", category: "dinner", cuisine: "Mexican", calories: 480, protein: "36g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Beef Lasagna", category: "dinner", cuisine: "Italian", calories: 720, protein: "40g", cookTime: "60 min", prepTime: "25 min", servings: 4, diet: "" },
  { name: "Teriyaki Salmon Bowl", category: "dinner", cuisine: "Asian", calories: 520, protein: "38g", cookTime: "20 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Chicken Curry", category: "dinner", cuisine: "Indian", calories: 490, protein: "34g", cookTime: "30 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Beef Fried Rice", category: "dinner", cuisine: "Asian", calories: 560, protein: "28g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Grilled Steak with Broccoli", category: "dinner", cuisine: "American", calories: 580, protein: "50g", cookTime: "20 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Shakshuka", category: "dinner", cuisine: "Middle Eastern", calories: 340, protein: "20g", cookTime: "25 min", prepTime: "10 min", servings: 2, diet: "vegetarian" },
  { name: "Chicken Piccata", category: "dinner", cuisine: "Italian", calories: 440, protein: "42g", cookTime: "20 min", prepTime: "10 min", servings: 2, diet: "" },

  // SNACKS (10)
  { name: "Apple Slices with Peanut Butter", category: "snacks", cuisine: "American", calories: 220, protein: "8g", cookTime: "0 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Hummus and Veggies", category: "snacks", cuisine: "Middle Eastern", calories: 180, protein: "8g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Trail Mix", category: "snacks", cuisine: "American", calories: 310, protein: "10g", cookTime: "0 min", prepTime: "0 min", servings: 1, diet: "vegetarian" },
  { name: "Cheese and Crackers", category: "snacks", cuisine: "American", calories: 280, protein: "12g", cookTime: "0 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Guacamole with Chips", category: "snacks", cuisine: "Mexican", calories: 240, protein: "6g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Protein Bar", category: "snacks", cuisine: "American", calories: 220, protein: "20g", cookTime: "0 min", prepTime: "0 min", servings: 1, diet: "vegetarian" },
  { name: "Yogurt with Honey", category: "snacks", cuisine: "Mediterranean", calories: 180, protein: "12g", cookTime: "0 min", prepTime: "3 min", servings: 1, diet: "vegetarian" },
  { name: "Almonds", category: "snacks", cuisine: "Mediterranean", calories: 170, protein: "6g", cookTime: "0 min", prepTime: "0 min", servings: 1, diet: "vegetarian" },
  { name: "Caprese Skewers", category: "snacks", cuisine: "Italian", calories: 200, protein: "10g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Edamame", category: "snacks", cuisine: "Asian", calories: 140, protein: "12g", cookTime: "5 min", prepTime: "3 min", servings: 1, diet: "vegetarian" },
];

// Remove duplicates in SNACKS (already 10 unique) and fix any issues
// Also add more variety - we need 100 total, let me count: 10+10+30+10 = 60... need 40 more

const MORE_RECIPES = [
  // 10 more breakfast
  { name: "Breakfast Hash", category: "breakfast", cuisine: "American", calories: 420, protein: "22g", cookTime: "25 min", prepTime: "15 min", servings: 1, diet: "" },
  { name: " Chia Seed Pudding", category: "breakfast", cuisine: "American", calories: 280, protein: "8g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Smoked Salmon Bagel", category: "breakfast", cuisine: "American", calories: 480, protein: "26g", cookTime: "5 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "Acai Bowl", category: "breakfast", cuisine: "Brazilian", calories: 360, protein: "8g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Veggie Omelette", category: "breakfast", cuisine: "American", calories: 340, protein: "24g", cookTime: "10 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Overnight Oats", category: "breakfast", cuisine: "American", calories: 320, protein: "12g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Belgian Waffles", category: "breakfast", cuisine: "Belgian", calories: 490, protein: "14g", cookTime: "15 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Breakfast Smoothie", category: "breakfast", cuisine: "American", calories: 310, protein: "22g", cookTime: "0 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Shakshuka Eggs", category: "breakfast", cuisine: "Middle Eastern", calories: 320, protein: "20g", cookTime: "20 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Peanut Butter Banana Toast", category: "breakfast", cuisine: "American", calories: 380, protein: "14g", cookTime: "5 min", prepTime: "3 min", servings: 1, diet: "vegetarian" },
  // 10 more lunch
  { name: "Greek Salad", category: "lunch", cuisine: "Mediterranean", calories: 320, protein: "14g", cookTime: "0 min", prepTime: "15 min", servings: 1, diet: "vegetarian" },
  { name: "Chicken Shawarma Plate", category: "lunch", cuisine: "Middle Eastern", calories: 540, protein: "42g", cookTime: "25 min", prepTime: "15 min", servings: 1, diet: "" },
  { name: "Black Bean Tacos", category: "lunch", cuisine: "Mexican", calories: 420, protein: "16g", cookTime: "15 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Mediterranean Grain Bowl", category: "lunch", cuisine: "Mediterranean", calories: 480, protein: "18g", cookTime: "20 min", prepTime: "15 min", servings: 1, diet: "vegetarian" },
  { name: "Club Sandwich", category: "lunch", cuisine: "American", calories: 560, protein: "32g", cookTime: "10 min", prepTime: "15 min", servings: 1, diet: "" },
  { name: "Sushi Bowl", category: "lunch", cuisine: "Asian", calories: 490, protein: "24g", cookTime: "20 min", prepTime: "15 min", servings: 1, diet: "" },
  { name: "Chicken Noodle Soup", category: "lunch", cuisine: "American", calories: 320, protein: "26g", cookTime: "35 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Steak Salad", category: "lunch", cuisine: "American", calories: 460, protein: "38g", cookTime: "15 min", prepTime: "15 min", servings: 1, diet: "" },
  { name: "Buffalo Chicken Wrap", category: "lunch", cuisine: "American", calories: 510, protein: "34g", cookTime: "15 min", prepTime: "10 min", servings: 1, diet: "" },
  { name: "Ramen Bowl", category: "lunch", cuisine: "Asian", calories: 540, protein: "28g", cookTime: "20 min", prepTime: "10 min", servings: 1, diet: "" },
  // 10 more dinner (total 50 dinner)
  { name: "Orange Chicken", category: "dinner", cuisine: "Asian", calories: 580, protein: "36g", cookTime: "30 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Miso Glazed Cod", category: "dinner", cuisine: "Asian", calories: 360, protein: "34g", cookTime: "15 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Eggplant Parmesan", category: "dinner", cuisine: "Italian", calories: 480, protein: "20g", cookTime: "45 min", prepTime: "20 min", servings: 2, diet: "vegetarian" },
  { name: "Korean BBQ Beef", category: "dinner", cuisine: "Asian", calories: 540, protein: "38g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Coconut Shrimp", category: "dinner", cuisine: "Thai", calories: 520, protein: "28g", cookTime: "20 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Chicken Marsala", category: "dinner", cuisine: "Italian", calories: 480, protein: "42g", cookTime: "30 min", prepTime: "10 min", servings: 2, diet: "" },
  { name: "Seafood Paella", category: "dinner", cuisine: "Spanish", calories: 560, protein: "36g", cookTime: "45 min", prepTime: "20 min", servings: 2, diet: "" },
  { name: "Butter Chicken", category: "dinner", cuisine: "Indian", calories: 580, protein: "40g", cookTime: "35 min", prepTime: "15 min", servings: 2, diet: "" },
  { name: "Beef Enchiladas", category: "dinner", cuisine: "Mexican", calories: 620, protein: "32g", cookTime: "35 min", prepTime: "25 min", servings: 2, diet: "" },
  { name: "Honey Garlic Salmon", category: "dinner", cuisine: "American", calories: 460, protein: "40g", cookTime: "20 min", prepTime: "10 min", servings: 2, diet: "" },
  // 10 more snacks (total 20)
  { name: "Frozen Grapes", category: "snacks", cuisine: "American", calories: 100, protein: "2g", cookTime: "0 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Roasted Chickpeas", category: "snacks", cuisine: "Middle Eastern", calories: 200, protein: "10g", cookTime: "30 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Dark Chocolate", category: "snacks", cuisine: "American", calories: 180, protein: "4g", cookTime: "0 min", prepTime: "0 min", servings: 1, diet: "vegetarian" },
  { name: "Cottage Cheese with Fruit", category: "snacks", cuisine: "American", calories: 160, protein: "14g", cookTime: "0 min", prepTime: "3 min", servings: 1, diet: "vegetarian" },
  { name: "Rice Cakes with Avocado", category: "snacks", cuisine: "American", calories: 180, protein: "4g", cookTime: "0 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Deviled Eggs", category: "snacks", cuisine: "American", calories: 200, protein: "14g", cookTime: "15 min", prepTime: "20 min", servings: 1, diet: "vegetarian" },
  { name: "Stuffed Mini Peppers", category: "snacks", cuisine: "American", calories: 160, protein: "8g", cookTime: "15 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
  { name: "Smoothie", category: "snacks", cuisine: "American", calories: 240, protein: "16g", cookTime: "0 min", prepTime: "5 min", servings: 1, diet: "vegetarian" },
  { name: "Celery with Cream Cheese", category: "snacks", cuisine: "American", calories: 120, protein: "4g", cookTime: "0 min", prepTime: "3 min", servings: 1, diet: "vegetarian" },
  { name: "Fruit Cup", category: "snacks", cuisine: "American", calories: 120, protein: "2g", cookTime: "0 min", prepTime: "10 min", servings: 1, diet: "vegetarian" },
];

// Combined: 60 + 40 = 100
const ALL_RECIPES = [...RECIPES, ...MORE_RECIPES];

// Remove any duplicates by name
const seen = new Set();
const RECIPE_LIST = ALL_RECIPES.filter(r => {
  if (seen.has(r.name)) return false;
  seen.add(r.name);
  return true;
}).slice(0, 100);

console.log(`Total recipes to generate: ${RECIPE_LIST.length}`);
console.log(RECIPE_LIST.map((r,i) => `${i+1}. ${r.name} (${r.category})`).join('\n'));
