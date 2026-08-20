const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { registerPatient, getPatientById } = require("../controllers/patientController");

router.post("/register", auth, registerPatient);
router.get("/:id", auth, getPatientById);

module.exports = router;
