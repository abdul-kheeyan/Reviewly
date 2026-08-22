import { Repo } from "../models/Repo.js";
import { PullRequest } from "../models/PullRequest.js";
import { Review } from "../models/Review.js";

export async function listPullRequests(req, res, next) {
  try {
    const { owner, repo: repoName } = req.params;

    const repo = await Repo.findOne({ owner, name: repoName });
    if (!repo) {
      res.status(404).json({ success: false, error: "Repo not found" });
      return;
    }

    const pulls = await PullRequest.find({ repo: repo._id }).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: pulls });
  } catch (err) {
    next(err);
  }
}

export async function getPullRequest(req, res, next) {
  try {
    const { owner, repo: repoName, number } = req.params;

    const repo = await Repo.findOne({ owner, name: repoName });
    if (!repo) {
      res.status(404).json({ success: false, error: "Repo not found" });
      return;
    }

    const pr = await PullRequest.findOne({ repo: repo._id, number: Number(number) }).lean();
    if (!pr) {
      res.status(404).json({ success: false, error: "Pull request not found" });
      return;
    }

    const review = await Review.findOne({ pullRequest: pr._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { pr, review } });
  } catch (err) {
    next(err);
  }
}
