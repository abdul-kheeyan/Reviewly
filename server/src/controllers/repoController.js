import { Repo } from "../models/Repo.js";
import { parseGithubUrl, fetchRepoMeta } from "../services/repoService.js";
import { BugReport } from "../models/BugReport.js";

export async function listRepos(req, res, next) {
  try {
    const repos = await Repo.find({ addedBy: req.auth.sub }).sort({ updatedAt: -1 }).limit(100).lean();
    res.json({ success: true, data: repos });
  } catch (err) {
    next(err);
  }
}

export async function addRepo(req, res, next) {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ success: false, error: 'repoUrl is required' });
    }

    const { owner, name } = parseGithubUrl(repoUrl);
    
    const existing = await Repo.findOne({ owner, name, addedBy: req.auth.sub });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already added this repository' });
    }

    const meta = await fetchRepoMeta(owner, name);

    const repo = new Repo({
      owner,
      name,
      addedBy: req.auth.sub,
      repoUrl,
      description: meta.description,
      language: meta.language,
      stars: meta.stars,
      forks: meta.forks,
      defaultBranch: meta.defaultBranch
    });

    await repo.save();
    res.status(201).json({ success: true, data: { repo } });
  } catch (err) {
    next(err);
  }
}

export async function getRepoDetails(req, res, next) {
  try {
    const repo = await Repo.findOne({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }
    res.json({ success: true, data: { repo } });
  } catch (err) {
    next(err);
  }
}

export async function deleteRepo(req, res, next) {
  try {
    const repo = await Repo.findOneAndDelete({ _id: req.params.repoId, addedBy: req.auth.sub });
    if (!repo) {
      return res.status(404).json({ success: false, error: 'Repository not found' });
    }
    await BugReport.deleteMany({ repo: repo._id });
    res.json({ success: true, message: 'Repo removed' });
  } catch (err) {
    next(err);
  }
}
