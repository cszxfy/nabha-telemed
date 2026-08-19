const PHONE_REGEX = /^[6-9]\d{9}$/;

function isValidPhone(phone) {
  return typeof phone === "string" && PHONE_REGEX.test(phone);
}

module.exports = { isValidPhone };