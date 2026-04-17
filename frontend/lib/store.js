'use client';
import { create } from 'zustand';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

// Shopping list categories and categorization logic
const SHOPPING_CATEGORIES = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Grains & Bread', 'Pantry', 'Frozen', 'Other'];

const CATEGORY_RULES = [
  { keywords: ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'shrimp', 'bacon', 'sausage', 'steak', 'ground beef', 'tuna', 'crab', 'lobster', 'scallop', 'duck', 'ham', 'pepperoni', 'salami', 'prosciutto', 'meatball'], category: 'Meat & Seafood' },
  { keywords: ['milk', 'cheese', 'yogurt', 'egg', 'butter', 'cream', 'sour cream', 'cottage cheese', 'mozzarella', 'parmesan', 'feta', 'ricotta', 'cheddar', 'gouda', 'brie', 'half and half', 'whipping cream'], category: 'Dairy & Eggs' },
  { keywords: ['rice', 'bread', 'pasta', 'noodle', 'oat', 'quinoa', 'flour', 'tortilla', 'cereal', 'croissant', 'bagel', 'panko', 'breadcrumb', 'crouton', ' Couscous', 'barley', 'lentil'], category: 'Grains & Bread' },
  { keywords: ['broccoli', 'tomato', 'onion', 'garlic', 'pepper', 'lettuce', 'spinach', 'kale', 'carrot', 'celery', 'cucumber', 'zucchini', 'squash', 'mushroom', 'avocado', 'lemon', 'lime', 'apple', 'banana', 'orange', 'berry', 'fruit', 'vegetable', 'potato', 'sweet potato', 'asparagus', 'green bean', 'cabbage', 'beet', 'corn', 'pea', 'bean sprout', 'bok choy', 'arugula', 'radish', 'scallion', 'shallot', 'ginger', 'jalapeño', 'serrano', 'habanero', 'poblano', 'cilantro', 'parsley', 'basil', 'mint', 'dill', 'thyme', 'rosemary', 'oregano', 'sage', 'chive', 'ketchup', 'mayo', 'mustard', 'mayonnaise'], category: 'Produce' },
  { keywords: ['oil', 'olive oil', 'salt', 'pepper', 'sugar', 'spice', 'herb', 'vinegar', 'broth', 'stock', 'honey', 'soy sauce', 'dressing', 'sauce', 'syrup', 'vanilla', 'baking', 'cocoa', 'chocolate', 'nut', 'almond', 'walnut', 'pecan', 'cashew', 'peanut', 'seed', 'sesame', 'coconut', 'raisin', 'cranberry', 'apricot', 'papaya', 'mango', 'pineapple', 'canned', 'can of', 'beans', 'lentil', 'chickpea', 'tomato paste', 'tomato sauce', 'salsa', 'sriracha', 'hot sauce', 'worcestershire', 'fish sauce', 'oyster sauce', 'hoisin', 'teriyaki', 'curry paste', 'coconut milk', 'evaporated milk'], category: 'Pantry' },
  { keywords: ['frozen', 'ice cream', 'sorbet', 'gelato', 'popsicle', 'frozen yogurt'], category: 'Frozen' },
];

function categorizeIngredient(name) {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.category;
    }
  }
  return 'Other';
}

