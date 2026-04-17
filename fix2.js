const fs = require('fs');
const path = 'C:/Users/bonif/.openclaw/workspace/meal-planner/frontend/app/page.js';
let c = fs.readFileSync(path, 'utf8');

const bad = "else root.removeAttribute  // Always load GitHub recipes on mount\n  useEffect(function() {\n    if (typeof window === 'undefined') return;\n";
const good = `else root.removeAttribute('data-dark');
      }
    }
  }
}, [darkMode]);

  // Always load GitHub recipes on mount
  useEffect(function() {
    if (typeof window === 'undefined') return;
`;

if (c.includes(bad)) {
  c = c.replace(bad, good);
  console.log('Fixed!');
} else {
  console.log('Pattern not found');
  // Try with newline variations
  const alt = "else root.removeAttribute  // Always load GitHub recipes on mount\r\n  useEffect(function() {\r\n    if (typeof window === 'undefined') return;\r\n";
  if (c.includes(alt)) {
    c = c.replace(alt, good);
    console.log('Fixed with alt!');
  } else {
    console.log('Neither found');
  }
}
fs.writeFileSync(path, c);
