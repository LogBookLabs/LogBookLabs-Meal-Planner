const fs = require('fs');
const path = 'C:\\Users\\bonif\\.openclaw\\workspace\\meal-planner\\frontend\\app\\page.js';
const content = fs.readFileSync(path, 'utf8');

const startToken = '{selectedRecipe && (';
const startIdx = content.indexOf(startToken);
if (startIdx === -1) { console.log('ERROR: start token not found'); process.exit(1); }

// Find the opening { immediately before
let bs = startIdx - 1;
while (bs >= 0 && ' \t\n\r'.includes(content[bs])) bs--;
console.log('braceStart:', bs, JSON.stringify(content[bs]));

// Count depth to find end
let depth = 0, inStr = false, strChar = null, pc = '', endIdx = -1;
for (let i = bs; i < content.length; i++) {
  const ch = content[i];
  if (!inStr) {
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
    else if (ch === '{') { depth++; }
    else if (ch === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
  } else {
    if (ch === strChar && pc !== '\\') { inStr = false; strChar = null; }
  }
  pc = ch;
}
if (endIdx === -1) { console.log('ERROR: unmatched braces'); process.exit(1); }
console.log('endIdx:', endIdx, JSON.stringify(content[endIdx]));

// OLD block for reference (just check first 50 chars)
const OLD = content.substring(bs, endIdx + 1);
console.log('OLD len:', OLD.length, '→', JSON.stringify(OLD.substring(0, 60)));

// NEW 2-column layout
const NEW = `{selectedRecipe && !showInstructions && (
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flex: '0 0 60%', overflowY: 'auto', padding: '1.5rem', borderRight: '1px solid #E8F4F8' }}>
              {(selectedRecipe.imageUrl || selectedRecipe.ImageURL || selectedRecipe.ImageUrl) && (
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <img src={selectedRecipe.imageUrl || selectedRecipe.ImageURL || selectedRecipe.ImageUrl} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(11,29,46,0.7))', borderRadius: '0 0 16px 16px', padding: '2rem 1rem 0.75rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>{selectedRecipe.Name || selectedRecipe.name || 'Unnamed'}</p>
                  </div>
                </div>
              )}
              {!selectedRecipe.imageUrl && !selectedRecipe.ImageURL && !selectedRecipe.ImageUrl && (
                <p style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1E2A33', marginBottom: '1rem' }}>{selectedRecipe.Name || selectedRecipe.name || 'Unnamed'}</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {[{ label: 'CAL', val: selectedRecipe.calories || selectedRecipe.calorie || '---' }, { label: 'PREP', val: selectedRecipe.prepTime || '---' }, { label: 'COOK', val: selectedRecipe.cookTime || '---' }, { label: 'SERVINGS', val: selectedRecipe.servings || '---' }].map(function(s) {
                  return <div key={s.label} style={{ background: '#E8F4F8', borderRadius: 8, padding: '0.35rem 0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ fontSize: '0.6rem', color: '#5A7180', fontWeight: 700 }}>{s.label}</span><span style={{ fontSize: '0.8rem', color: '#1E2A33', fontWeight: 700 }}>{s.val}</span></div>;
                })}
                {selectedRecipe.cuisine && <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '0.35rem 0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ fontSize: '0.6rem', color: '#92400E', fontWeight: 700 }}>CUISINE</span><span style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 700 }}>{selectedRecipe.cuisine}</span></div>}
              </div>
              <button onClick={handleAddRecipe} style={{ width: '100%', padding: '0.875rem', background: '#1A8BA5', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(26,139,165,0.25)' }}>Add to {activeMeal}</button>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button onClick={function() { var s = selectedRecipe; var entry = { id: 'my_' + Date.now(), name: s.Name || s.name, imageUrl: s.imageUrl || s.ImageURL || s.ImageUrl || '', calories: s.calories || s.calorie, prepTime: s.prepTime, cookTime: s.cookTime, servings: s.servings, cuisine: s.cuisine, ingredients: s.ingredients, instructions: s.instructions, Notes: s.Notes, source: 'saved' }; var saved = JSON.parse(localStorage.getItem('myRecipes') || '[]'); saved.unshift(entry); localStorage.setItem('myRecipes', JSON.stringify(saved)); showNotify('Saved to My Recipes!'); }} style={{ flex: 1, padding: '0.65rem', background: '#ffffff', color: '#1E2A33', border: '1.5px solid #D1E3EA', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Save to My</button>
                <button onClick={function() { showNotify('Share feature coming soon!'); }} style={{ flex: 1, padding: '0.65rem', background: '#ffffff', color: '#1E2A33', border: '1.5px solid #D1E3EA', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Share</button>
              </div>
              {selectedRecipe.Notes && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 700, fontSize: '0.7rem', color: '#5A7180', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</p><p style={{ fontSize: '0.85rem', color: '#1E2A33', lineHeight: 1.6 }}>{selectedRecipe.Notes}</p></div>}
            </div>
            <div style={{ flex: '0 0 40%', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#5A7180', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Ingredients</p>
                <button onClick={handleBackToList} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#5A7180' }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                {(Array.isArray(selectedRecipe.ingredients) ? selectedRecipe.ingredients : (typeof selectedRecipe.ingredients === 'string' ? selectedRecipe.ingredients.split('|') : [])).filter(Boolean).map(function(ing, idx) {
                  var ingKey = typeof ing === 'string' ? ing.trim() : JSON.stringify(ing);
                  var checked = !!selectedIngredients[ingKey];
                  return <div key={idx} onClick={function() { setSelectedIngredients(function(prev) { return { ...prev, [ingKey]: !prev[ingKey] }; }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: '1px solid #F7FAFB', cursor: 'pointer' }}><div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid ' + (checked ? '#1A8BA5' : '#D1E3EA'), background: checked ? '#1A8BA5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>{checked && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}</div><span style={{ fontSize: '0.825rem', color: checked ? '#5A7180' : '#1E2A33', textDecoration: checked ? 'line-through' : 'none' }}>{typeof ing === 'string' ? ing.trim() : ing}</span></div>;
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <button onClick={function() { var all = (Array.isArray(selectedRecipe.ingredients) ? selectedRecipe.ingredients : (typeof selectedRecipe.ingredients === 'string' ? selectedRecipe.ingredients.split('|') : [])).filter(Boolean); var all2 = {}; all.forEach(function(i) { var k = typeof i === 'string' ? i.trim() : JSON.stringify(i); all2[k] = true; }); setSelectedIngredients(all2); }} style={{ flex: 1, padding: '0.5rem', background: '#E8F4F8', color: '#1E2A33', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>All</button>
                <button onClick={function() { setSelectedIngredients({}); }} style={{ flex: 1, padding: '0.5rem', background: '#FEF3C7', color: '#92400E', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
                <button onClick={function() { Object.keys(selectedIngredients).length > 0 ? openIngredientsModal(selectedRecipe) : showNotify('Check some ingredients first!'); }} style={{ flex: 2, padding: '0.5rem', background: '#10B981', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>+ Shopping List</button>
              </div>
              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                <button onClick={function() { setShowInstructions(true); }} style={{ width: '100%', padding: '0.875rem', background: '#7C3AED', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  View Instructions <span style={{ fontSize: '1rem' }}>→</span>
                </button>
              )}
            </div>
          </div>
        )

        selectedRecipe && showInstructions && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #E8F4F8', flexShrink: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33', margin: 0 }}>Cooking Instructions</p>
              <button onClick={function() { setShowInstructions(false); }} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#5A7180' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {(selectedRecipe.instructions || []).map(function(step, idx) {
                return (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1A8BA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                    <p style={{ flex: 1, fontSize: '0.9rem', color: '#1E2A33', lineHeight: 1.6, paddingTop: '0.2rem' }}>{step}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E8F4F8', flexShrink: 0 }}>
              <button style={{ width: '100%', padding: '0.875rem', background: '#7C3AED', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>Start Cook Mode ▶</button>
            </div>
          </div>
        )}`;

const newContent = content.substring(0, bs) + NEW + content.substring(endIdx + 1);
fs.writeFileSync(path, newContent);
console.log('Success!', content.length, '→', newContent.length, 'chars');