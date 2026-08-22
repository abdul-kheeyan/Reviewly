import { PullRequest } from "../models/PullRequest.js";
import { Review } from "../models/Review.js";
import { reviewDiff } from "../services/copilotService.js";

// Manually (re-)triggers an AI review for a PR — useful for a "Re-run review" button.
export async function triggerReview(req, res, next) {
  try {
    const { pullRequestId } = req.params;

    const pr = await PullRequest.findById(pullRequestId);
    if (!pr) {
      res.status(404).json({ success: false, error: "Pull request not found" });
      return;
    }

    // TODO: fetch the real diff from the GitHub REST/GraphQL API using pr.headSha.
    const suggestions = await reviewDiff([{ filePath: "src/example.js", patch: "" }]);

    const review = await Review.create({ pullRequest: pr._id, suggestions });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

// Records a developer's reaction to a specific suggestion (the "learning loop").
export async function submitFeedback(req, res, next) {
  try {
    const { reviewId } = req.params;
    const { suggestionIndex, reaction } = req.body;

    if (!req.auth) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $push: { feedback: { suggestionIndex, reaction, byUser: req.auth.sub, createdAt: new Date() } } },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, error: "Review not found" });
      return;
    }

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}
