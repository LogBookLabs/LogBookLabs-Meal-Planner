'use client';
import { useState, useEffect, useRef } from 'react';
import { useMealPlannerStore } from '../lib/store';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const MEAL_GRADIENTS = {
  Breakfast: { from: '#F59E0B', to: '#D97706' },
  Lunch: { from: '#10B981', to: '#059669' },
  Dinner: { from: '#7C3AED', to: '#6D28D9' },
  Snacks: { from: '#F43F5E', to: '#E11D48' },
};
const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snacks: '🍿' };
const INGREDIENT_EMOJIS = {
  'avocado': '🥑', 'eggs': '🥚', 'egg': '🥚', 'bread': '🍞', 'toast': '🍞', 'sourdough': '🍞',
  'chicken': '🍗', 'beef': '🥩', 'pork': '🥓', 'salmon': '🐟', 'shrimp': '🦐', 'tuna': '🐟', 'fish': '🐟',
  'cheese': '🧀', 'yogurt': '🥛', 'milk': '🥛', 'cream': '🥛', 'butter': '🧈',
  'rice': '🍚', 'noodles': '🍜', 'pasta': '🍝', 'noodle': '🍜', 'spaghetti': '🍝', 'macaroni': '🍝',
  'tomato': '🍅', 'tomatoes': '🍅', 'onion': '🧅', 'garlic': '🧄', 'pepper': '🫑', 'peppers': '🫑', 'bell pepper': '🫑',
  'carrot': '🥕', 'lettuce': '🥬', 'spinach': '🥬', 'broccoli': '🥦', 'cucumber': '🥒', 'corn': '🌽', 'zucchini': '🥒',
  'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'berries': '🫐', 'strawberry': '🍓', 'lemon': '🍋', 'lime': '🍋', 'mango': '🥭', 'pineapple': '🍍', 'grape': '🍇', 'grapes': '🍇', 'watermelon': '🍉',
  'almond': '🌰', 'walnut': '🌰', 'peanut': '🥜', 'nut': '🌰', 'nuts': '🌰', 'pecan': '🌰', 'cashew': '🥜',
  'oil': '🫒', 'olive oil': '🫒', 'honey': '🍯', 'sauce': '🫕', 'salsa': '🫕', 'soy sauce': '🫕',
  'oat': '🌾', 'oats': '🌾', 'flour': '🌾', 'sugar': '🍬', 'salt': '🧂', 'pepper': '🧂',
  'potato': '🥔', 'potatoes': '🥔', 'mushroom': '🍄', 'beans': '🫘', 'chickpeas': '🫘', 'lentils': '🫘',
  'cilantro': '🌿', 'basil': '🌿', 'parsley': '🌿', 'ginger': '🫚', 'mint': '🌿', 'rosemary': '🌿', 'thyme': '🌿',
  'bagel': '🥯', 'croissant': '🥐', 'muffin': '🧁', 'chocolate': '🍫', 'cocoa': '🍫',
  'chickpea': '🫘', 'tofu': '🧈', 'edamame': '🫘',
  'vinegar': '🍶', 'wine': '🍷', 'broth': '🍲', 'stock': '🍲',
  'mayonnaise': '🥚', 'mustard': '🟡', 'ketchup': '🍅', 'mayo': '🥚',
  'wrap': '🌯', 'tortilla': '🌯', 'pita': '🥙',
  'ham': '🥓', 'bacon': '🥓', 'sausage': '🌭', 'hot dog': '🌭',
  'granola': '🌾', 'maple': '🍯', 'cinnamon': '🟫', 'vanilla': '🍦', 'yeast': '🧫',
};
function getIngredientEmoji(name) {
  var lower = (name || '').toLowerCase();
  for (var key in INGREDIENT_EMOJIS) {
    if (lower.includes(key)) return INGREDIENT_EMOJIS[key];
  }
  return '•';
}
const SERVICE_EMAIL = 'trill-sheets-access@trill-hmi.iam.gserviceaccount.com';
const SHOPPING_CATEGORIES = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Grains & Bread', 'Pantry', 'Frozen', 'Bakery', 'Beverages', 'Condiments', 'Snacks', 'Other'];