export const useMealPlannerStore = create((set, get) => ({
  // Sheet configuration
  sheetUrl: '',
  sheetId: '',
  isConnected: false,

  // Active week: 'week1' | 'week2'
  activeWeek: 'week1',

  // View tabs: 'all' | 'community' | 'my'
  activeTab: 'all',

  // Recipes — merged from GitHub + Sheet
  recipes: [],
  communityRecipes: [],  // from Sheet CSV
  myRecipes: [],         // user-submitted, stored locally + Sheet
  recipesLoading: false,

  // GitHub recipe cache (raw, before tab split)
  githubRecipes: [],

  // Filters
  filters: {
    category: '',       // Breakfast, Lunch, Dinner, Snacks
    cuisine: '',        // American, Mexican, Italian, Asian, Mediterranean, Indian, Other
    calories: '',       // under200, 200-400, 400-600, over600
    cookTime: '',       // under15, 15-30, 30-60, over60
    dietType: '',       // None, Vegetarian, Vegan, Keto, Low Carb, Gluten-Free, Dairy-Free
    protein: '',         // Low, Medium, High
    ingredientCount: '', // upTo5, 6to10, over10
  },

  // Active filter chips for display
  activeFilters: [],

  // Shopping list
  shoppingList: [],

  // Two-week meal plan
  week1MealPlan: DAYS.reduce((acc, day) => {
    acc[day] = MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {});
    return acc;
  }, {}),
  week2MealPlan: DAYS.reduce((acc, day) => {
    acc[day] = MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {});
    return acc;
  }, {}),

  // Load full meal plan from Google Sheet (both weeks)
  loadFromSheet: async (sheetId) => {
    if (!sheetId) return;
    try {
      const res = await fetch(`/api/sheet-read?sheetId=${sheetId}&range=planner!A2:K15`);
      if (!res.ok) throw new Error(`Sheet read failed: ${res.status}`);
      const { values } = await res.json();
      console.log('[store] loadFromSheet received', values?.length ?? 0, 'rows');
      if (!values || !values.length) { console.log('[store] No data rows returned'); return; }

      const week1 = {};
      const week2 = {};
      DAYS.forEach(day => {
        week1[day] = MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {});
        week2[day] = MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {});
      });


      // Map row index to day (0=Mon Meal, 1=Mon Cal, 2=Tue Meal, ...)
      const rowToDay = {};
      [0,1,2,3,4,5,6,7,8,9,10,11,12,13].forEach(i => {
        const dayIdx = Math.floor(i / 2);
        rowToDay[i] = DAYS[dayIdx];
      });


      // Week 1 cols: C=2, D=3, E=4, F=5 (0-indexed in row array, but row[0]=A, row[1]=B)
      // So Breakfast=col 2 (C), Lunch=col 3 (D), Dinner=col 4 (E), Snacks=col 5 (F)
      // Week 2 cols: H=7 (J), I=8 (K), J=9 (L), K=10 (M)

      values.forEach((row, idx) => {
        const day = rowToDay[idx];
        if (!day || idx % 2 !== 0) return; // skip calorie rows
        MEALS.forEach((meal, mi) => {
          week1[day][meal] = row[mi + 2] || '';  // col C/D/E/F
          week2[day][meal] = row[mi + 7] || '';  // col H/I/J/K
        });
      });

      set({ week1MealPlan: week1, week2MealPlan: week2 });
      console.log('[store] Loaded meal plans from sheet', { week1, week2 });
    } catch (e) {
      console.error('[store] loadFromSheet error:', e);
    }
  },


  // Sync meal plan to Google Sheet (both weeks)
  syncToSheet: async (week1MealPlan, week2MealPlan) => {
    try {
      const res = await fetch('/api/sheet-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week1MealPlan, week2MealPlan }),
      });
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
      const data = await res.json();
      console.log(`[store] Synced ${data.syncedMeals} meals to sheet`);
    } catch (e) {
      console.error('[store] syncToSheet error:', e);
    }
  },

  // Check and apply weekly rollover if needed
  checkRollover: () => {
    const { week1MealPlan, week2MealPlan } = get();
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const todayStr = today.toISOString().split('T')[0];
    const lastRollover = localStorage.getItem('lastWeekRollover');
    if (!isSunday || lastRollover === todayStr) return;
    // Rollover: week2 -> week1, clear week2
    set({
      week1MealPlan: { ...week2MealPlan },
      week2MealPlan: DAYS.reduce((acc, day) => {
        acc[day] = MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {});
        return acc;
      }, {}),
    });
    localStorage.setItem('lastWeekRollover', todayStr);
  },

  // Computed: mealPlan points to active week (backward compat)
  getMealPlan: () => {
    const { activeWeek, week1MealPlan, week2MealPlan } = get();
    return activeWeek === 'week2' ? week2MealPlan : week1MealPlan;
  },

  setActiveWeek: (week) => set({ activeWeek: week }),

  // Notification
  notification: '',
  setNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => set({ notification: '' }), 3000);
  },

  // Actions
  setSheetUrl: (url) => {
    const id = extractSheetId(url);
    set({ sheetUrl: url, sheetId: id, isConnected: !!id });
  },

  setRecipesLoading: (loading) => set({ recipesLoading: loading }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Load all GitHub recipes on startup (via server-side API route for speed)
  loadGitHubRecipes: async () => {
    set({ recipesLoading: true });
    try {
      // Check localStorage cache first (valid 1 hour)
      const cached = localStorage.getItem('githubRecipesCache');
      const cacheTime = localStorage.getItem('githubRecipesCacheTime');
      const oneHour = 60 * 60 * 1000;
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < oneHour) {
        const unique = JSON.parse(cached);
        console.log('[store] Cache hit: loading', unique.length, 'from localStorage');
        set({ githubRecipes: unique, recipes: unique, recipesLoading: false });
        return;
      }
      // Fetch via API route (server handles parallel fan-out)
      console.log('[store] Cache miss - calling /api/recipes');
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const unique = data.recipes;
      // Cache for next time
      localStorage.setItem('githubRecipesCache', JSON.stringify(unique));
      localStorage.setItem('githubRecipesCacheTime', Date.now().toString());
      console.log('[store] Loaded', unique.length, 'recipes from API');
      set({ githubRecipes: unique, recipes: unique });
    } catch (e) { console.error('[store] loadGitHubRecipes error:', e); }
    finally { set({ recipesLoading: false }); }
  },

  // Load community recipes from Sheet CSV export
  loadCommunityRecipes: async (sheetId) => {
    if (!sheetId) return;
    try {
      const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=466527247`);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.split('\n');
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]);
        if (vals.length === 0 || (vals.length === 1 && vals[0] === '')) continue;
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
        obj._source = 'community';
        rows.push(obj);
      }
      set({ communityRecipes: rows });
    } catch (e) { if (e.name !== 'TypeError' || !e.message.includes('Failed to fetch')) console.error('Community recipes error', e); }
  },

  // Add a user-submitted recipe
  addMyRecipe: async (recipe, sheetId) => {
    set(state => ({ myRecipes: [...state.myRecipes, { ...recipe, _source: 'mine' }] }));
    if (sheetId) {
      const row = [
        recipe.name || '',
        (recipe.ingredients || []).join('|'),
        recipe.servings || '',
        recipe.calories || '',
        recipe.protein || '',
        recipe.cuisine || '',
        recipe.diet || '',
        recipe.cookTime || '',
        recipe.prepTime || '',
        (recipe.instructions || []).join('|'),
        recipe.imageUrl || '',
        recipe.category || '',
        recipe.submittedBy || 'Me',
        new Date().toISOString().split('T')[0],
      ];
      try {
        await fetch('/api/sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetId, range: 'my-recipes!A2', values: [row] }),
        });
      } catch (e) { console.error('Failed to write to sheet', e); }
    }
  },

  setFilter: (key, value) => set(state => {
    const newFilters = { ...state.filters, [key]: value };
    const active = buildActiveFilters(newFilters);
    return { filters: newFilters, activeFilters: active };
  }),

  clearFilters: () => set({
    filters: {
      category: '',
      cuisine: '',
      calories: '',
      cookTime: '',
      dietType: '',
      protein: '',
      ingredientCount: '',
    },
    activeFilters: [],
  }),

  // Computed: recipes for active tab
  getTabRecipes: () => {
    const { activeTab, githubRecipes, communityRecipes, myRecipes } = get();
    switch (activeTab) {
      case 'community': return communityRecipes;
      case 'my': return myRecipes;
      default: return githubRecipes;
    }
  },

  // Computed: recipes filtered by current filter state (uses active tab recipes)
  getFilteredRecipes: () => {
    const { recipes, filters } = get();
    if (!recipes.length) return [];
    return recipes.filter(r => {
      // Category
      if (filters.category && ((r.category || r.Category) || '').toLowerCase() !== filters.category.toLowerCase()) {
        // "Snacks" category should also include snacks in Snacks filter
        const cat = ((r.category || r.Category) || '').toLowerCase();
        const target = filters.category.toLowerCase();
        if (target === 'snacks') {
          if (cat !== 'snack' && cat !== 'snacks') return false;
        } else {
          if (cat !== target) return false;
        }
      }
      // Cuisine
      if (filters.cuisine && ((r.cuisine || r.Ethnicity) || '').toLowerCase() !== filters.cuisine.toLowerCase()) return false;
      // Calories
      if (filters.calories) {
        const cal = parseInt(r.calories ?? r.Calories) || 0;
        switch (filters.calories) {
          case 'under200': if (cal >= 200) return false; break;
          case '200-400': if (cal < 200 || cal > 400) return false; break;
          case '400-600': if (cal < 400 || cal > 600) return false; break;
          case 'over600': if (cal < 600) return false; break;
        }
      }
      // Cook time — parse "30 min" format
      if (filters.cookTime && (r.cookTime || r.CookTime)) {
        const cookRaw = r.cookTime || r.CookTime || '';
        const minMatch = cookRaw.toString().match(/(\d+)/);
        const cookMin = minMatch ? parseInt(minMatch[1]) : 0;
        switch (filters.cookTime) {
          case 'under15': if (cookMin >= 15) return false; break;
          case '15-30': if (cookMin < 15 || cookMin > 30) return false; break;
          case '30-60': if (cookMin < 30 || cookMin > 60) return false; break;
          case 'over60': if (cookMin < 60) return false; break;
        }
      }
      // Diet type — check Notes or Category for diet tags
      if (filters.dietType && filters.dietType !== 'None') {
        const text = ((r.notes || r.Notes || '') + ' ' + ((r.category || r.Category) || '')).toLowerCase();
        switch (filters.dietType) {
          case 'Vegetarian': if (!text.includes('vegetarian')) return false; break;
          case 'Vegan': if (!text.includes('vegan')) return false; break;
          case 'Keto': if (!text.includes('keto')) return false; break;
          case 'Low Carb': if (!text.includes('low carb')) return false; break;
          case 'Gluten-Free': if (!text.includes('gluten')) return false; break;
          case 'Dairy-Free': if (!text.includes('dairy')) return false; break;
        }
      }
      // Protein level
      if (filters.protein) {
        const lvl = ((r.proteinLevel || r.ProteinLevel || r.protein || '') || '').toLowerCase();
        if (lvl !== filters.protein.toLowerCase()) return false;
      }
      // Ingredient count
      if (filters.ingredientCount) {
        const ings = r.ingredients || r.Ingredients || [];
        const count = Array.isArray(ings) ? ings.length : (ings || '').split('|').filter(Boolean).length;
        switch (filters.ingredientCount) {
          case 'upTo5': if (count > 5) return false; break;
          case '6to10': if (count < 6 || count > 10) return false; break;
          case 'over10': if (count < 10) return false; break;
        }
      }
      return true;
    });
  },

  setMeal: (day, meal, recipeName, weekOverride) => set(state => {
    const target = weekOverride || (state.activeWeek === 'week2' ? 'week2MealPlan' : 'week1MealPlan');
    return {
      [target]: {
        ...state[target],
        [day]: {
          ...state[target][day],
          [meal]: recipeName,
        }
      }
    };
  }),

  clearMeal: (day, meal, weekOverride) => set(state => {
    const target = weekOverride || (state.activeWeek === 'week2' ? 'week2MealPlan' : 'week1MealPlan');
    return {
      [target]: {
        ...state[target],
        [day]: {
          ...state[target][day],
          [meal]: '',
        }
      }
    };
  }),

  clearWeek: (weekOverride) => set(state => {
    const target = weekOverride || (state.activeWeek === 'week2' ? 'week2MealPlan' : 'week1MealPlan');
    const cleared = DAYS.reduce((acc, day) => {
      acc[day] = MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {});
      return acc;
    }, {});
    return { [target]: cleared };
  }),

  clearDay: (day, weekOverride) => set(state => {
    const target = weekOverride || (state.activeWeek === 'week2' ? 'week2MealPlan' : 'week1MealPlan');
    return {
      [target]: {
        ...state[target],
        [day]: MEALS.reduce((m, meal) => { m[meal] = ''; return m; }, {}),
      }
    };
  }),

  randomFillDay: (day, weekOverride) => {
    const { recipes, getFilteredRecipes } = get();
    const filtered = getFilteredRecipes();
    const pool = filtered.length > 0 ? filtered : recipes;
    if (pool.length === 0) return;
    set(state => {
      const target = weekOverride || (state.activeWeek === 'week2' ? 'week2MealPlan' : 'week1MealPlan');
      return {
        [target]: {
          ...state[target],
          [day]: MEALS.reduce((m, meal) => {
            const catMeal = meal.toLowerCase();
            const catFiltered = pool.filter(r => {
              const cat = ((r.category || r.Category) || '').toLowerCase();
              return cat === catMeal || cat === 'snack' || cat === 'snacks';
            });
            const pick = catFiltered.length > 0
              ? catFiltered[Math.floor(Math.random() * catFiltered.length)]
              : pool[Math.floor(Math.random() * pool.length)];
            m[meal] = (pick?.name || pick?.Name) || '';
            return m;
          }, {}),
        }
      };
    });
  },

  randomFill: (weekOverride) => {
    const { recipes, getFilteredRecipes } = get();
    const filtered = getFilteredRecipes();
    const pool = filtered.length > 0 ? filtered : recipes;
    if (pool.length === 0) return;
    set(state => {
      const target = weekOverride || (state.activeWeek === 'week2' ? 'week2MealPlan' : 'week1MealPlan');
      const newPlan = DAYS.reduce((acc, day) => {
        acc[day] = MEALS.reduce((m, meal) => {
          const catMeal = meal.toLowerCase();
          const catFiltered = pool.filter(r => {
            const cat = ((r.category || r.Category) || '').toLowerCase();
            return cat === catMeal || cat === 'snack' || cat === 'snacks';
          });
          const pick = catFiltered.length > 0
            ? catFiltered[Math.floor(Math.random() * catFiltered.length)]
            : pool[Math.floor(Math.random() * pool.length)];
          m[meal] = (pick?.name || pick?.Name) || '';
          return m;
        }, {});
        return acc;
      }, {});
      return { [target]: newPlan };
    });
  },

  // Shopping list actions
  addToShoppingList: (ingredientNames, forceCategory) => set(state => {
    const existing = new Set(state.shoppingList.map(i => i.name.toLowerCase()));
    const newItems = ingredientNames
      .map(name => name.trim())
      .filter(name => name && !existing.has(name.toLowerCase()))
      .map(name => ({
        name,
        category: forceCategory || categorizeIngredient(name),
        purchased: false,
      }));
    if (!newItems.length) return {};
    return { shoppingList: [...state.shoppingList, ...newItems] };
  }),

  removeFromShoppingList: (name) => set(state => ({
    shoppingList: state.shoppingList.filter(i => i.name.toLowerCase() !== name.toLowerCase()),
  })),

  togglePurchased: (name) => set(state => ({
    shoppingList: state.shoppingList.map(i =>
      i.name.toLowerCase() === name.toLowerCase() ? { ...i, purchased: !i.purchased } : i
    ),
  })),

  // Sync meal plan to Google Sheet
  syncToSheet: async (week1MealPlan, week2MealPlan) => {
    try {
      const res = await fetch('/api/sheet-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week1MealPlan, week2MealPlan }),
      });
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
      const data = await res.json();
      console.log(`[store] Synced ${data.syncedMeals} meals to sheet`);
    } catch (e) {
      console.error('[store] syncToSheet error:', e);
    }
  },

  getShoppingListCount: () => get().shoppingList.filter(i => !i.purchased).length,
}));

function parseCSVLine(line) {
  const result = [];
  let current = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function extractSheetId(url) {
  if (!url) return '';
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

function buildActiveFilters(filters) {
  const active = [];
  if (filters.category) active.push({ key: 'category', label: filters.category });
  if (filters.cuisine) active.push({ key: 'cuisine', label: filters.cuisine });
  if (filters.calories) {
    const labels = { under200: 'Under 200 cal', '200-400': '200–400 cal', '400-600': '400–600 cal', over600: '600+ cal' };
    active.push({ key: 'calories', label: labels[filters.calories] });
  }
  if (filters.cookTime) {
    const labels = { under15: 'Under 15 min', '15-30': '15–30 min', '30-60': '30–60 min', over60: '60+ min' };
    active.push({ key: 'cookTime', label: labels[filters.cookTime] });
  }
  if (filters.dietType) active.push({ key: 'dietType', label: filters.dietType });
  if (filters.protein) active.push({ key: 'protein', label: filters.protein + ' protein' });
  if (filters.ingredientCount) {
    const labels = { upTo5: '5 or fewer ingredients', '6to10': '6–10 ingredients', over10: '10+ ingredients' };
    active.push({ key: 'ingredientCount', label: labels[filters.ingredientCount] });
  }
  return active;
}
