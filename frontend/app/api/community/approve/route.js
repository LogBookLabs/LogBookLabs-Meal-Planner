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

export async function POST(request, { params }) {
  try {
    const { id } = params;
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

    const pendingDir = `recipes/submissions/pending/${id}`;
    const communityDir = `recipes/community/${id}`;

    // Read the pending recipe.json
    const jsonRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}/recipe.json?ref=${BRANCH}`, pat);
    if (!jsonRes || !jsonRes.content) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    const recipe = JSON.parse(Buffer.from(jsonRes.content, 'base64').toString('utf-8'));

    // Update approval fields
    recipe.approvedBy = 'Trill';
    recipe.approvedAt = new Date().toISOString();
    recipe.image = `recipes/community/${id}/image.jpg`;

    // Get pending folder contents to find the image
    const dirRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}?ref=${BRANCH}`, pat);
    const imageFile = Array.isArray(dirRes) ? dirRes.find(f => f.type === 'file' && f.name.match(/\.(jpg|jpeg|png|webp)$/i)) : null;

    // Delete the old JSON (need its SHA)
    const deleteJsonRes = await githubApi('DELETE', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}/recipe.json`, pat, {
      message: `Approve submission: ${recipe.name}`,
      sha: jsonRes.sha,
      branch: BRANCH,
    });

    // Create the recipe.json in community dir
    const newJsonRes = await githubApi('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${communityDir}/recipe.json`, pat, {
      message: `Approve submission: ${recipe.name}`,
      content: Buffer.from(JSON.stringify(recipe, null, 2)).toString('base64'),
      branch: BRANCH,
    });

    // Move the image if found
    if (imageFile) {
      const imageExt = imageFile.name.split('.').pop().toLowerCase();
      const imageRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}/${imageFile.name}?ref=${BRANCH}`, pat);
      await githubApi('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${communityDir}/image.${imageExt}`, pat, {
        message: `Approve image: ${recipe.name}`,
        content: imageRes.content,
        branch: BRANCH,
      });
      // Delete the old image
      await githubApi('DELETE', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}/${imageFile.name}`, pat, {
        message: `Cleanup after approve: ${recipe.name}`,
        sha: imageRes.sha,
        branch: BRANCH,
      });
    }

    // Delete the now-empty pending folder (git rm the dir — we'll delete each file individually since there's no rmdir API)
    // The pending dir files should be deleted above; the folder remains empty.

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[/api/community/approve]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
