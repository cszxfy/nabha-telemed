// Usage in a controller: throw httpError(400, "symptoms array required");
// The errorHandler middleware catches it and responds { error: message }
// with the given status code, matching the API contract exactly.
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
module.exports = httpError;