 // Centralized error handler. Every error response body follows the API
// contract's shape: { "error": "human readable message" }.
// Routes/controllers should call next(err) with err.status set, e.g.:
//   const e = new Error("Invalid phone number"); e.status = 400; throw e;
module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: err.message || "Server error" });
};