const fs = require('fs');
const path = 'C:/Users/bonif/.openclaw/workspace/meal-planner/frontend/app/page.js';
let c = fs.readFileSync(path, 'utf8');

// Find and remove the old dark mode CSS override useEffect block (129 to ~164)
const marker = '// Dark mode CSS overrides via style tag';
const idx = c.indexOf(marker);
if (idx === -1) {
  console.log('Marker not found');
} else {
  // Find the start of this useEffect (go back to find '// Dark mode CSS overrides')
  const useEffectStart = c.lastIndexOf('  // Dark mode CSS overrides via style tag\n', idx);
  // Find the end: '  }, [darkMode]);' after the style injection block
  const endMarker = '  // Always load GitHub';
  const blockEnd = c.indexOf(endMarker, idx);
  if (blockEnd !== -1) {
    const oldBlock = c.substring(useEffectStart, blockEnd);
    console.log('Found old block, length:', oldBlock.length);
    // Check if the '// Always load GitHub' is right after the closing of the second useEffect
    const firstUseEffectEnd = c.indexOf('}, [darkMode]);', idx);
    const secondUseEffectEnd = c.indexOf('}, [darkMode]);', firstUseEffectEnd + 15);
    console.log('First useEffect ends at:', firstUseEffectEnd);
    console.log('Second useEffect ends at:', secondUseEffectEnd);
    
    // Actually let's just remove from marker to just before '// Always load GitHub'
    const toRemove = c.substring(idx - 50, blockEnd);
    c = c.replace(toRemove, '');
    fs.writeFileSync(path, c);
    console.log('Removed old useEffect block');
  } else {
    console.log('End marker not found');
  }
}
