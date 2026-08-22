import rateLimit from "express-rate-limit";

// General API traffic.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again shortly." },
});

// Webhooks come from GitHub's infra, not end users — allow a much higher burst
// rate but still cap it so a misbehaving integration can't take the process down.
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
