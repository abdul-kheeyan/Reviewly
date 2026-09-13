import { Repo } from '../models/Repo.js';
import { BugReport } from '../models/BugReport.js';
import { fetchRepoTree, fetchFileContent } from '../services/repoService.js';
import { analyzeBugs } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

export async function triggerBugAnalysis(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    const fileTree = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch);
    
    // Select up to 10 source files
    const sourceFiles = fileTree.filter(path => {
      const p = path.toLowerCase();
      // Skip non-code files
      if (p.includes('node_modules') || p.includes('package-lock.json') || p.includes('yarn.lock')) return false;
      if (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.ico') || p.endsWith('.svg')) return false;
      if (p.endsWith('.md')) return false;
      return p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.ts') || p.endsWith('.tsx') || 
             p.endsWith('.py') || p.endsWith('.go') || p.endsWith('.java') || p.endsWith('.html') || 
             p.endsWith('.css') || p.endsWith('.rs') || p.endsWith('.php') || p.endsWith('.c') || p.endsWith('.cpp');
    }).slice(0, 10);


    const files = [];
    for (const filePath of sourceFiles) {
      const content = await fetchFileContent(repo.owner, repo.name, filePath, repo.defaultBranch);
      if (content) {
        files.push({ path: filePath, content });
      }
    }

    const result = await analyzeBugs(files);

    const bugReport = await BugReport.findOneAndUpdate(
      { repo: repo._id },
      { 
        repo: repo._id, 
        bugs: result.bugs || [], 
        overallScore: result.overallScore || 0, 
        summary: result.summary || '' 
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { bugReport } });
  } catch (err) {
    logger.error(err, 'Failed to analyze bugs');
    next(err);
  }
}

export async function getBugReport(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    const bugReport = await BugReport.findOne({ repo: repo._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { bugReport: bugReport || null } });
  } catch (err) {
    next(err);
  }
}

