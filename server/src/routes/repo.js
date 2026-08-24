import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listRepos, addRepo, getRepoDetails, deleteRepo } from "../controllers/repoController.js";

const router = Router();

router.get("/", requireAuth, listRepos);
router.post("/", requireAuth, addRepo);
router.get("/:repoId", requireAuth, getRepoDetails);
router.delete("/:repoId", requireAuth, deleteRepo);

export default router;
