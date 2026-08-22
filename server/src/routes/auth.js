import { Router } from "express";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../middleware/auth.js";

const router = Router();

/**
 * Stub GitHub OAuth callback: in production this exchanges `code` for a GitHub
 * access token, fetches the profile, and upserts a User from it.
 * TODO: replace the mock profile below with a real token exchange + /user call.
 */
router.post("/github/callback", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: "Missing code" });
      return;
    }

    const mockProfile = { githubId: "12345", username: "demo-user", avatarUrl: "" };

    const user = await User.findOneAndUpdate({ githubId: mockProfile.githubId }, mockProfile, {
      upsert: true,
      new: true,
    });

    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          githubId: user.githubId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
