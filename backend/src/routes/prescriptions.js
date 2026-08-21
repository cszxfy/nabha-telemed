const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Prescription = require("../models/Prescription");

// Patient views their prescriptions
router.get("/", auth, async (req, res, next) => {
  try {
    // Find prescriptions for the logged-in patient
    const prescriptions = await Prescription.find({ patient: req.auth.userId });
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// Doctor creates a prescription
router.post("/", auth, async (req, res, next) => {
  try {
    if (req.auth.role !== "doctor") {
      return res.status(403).json({ error: "Only doctors can create prescriptions" });
    }

    const { consultationId, patientId, medicines, notes } = req.body;

    const prescription = new Prescription({
      doctor: req.auth.userId,   // doctor comes from JWT
      patient: patientId,        // patient passed in request body
      consultationId,
      medicines,
      notes
    });

    await prescription.save();
    res.status(201).json({ message: "Prescription created successfully", prescription });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