export default function MealPlannerPage() {
  const store = useMealPlannerStore();
  const isConnected = store.isConnected;
  const setSheetUrl = store.setSheetUrl;
  const [githubLoaded, setGithubLoaded] = useState(false);

  const recipes = githubLoaded ? (store.githubRecipes || []) : [];
  const activeWeek = store.activeWeek || 'week1';
  const setActiveWeek = store.setActiveWeek;
  const [targetWeek, setTargetWeek] = useState('week1');
  const mealPlan = activeWeek === 'week2' ? (store.week2MealPlan || {}) : (store.week1MealPlan || {});
  const setMeal = store.setMeal;
  const clearDay = store.clearDay;
  const clearWeek = store.clearWeek;
  const randomFillDay = store.randomFillDay;
  const randomFill = store.randomFill;
  const sheetId = store.sheetId;
  const notification = store.notification || '';
  const setNotification = store.setNotification || function(){};
  const shoppingList = store.shoppingList || [];
  const addToShoppingList = store.addToShoppingList;
  const removeFromShoppingList = store.removeFromShoppingList;
  const togglePurchased = store.togglePurchased;
  const clearShoppingList = store.clearShoppingList;

  const [inputUrl, setInputUrl] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [weekView, setWeekView] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Shopping list state
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [modalRecipe, setModalRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  // Recipe picker filters
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMeal, setPickerMeal] = useState('');
  const [pickerCuisine, setPickerCuisine] = useState('');
  const [pickerDiet, setPickerDiet] = useState('');
  const [pickerCalories, setPickerCalories] = useState('');
  const [pickerCookTime, setPickerCookTime] = useState('');
  const [pickerProtein, setPickerProtein] = useState('');
  const [pickerIngredients, setPickerIngredients] = useState('');

  // Settings & dark mode
  const [darkMode, setDarkMode] = useState(function() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [showSettings, setShowSettings] = useState(false);

  // Picker state
  const [pickerTab, setPickerTab] = useState('recipes');
  const [quickAddText, setQuickAddText] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Cook Mode state
  const [cookMode, setCookMode] = useState(false);
  const [cookStep, setCookStep] = useState(0);
  const [cookTimer, setCookTimer] = useState(null);
  const [cookTimerRunning, setCookTimerRunning] = useState(false);
  const [cookTimerSeconds, setCookTimerSeconds] = useState(0);

  // Shopping list manual entry
  const [manualItem, setManualItem] = useState('');
  const [manualCategory, setManualCategory] = useState('Other');

  // Toast timer ref
  const toastTimer = useRef(null);

  const cartCount = shoppingList.filter(i => !i.purchased).length;

  function showToast(msg) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    // Bump cart
    setCartBump(true);
    setTimeout(() => setCartBump(false), 250);
    setTimeout(() => setToastMessage(''), 3000);
  }

  function toggleDarkMode() {
    var next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    // Apply dark mode directly to the root div's inline styles
    var root = document.querySelector('[data-dark]');
    if (root) {
      if (next) {
        root.setAttribute('data-dark', 'true');
        root.style.background = '#0B1D2E';
        root.style.color = '#E8F4F8';
      } else {
        root.removeAttribute('data-dark');
        root.style.background = '#F7FAFB';
        root.style.color = '#1E2A33';
      }
    }
    document.body.className = next ? 'dark' : '';
  }

  // Apply dark mode class to body
  useEffect(function() {
    if (typeof document !== 'undefined') {
      document.body.className = darkMode ? 'dark' : '';
      var root = document.querySelector('[data-dark]');
      if (root) {
        if (darkMode) root.setAttribute('data-dark', 'true');
        else root.removeAttribute('data-dark');
      }
    }
  }, [darkMode]);

  // ESC key closes recipe detail
  useEffect(function() {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (cookMode) { setCookMode(false); setCookTimerRunning(false); return; }
        if (showInstructions) { setShowInstructions(false); return; }
        if (selectedRecipe) { handleBackToList(); }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return function() { document.removeEventListener('keydown', handleKeyDown); };
  }, [selectedRecipe, cookMode]);

  // Cook mode timer tick
  useEffect(function() {
    if (!cookTimerRunning || cookTimerSeconds <= 0) return;
    var interval = setInterval(function() {
      setCookTimerSeconds(function(s) { return s > 0 ? s - 1 : 0; });
    }, 1000);
    return function() { clearInterval(interval); };
  }, [cookTimerRunning]);

  // Load GitHub recipes and initial sheet data on mount
  useEffect(function() {
    if (typeof window === 'undefined') return;
    window.__debugStore = useMealPlannerStore.getState();
    store.checkRollover();
    store.loadGitHubRecipes().then(function() { setGithubLoaded(true); }).catch(function() {});
    // Auto-load meal plan from the connected Google Sheet (new sheet with proper sharing)
    store.loadFromSheet('13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI').catch(function() {});
    // Restore sheet URL if previously connected (for display purposes only — new sheet has no community tab)
    const saved = localStorage.getItem('sheetUrl') || '';
    setInputUrl(saved);
    if (saved) {
      setSheetUrl(saved);
    }
    // Community recipes loading removed — old URL deprecated, new sheet has no community tab
  }, []);

  // Load community recipes only when explicitly switching to community tab
  useEffect(function() {
    if (!isConnected || !sheetId) return;
    if (store.activeTab !== 'community') return;
    store.loadCommunityRecipes(sheetId).catch(function() {});
  }, [isConnected, sheetId, store.activeTab]);

  function showNotify(msg) {
    setNotification(msg);
    setTimeout(function() { setNotification(''); }, 3000);
  }

  function handleConnect() {
    if (!inputUrl.includes('spreadsheets')) {
      showNotify('Please paste a valid Google Sheets URL');
      return;
    }
    setSheetUrl(inputUrl);
    localStorage.setItem('sheetUrl', inputUrl);
    showNotify('Connected! Loading recipes...');
  }

  function handleSaveMeal(day, meal, recipeName, week) {
    var effectiveWeek = week || (targetWeek !== 'week1' ? targetWeek : null);
    setMeal(day, meal, recipeName, effectiveWeek);
    closePicker();
    if (!sheetId) return;
    const week2ColMap = { Breakfast: 'H', Lunch: 'I', Dinner: 'J', Snacks: 'K' };
    const week1ColMap = { Breakfast: 'C', Lunch: 'D', Dinner: 'E', Snacks: 'F' };
    const isWeek2 = (week === 'week2' || effectiveWeek === 'week2' || activeWeek === 'week2');
    const colMap = isWeek2 ? week2ColMap : week1ColMap;
    const dayRow = { Monday: 2, Tuesday: 4, Wednesday: 6, Thursday: 8, Friday: 10, Saturday: 12, Sunday: 14 }[day] || 2;
    fetch('/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId: '13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI', range: 'planner!' + colMap[meal] + dayRow, values: [[recipeName]] }),
    }).then(function() { showNotify('Saved to sheet'); }).catch(function() { showNotify('Saved locally only'); });
  }

  function getPickerRecipes() {
    var all = store.githubRecipes || [];
    if (!all.length) return [];
    var target = pickerMeal ? pickerMeal.toLowerCase() : activeMeal.toLowerCase();
    var base = all.filter(function(r) {
      var cat = (r.category || '').toLowerCase();
      return cat === target || cat === 'snack' || cat === 'snacks';
    });
    if (!base.length) return base;
    if (pickerCuisine) {
      base = base.filter(function(r) { return (r.cuisine || '').toLowerCase() === pickerCuisine.toLowerCase(); });
    }
    if (pickerDiet) {
      base = base.filter(function(r) {
        var text = ((r.diet || '') + ' ' + (r.category || '')).toLowerCase();
        switch (pickerDiet) {
          case 'Vegetarian': return text.includes('vegetarian');
          case 'Vegan': return text.includes('vegan');
          case 'Keto': return text.includes('keto');
          case 'Low Carb': return text.includes('low carb');
          case 'Gluten-Free': return text.includes('gluten');
          case 'Dairy-Free': return text.includes('dairy');
          default: return true;
        }
      });
    }
    if (pickerCalories) {
      base = base.filter(function(r) {
        var cal = parseInt(r.calories) || 0;
        switch (pickerCalories) {
          case 'Under 200': return cal < 200;
          case '200-400': return cal >= 200 && cal <= 400;
          case '400-600': return cal >= 400 && cal <= 600;
          case '600+': return cal > 600;
          default: return true;
        }
      });
    }
    if (pickerCookTime) {
      base = base.filter(function(r) {
        var m = r.cookTime ? r.cookTime.toString().match(/(\d+)/) : null;
        var cm = m ? parseInt(m[1]) : 0;
        switch (pickerCookTime) {
          case 'Under 15': return cm < 15;
          case '15-30': return cm >= 15 && cm <= 30;
          case '30-60': return cm >= 30 && cm <= 60;
          case '60+': return cm > 60;
          default: return true;
        }
      });
    }
    if (pickerProtein) {
      base = base.filter(function(r) {
        var grams = parseInt((r.protein || '0').replace(/g$/, '')) || 0;
        switch (pickerProtein) {
          case 'Low': return grams < 15;
          case 'Medium': return grams >= 15 && grams <= 35;
          case 'High': return grams > 35;
          default: return true;
        }
      });
    }
    if (pickerIngredients) {
      base = base.filter(function(r) {
        var cnt = Object.keys(r.ingredients || {}).length;
        switch (pickerIngredients) {
          case '5 or less': return cnt <= 5;
          case '6-10': return cnt >= 6 && cnt <= 10;
          case '10+': return cnt > 10;
          default: return true;
        }
      });
    }
    if (pickerSearch) {
      var q = pickerSearch.toLowerCase();
      base = base.filter(function(r) { return (r.name || '').toLowerCase().includes(q) || (r.cuisine || '').toLowerCase().includes(q); });
    }
    return base;
  }

  function resetPickerFilters() {
    setPickerSearch(''); setPickerMeal(''); setPickerCuisine(''); setPickerDiet(''); setPickerCalories(''); setPickerCookTime(''); setPickerProtein(''); setPickerIngredients('');
  }

  function openPicker(day, meal, week) {
    setActiveDay(day);
    setActiveMeal(meal);
    if (week) setTargetWeek(week);
    resetPickerFilters();
    setSelectedRecipe(null);
    setPickerTab('recipes');
    setQuickAddText('');
    setShowRecipePicker(true);
  }

  function closePicker() {
    setShowRecipePicker(false);
    setSelectedRecipe(null);
    setPickerTab('recipes');
    setQuickAddText('');
    resetPickerFilters();
  }

  function handleSelectRecipe(r) {
    setSelectedRecipe(r);
  }

  function handleAddRecipe() {
    if (!selectedRecipe) return;
    var name = selectedRecipe.Name || selectedRecipe.name || '';
    handleSaveMeal(activeDay, activeMeal, name, targetWeek !== 'week1' ? targetWeek : null);
  }

  function handleBackToList() {
    setSelectedRecipe(null);
  }

  function handleQuickAdd() {
    var text = quickAddText.trim();
    if (!text) return;
    handleSaveMeal(activeDay, activeMeal, text, targetWeek !== 'week1' ? targetWeek : null);
  }

  // ── INGREDIENTS MODAL ────────────────────────────────────────────────────
  function openIngredientsModal(recipe) {
    if (!recipe || !recipe.ingredients) return;
    var ings;
    if (Array.isArray(recipe.ingredients)) {
      ings = recipe.ingredients.filter(Boolean).map(function(i) { return typeof i === 'string' ? i.trim() : i; });
    } else if (typeof recipe.ingredients === 'string') {
      ings = recipe.ingredients.split('|').filter(Boolean).map(function(i) { return i.trim(); });
    } else {
      ings = Object.keys(recipe.ingredients);
    }
    var init = {};
    ings.forEach(function(ing) { init[typeof ing === 'string' ? ing.trim() : JSON.stringify(ing)] = false; });
    setModalRecipe(recipe);
    setSelectedIngredients(init);
    setShowIngredientsModal(true);
  }

  function closeIngredientsModal() {
    setShowIngredientsModal(false);
    setModalRecipe(null);
    setSelectedIngredients({});
  }

  function handleAddSelectedToList() {
    if (!modalRecipe || !modalRecipe.ingredients) return;
    var allIngs;
    if (Array.isArray(modalRecipe.ingredients)) {
      allIngs = modalRecipe.ingredients.filter(Boolean).map(function(i) { return typeof i === 'string' ? i.trim() : i; });
    } else if (typeof modalRecipe.ingredients === 'string') {
      allIngs = modalRecipe.ingredients.split('|').filter(Boolean).map(function(i) { return i.trim(); });
    } else {
      allIngs = Object.keys(modalRecipe.ingredients);
    }
    const toAdd = allIngs.filter(function(ing) { return selectedIngredients[typeof ing === 'string' ? ing.trim() : JSON.stringify(ing)]; });
    if (toAdd.length === 0) {
      showToast('No items selected');
      return;
    }
    addToShoppingList(toAdd.map(function(i) { return typeof i === 'string' ? i.trim() : JSON.stringify(i); }));
    showToast(toAdd.length + ' item' + (toAdd.length > 1 ? 's' : '') + ' added to shopping list');
    closeIngredientsModal();
  }

  function handleClearSelected() {
    const cleared = {};
    Object.keys(selectedIngredients).forEach(k => { cleared[k] = false; });
    setSelectedIngredients(cleared);
  }

  function handleAddAllToList() {
    if (!modalRecipe || !modalRecipe.ingredients) return;
    var allIngs;
    if (Array.isArray(modalRecipe.ingredients)) {
      allIngs = modalRecipe.ingredients.filter(Boolean).map(function(i) { return typeof i === 'string' ? i.trim() : i; });
    } else if (typeof modalRecipe.ingredients === 'string') {
      allIngs = modalRecipe.ingredients.split('|').filter(Boolean).map(function(i) { return i.trim(); });
    } else {
      allIngs = Object.keys(modalRecipe.ingredients);
    }
    addToShoppingList(allIngs.map(function(i) { return typeof i === 'string' ? i.trim() : JSON.stringify(i); }));
    showToast(allIngs.length + ' items added to shopping list');
    closeIngredientsModal();
  }

  // ── SHOPPING LIST HELPERS ────────────────────────────────────────────────
  function getGroupedList() {
    const grouped = {};
    SHOPPING_CATEGORIES.forEach(cat => { grouped[cat] = []; });
    shoppingList.forEach(item => {
      const cat = SHOPPING_CATEGORIES.includes(item.category) ? item.category : 'Other';
      grouped[cat].push(item);
    });
    return grouped;
  }

  function handleAddManualItem() {
    const name = manualItem.trim();
    if (!name) return;
    addToShoppingList([name], manualCategory);
    showToast('1 item added to shopping list');
    setManualItem('');
  }

  function handleClearShoppingList() {
    clearShoppingList();
    setShowClearConfirm(false);
    showToast('Shopping list cleared');
  }

  function handlePrint() {
    window.print();
  }

  // ── NOT CONNECTED ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#ffffff', borderRadius: 24, boxShadow: '0 4px 32px rgba(11,29,46,0.10)', maxWidth: 560, width: '100%', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #0B1D2E 0%, #145C7E 100%)', padding: '2rem 2.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>
              Meal<span style={{ color: '#1A8BA5' }}>Planner</span> Pro
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>by LogBook Labs</div>
          </div>
          <div style={{ padding: '2rem 2.5rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1E2A33', marginBottom: '0.5rem' }}>Connect Your Sheet</h2>
            <p style={{ color: '#5A7180', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>Paste the URL of your Meal Planner Google Sheet to get started.</p>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                value={inputUrl}
                onChange={function(e) { setInputUrl(e.target.value); }}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #D1E3EA', borderRadius: 12, fontSize: '0.9rem', color: '#1E2A33', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={function() { handleConnect(); }}
              style={{ width: '100%', padding: '0.875rem', background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >Connect</button>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F7FAFB', borderRadius: 16 }}>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#5A7180', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Setup Steps</p>
              <ol style={{ margin: 0, padding: '0 0 0 1.25rem', color: '#1E2A33', fontSize: '0.875rem', lineHeight: 2 }}>
                <li>Open your Google Sheet copy</li>
                <li>Click <strong style={{ color: '#1A8BA5' }}>Share</strong> and paste this email:<br />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                    <code style={{ background: '#E8F4F8', color: '#145C7E', padding: '0.15rem 0.4rem', borderRadius: 6, fontSize: '0.8rem', flex: 1 }}>{SERVICE_EMAIL}</code>
                    <button
                      onClick={function() {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(SERVICE_EMAIL).then(function() {
                            setEmailCopied(true);
                            setTimeout(function() { setEmailCopied(false); }, 2000);
                          });
                        }
                      }}
                      style={{ background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                    >{emailCopied ? 'Copied!' : 'Copy'}</button>
                  </div>
                </li>
                <li>Set permissions to <strong>Editor</strong>, then paste your sheet URL above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RECIPE PICKER MODAL ────────────────────────────────────────────────────
  var pickerRecipes = getPickerRecipes();
  var totalForMeal = pickerMeal ? pickerMeal.toLowerCase() : activeMeal.toLowerCase();
  var totalRecipes = recipes.filter(function(r) {
    var cat = (r.category || '').toLowerCase();
    return cat === totalForMeal || cat === 'snack' || cat === 'snacks';
  });
  var hasActivePickerFilters = pickerSearch || pickerMeal || pickerCuisine || pickerDiet || pickerCalories || pickerCookTime || pickerProtein || pickerIngredients;

  var recipePicker = showRecipePicker ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(11,29,46,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={function(e) { if (e.target === e.currentTarget) { closePicker(); } }}>
      <div style={{ width: '100%', maxWidth: 1160, maxHeight: '92vh', background: '#ffffff', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(11,29,46,0.18)', margin: '0 1rem' }}>
        {/* Header with back button */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E8F4F8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={function() { if (selectedRecipe) { setSelectedRecipe(null); } else { closePicker(); } }}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#1A8BA5', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0' }}
          >
            <span style={{ fontSize: '1rem' }}>←</span> Back
          </button>
        </div>

        {pickerTab === 'recipes' && !selectedRecipe && (
          <div>
            <div style={{ padding: '0.625rem 1.5rem', borderBottom: '1px solid #E8F4F8', background: '#F7FAFB', display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <input type="text" placeholder="Search recipes..." value={pickerSearch} onChange={function(e) { setPickerSearch(e.target.value); }} style={{ flex: '0 1 300px', padding: '0.375rem 0.5rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.775rem', color: '#1E2A33', outline: 'none', minWidth: 0, background: '#fff' }} />
              <select onChange={function(e) { setPickerMeal(e.target.value); }} value={pickerMeal} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 85 }}><option value="">All Meals</option><option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Snacks">Snacks</option></select>
              <select onChange={function(e) { setPickerCuisine(e.target.value); }} value={pickerCuisine} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 78 }}><option value="">Cuisine</option><option value="American">American</option><option value="Mexican">Mexican</option><option value="Italian">Italian</option><option value="Asian">Asian</option><option value="Mediterranean">Mediterranean</option><option value="Indian">Indian</option><option value="Other">Other</option></select>
              <select onChange={function(e) { setPickerCalories(e.target.value); }} value={pickerCalories} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 78 }}><option value="">Calories</option><option value="under200">Under 200</option><option value="200-400">200-400</option><option value="400-600">400-600</option><option value="over600">600+</option></select>
              <select onChange={function(e) { setPickerCookTime(e.target.value); }} value={pickerCookTime} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 78 }}><option value="">Cook Time</option><option value="under15">Under 15</option><option value="15-30">15-30</option><option value="30-60">30-60</option><option value="over60">60+</option></select>
              <select onChange={function(e) { setPickerDiet(e.target.value); }} value={pickerDiet} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 88 }}><option value="">Diet</option><option value="Vegetarian">Vegetarian</option><option value="Vegan">Vegan</option><option value="Keto">Keto</option><option value="Low Carb">Low Carb</option><option value="Gluten-Free">Gluten-Free</option><option value="Dairy-Free">Dairy-Free</option></select>
              <select onChange={function(e) { setPickerProtein(e.target.value); }} value={pickerProtein} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 78 }}><option value="">Protein</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select>
              <select onChange={function(e) { setPickerIngredients(e.target.value); }} value={pickerIngredients} style={{ padding: '0.375rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.725rem', color: '#1E2A33', background: '#fff', cursor: 'pointer', minWidth: 78 }}><option value="">Ingredients</option><option value="upTo5">5 or less</option><option value="6to10">6-10</option><option value="over10">10+</option></select>
              {hasActivePickerFilters && <button onClick={resetPickerFilters} style={{ padding: '0.375rem 0.625rem', background: 'none', border: '1.5px solid #F43F5E', borderRadius: 8, fontSize: '0.725rem', color: '#F43F5E', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>Reset</button>}
            </div>
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', maxHeight: '62vh' }}>
              <div style={{ padding: '0.5rem 1.5rem 0', fontSize: '0.725rem', color: '#5A7180' }}>{activeMeal} &middot; {pickerRecipes.length} of {totalRecipes.length}</div>
              {pickerRecipes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <p style={{ color: '#5A7180', fontSize: '0.9rem', marginBottom: '0.5rem' }}>No recipes match these filters.</p>
                  <button onClick={resetPickerFilters} style={{ background: 'none', border: '1.5px solid #1A8BA5', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', color: '#1A8BA5', cursor: 'pointer', fontWeight: 600 }}>Clear filters</button>
                </div>
              ) : pickerRecipes.map(function(r, i) {
                return (
                  <div key={i} onClick={function() { handleSelectRecipe(r); }} style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid #F7FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem' }} onMouseEnter={function(e) { e.currentTarget.style.background = '#F7FAFB'; }} onMouseLeave={function(e) { e.currentTarget.style.background = ''; }}>
                    {(r.imageUrl || r.ImageURL || r.ImageUrl) ? <img src={r.imageUrl || r.ImageURL || r.ImageUrl} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 44, height: 44, borderRadius: 8, background: '#E8F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>&#127860;</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E2A33', marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.Name || r.name || 'Unnamed'}</p>
                      <p style={{ fontSize: '0.725rem', color: '#5A7180' }}>{(r.calories ?? r.calorie) ? (r.calories ?? r.calorie) + ' cal' : '---'} &middot; {(r.prepTime || r.cookTime || '---').toString().replace(/\s*min$/i, '') + ' min'}</p>
                    </div>
                    <div style={{ color: '#1A8BA5', fontSize: '0.775rem', fontWeight: 600, flexShrink: 0 }}>View &rarr;</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pickerTab === 'quick' && !selectedRecipe && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: '#5A7180', lineHeight: 1.5 }}>Type anything. Mom&apos;s famous chicken, a reminder to yourself, Smoothie #3 &mdash; no recipe needed. It saves directly to your planner.</p>
            <textarea value={quickAddText} onChange={function(e) { setQuickAddText(e.target.value); }} placeholder="Mom's famous chicken..." rows={4} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #D1E3EA', borderRadius: 12, fontSize: '0.875rem', color: '#1E2A33', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }} onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuickAdd(); } }} />
            <button onClick={handleQuickAdd} disabled={!quickAddText.trim()} style={{ padding: '0.75rem', background: quickAddText.trim() ? '#1A8BA5' : '#D1E3EA', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: quickAddText.trim() ? 'pointer' : 'not-allowed' }}>Add to {activeMeal}</button>
          </div>
        )}

        {selectedRecipe && !showInstructions && (
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flex: '0 0 60%', overflowY: 'auto', borderRight: '1px solid #E8F4F8' }}>
              {/* Hero Image */}
              {(selectedRecipe.imageUrl || selectedRecipe.ImageURL || selectedRecipe.ImageUrl) && (
                <div style={{ position: 'relative', padding: '0.875rem 0.875rem 0', overflow: 'hidden' }}>
                  <img src={selectedRecipe.imageUrl || selectedRecipe.ImageURL || selectedRecipe.ImageUrl} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block', borderRadius: 12 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(11,29,46,0.75))', padding: '3rem 1.25rem 1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '1.5rem', color: '#ffffff', margin: '0 0 0.75rem', lineHeight: 1.2 }}>{selectedRecipe.Name || selectedRecipe.name || 'Unnamed'}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {(selectedRecipe.calories || selectedRecipe.calorie) && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ fontSize: '0.85rem', color: '#ffffff' }}>🔥</span><span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>{selectedRecipe.calories || selectedRecipe.calorie} kcal</span></div>}
                      {(selectedRecipe.prepTime || selectedRecipe.cookTime) && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ fontSize: '0.85rem', color: '#ffffff' }}>⏱</span><span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>{selectedRecipe.prepTime && selectedRecipe.cookTime ? (parseInt(selectedRecipe.prepTime) + parseInt(selectedRecipe.cookTime)) + ' min' : (selectedRecipe.prepTime || selectedRecipe.cookTime).toString().replace(/\s*min$/i, '') + ' min'}</span></div>}
                      {selectedRecipe.servings && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ fontSize: '0.85rem', color: '#ffffff' }}>👤</span><span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>{selectedRecipe.servings}</span></div>}
                      {selectedRecipe.cuisine && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ fontSize: '0.85rem', color: '#ffffff' }}>📍</span><span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>{selectedRecipe.cuisine}</span></div>}
                    </div>
                  </div>
                </div>
              )}
              {!selectedRecipe.imageUrl && !selectedRecipe.ImageURL && !selectedRecipe.ImageUrl && (
                <div style={{ padding: '1.5rem 1.5rem 0' }}>
                  <p style={{ fontWeight: 700, fontSize: '1.5rem', color: '#1E2A33', margin: '0 0 1rem' }}>{selectedRecipe.Name || selectedRecipe.name || 'Unnamed'}</p>
                </div>
              )}
              <div style={{ padding: '0.5rem 1.5rem 1.5rem' }}>
                {/* Add to Meal button */}
                <button onClick={handleAddRecipe} style={{ width: '100%', padding: '0.875rem', background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.75rem', marginBottom: '0.875rem', boxShadow: '0 2px 8px rgba(26,139,165,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>🍽️ Add to {activeMeal}</button>
                {/* Save / Share */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button onClick={function() { var s = selectedRecipe; var entry = { id: 'my_' + Date.now(), name: s.Name || s.name, imageUrl: s.imageUrl || s.ImageURL || s.ImageUrl || '', calories: s.calories || s.calorie, prepTime: s.prepTime, cookTime: s.cookTime, servings: s.servings, cuisine: s.cuisine, ingredients: s.ingredients, instructions: s.instructions, Notes: s.Notes, source: 'saved' }; var saved = JSON.parse(localStorage.getItem('myRecipes') || '[]'); saved.unshift(entry); localStorage.setItem('myRecipes', JSON.stringify(saved)); showNotify('Saved to My Recipes!'); }} style={{ flex: 1, padding: '0.65rem', background: '#E8F4F8', color: '#1A8BA5', border: '1.5px solid #D1E3EA', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>🔖 Save to My Recipes</button>
                  <button onClick={function() { showNotify('Share feature coming soon!'); }} style={{ flex: 1, padding: '0.65rem', background: '#E8F4F8', color: '#1A8BA5', border: '1.5px solid #D1E3EA', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>🔗 Share with Community</button>
                </div>
                {/* About */}
                {selectedRecipe.Notes && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 700, fontSize: '0.7rem', color: '#5A7180', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About this recipe</p><p style={{ fontSize: '0.85rem', color: '#1E2A33', lineHeight: 1.6 }}>{selectedRecipe.Notes}</p></div>}
              </div>
            </div>
            {/* Right column */}
            <div style={{ flex: '0 0 40%', overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E2A33', margin: '0 0 0.625rem' }}>Ingredients</p>
              {/* Action buttons — at TOP */}
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
                <button onClick={function() { var entries = Object.entries(selectedRecipe.ingredients || {}); var all2 = {}; entries.forEach(function(e) { all2[e[0].trim()] = true; }); setSelectedIngredients(all2); }} style={{ flex: 1, padding: '0.6rem 0.5rem', background: '#E8F4F8', color: '#1A8BA5', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.775rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>+ Add All</button>
                <button onClick={function() { var entries = Object.entries(selectedRecipe.ingredients || {}); var sel = {}; entries.forEach(function(e) { if (selectedIngredients[e[0].trim()]) sel[e[0].trim()] = true; }); Object.keys(sel).length > 0 ? openIngredientsModal(selectedRecipe) : showNotify('Check some ingredients first!'); }} style={{ flex: 1, padding: '0.6rem 0.5rem', background: '#E8F4F8', color: '#1A8BA5', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.775rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>📋 Add to List</button>
                <button onClick={function() { setSelectedIngredients({}); }} style={{ flex: 1, padding: '0.6rem 0.5rem', background: '#FEE2E2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 8, fontSize: '0.775rem', fontWeight: 600, cursor: 'pointer' }}>Clear Selected</button>
              </div>
              {/* Ingredient rows */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {Object.entries(selectedRecipe.ingredients || {}).map(function(entry, idx) {
                  var ingName = entry[0];
                  var ingAmt = entry[1];
                  var ingKey = ingName.trim();
                  var checked = !!selectedIngredients[ingKey];
                  return <div key={idx} onClick={function() { setSelectedIngredients(function(prev) { return { ...prev, [ingKey]: !prev[ingKey] }; }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #F7FAFB', cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (checked ? '#10B981' : '#D1E3EA'), background: checked ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>{checked && <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 700 }}>✓</span>}</div>
                    <span style={{ fontSize: '0.9rem' }}>{getIngredientEmoji(ingName)}</span>
                    <span style={{ flex: 1, fontSize: '0.85rem', color: checked ? '#5A7180' : '#1E2A33', textDecoration: checked ? 'line-through' : 'none' }}>{ingName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#5A7180', fontWeight: 500, flexShrink: 0 }}>{ingAmt}</span>
                  </div>;
                })}
              </div>
              {/* View Instructions */}
              {selectedRecipe.instructions && Object.keys(selectedRecipe.instructions).length > 0 && (
                <button onClick={function() { setShowInstructions(true); }} style={{ width: '100%', padding: '0.75rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', flexShrink: 0 }}>
                  View Instructions <span style={{ fontSize: '1rem' }}>→</span>
                </button>
              )}
            </div>
          </div>
        )}

        {selectedRecipe && showInstructions && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #E8F4F8', flexShrink: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33', margin: 0 }}>Cooking Instructions</p>
              <button onClick={function() { setShowInstructions(false); }} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#5A7180' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {Object.values(selectedRecipe.instructions || {}).map(function(step, idx) {
                return (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1A8BA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                    <p style={{ flex: 1, fontSize: '0.9rem', color: '#1E2A33', lineHeight: 1.6, paddingTop: '0.2rem' }}>{step}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E8F4F8', flexShrink: 0 }}>
              <button onClick={function() { setCookStep(0); setCookMode(true); }} style={{ width: '100%', padding: '0.875rem', background: '#7C3AED', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>Start Cook Mode ▶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // ── COOK MODE OVERLAY ──────────────────────────────────────────────────────
  var cookModeOverlay = cookMode && selectedRecipe ? (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#ffffff',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease'
      }}
      onClick={function() {
        var steps = Object.values(selectedRecipe.instructions || {});
        if (cookStep < steps.length - 1) setCookStep(cookStep + 1);
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8F4F8', flexShrink: 0 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#5A7180', margin: '0 0 0.2rem' }}>COOK MODE</p>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33', margin: 0 }}>{selectedRecipe.Name || selectedRecipe.name}</p>
        </div>
        <button
          onClick={function(e) { e.stopPropagation(); setCookMode(false); setCookTimerRunning(false); setCookTimer(null); setCookTimerSeconds(0); }}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#5A7180', padding: '0.5rem' }}
        >✕</button>
      </div>

      {/* Step indicator */}
      <div style={{ padding: '0.75rem 1.5rem', background: '#F7FAFB', flexShrink: 0, textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#5A7180', margin: 0, fontWeight: 600 }}>
          Step {cookStep + 1} of {Object.values(selectedRecipe.instructions || {}).length}
        </p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
          {Object.values(selectedRecipe.instructions || {}).map(function(_, i) {
            return <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === cookStep ? '#1A8BA5' : i < cookStep ? '#10B981' : '#D1E3EA' }} />;
          })}
        </div>
      </div>

      {/* Step text */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 2rem 1.5rem', cursor: 'pointer' }}>
        <p style={{ fontSize: '1.35rem', color: '#1E2A33', lineHeight: 1.7, textAlign: 'center', maxWidth: 680, fontWeight: 500 }}>
          {Object.values(selectedRecipe.instructions || {})[cookStep]}
        </p>
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>Tap anywhere to continue</p>
      </div>

      {/* Timer button (if step has time mention) */}
      {Object.values(selectedRecipe.instructions || {})[cookStep] && Object.values(selectedRecipe.instructions || {})[cookStep].match(/\d+[-–]\d+\s*(min|mins|minutes|mins?)|\d+\s*(min|mins|minutes|mins?)/i) && !cookTimerRunning && (
        <div style={{ padding: '0 1.5rem 0.75rem', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={function(e) {
              e.stopPropagation();
              var match = Object.values(selectedRecipe.instructions || {})[cookStep].match(/(\d+)[-–](\d+)\s*(min|mins?)|(\d+)\s*(min|mins?)/i);
              var seconds = 0;
              if (match) {
                if (match[1] && match[2]) seconds = (parseInt(match[1]) + parseInt(match[2])) / 2 * 60;
                else if (match[4]) seconds = parseInt(match[4]) * 60;
              }
              setCookTimerSeconds(seconds);
              setCookTimerRunning(true);
            }}
            style={{ padding: '0.6rem 1.25rem', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >⏱ Start Timer</button>
        </div>
      )}

      {/* Active timer display */}
      {cookTimerRunning && (
        <div style={{ padding: '0 1.5rem 0.75rem', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '0.5rem 1.25rem', background: '#1A2A3A', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#F59E0B', fontSize: '1rem' }}>⏱</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {Math.floor(cookTimerSeconds / 60)}:{(cookTimerSeconds % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={function(e) { e.stopPropagation(); setCookTimerRunning(false); }}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '0.2rem 0.5rem', color: '#fff', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
            >Stop</button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem 1.5rem', flexShrink: 0 }}>
        <button
          onClick={function(e) { e.stopPropagation(); if (cookStep > 0) setCookStep(cookStep - 1); }}
          disabled={cookStep === 0}
          style={{ flex: 1, padding: '0.875rem', background: cookStep === 0 ? '#E8F4F8' : '#ffffff', color: cookStep === 0 ? '#9ca3af' : '#1E2A33', border: '1.5px solid #D1E3EA', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: cookStep === 0 ? 'not-allowed' : 'pointer' }}
        >← Back</button>
        <button
          onClick={function(e) { e.stopPropagation(); var steps = Object.values(selectedRecipe.instructions || {}); if (cookStep < steps.length - 1) setCookStep(cookStep + 1); else setCookMode(false); }}
          style={{ flex: 2, padding: '0.875rem', background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
        >{cookStep < Object.values(selectedRecipe.instructions || {}).length - 1 ? 'Next →' : 'Done ✓'}</button>
      </div>
    </div>
  ) : null;

  // ── INGREDIENTS MODAL ──────────────────────────────────────────────────────
  var ingredientsModal = showIngredientsModal && modalRecipe ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,29,46,0.5)', display: 'flex', alignItems: 'flex-end' }} onClick={function(e) { if (e.target === e.currentTarget) { closeIngredientsModal(); } }}>
      <div style={{ width: '100%', background: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, background: '#D1E3EA', borderRadius: 2, margin: '1rem auto 0', flexShrink: 0 }} />
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E8F4F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33', margin: 0 }}>{modalRecipe.Name || 'Select Ingredients'}</p>
            <p style={{ fontSize: '0.75rem', color: '#5A7180', margin: '0.2rem 0 0' }}>Select items to add to your shopping list</p>
          </div>
          <button onClick={closeIngredientsModal} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#5A7180' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: '70vh', padding: '0.5rem 0' }}>
          {Object.entries(modalRecipe.ingredients || {}).map(function(entry, idx) {
            var ingName = entry[0];
            var ingAmt = entry[1];
            var ingKey = ingName.trim();
            var checked = !!selectedIngredients[ingKey];
            return (
              <div key={idx} onClick={function() { setSelectedIngredients(function(prev) { return { ...prev, [ingKey]: !prev[ingKey] }; }); }} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', borderBottom: '1px solid #F7FAFB' }} onMouseEnter={function(e) { e.currentTarget.style.background = '#F7FAFB'; }} onMouseLeave={function(e) { e.currentTarget.style.background = ''; }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid ' + (checked ? '#1A8BA5' : '#D1E3EA'), background: checked ? '#1A8BA5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                  {checked && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.875rem', color: '#1E2A33' }}>{ingName}{ingAmt ? ': ' + ingAmt : ''}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E8F4F8', display: 'flex', gap: '0.75rem', flexShrink: 0, background: '#F7FAFB' }}>
          <button onClick={closeIngredientsModal} style={{ flex: 1, padding: '0.875rem', background: '#ffffff', color: '#1E2A33', border: '1.5px solid #D1E3EA', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleClearSelected} style={{ flex: 1, padding: '0.875rem', background: '#F7FAFB', color: '#5A7180', border: '1.5px solid #D1E3EA', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Clear Selected</button>
          <button onClick={handleAddAllToList} style={{ flex: 1, padding: '0.875rem', background: '#E8F4F8', color: '#1E2A33', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Add All</button>
          <button onClick={handleAddSelectedToList} style={{ flex: 2, padding: '0.875rem', background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Add Selected</button>
        </div>
      </div>
    </div>
  ) : null;

  // ── SHOPPING LIST MODAL ─────────────────────────────────────────────────────
  var shoppingListModal = showShoppingList ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(11,29,46,0.5)' }} onClick={function(e) { if (e.target === e.currentTarget) { setShowShoppingList(false); } }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 440, background: '#ffffff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(11,29,46,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8F4F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0B1D2E' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🛒</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', margin: 0 }}>Shopping List</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: '0.1rem 0 0' }}>{cartCount} item{cartCount !== 1 ? 's' : ''} to buy</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>Print</button>
            <button onClick={function() { setShowShoppingList(false); }} style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Manual entry */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #E8F4F8', background: '#F7FAFB' }}>
          <p style={{ fontWeight: 600, fontSize: '0.75rem', color: '#5A7180', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Custom Item</p>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <input
              type="text"
              value={manualItem}
              onChange={function(e) { setManualItem(e.target.value); }}
              placeholder="Add custom item..."
              style={{ flex: 1, padding: '0.5rem 0.625rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.8rem', color: '#1E2A33', outline: 'none', background: '#fff', minWidth: 0 }}
              onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); handleAddManualItem(); } }}
            />
            <select value={manualCategory} onChange={function(e) { setManualCategory(e.target.value); }} style={{ padding: '0.5rem 0.4rem', border: '1.5px solid #D1E3EA', borderRadius: 8, fontSize: '0.75rem', color: '#1E2A33', background: '#fff', cursor: 'pointer' }}>
              {SHOPPING_CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
            </select>
            <button onClick={handleAddManualItem} disabled={!manualItem.trim()} style={{ padding: '0.5rem 0.875rem', background: manualItem.trim() ? '#1A8BA5' : '#D1E3EA', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: manualItem.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>Add</button>
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: '70vh', padding: '0.5rem 0' }}>
          {shoppingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🛒</p>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E2A33', marginBottom: '0.375rem' }}>Your shopping list is empty</p>
              <p style={{ fontSize: '0.8rem', color: '#5A7180' }}>Select meals to generate your grocery list</p>
            </div>
          ) : (function() {
            var grouped = getGroupedList();
            return SHOPPING_CATEGORIES.map(function(cat) {
              var items = grouped[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: '0.25rem' }}>
                  <div style={{ padding: '0.4rem 1.25rem', background: '#F7FAFB' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.7rem', color: '#5A7180', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{cat}</p>
                  </div>
                  {items.map(function(item) {
                    return (
                      <div key={item.name} style={{ padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #F7FAFB' }}>
                        <div onClick={function() { togglePurchased(item.name); }} style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid ' + (item.purchased ? '#10B981' : '#D1E3EA'), background: item.purchased ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {item.purchased && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
                        </div>
                        <span style={{ flex: 1, fontSize: '0.875rem', color: item.purchased ? '#aaa' : '#1E2A33', textDecoration: item.purchased ? 'line-through' : 'none', transition: 'all 0.15s' }}>{item.name}</span>
                        <button onClick={function() { removeFromShoppingList(item.name); }} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0.3rem', lineHeight: 1 }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>

        {/* Footer actions */}
        {shoppingList.length > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #E8F4F8', background: '#F7FAFB' }}>
            <button onClick={function() { setShowClearConfirm(true); }} style={{ width: '100%', padding: '0.75rem', background: '#ffffff', color: '#F43F5E', border: '1.5px solid #F43F5E', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Clear Shopping List</button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // ── CLEAR CONFIRM DIALOG ─────────────────────────────────────────────────
  var clearConfirm = showClearConfirm ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(11,29,46,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 300 }}>
      <div style={{ background: '#ffffff', borderRadius: 20, padding: '1.75rem', maxWidth: 340, width: '100%', boxShadow: '0 8px 32px rgba(11,29,46,0.2)' }}>
        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33', marginBottom: '0.5rem' }}>Clear Shopping List?</p>
        <p style={{ fontSize: '0.875rem', color: '#5A7180', marginBottom: '1.5rem', lineHeight: 1.5 }}>This will remove all {shoppingList.length} item{shoppingList.length !== 1 ? 's' : ''} from your list. This cannot be undone.</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={function() { setShowClearConfirm(false); }} style={{ flex: 1, padding: '0.75rem', background: '#ffffff', color: '#1E2A33', border: '1.5px solid #D1E3EA', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleClearShoppingList} style={{ flex: 1, padding: '0.75rem', background: '#F43F5E', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        </div>
      </div>
    </div>
  ) : null;

  // ── SETTINGS MODAL ─────────────────────────────────────────────────────────
  var settingsModal = showSettings ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(11,29,46,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={function(e) { if (e.target === e.currentTarget) { setShowSettings(false); } }}>
      <div style={{ background: '#ffffff', borderRadius: 20, padding: '1.75rem', maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(11,29,46,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E2A33', margin: 0 }}>Settings</p>
          <button onClick={function() { setShowSettings(false); }} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#5A7180', padding: '0.25rem' }}>✕</button>
        </div>

        {/* Dark Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0', borderBottom: '1px solid #F0F4F7' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E2A33', margin: '0 0 0.125rem' }}>Dark Mode</p>
            <p style={{ fontSize: '0.75rem', color: '#5A7180', margin: 0 }}>Use dark color scheme</p>
          </div>
          <button onClick={toggleDarkMode} style={{ width: 48, height: 26, borderRadius: 13, background: darkMode ? '#1A8BA5' : '#D1E3EA', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: darkMode ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#ffffff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>

        {/* Clear Cache */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0', borderBottom: '1px solid #F0F4F7' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E2A33', margin: '0 0 0.125rem' }}>Clear Recipe Cache</p>
            <p style={{ fontSize: '0.75rem', color: '#5A7180', margin: 0 }}>Remove locally stored recipes</p>
          </div>
          <button onClick={function() { localStorage.removeItem('githubRecipesCache'); localStorage.removeItem('githubRecipesCacheTime'); showToast('Cache cleared'); }} style={{ padding: '0.4rem 0.875rem', background: '#F43F5E', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        </div>

        {/* Attribution */}
        <div style={{ padding: '1rem 0' }}>
          <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#5A7180', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>Data Sources</p>
          <p style={{ fontSize: '0.8rem', color: '#1E2A33', lineHeight: 1.5 }}>Additional recipe data provided by <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1A8BA5', textDecoration: 'none', fontWeight: 600 }}>TheMealDB.com</a></p>
          <p style={{ fontSize: '0.75rem', color: '#5A7180', marginTop: '0.375rem', lineHeight: 1.5 }}>Community recipes are user-submitted and publicly shared via Google Sheets.</p>
        </div>

        <div style={{ padding: '0.875rem 0', borderTop: '1px solid #F0F4F7', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#5A7180', textAlign: 'center', margin: 0 }}>MealPlanner Pro by LogBook Labs</p>
        </div>
      </div>
    </div>
  ) : null;

  // ── TOAST ──────────────────────────────────────────────────────────────────
  var toast = toastMessage ? (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#0B1D2E', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 500, zIndex: 300, boxShadow: '0 4px 16px rgba(11,29,46,0.25)', whiteSpace: 'nowrap' }}>
      {toastMessage}
    </div>
  ) : null;

  // ── FLOATING CART ───────────────────────────────────────────────────────────
  var floatingCart = !showShoppingList ? (
    <div onClick={function() { setShowShoppingList(true); }} style={{ position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%', background: '#0B1D2E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(11,29,46,0.25)', cursor: 'pointer', zIndex: 100, transition: 'transform 0.15s', transform: cartBump ? 'scale(1.15)' : 'scale(1)', userSelect: 'none' }}>
      <span style={{ fontSize: '1.5rem' }}>🛒</span>
      {cartCount > 0 && (
        <div style={{ position: 'absolute', top: -4, right: -4, background: '#F43F5E', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, border: '2px solid #ffffff' }}>
          {cartCount > 99 ? '99+' : cartCount}
        </div>
      )}
    </div>
  ) : null;

  // ── NOTIFICATION ──────────────────────────────────────────────────────────
  var notificationBanner = notification ? (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0B1D2E', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 500, zIndex: 200, boxShadow: '0 4px 16px rgba(11,29,46,0.2)' }}>
      {notification}
    </div>
  ) : null;

  // ── NAVBAR ───────────────────────────────────────────────────────────────
  var navbar = (
    <nav style={{ background: '#0B1D2E', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(11,29,46,0.15)' }}>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
        Meal<span style={{ color: '#1A8BA5' }}>Planner</span> Pro
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {['all','community','my'].map(function(t) {
            var label = t === 'all' ? 'All' : t === 'community' ? 'Community' : 'My';
            var active = store.activeTab === t;
            return (
              <button key={t} onClick={function() {
                store.setActiveTab(t);
                if (t === 'community') store.loadCommunityRecipes(store.sheetId);
              }} style={{ padding: '0.375rem 0.75rem', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: active ? '#1A8BA5' : 'rgba(255,255,255,0.1)', color: active ? '#ffffff' : 'rgba(255,255,255,0.6)', transition: 'all 0.15s' }}>{label}</button>
            );
          })}
        </div>
        {weekView ? (
          <>
            <button onClick={clearWeek} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer' }}>Clear Week</button>
            <button onClick={randomFill} style={{ background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Random Fill</button>
          </>
        ) : (
          <>
            <button onClick={function() { clearDay(activeDay); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer' }}>Clear {activeDay}</button>
            <button onClick={function() { randomFillDay(activeDay); }} style={{ background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Random Fill</button>
          </>
        )}
        <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.2)' }} />
        <button onClick={function() { setShowSettings(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', padding: '0.25rem', lineHeight: 1, flexShrink: 0 }} title="Settings">⚙️</button>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>by LogBook Labs</span>
      </div>
    </nav>
  );

  // ── DAY TABS ─────────────────────────────────────────────────────────────
  var dayTabs = (
    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
      <button onClick={function() { setWeekView(true); setActiveDay('Monday'); }} style={{ padding: '0.5rem 1.25rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0, background: weekView ? '#1A8BA5' : '#ffffff', color: weekView ? '#ffffff' : '#1E2A33' }}>Week View</button>
      {DAYS.map(function(day) {
        var active = activeDay === day && !weekView;
        return (
          <button key={day} onClick={function() { setActiveDay(day); setWeekView(false); }} style={{ padding: '0.5rem 1.25rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0, background: active ? '#0B1D2E' : '#ffffff', color: active ? '#ffffff' : '#1E2A33' }}>{day.substring(0, 3)}</button>
        );
      })}
    </div>
  );

  // ── WEEK VIEW ────────────────────────────────────────────────────────────
  function buildWeekGrid(weekPlan, weekLabel, weekKey) {
    return (
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33' }}>{weekLabel}</span>
            {weekKey === 'week2' && <span style={{ fontSize: '0.7rem', background: '#E8F4F8', color: '#5A7180', padding: '0.2rem 0.5rem', borderRadius: 6, fontWeight: 600 }}>Planning Ahead</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={function() { clearDay(activeDay, weekKey); }} style={{ padding: '0.4rem 0.875rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, border: '1.5px solid #D1E3EA', background: '#ffffff', color: '#5A7180', cursor: 'pointer' }}>Clear Day</button>
            <button onClick={function() { store.clearWeek(weekKey); }} style={{ padding: '0.4rem 0.875rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, border: '1.5px solid #D1E3EA', background: '#ffffff', color: '#5A7180', cursor: 'pointer' }}>Clear Week</button>
            <button onClick={function() { store.randomFill(weekKey); }} style={{ padding: '0.4rem 0.875rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, border: 'none', background: '#1A8BA5', color: '#ffffff', cursor: 'pointer' }}>Random Fill</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div />
            {DAYS.map(function(day) {
              return <div key={day} style={{ textAlign: 'center', padding: '0.625rem 0.25rem', background: weekKey === 'week1' ? '#0B1D2E' : '#1A8BA5', borderRadius: 10, color: '#ffffff', fontSize: '0.8rem', fontWeight: 700 }}>{day.substring(0, 3)}</div>;
            })}
          </div>
          {MEALS.map(function(meal) {
            var grad = MEAL_GRADIENTS[meal];
            return (
              <div key={meal} style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'stretch' }}>
                <div style={{ background: 'linear-gradient(135deg, ' + grad.from + ', ' + grad.to + ')', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.75rem 0.25rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{MEAL_ICONS[meal]}</span>
                  <span style={{ color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{meal}</span>
                </div>
                {DAYS.map(function(day) {
                  var recipe = weekPlan[day] ? weekPlan[day][meal] || '' : '';
                  return (
                    <div key={day} onClick={function() { setTargetWeek(weekKey); openPicker(day, meal); }} style={{ padding: '0.75rem 0.5rem', background: recipe ? '#ffffff' : '#F7FAFB', borderRadius: 10, fontSize: '0.8rem', color: recipe ? '#1E2A33' : '#cccccc', cursor: 'pointer', border: '1px solid ' + (recipe ? '#D1E3EA' : 'transparent'), minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.3, fontWeight: recipe ? 600 : 400, transition: 'all 0.15s', boxShadow: recipe ? '0 1px 4px rgba(11,29,46,0.06)' : 'none' }}>{recipe || '+'}</div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  var weekViewJSX = (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {buildWeekGrid(store.week1MealPlan || {}, 'Week 1', 'week1')}
      {buildWeekGrid(store.week2MealPlan || {}, 'Week 2', 'week2')}
      <p style={{ textAlign: 'center', marginTop: '0.5rem', color: '#5A7180', fontSize: '0.8rem' }}>Click any cell to edit &middot; saves automatically &middot; Week 2 = planning ahead</p>
    </div>
  );

  // ── SINGLE DAY VIEW ──────────────────────────────────────────────────────
  function MealCard(_ref) {
    var meal = _ref.meal;
    var current = mealPlan[activeDay] ? mealPlan[activeDay][meal] || '' : '';
    var grad = MEAL_GRADIENTS[meal];
    // Look up the recipe object for this meal name
    var recipeObj = null;
    if (current) {
      recipeObj = recipes.find(function(r) { return (r.name || r.Name || '') === current; });
    }
    var hasPhoto = !!(recipeObj && (recipeObj.imageUrl || recipeObj.ImageURL || recipeObj.ImageUrl));
    var imgSrc = recipeObj ? (recipeObj.imageUrl || recipeObj.ImageURL || recipeObj.ImageUrl) : null;
    var cookTime = recipeObj ? (recipeObj.cookTime || recipeObj.CookTime || recipeObj.cook_time || '—') : null;
    var calories = recipeObj ? (recipeObj.calories || recipeObj.Calories || '—') : null;
    return (
      <div style={{ background: '#ffffff', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'linear-gradient(to right, ' + grad.from + ', ' + grad.to + ')', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{MEAL_ICONS[meal]}</span>
          <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>{meal}</span>
        </div>
        <div style={{ position: 'relative', minHeight: 140 }}>
          {hasPhoto ? (
            <div style={{ position: 'relative' }} onClick={function(e) { e.stopPropagation(); var r = recipes.find(function(x) { return (x.name || x.Name || '') === current; }); if (r) { setTargetWeek('week1'); setActiveMeal(meal); setSelectedRecipe(r); setShowRecipePicker(true); } else { openPicker(activeDay, meal); } }}>
              <img src={imgSrc} alt={current} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff', margin: 0, lineHeight: 1.3 }}>{current}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                  {cookTime && cookTime !== '—' ? (
                    <span style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: '#ffffff', fontWeight: 600 }}>⏱ {cookTime} min</span>
                  ) : null}
                  {calories && calories !== '—' ? (
                    <span style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: '#ffffff', fontWeight: 600 }}>{calories} cal</span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={function(e) { e.stopPropagation(); openPicker(activeDay, meal); }} style={{ background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: 6, color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Change</button>
                  <button onClick={function(e) { e.stopPropagation(); handleSaveMeal(activeDay, meal, '', targetWeek !== 'week1' ? targetWeek : null); }} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 6, color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem 0.4rem' }}>Remove</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              {current ? (
                <div onClick={function(e) { e.stopPropagation(); var r = recipes.find(function(x) { return (x.name || x.Name || '') === current; }); if (r) { setTargetWeek('week1'); setActiveMeal(meal); setSelectedRecipe(r); setShowRecipePicker(true); } else { openPicker(activeDay, meal); } }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E2A33', cursor: 'pointer' }}>{current}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button onClick={function(e) { e.stopPropagation(); openPicker(activeDay, meal); }} style={{ background: 'none', border: 'none', color: '#1A8BA5', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Change</button>
                    <button onClick={function(e) { e.stopPropagation(); handleSaveMeal(activeDay, meal, '', targetWeek !== 'week1' ? targetWeek : null); }} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Remove</button>
                  </div>
                </div>
              ) : (
                <button onClick={function() { openPicker(activeDay, meal); }} style={{ width: '100%', padding: '1.25rem', border: '2px dashed #e5e7eb', borderRadius: 10, background: 'none', color: '#9ca3af', fontSize: '0.875rem', cursor: 'pointer' }}>+ Add {meal}</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  var dayViewJSX = (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 2rem' }}>
      <div style={{ background: 'url(/food-doodles-bg.png) no-repeat center center / 600px auto', borderRadius: 12, padding: '0.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {MEALS.map(function(meal) {
            return <MealCard key={meal} meal={meal} />;
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div
      data-dark={darkMode ? 'true' : undefined}
      style={{
        '--bg': darkMode ? '#0B1D2E' : '#F7FAFB',
        '--bg-card': darkMode ? '#1A2A3A' : '#ffffff',
        '--bg-input': darkMode ? '#1A2A3A' : '#ffffff',
        '--bg-secondary': darkMode ? '#1A2A3A' : '#F7FAFB',
        '--bg-accent': darkMode ? '#2A3A4A' : '#E8F4F8',
        '--text': darkMode ? '#E8F4F8' : '#1E2A33',
        '--text-muted': darkMode ? '#8A9BAF' : '#5A7180',
        '--text-dim': darkMode ? '#6A7B8F' : '#9ca3af',
        '--border': darkMode ? '#2A3A4A' : '#D1E3EA',
        '--border-subtle': darkMode ? '#1A2A3A' : '#F7FAFB',
        '--danger': darkMode ? '#C53050' : '#F43F5E',
        '--success': darkMode ? '#059669' : '#10B981',
        background: darkMode
          ? '#0B1D2E'
          : `url('/images/kitchen-bg.jpg') center/cover no-repeat #F7FAFB`,
        minHeight: '100vh',
        color: darkMode ? '#E8F4F8' : '#1E2A33',
        transition: 'background 0.25s, color 0.25s',
        position: 'relative'
      }}
    >
      {/* White overlay on background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: darkMode ? 'transparent' : 'rgba(255,255,255,0.82)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      {/* Print-only shopping list (visible only during print) */}
      <div style={{ display: 'none' }} className="print-only">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1E2A33' }}>Shopping List</h1>
        {shoppingList.length === 0 ? <p style={{ color: '#5A7180' }}>No items.</p> : (function() {
          var grouped = getGroupedList();
          return SHOPPING_CATEGORIES.map(function(cat) {
            var items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.75rem 0 0.25rem', borderBottom: '1px solid #ddd', paddingBottom: '0.125rem' }}>{cat}</div>
                {items.map(function(item) {
                  return (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', fontSize: '0.875rem' }}>
                      <div style={{ width: 14, height: 14, border: '1.5px solid #333', borderRadius: 3, flexShrink: 0 }} />
                      <span style={{ textDecoration: item.purchased ? 'line-through' : 'none', color: item.purchased ? '#aaa' : '#1E2A33' }}>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          });
        })()}
      </div>
      {navbar}
      {notificationBanner}
      {recipePicker}
      {cookModeOverlay}
      {ingredientsModal}
      {shoppingListModal}
      {clearConfirm}
      {toast}
      {settingsModal}
      {floatingCart}

      {/* Main content area with background */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh'
      }}>
        {/* Framed container */}
        <div style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '24px 96px 24px 48px',
          background: darkMode ? '#1A2A3A' : '#ffffff',
          borderRadius: 20,
          boxShadow: darkMode
            ? 'none'
            : '0 4px 32px rgba(11,29,46,0.10), 0 1px 4px rgba(11,29,46,0.06)',
        }}>
          <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            {dayTabs}
          </div>
          {weekView ? weekViewJSX : dayViewJSX}
        </div>
      </div>
    </div>
  );
}
