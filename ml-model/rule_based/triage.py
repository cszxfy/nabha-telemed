"""
Day 1-5 fallback: simple rule-based / keyword-map symptom triage.
"""

# The only symptom names our system understands right now.
# Frontend checkboxes must use these exact same words.
VALID_SYMPTOMS = [
    "fever",
    "cough",
    "chest_pain",
    "breathlessness",
    "fatigue",
    "sore_throat",
    "headache",
    "body_ache",
    "vomiting",
    "diarrhea",
]

# Combos that are always dangerous, no matter what else is going on.
RED_FLAG_COMBOS = [
    {"chest_pain", "breathlessness"},
]

# Which department to suggest, based on the symptom.
DEPARTMENT_MAP = {
    "chest_pain": "Cardiology",
    "breathlessness": "Pulmonology",
    "vomiting": "Gastroenterology",
    "diarrhea": "Gastroenterology",
}


def triage(symptoms: list[str]) -> dict:
    symptom_set = set(symptoms)

    # Check dangerous combos first — these always win, no matter what.
    for combo in RED_FLAG_COMBOS:
        if combo.issubset(symptom_set):
            return {
                "urgencyLevel": "high",
                "suggestedDept": "Emergency",
                "source": "rule_based",
            }

    # More symptoms present = more urgent, roughly.
    if len(symptom_set) >= 3:
        urgency = "high"
    elif len(symptom_set) == 2:
        urgency = "medium"
    else:
        urgency = "low"

    # Pick a department from the first symptom that matches our map.
    dept = "General Medicine"
    for symptom in symptoms:
        if symptom in DEPARTMENT_MAP:
            dept = DEPARTMENT_MAP[symptom]
            break

    return {
        "urgencyLevel": urgency,
        "suggestedDept": dept,
        "source": "rule_based",
    }
