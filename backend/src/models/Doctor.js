const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialization: { type: String },
  availability: { type: Boolean, default: true },
  licenseNumber: { type: String },
});

module.exports = mongoose.model("Doctor", doctorSchema);