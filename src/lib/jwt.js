import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ 7 days expiry
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "90d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ✅ Token எத்தனை days மீதம் இருக்கு
export function getTokenDaysLeft(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded?.exp) return null;
    const msLeft = decoded.exp * 1000 - Date.now();
    return msLeft / (1000 * 60 * 60 * 24); // days
  } catch {
    return null;
  }
}