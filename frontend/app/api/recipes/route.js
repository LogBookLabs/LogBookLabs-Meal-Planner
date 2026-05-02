import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'LogBook-Labs';
const REPO_NAME = 'meal-planner-recipes';
const BRANCH = 'main';

async function githubApi(method, path, pat, body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${GITHUB_API}${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${method} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

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

    // Also fetch community recipes from GitHub
    const pat = process.env.GH_PAT;
    if (pat) {
      try {
        const dirRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/recipes/community?ref=${BRANCH}`, pat);
        if (Array.isArray(dirRes)) {
          for (const item of dirRes) {
            if (item.type !== 'file' || !item.name.endsWith('.json')) continue;
            try {
              const jsonRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${item.path}?ref=${BRANCH}`, pat);
              if (jsonRes && jsonRes.content) {
                const recipe = JSON.parse(Buffer.from(jsonRes.content, 'base64').toString('utf-8'));
                // Enrich with image URL (raw GitHub URL)
                recipe.imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/recipes/community/${item.name.replace('.json', '')}/image.jpg`;
                recipe._source = 'community';
                allRecipes.push(recipe);
              }
            } catch {
              // skip files we can't read
            }
          }
        }
      } catch (e) {
        console.warn('[/api/recipes] Could not fetch community recipes:', e.message);
      }
    }

    return Response.json({
      recipes: allRecipes,
      total: allRecipes.length,
      source: 'local+community',
      files: jsonFiles,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
