import { Repo } from '../models/Repo.js';
import { fetchRepoTree, fetchFileContent } from '../services/repoService.js';
import { explainRepo } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

export async function triggerExplain(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    const fileTree = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch);
    
    // Select key files
    const keyFilePaths = fileTree.filter(path => {
      const lower = path.toLowerCase();
      return lower === 'readme.md' || lower === 'package.json' || lower.includes('src/index.js') || lower.includes('src/main.js') || lower.includes('app.js');
    }).slice(0, 5);

    const keyFileContents = [];
    for (const filePath of keyFilePaths) {
      const content = await fetchFileContent(repo.owner, repo.name, filePath, repo.defaultBranch);
      if (content) {
        keyFileContents.push({ path: filePath, content });
      }
    }

    const explanation = await explainRepo(repo, fileTree, keyFileContents);

    repo.aiSummary = explanation.summary || explanation.purpose;
    repo.techStack = explanation.techStack || [];
    repo.lastAnalyzedAt = new Date();
    await repo.save();

    res.json({ success: true, data: { explanation } });
  } catch (err) {
    logger.error(err, 'Failed to trigger explain');
    next(err);
  }
}

export async function getExplanation(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }
    res.json({ 
      success: true, 
      data: { 
        aiSummary: repo.aiSummary, 
        techStack: repo.techStack,
        lastAnalyzedAt: repo.lastAnalyzedAt
      } 
    });
  } catch (err) {
    next(err);
  }
}
