/**
 * add-recipe.js
 * Usage: node add-recipe.js "Recipe Name" "Breakfast" "American" 320 "10 min" "20 min" 4 "ingredient1|ingredient2|..." "image-category"
 *
 * Downloads a free food image from Unsplash and appends the recipe to recipes.csv
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

const SHEETS_DIR = path.join(__dirname, '..', 'sheets');

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const ETHNICITIES = ['American', 'Mexican', 'Italian', 'Asian', 'Indian', 'Mediterranean', 'Middle Eastern', 'Japanese', 'Thai', 'Brazilian'];
const ING_CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Seasoning', 'Condiment', 'Fat', 'Herb', 'Vegetable', 'Fruit', 'Nuts', 'Spice', 'Citrus', 'Canned', 'Superfood', 'Cheese', 'Garnish', 'Flavoring', 'Liquid', 'Starch', 'Allium', 'Coconut'];

function searchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query + ' food')}&per_page=10&orientation=landscape`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = json.results || [];
          if (results.length > 0) {
            // Pick a random one from top 5
            const pick = results[Math.floor(Math.random() * Math.min(5, results.length))];
            resolve({
              id: pick.id,
              thumb: pick.urls.thumb,
              full: pick.urls.full,
              regular: pick.urls.regular,
              small: pick.urls.small,
              photographer: pick.user.name,
              photographerUrl: pick.user.links.html
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 8) {
    console.log('Usage: node add-recipe.js "Name" "Category" "Ethnicity" Calories "PrepTime" "CookTime" Servings "Ingredient1|Ingredient2|..." ["image-query"]');
    console.log('Example: node add-recipe.js "Avocado Toast" "Breakfast" "American" 320 "5 min" "10 min" 1 "bread|avocado|eggs" "avocado toast"');
    process.exit(1);
  }

  const [name, category, ethnicity, calories, prepTime, cookTime, servings, ingredients, ...rest] = args;
  const imageQuery = rest[0] || name;
  const imagePath = path.join(SHEETS_DIR, 'images');
  if (!fs.existsSync(imagePath)) fs.mkdirSync(imagePath, { recursive: true });

  const id = Date.now();
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
  const ext = 'jpg';
  const filename = `${safeName}_${id}.${ext}`;
  const localPath = path.join(imagePath, filename);

  console.log(`Searching Unsplash for: ${imageQuery}`);
  const photo = await searchUnsplash(imageQuery);

  if (photo) {
    console.log(`Found photo by ${photo.photographer}. Downloading...`);
    await downloadImage(photo.regular, localPath);
    console.log(`Saved: ${filename}`);
  } else {
    console.log('No image found — leaving blank');
  }

  const row = [
    name,
    category,
    ethnicity,
    calories,
    prepTime,
    cookTime,
    servings,
    ingredients,
    ingredients.split('|').map(i => 'Other').join('/'), // placeholder ingredient categories
    photo ? `https://www.unsplash.com/photos/${photo.id}/download?w=800` : '',
    photo ? `Unsplash — ${photo.photographer}` : '',
    ''
  ];

  const csvLine = row.map(v => `"${v}"`).join(',');
  const csvPath = path.join(SHEETS_DIR, 'recipes.csv');
  const existing = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf8') : 'Name,Category,Ethnicity,Calories,PrepTime,CookTime,Servings,Ingredients,IngredientCategory,ImageURL,Notes,ImageSource\n';
  
  fs.writeFileSync(csvPath, existing + csvLine + '\n');
  console.log(`Added to recipes.csv: ${name}`);
}

main().catch(console.error);
