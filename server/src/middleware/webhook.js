import crypto from "crypto";
import { logger } from "../utils/logger.js";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

/**
 * Verifies GitHub's `X-Hub-Signature-256` header against the raw request body.
 * Must run AFTER a body parser that captured `req.rawBody` (see app.js), and
 * BEFORE any route handler that trusts the payload.
 */
export function verifyGithubSignature(req, res, next) {
  if (!WEBHOOK_SECRET) {
    logger.error("GITHUB_WEBHOOK_SECRET is not set — refusing to process webhook");
    res.status(500).json({ success: false, error: "Webhook not configured" });
    return;
  }

  const signature = req.header("X-Hub-Signature-256");
  const rawBody = req.rawBody;

  if (!signature || !rawBody) {
    res.status(401).json({ success: false, error: "Missing signature" });
    return;
  }

  const expected =
    "sha256=" + crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  const isValid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!isValid) {
    logger.warn("Rejected webhook: signature mismatch");
    res.status(401).json({ success: false, error: "Invalid signature" });
    return;
  }

  next();
}
