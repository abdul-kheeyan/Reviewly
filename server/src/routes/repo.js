import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listRepos } from "../controllers/repoController.js";

const router = Router();

router.get("/", requireAuth, listRepos);

export default router;
