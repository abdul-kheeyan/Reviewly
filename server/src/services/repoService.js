import { logger } from '../utils/logger.js';

function getGithubHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Reviewly-App'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// Parse GitHub URL to extract owner and repo name
// Handles: https://github.com/owner/repo, https://github.com/owner/repo.git, github.com/owner/repo
export function parseGithubUrl(url) {
  try {
    let cleanUrl = (url || '').trim().replace(/\.git$/, '').replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const parsed = new URL(cleanUrl);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], name: parts[1] };
    }
    throw new Error('Invalid GitHub URL format');
  } catch (err) {
    throw new Error('Invalid GitHub URL');
  }
}

// Fetch repo metadata from GitHub public API
export async function fetchRepoMeta(owner, name) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: getGithubHeaders()
  });
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Repository not found' : 'Failed to fetch repo metadata');
  }
  const data = await res.json();
  return { 
    description: data.description || '', 
    language: data.language || '', 
    stars: data.stargazers_count || 0, 
    forks: data.forks_count || 0, 
    defaultBranch: data.default_branch || 'main'
  };
}

// Fetch file tree from GitHub
export async function fetchRepoTree(owner, name, branch = 'main') {
  let targetBranch = branch || 'main';
  let res = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${targetBranch}?recursive=1`, {
    headers: getGithubHeaders()
  });

  // Fallback to master if defaultBranch was main and not found, or vice-versa
  if (!res.ok && targetBranch === 'main') {
    targetBranch = 'master';
    res = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${targetBranch}?recursive=1`, {
      headers: getGithubHeaders()
    });
  }

  if (!res.ok) {
    logger.warn({ owner, name, branch: targetBranch, status: res.status }, 'Failed to fetch repo tree from GitHub');
    return [];
  }
  const data = await res.json();
  if (!data.tree || !Array.isArray(data.tree)) return [];
  return data.tree.filter(item => item.type === 'blob').map(item => item.path);
}

// Fetch single file content
export async function fetchFileContent(owner, name, filePath, branch = 'main') {
  const targetBranch = branch || 'main';
  let res = await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${filePath}?ref=${targetBranch}`, {
    headers: getGithubHeaders()
  });

  if (!res.ok && targetBranch === 'main') {
    res = await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${filePath}?ref=master`, {
      headers: getGithubHeaders()
    });
  }

  if (!res.ok) {
    logger.warn(`Failed to fetch file content for ${filePath}`);
    return null;
  }
  const data = await res.json();
  if (data.size > 1000000) { // skip if > 1MB
    return null;
  }
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf8');
  }
  return null;
}

