import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger.js";
import { corsMiddleware } from "./middleware/cors.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import repoRoutes from "./routes/repo.js";
import prRoutes from "./routes/pr.js";
import webhookRoutes from "./routes/webhook.js";
import aiRoutes from "./routes/ai.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(corsMiddleware);
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Capture the raw body on every request so the GitHub webhook route can verify
  // its HMAC signature against the exact bytes GitHub sent.
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.get("/health", (_req, res) => res.json({ success: true, data: "ok" }));

  app.use("/api/auth", apiLimiter, authRoutes);
  app.use("/api/repos", apiLimiter, repoRoutes);
  app.use("/api/repos", apiLimiter, prRoutes); // pr routes are nested under /api/repos/:owner/:repo
  app.use("/api/webhooks", webhookRoutes); // has its own rate limiter (webhookLimiter)
  app.use("/api/analysis", apiLimiter, aiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
