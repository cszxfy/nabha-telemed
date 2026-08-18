const mongoose = require("mongoose");
const symptomCheckSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  symptoms: { type: [String], required: true },
  urgencyLevel: { type: String, enum: ["low", "medium", "high"], required: true },
  suggestedDept: { type: String, required: true },
  source: { type: String, enum: ["rule_based", "ml_model"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SymptomCheck", symptomCheckSchema);