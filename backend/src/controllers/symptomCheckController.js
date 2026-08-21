const SymptomCheck = require("../models/SymptomCheck");
const { predictTriage } = require("../services/ml");
const { ruleBasedTriage } = require("../utils/ruleBasedTriage");
const httpError = require("../utils/httpError");

async function checkSymptoms(req, res, next) {
  try {
    const { patientId, symptoms } = req.body;
    if (!patientId || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw httpError(400, "symptoms array required");
    }

    let result;
    try {
      result = await predictTriage(symptoms);
    } catch (mlErr) {
      console.warn(`[symptom-check] ML service unavailable, using rule-based fallback: ${mlErr.message}`);
      result = ruleBasedTriage(symptoms);
    }

    const record = await SymptomCheck.create({
      patientId,
      symptoms,
      urgencyLevel: result.urgencyLevel,
      suggestedDept: result.suggestedDept,
      source: result.source,
    });

    res.status(200).json({
      urgencyLevel: record.urgencyLevel,
      suggestedDept: record.suggestedDept,
      symptomCheckId: record._id,
    });
  } catch (err) {
    next(err);
  }
}
module.exports = { checkSymptoms };