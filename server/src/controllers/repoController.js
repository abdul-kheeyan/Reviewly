import { Repo } from "../models/Repo.js";

export async function listRepos(req, res, next) {
  try {
    const repos = await Repo.find().sort({ updatedAt: -1 }).limit(100).lean();
    res.json({ success: true, data: repos });
  } catch (err) {
    next(err);
  }
}
