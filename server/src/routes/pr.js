import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listPullRequests, getPullRequest } from "../controllers/prController.js";
import { triggerReview, submitFeedback } from "../controllers/copilotController.js";

const router = Router();

router.get("/:owner/:repo/pulls", requireAuth, listPullRequests);
router.get("/:owner/:repo/pulls/:number", requireAuth, getPullRequest);
router.post("/reviews/:pullRequestId/run", requireAuth, triggerReview);
router.post("/reviews/:reviewId/feedback", requireAuth, submitFeedback);

export default router;
