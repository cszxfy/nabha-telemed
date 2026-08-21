const VALID_SYMPTOMS = ["fever","cough","chest_pain","breathlessness","fatigue","sore_throat","headache","body_ache","vomiting","diarrhea"];
const RED_FLAG_COMBOS = [["chest_pain", "breathlessness"]];
const DEPARTMENT_MAP = { chest_pain: "Cardiology", breathlessness: "Pulmonology", vomiting: "Gastroenterology", diarrhea: "Gastroenterology" };

function ruleBasedTriage(symptoms) {
  const symptomSet = new Set(symptoms.filter((s) => VALID_SYMPTOMS.includes(s)));
  for (const combo of RED_FLAG_COMBOS) {
    if (combo.every((s) => symptomSet.has(s))) {
      return { urgencyLevel: "high", suggestedDept: "Emergency", source: "rule_based" };
    }
  }
  let urgencyLevel;
  if (symptomSet.size >= 3) urgencyLevel = "high";
  else if (symptomSet.size === 2) urgencyLevel = "medium";
  else urgencyLevel = "low";
  let suggestedDept = "General Medicine";
  for (const symptom of symptoms) {
    if (DEPARTMENT_MAP[symptom]) { suggestedDept = DEPARTMENT_MAP[symptom]; break; }
  }
  return { urgencyLevel, suggestedDept, source: "rule_based" };
}
module.exports = { ruleBasedTriage, VALID_SYMPTOMS };