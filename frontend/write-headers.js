const https = require('https');

const SHEET_ID = '13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI';
const HEADERS = ['name', 'ingredients', 'servings', 'calories', 'protein', 'cuisine', 'diet', 'cookTime', 'prepTime', 'instructions', 'imageUrl', 'category', 'submittedBy', 'dateAdded'];

function getToken() {
  const { execSync } = require('child_process');
  // Use gog's OAuth token for API calls
  const { GoogleAuth } = require('google-auth-library');
  // Actually, let's just spawn gog and capture its stdout
  const { spawn } = require('child_process');
  return null; // placeholder
}

const { spawnSync } = require('child_process');
const result = spawnSync('gog', ['sheets', 'update', SHEET_ID, 'my-recipes!A1:N1',
  '--values-json', '[["name","ingredients","servings","calories","protein","cuisine","diet","cookTime","prepTime","instructions","imageUrl","category","submittedBy","dateAdded"]]',
  '--account', 'bonifascorey2006@gmail.com',
  '--plain'], { encoding: 'utf8' });
console.log('stdout:', result.stdout);
console.log('stderr:', result.stderr);
console.log('status:', result.status);
