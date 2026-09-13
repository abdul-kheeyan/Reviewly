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
    
    // Select key files intelligently across all tech stacks
    const priorityKeywords = ['readme.md', 'package.json', 'index.html', 'style.css', 'styles.css', 'script.js', 'app.js', 'main.js', 'index.js', 'app.py', 'main.py', 'requirements.txt', 'go.mod', 'cargo.toml', 'pom.xml', 'app.jsx', 'app.tsx'];
    
    let keyFilePaths = fileTree.filter(path => {
      const lower = path.toLowerCase();
      const filename = lower.split('/').pop();
      return priorityKeywords.some(keyword => filename === keyword || lower.endsWith(`/${keyword}`));
    });

    if (keyFilePaths.length < 3) {
      const fallbackFiles = fileTree.filter(path => {
        const lower = path.toLowerCase();
        if (lower.includes('node_modules') || lower.includes('dist/') || lower.includes('.git/')) return false;
        return lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.html') || lower.endsWith('.css') || lower.endsWith('.py') || lower.endsWith('.java');
      });
      keyFilePaths = [...new Set([...keyFilePaths, ...fallbackFiles])];
    }

    keyFilePaths = keyFilePaths.slice(0, 8);


    const keyFileContents = [];
    for (const filePath of keyFilePaths) {
      const content = await fetchFileContent(repo.owner, repo.name, filePath, repo.defaultBranch);
      if (content) {
        keyFileContents.push({ path: filePath, content });
      }
    }

    const explanation = await explainRepo(repo, fileTree, keyFileContents);

    repo.aiSummary = explanation.summary || explanation.purpose;
    repo.aiExplanation = explanation;
    repo.techStack = explanation.techStack || [];
    repo.lastAnalyzedAt = new Date();
    await repo.save();

    res.json({ success: true, data: { explanation } });
  } catch (err) {
    logger.error({ err }, 'Failed to trigger explain');
    next(err);
  }
}

export async function getExplanation(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }

    if (!repo.aiExplanation && !repo.aiSummary) {
      return res.json({ 
        success: true, 
        data: { 
          explanation: null,
          aiSummary: '', 
          techStack: [],
          lastAnalyzedAt: null
        } 
      });
    }

    const explanation = repo.aiExplanation || {
      summary: repo.aiSummary || '',
      purpose: '',
      architecture: '',
      techStack: repo.techStack || [],
      keyFiles: [],
      strengths: [],
      improvements: []
    };

    res.json({ 
      success: true, 
      data: { 
        explanation,
        aiSummary: repo.aiSummary, 
        techStack: repo.techStack,
        lastAnalyzedAt: repo.lastAnalyzedAt
      } 
    });
  } catch (err) {
    next(err);
  }
}


