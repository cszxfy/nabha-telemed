const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["patient", "doctor"], required: true },
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  passwordHash: { type: String }, // doctors only
  language: { type: String, enum: ["pa", "hi", "en"], default: "en" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);