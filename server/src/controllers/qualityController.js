import { Repo } from '../models/Repo.js';
import { fetchRepoTree, fetchFileContent } from '../services/repoService.js';
import { generateQualityScore, scanSecurity, analyzeDependencies } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

export async function triggerQualityScore(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    const fileTree = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch);
    
    // Select key files for quality analysis
    const sourceFiles = fileTree.filter(path => {
      const p = path.toLowerCase();
      if (p.includes('node_modules') || p.includes('package-lock.json')) return false;
      return p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.ts') || p.endsWith('.tsx');
    }).slice(0, 10);

    const files = [];
    for (const filePath of sourceFiles) {
      const content = await fetchFileContent(repo.owner, repo.name, filePath, repo.defaultBranch);
      if (content) {
        files.push({ path: filePath, content });
      }
    }

    const result = await generateQualityScore(repo, fileTree, files);
    res.json({ success: true, data: { qualityScore: result } });
  } catch (err) {
    logger.error(err, 'Failed to trigger quality score');
    next(err);
  }
}

export async function triggerSecurityScan(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    const fileTree = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch);
    
    // Select key files that often contain security issues (auth, db, routes)
    const sourceFiles = fileTree.filter(path => {
      const p = path.toLowerCase();
      if (p.includes('node_modules') || p.includes('package-lock.json')) return false;
      return p.includes('auth') || p.includes('user') || p.includes('db') || p.includes('api') || p.includes('route');
    }).slice(0, 10);

    // Fallback to general files if not enough security-specific ones found
    if (sourceFiles.length < 5) {
        const moreFiles = fileTree.filter(path => path.endsWith('.js') || path.endsWith('.ts')).slice(0, 5);
        sourceFiles.push(...moreFiles);
    }

    const files = [];
    for (const filePath of [...new Set(sourceFiles)].slice(0, 10)) {
      const content = await fetchFileContent(repo.owner, repo.name, filePath, repo.defaultBranch);
      if (content) {
        files.push({ path: filePath, content });
      }
    }

    const result = await scanSecurity(files);
    res.json({ success: true, data: { securityScan: result } });
  } catch (err) {
    logger.error(err, 'Failed to trigger security scan');
    next(err);
  }
}

export async function triggerDependencyCheck(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    const fileTree = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch);
    
    // Find manifest files like package.json, requirements.txt, Pipfile, go.mod, pom.xml, Cargo.toml, etc.
    const manifestPaths = fileTree.filter(path => {
      const p = path.toLowerCase();
      return p.endsWith('package.json') || 
             p.endsWith('requirements.txt') || 
             p.endsWith('pipfile') || 
             p.endsWith('go.mod') || 
             p.endsWith('pom.xml') || 
             p.endsWith('cargo.toml') ||
             p.endsWith('gemfile');
    }).slice(0, 5);

    const files = [];
    for (const filePath of manifestPaths) {
      const content = await fetchFileContent(repo.owner, repo.name, filePath, repo.defaultBranch);
      if (content) {
        files.push({ path: filePath, content });
      }
    }

    if (files.length === 0) {
      return res.json({
        success: true,
        data: {
          dependencies: {
            healthScore: 100,
            totalDependencies: 0,
            outdatedCount: 0,
            vulnerableCount: 0,
            summary: "No standard dependency manifest file (e.g. package.json, requirements.txt) was found in this repository.",
            dependencies: [],
            recommendations: ["Ensure your project includes standard dependency configuration files."]
          }
        }
      });
    }

    const result = await analyzeDependencies(files);
    res.json({ success: true, data: { dependencies: result } });
  } catch (err) {
    logger.error(err, 'Failed to trigger dependency check');
    next(err);
  }
}

