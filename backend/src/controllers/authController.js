const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { signToken } = require("../utils/jwt");
const { isValidPhone } = require("../utils/validators");
const otpStore = require("../utils/otpStore");
const { sendSms } = require("../services/sms");
const httpError = require("../utils/httpError");

async function requestPatientOtp(req, res, next) {
  try {
    const { phone } = req.body;
    if (!isValidPhone(phone)) {
      throw httpError(400, "Invalid phone number");
    }
    const otp = otpStore.generate(phone);
    await sendSms(phone, `Your Nabha Telemed OTP is ${otp}. Valid for 5 minutes.`);
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
}

async function verifyPatientOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    if (!isValidPhone(phone) || !otp) {
      throw httpError(400, "Invalid phone number");
    }
    const isValid = otpStore.verify(phone, otp);
    if (!isValid) {
      throw httpError(401, "Invalid OTP");
    }

    let user = await User.findOne({ phone, role: "patient" });
    let isNewUser = false;
    if (!user) {
      user = await User.create({ phone, role: "patient" });
      isNewUser = true;
    }

    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      patient = await Patient.create({ userId: user._id });
      isNewUser = true;
    }

    const token = signToken({ userId: user._id, role: "patient" });
    res.status(200).json({ token, patientId: patient._id, isNewUser });
  } catch (err) {
    next(err);
  }
}

async function doctorLogin(req, res, next) {
  try {
    const { phone, password } = req.body;
    if (!isValidPhone(phone) || !password) {
      throw httpError(401, "Invalid credentials");
    }
    const user = await User.findOne({ phone, role: "doctor" });
    if (!user || !user.passwordHash) {
      throw httpError(401, "Invalid credentials");
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw httpError(401, "Invalid credentials");
    }
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      throw httpError(500, "Doctor profile not found for this account");
    }
    const token = signToken({ userId: user._id, role: "doctor" });
    res.status(200).json({ token, doctorId: doctor._id });
  } catch (err) {
    next(err);
  }
}

module.exports = { requestPatientOtp, verifyPatientOtp, doctorLogin };