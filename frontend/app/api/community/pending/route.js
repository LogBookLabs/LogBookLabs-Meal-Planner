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

export async function GET() {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List pending submissions directory
    const dirRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/recipes/submissions/pending?ref=${BRANCH}`, pat);

    if (!Array.isArray(dirRes)) {
      return NextResponse.json({ submissions: [] });
    }

    const submissions = [];
    for (const item of dirRes) {
      if (item.type !== 'dir') continue;
      const id = item.name;
      try {
        const jsonRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/recipes/submissions/pending/${id}/recipe.json?ref=${BRANCH}`, pat);
        if (jsonRes && jsonRes.content) {
          const decoded = JSON.parse(Buffer.from(jsonRes.content, 'base64').toString('utf-8'));
          submissions.push({
            id,
            name: decoded.name,
            submittedBy: decoded.submittedBy || 'Anonymous',
            date: decoded.dateAdded,
            category: decoded.category,
            imageUrl: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/recipes/submissions/pending/${id}/image.jpg`,
          });
        }
      } catch {
        // skip entries we can't read
      }
    }

    // Sort by date descending
    submissions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error('[/api/community/pending]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
