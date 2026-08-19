require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Doctor = require("../src/models/Doctor");

async function main() {
  const [phone, password, name] = process.argv.slice(2);
  if (!phone || !password) {
    console.error("Usage: node scripts/seedDoctor.js <phone> <password> [name]");
    process.exit(1);
  }
  await connectDB();
  const existing = await User.findOne({ phone, role: "doctor" });
  if (existing) {
    console.error(`A doctor with phone ${phone} already exists.`);
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ phone, role: "doctor", name: name || "Test Doctor", passwordHash });
  const doctor = await Doctor.create({ userId: user._id, availability: true });
  console.log("Doctor created:");
  console.log({ phone, doctorId: doctor._id.toString(), userId: user._id.toString() });
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });