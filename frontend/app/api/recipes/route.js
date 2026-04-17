import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const recipesDir = join(process.cwd(), 'public', 'images', 'recipes');
    const files = await readdir(recipesDir);
    const jsonFiles = files.filter(f => f.startsWith('part-') && f.endsWith('.json'));
    
    const allRecipes = [];
    for (const file of jsonFiles) {
      const content = await readFile(join(recipesDir, file), 'utf8');
      const recipes = JSON.parse(content);
      allRecipes.push(...recipes);
    }
    
    return Response.json({ 
      recipes: allRecipes, 
      total: allRecipes.length, 
      source: 'local',
      files: jsonFiles
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
