const mongoose = require("mongoose");
const queueSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
  symptomCheckId: { type: mongoose.Schema.Types.ObjectId, ref: "SymptomCheck", required: true },
  status: {
    type: String,
    enum: ["waiting", "in_call", "completed", "cancelled"],
    default: "waiting",
  },
  urgencyLevel: { type: String },
  joinedAt: { type: Date, default: Date.now },
  calledAt: { type: Date, default: null },
});

module.exports = mongoose.model("Queue", queueSchema);