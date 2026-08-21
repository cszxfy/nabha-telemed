const Queue = require("../models/Queue");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Consultation = require("../models/Consultation");
const SymptomCheck = require("../models/SymptomCheck");
const { generateCallId } = require("../utils/callId");
const httpError = require("../utils/httpError");
const URGENCY_RANK = { high: 0, medium: 1, low: 2 };
const AVG_CONSULT_MINS = 8;
async function getSortedWaitingQueue() {
  const waiting = await Queue.find({ status: "waiting" });
  return waiting.sort((a, b) => {
    const rankDiff = (URGENCY_RANK[a.urgencyLevel] ?? 1) - (URGENCY_RANK[b.urgencyLevel] ?? 1);
    if (rankDiff !== 0) return rankDiff;
    return a.joinedAt - b.joinedAt;
  });
}

async function joinQueue(req, res, next) {
  try {
    const { patientId, symptomCheckId } = req.body;
    if (!patientId || !symptomCheckId) {
      throw httpError(400, "patientId and symptomCheckId are required");
    }
    const patient = await Patient.findById(patientId);
    if (!patient) throw httpError(404, "Patient not found");
    if (req.auth.userId !== String(patient.userId)) {
      throw httpError(403, "Cannot join the queue for another patient");
    }
    const symptomCheck = await SymptomCheck.findById(symptomCheckId);
    if (!symptomCheck) throw httpError(404, "Symptom check not found");

    const queueEntry = await Queue.create({
      patientId, symptomCheckId, status: "waiting",
      urgencyLevel: symptomCheck.urgencyLevel, joinedAt: new Date(),
    });

    const sorted = await getSortedWaitingQueue();
    const position = sorted.findIndex((q) => String(q._id) === String(queueEntry._id)) + 1;
    res.status(201).json({ queueId: queueEntry._id, position, estimatedWaitMins: position * AVG_CONSULT_MINS });
  } catch (err) { next(err); }
}
async function getQueueStatus(req, res, next) {
  try {
    const queueEntry = await Queue.findById(req.params.queueId);
    if (!queueEntry) throw httpError(404, "Queue entry not found");
    let position = 0;
    if (queueEntry.status === "waiting") {
      const sorted = await getSortedWaitingQueue();
      position = sorted.findIndex((q) => String(q._id) === String(queueEntry._id)) + 1;
    }
    res.status(200).json({ status: queueEntry.status, position });
  } catch (err) {
    if (err.name === "CastError") return next(httpError(404, "Queue entry not found"));
    next(err);
  }
}
async function getDoctorQueue(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) throw httpError(404, "Doctor not found");
    if (req.auth.userId !== String(doctor.userId)) {
      throw httpError(403, "Cannot view another doctor's queue");
    }
    const sorted = await getSortedWaitingQueue();
    const queue = await Promise.all(sorted.map(async (entry) => {
      const patient = await Patient.findById(entry.patientId);
      const user = patient ? await User.findById(patient.userId) : null;
      return { queueId: entry._id, patientName: user ? user.name : "Unknown", urgencyLevel: entry.urgencyLevel, waitingSince: entry.joinedAt };
    }));
    res.status(200).json({ queue });
  } catch (err) {
    if (err.name === "CastError") return next(httpError(404, "Doctor not found"));
    next(err);
  }
}
async function callNext(req, res, next) {
  try {
    const { doctorId } = req.body;
    if (!doctorId) throw httpError(400, "doctorId is required");
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw httpError(404, "Doctor not found");
    if (req.auth.userId !== String(doctor.userId)) {
      throw httpError(403, "Cannot call next on behalf of another doctor");
    }
    const sorted = await getSortedWaitingQueue();
    const next_ = sorted[0];
    if (!next_) return res.status(204).end();
    next_.doctorId = doctorId;
    next_.status = "in_call";
    next_.calledAt = new Date();
    await next_.save();
    const callId = generateCallId();
    await Consultation.create({ queueId: next_._id, patientId: next_.patientId, doctorId, startedAt: new Date(), callId });

    res.status(200).json({ queueId: next_._id, patientId: next_.patientId, callId });
  } catch (err) { next(err); }
}
module.exports = { joinQueue, getQueueStatus, getDoctorQueue, callNext };