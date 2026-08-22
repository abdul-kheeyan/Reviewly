import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Verifies the access token from the Authorization header (Bearer <token>)
// and attaches { sub, role } to req.auth.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing bearer token" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// RBAC gate. Role hierarchy: owner > maintainer > contributor > reader.
const ROLE_RANK = { owner: 3, maintainer: 2, contributor: 1, reader: 0 };

export function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    if (ROLE_RANK[req.auth.role] < ROLE_RANK[minRole]) {
      res.status(403).json({ success: false, error: `Requires ${minRole} role or higher` });
      return;
    }
    next();
  };
}

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
}

export function signRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
}
