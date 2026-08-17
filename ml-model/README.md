# ML Model — Symptom Triage

## Current Implementation

### Rule-Based Symptom Triage
- Implemented initial rule-based symptom triage.
- Supported symptoms are defined in `rule_based/triage.py`.
- Returns:
  - `urgencyLevel`
  - `suggestedDept`
  - `source`
- Red-flag combination:
  - `chest_pain + breathlessness` → `high` urgency and `Emergency`.
- Basic urgency logic:
  - 0–1 symptoms → low
  - 2 symptoms → medium
  - 3+ symptoms → high

### ML API
- Added FastAPI service in `api/app.py`.
- Internal endpoint:
  - `POST /predict`
- Request:
```json
{
  "symptoms": ["fever", "cough"]
}