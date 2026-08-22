import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: `Not found: ${req.method} ${req.path}` });
}

// Keep this as the LAST middleware registered in app.js — Express identifies
// error handlers by their 4-argument signature (err, req, res, next).
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error({ err, path: req.path }, "Unhandled server error");
  } else {
    logger.warn({ err: err.message, path: req.path }, "Request error");
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? "Internal server error" : err.message,
  });
}
