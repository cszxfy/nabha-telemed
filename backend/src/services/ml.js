const axios = require("axios");
async function predictTriage(symptoms) {
  const url = `${process.env.ML_SERVICE_URL}/predict`;
  const timeout = Number(process.env.ML_SERVICE_TIMEOUT_MS) || 3000;
  const response = await axios.post(url, { symptoms }, { timeout });
  const { urgencyLevel, suggestedDept, source } = response.data;
  if (!urgencyLevel || !suggestedDept) {
    throw new Error("ML service returned an incomplete response");
  }
  return { urgencyLevel, suggestedDept, source: source || "ml_model" };
}
module.exports = { predictTriage };