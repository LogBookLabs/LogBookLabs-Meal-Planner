# Meal Planner Pro — Session Handoff Notes

## Project
Build a Google Sheets-backed meal planner React app (brand: LogBook Labs) for an Etsy product.

**Frontend:** `C:\Users\bonif\.openclaw\workspace\meal-planner\frontend\`
**Sheets backend:** `C:\Users\bonif\.openclaw\workspace\meal-planner\sheets\`
**Dev server:** `http://localhost:3001` (run `npm run dev` inside `frontend/`)

**Sheet ID:** `16mWtkk5bQ5G1Eoi7rIzNJzAAtdLoU-jGFobTjKFSWq4`
**Service account:** `trill-sheets-access@trill-hmi.iam.gserviceaccount.com`
**Key file:** `C:\Users\bonif\.openclaw\secrets\trill-sheets-service-account.json`

---

## Known Bugs (Active)

### Bug 1: Recipe Picker Doesn't Open from Week View (CRITICAL)
**Root cause:** The week view has an early `return (<week view JSX>);` that exits before the single day view. The Recipe Picker `showRecipePicker` conditional block lives inside the SINGLE DAY VIEW return — so when you're in week view and click a `+` cell, `showRecipePicker` gets set to `true` but the picker never renders because the week view already returned.

**Fix required:**
Move the Recipe Picker conditional block OUTSIDE both the week view and day view returns. It should be a single `if (showRecipePicker)` block at the top level of the component return, rendered regardless of which view is active.

Current structure (broken):
```
if (weekView) { return <week JSX>; }  // exits here, picker below never reached
if (!isConnected) { return <setup JSX>; }
return (
  <div>
    <navbar />
    <notification />
    {showRecipePicker && <RecipePicker />}  // lives here in day view
    <dayTabs />
    <mealCards />    // doodle wallpaper here
  </div>
);
```

Correct structure:
```
return (
  <div>
    <navbar />
    <notification />
    {showRecipePicker && <RecipePicker />}  // MUST be here, outside conditionals
    {weekView ? <weekViewJSX /> : <dayViewJSX />}
  </div>
);
```

---

## page.js Current State (line ~430)

**File:** `C:\Users\bonif\.openclaw\workspace\meal-planner\frontend\app\page.js`

**Store:** `useMealPlannerStore` (Zustand) — drives `isConnected`, `sheetId`, `mealPlan`, `recipes`, `notification`, etc.

**Local state:** `inputUrl`, `activeDay`, `activeMeal`, `showRecipePicker`, `weekView`, `emailCopied`

**Key functions:**
- `handleConnect()` — reads `inputUrl`, calls `setSheetUrl(inputUrl)`, saves to localStorage
- `handleSaveMeal(day, meal, recipeName)` — updates store + writes to sheet via API

**Conditional returns:**
1. `if (!isConnected)` → Setup card (input + copy button + steps)
2. `if (weekView)` → Week view JSX (early return — THIS IS THE PROBLEM)
3. Otherwise → Single day view JSX (picker lives here)

**Current day view has 3 duplicate recipe picker blocks** (lines ~265, ~310, ~350) and 2 duplicate notification banners. These need to be collapsed into ONE recipe picker and ONE notification.

---

## What Works Right Now

- Setup card: URL input + copy button + connect ✅
- Navbar: sticky, navy, LogBook Labs branding ✅
- Day tabs: Mon–Sun + Week button ✅
- Week view renders (layout — but picker doesn't open) ⚠️
- Single day view: meal cards + doodle wallpaper ✅
- Doodle wallpaper only on day view (not week view) ✅
- Meal cards: gradient headers with icons, Change/Remove/Add buttons ✅
- Notification toasts ✅

---

## What Needs Fixing

1. **Recipe picker** must open from BOTH day view AND week view — currently only day view
2. **Duplicate JSX blocks** — 3 recipe pickers and 2 notification banners in single day view. Remove duplicates, keep one recipe picker.
3. **Week view layout** is correct with meal labels on left and 7 day columns ✅

---

## Files Reference

| File | Purpose |
|------|---------|
| `frontend/app/page.js` | Main React page component |
| `frontend/lib/store.js` | Zustand store with sheet/meal/recipe state |
| `frontend/app/api/sheet/route.js` | Google Sheets API proxy (GET/POST) |
| `frontend/app/globals.css` | Fonts (Inter + JetBrains Mono) + global styles |
| `frontend/public/food-doodles-bg.png` | Light blue doodle wallpaper (daily view only) |
| `frontend/public/hero.jpg` | 192px hero image |
| `frontend/public/background.jpg` | Unsplash food photo |
| `sheets/apps-script.js` | Apps Script for one-click sharing |
| `sheets/recipes.csv` | 30 recipes |

---

## Doodle Wallpaper
`frontend/public/food-doodles-bg.png` — light blue food doodle pattern, applied to daily view only via `background: url(/food-doodles-bg.png) no-repeat center center / 600px auto`. Week view should have plain `#F7FAFB` background.

---

## MEAL_GRADIENTS
```js
Breakfast: from '#F59E0B' to '#D97706'  (amber)
Lunch: from '#10B981' to '#059669'      (green)
Dinner: from '#7C3AED' to '#6D28D9'    (purple)
Snacks: from '#F43F5E' to '#E11D48'    (rose)
```

---

## Sheet API endpoint
- GET `/api/sheet?sheetId=...&range=recipes!A1:K50` — fetch data
- POST `/api/sheet` body: `{sheetId, range, values}` — write data

Column map for meals: `Breakfast:C, Lunch:D, Dinner:E, Snacks:F`
Day rows: Monday=2, Tuesday=4, Wednesday=6, Thursday=8, Friday=10, Saturday=12, Sunday=14

---

## Session History Context
- Long session, compaction summaries are very large
- page.js has been rewritten incrementally many times — current state has duplicate JSX blocks
- Key insight: the fix for the picker bug is architectural — move the picker OUTSIDE the conditional returns, render it once at top level before the view conditionals