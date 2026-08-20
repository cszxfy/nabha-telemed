const User = require("../models/User");
const Patient = require("../models/Patient");
const httpError = require("../utils/httpError");

async function registerPatient(req, res, next) {
  try {
    const { userId, name, age, gender, village, language } = req.body;

    if (!userId || !name) {
      throw httpError(400, "userId and name are required");
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "patient") {
      throw httpError(404, "Patient user not found");
    }

    if (req.auth.userId !== String(user._id)) {
      throw httpError(403, "Cannot register a profile for another user");
    }

    user.name = name;
    if (language) user.language = language;
    await user.save();

    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      patient = new Patient({ userId: user._id });
    }
    if (age !== undefined) patient.age = age;
    if (gender !== undefined) patient.gender = gender;
    if (village !== undefined) patient.village = village;
    await patient.save();

    res.status(201).json({ patientId: patient._id });
  } catch (err) {
    next(err);
  }
}

async function getPatientById(req, res, next) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      throw httpError(404, "Patient not found");
    }
    const user = await User.findById(patient.userId);
    res.status(200).json({
      patientId: patient._id,
      name: user ? user.name : null,
      age: patient.age,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return next(httpError(404, "Patient not found"));
    }
    next(err);
  }
}

module.exports = { registerPatient, getPatientById };