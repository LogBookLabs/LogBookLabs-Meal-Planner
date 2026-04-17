// Local recipes.json — copy this to public/images/recipes/recipes.json
// Images stored in public/images/recipes/
// Run: node build-recipes-json.js to compile all parts

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, 'public');
const RECIPES_DIR = join(PUBLIC_DIR, 'images', 'recipes');
const OUTPUT_FILE = join(RECIPES_DIR, 'recipes.json');

// This script is run manually to compile all recipe parts
// Just copy all the part files into one recipes.json
