import { logger } from '../utils/logger.js';

// Parse GitHub URL to extract owner and repo name
// Handles: https://github.com/owner/repo, https://github.com/owner/repo.git, github.com/owner/repo
export function parseGithubUrl(url) {
  try {
    let cleanUrl = url.trim().replace(/\.git$/, '');
    if (!cleanUrl.startsWith('http')) {
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
    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Reviewly-App' }
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
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${branch}?recursive=1`, {
    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Reviewly-App' }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch repo tree');
  }
  const data = await res.json();
  if (!data.tree) return [];
  return data.tree.filter(item => item.type === 'blob').map(item => item.path);
}

// Fetch single file content
export async function fetchFileContent(owner, name, filePath, branch = 'main') {
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${filePath}?ref=${branch}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Reviewly-App' }
  });
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
