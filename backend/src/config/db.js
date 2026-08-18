// Connects to MongoDB using the MONGO_URL env var.
// Called once from server.js on boot.
const mongoose = require("mongoose");
async function connectDB() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL is not set. Check your .env file.");
  }
  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });
  await mongoose.connect(uri);
}
module.exports = connectDB;