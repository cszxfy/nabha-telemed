// Verifies the JWT sent as "Authorization: Bearer <token>".
// On success, attaches { userId, role } to req.auth and calls next().
// On failure, responds 401 in the contract's error shape.
const jwt = require("jsonwebtoken");
const httpError = require("../utils/httpError");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(httpError(401, "Missing or invalid Authorization header"));
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    next(httpError(401, "Invalid or expired token"));
  }
};