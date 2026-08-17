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
- Service runs on port `8000`.

#### Example Request
```json
{
  "symptoms": ["fever", "cough"]
}
```
### EXAMPLE RESULT
```json
{
  "urgencyLevel": "medium",
  "suggestedDept": "General Medicine",
  "source": "rule_based"
}
```
### Testing
- Added automated tests in `tests/test_triage.py`.
- Current test suite contains 12 tests.
- All 12 tests are passing.

### Chunk 4 — Rule-Based Triage Hardening
- Duplicate symptoms do not increase urgency.
- Unknown symptoms are ignored instead of affecting urgency.
- Added handling for inputs containing only unknown symptoms.
- Added department-routing tests for chest pain and breathlessness.
- Tested the `/predict` endpoint through FastAPI Swagger.
- Verified that unknown symptom input returns a valid response.

### Validation
- Command: `python -m pytest`
- Result: `12 passed`

### Constraints Followed
- Database schema was not modified.
- API authentication was not modified.
- Existing API contracts were not changed.