const User = require("../models/User");

// Patient Registration
exports.registerPatient = async (req, res) => {
  try {
    const { phone, name, language } = req.body;

    // Create a new patient user
    const user = new User({
      role: "patient",
      phone,
      name,
      language
    });

    await user.save();
    res.status(201).json({ message: "Patient registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const bcrypt = require("bcrypt");

// Doctor Registration
exports.registerDoctor = async (req, res) => {
  try {
    const { phone, name, password, language } = req.body;

    // Hash the password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      role: "doctor",
      phone,
      name,
      passwordHash,
      language
    });

    await user.save();
    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const jwt = require("jsonwebtoken");

// Login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // If doctor, check password
    if (user.role === "doctor") {
      const bcrypt = require("bcrypt");
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
