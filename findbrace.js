const fs = require('fs');
const c = fs.readFileSync('C:\\Users\\bonif\\.openclaw\\workspace\\meal-planner\\frontend\\app\\page.js', 'utf8');
const startToken = '{selectedRecipe && (';
const startIdx = c.indexOf(startToken);
console.log('startIdx:', startIdx);
let bs = startIdx - 1;
while (bs >= 0 && ' \t\n\r'.includes(c[bs])) bs--;
console.log('braceStart:', bs, 'char:', JSON.stringify(c[bs]));
console.log('Around:', JSON.stringify(c.substring(bs - 2, startIdx + 30)));
let depth = 0, inStr = false, strChar = null, pc = '';
for (let i = bs; i < c.length; i++) {
  const ch = c[i];
  if (!inStr) {
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
    else if (ch === '{') { depth++; }
    else if (ch === '}') { depth--; if (depth === 0) { console.log('End at', i, 'char:', JSON.stringify(c[i])); break; } }
  } else {
    if (ch === strChar && pc !== '\\') { inStr = false; strChar = null; }
  }
  pc = ch;
}
console.log('Final depth:', depth);