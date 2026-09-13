import cors from "cors";

// Supports a comma-separated CLIENT_ORIGIN env var for multi-origin setups
// (e.g. a marketing site + the app itself on different subdomains).
function getAllowedOrigins() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.trim().replace(/\/+$/, "");
    const allowed = getAllowedOrigins();
    if (allowed.includes(cleanOrigin) || allowed.includes("*") || cleanOrigin.startsWith("http://localhost:") || cleanOrigin.startsWith("http://127.0.0.1:")) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
});

