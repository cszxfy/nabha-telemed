const mongoose = require("mongoose");

const smsLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  type: { type: String, enum: ["queue_update", "confirmation", "reminder"], required: true },
  status: { type: String, enum: ["sent", "failed"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SmsLog", smsLogSchema);