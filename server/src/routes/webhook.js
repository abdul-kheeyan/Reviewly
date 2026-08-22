import { Router } from "express";
import { verifyGithubSignature } from "../middleware/webhook.js";
import { webhookLimiter } from "../middleware/rateLimit.js";
import { Repo } from "../models/Repo.js";
import { PullRequest } from "../models/PullRequest.js";
import { Review } from "../models/Review.js";
import { reviewDiff } from "../services/copilotService.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.post("/github", webhookLimiter, verifyGithubSignature, async (req, res, next) => {
  try {
    const event = req.header("X-GitHub-Event");
    const payload = req.body;

    if (event !== "pull_request") {
      res.status(202).json({ success: true, data: "Event ignored" });
      return;
    }

    if (!["opened", "synchronize", "reopened"].includes(payload.action)) {
      res.status(202).json({ success: true, data: "Action ignored" });
      return;
    }

    const repo = await Repo.findOneAndUpdate(
      { owner: payload.repository.owner.login, name: payload.repository.name },
      {
        owner: payload.repository.owner.login,
        name: payload.repository.name,
        installationId: String(payload.installation?.id ?? ""),
        defaultBranch: payload.repository.default_branch,
      },
      { upsert: true, new: true }
    );

    const pr = await PullRequest.findOneAndUpdate(
      { repo: repo._id, number: payload.pull_request.number },
      {
        repo: repo._id,
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        author: payload.pull_request.user.login,
        state: payload.pull_request.merged ? "merged" : payload.pull_request.state,
        headSha: payload.pull_request.head.sha,
      },
      { upsert: true, new: true }
    );

    // NOTE: for production PR volume, push this onto a job queue (e.g. Bull +
    // Redis) instead of running it inline in the webhook handler.
    // TODO: fetch the real diff via GitHub's API before calling reviewDiff().
    const suggestions = await reviewDiff([{ filePath: "unknown", patch: "" }]);
    await Review.create({ pullRequest: pr._id, suggestions });

    logger.info({ repo: `${repo.owner}/${repo.name}`, pr: pr.number }, "Processed PR webhook");
    res.status(202).json({ success: true, data: "Review queued" });
  } catch (err) {
    next(err);
  }
});

export default router;
