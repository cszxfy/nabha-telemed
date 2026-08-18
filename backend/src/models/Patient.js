const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: { type: Number },
  gender: { type: String },
  village: { type: String },
  medicalHistory: { type: [String], default: [] },
});
module.exports = mongoose.model("Patient", patientSchema);