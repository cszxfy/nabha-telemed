const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", required: true },
  medicines: { type: [medicineSchema], default: [] },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);