// SMS service wrapper (Twilio / MSG91)
async function sendSms(phone, message) {
  const hasCreds = process.env.SMS_API_KEY && process.env.SMS_API_SECRET;

  if (!hasCreds) {
    console.log(`[sms:dev] to ${phone}: ${message}`);
    return { status: "sent" };
  }

  try {
    // TODO (Day 7): plug in real Twilio SDK call here.
    console.log(`[sms:prod-stub] to ${phone}: ${message}`);
    return { status: "sent" };
  } catch (err) {
    console.error("[sms] failed to send:", err.message);
    return { status: "failed" };
  }
}

module.exports = { sendSms };