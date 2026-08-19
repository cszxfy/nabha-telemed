const express = require("express");
const router = express.Router();
const { requestPatientOtp, verifyPatientOtp, doctorLogin } = require("../controllers/authController");
router.post("/patient/otp-request", requestPatientOtp);
router.post("/patient/otp-verify", verifyPatientOtp);
router.post("/doctor/login", doctorLogin);

module.exports = router;