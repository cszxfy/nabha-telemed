const mongoose = require("mongoose");
const consultationSchema = new mongoose.Schema({
  queueId: { type: mongoose.Schema.Types.ObjectId, ref: "Queue", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  callId: { type: String, required: true },
});
module.exports = mongoose.model("Consultation", consultationSchema);