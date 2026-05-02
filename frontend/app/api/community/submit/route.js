import { NextResponse } from 'next/server';

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

export async function POST(request) {
  try {
    const pat = process.env.GH_PAT;
    if (!pat) {
      return NextResponse.json({ error: 'Server misconfigured: GH_PAT not set' }, { status: 500 });
    }

    // Validate PAT has repo scope
    try {
      const user = await githubApi('GET', '/user', pat);
      if (!user || !user.login) throw new Error('Invalid token');
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: valid GitHub PAT with repo scope required' }, { status: 401 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const fields = {
      name: formData.get('name'),
      instructions: formData.get('instructions'),
      category: formData.get('category'),
      cuisine: formData.get('cuisine'),
      diet: formData.get('diet'),
      cookTime: parseInt(formData.get('cookTime')) || 0,
      prepTime: parseInt(formData.get('prepTime')) || 0,
      servings: parseInt(formData.get('servings')) || 0,
      caloriesValue: parseFloat(formData.get('caloriesValue')) || 0,
      caloriesEstimated: formData.get('caloriesEstimated') === 'true',
      proteinValue: parseFloat(formData.get('proteinValue')) || 0,
      proteinEstimated: formData.get('proteinEstimated') === 'true',
      submittedBy: formData.get('submittedBy') || 'Anonymous',
      ingredientsJson: formData.get('ingredients'),
      addToMyRecipes: formData.get('addToMyRecipes') === 'true',
    };

    if (!fields.name || !fields.instructions) {
      return NextResponse.json({ error: 'name and instructions are required' }, { status: 400 });
    }

    const ingredients = (() => {
      try {
        return JSON.parse(fields.ingredientsJson || '[]');
      } catch {
        return [];
      }
    })();

    const image = formData.get('image');
    let imageExt = 'jpg';
    if (image && image.name) {
      const ext = image.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) imageExt = ext;
    }

    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();

    const recipeJson = {
      id,
      name: fields.name,
      ingredients,
      instructions: fields.instructions,
      category: fields.category || 'Dinner',
      cuisine: fields.cuisine || '',
      diet: Array.isArray(fields.diet) ? fields.diet : (fields.diet ? fields.diet.split(',').map(s => s.trim()).filter(Boolean) : []),
      cookTime: fields.cookTime,
      prepTime: fields.prepTime,
      servings: fields.servings,
      calories: { value: fields.caloriesValue, estimated: fields.caloriesEstimated },
      protein: { value: fields.proteinValue, estimated: fields.proteinEstimated },
      image: `recipes/submissions/pending/${id}/image.${imageExt}`,
      profilePhoto: null,
      submittedBy: fields.submittedBy,
      dateAdded: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
    };

    const pendingDir = `recipes/submissions/pending/${id}`;
    const jsonPath = `${pendingDir}/recipe.json`;
    const imagePath = `${pendingDir}/image.${imageExt}`;

    // Create the recipe JSON file
    const jsonRes = await githubApi('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${jsonPath}`, pat, {
      message: `Pending submission: ${fields.name} (${id})`,
      content: Buffer.from(JSON.stringify(recipeJson, null, 2)).toString('base64'),
      branch: BRANCH,
    });

    // Upload the image if provided
    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer).toString('base64');
      await githubApi('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${imagePath}`, pat, {
        message: `Image for submission: ${fields.name} (${id})`,
        content: imageBuffer,
        branch: BRANCH,
      });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[/api/community/submit]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
