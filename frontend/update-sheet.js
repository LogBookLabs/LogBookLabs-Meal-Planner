const { execSync } = require('child_process');

// Get access token from gog
const tokenCmd = 'gog auth token --account bonifascorey2006@gmail.com --plain 2>&1';
const token = execSync(tokenCmd, { encoding: 'utf8' }).trim();
console.log('Token prefix:', token.substring(0, 20));

const https = require('https');

const sheetId = '13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI';
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

const headerRow = {
  values: [['name', 'ingredients', 'servings', 'calories', 'protein', 'cuisine', 'diet', 'cookTime', 'prepTime', 'instructions', 'imageUrl', 'category', 'submittedBy', 'dateAdded']]
};

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sheets.googleapis.com',
      path: `/v4/spreadsheets/${sheetId}${path}`,
      method,
      headers: { ...headers, 'Content-Length': body ? Buffer.byteLength(JSON.stringify(body)) : 0 }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Add header row to my-recipes
  const r1 = await request('POST', '/values/my-recipes!A1:N1:append?valueInputOption=RAW', headerRow);
  console.log('Header row result:', JSON.stringify(r1).substring(0, 200));

  // Freeze header row in planner
  const r2 = await request('POST', ':batchUpdate', {
    requests: [{ freezeRange: { numberOfRows: 1, sheetId: 0 } }]
  });
  console.log('Freeze result:', JSON.stringify(r2).substring(0, 200));
}

main().catch(e => console.error(e.message));
