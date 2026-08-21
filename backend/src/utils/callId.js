const crypto = require("crypto");
function generateCallId() {
  return `room_${crypto.randomBytes(4).toString("hex")}`;
}
module.exports = { generateCallId };