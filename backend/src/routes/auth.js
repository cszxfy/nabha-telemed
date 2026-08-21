const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Patient registration
router.post("/register/patient", authController.registerPatient);

// Doctor registration
router.post("/register/doctor", authController.registerDoctor);

// Login
router.post("/login", authController.login);

module.exports = router;
