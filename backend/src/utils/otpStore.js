// In-memory OTP store. Not part of the frozen DB schema (no "otps"
// collection defined), so OTPs are short-lived (5 min) and don't need to
// survive a restart. NOTE: only works with a single backend instance — if
// we scale to multiple instances behind a load balancer, move to Redis.
const OTP_TTL_MS = 5 * 60 * 1000;
const store = new Map();

function generate(phone) {
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  store.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS });
  return otp;
}
function verify(phone, otp) {
  const record = store.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    store.delete(phone);
    return false;
  }
  const match = record.otp === otp;
  if (match) store.delete(phone);
  return match;
}

module.exports = { generate, verify };