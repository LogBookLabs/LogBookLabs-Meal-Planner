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

    // List and delete all files in the pending submission folder
    const dirRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}?ref=${BRANCH}`, pat);
    if (Array.isArray(dirRes)) {
      for (const file of dirRes) {
        if (file.type === 'file') {
          // Get SHA then delete
          const fileRes = await githubApi('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}/${file.name}?ref=${BRANCH}`, pat);
          await githubApi('DELETE', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pendingDir}/${file.name}`, pat, {
            message: `Reject submission: ${id}`,
            sha: fileRes.sha,
            branch: BRANCH,
          });
        }
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[/api/community/reject]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
