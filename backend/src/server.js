 require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const doctorRoutes = require("./routes/doctors");
const symptomCheckRoutes = require("./routes/symptomCheck");
const queueRoutes = require("./routes/queue");
const callRoutes = require("./routes/call");
const prescriptionRoutes = require("./routes/prescriptions");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

const base = "/api/v1";
app.use(`${base}/auth`, authRoutes);
app.use(`${base}/patients`, patientRoutes);
app.use(`${base}/doctors`, doctorRoutes);
app.use(`${base}/symptom-check`, symptomCheckRoutes);
app.use(`${base}/queue`, queueRoutes);
app.use(`${base}/call`, callRoutes);
app.use(`${base}/prescriptions`, prescriptionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();

module.exports = app;