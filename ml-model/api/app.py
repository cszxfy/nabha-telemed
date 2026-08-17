"""
FastAPI microservice exposing /predict for symptom triage.
"""
from fastapi import FastAPI
from pydantic import BaseModel
from rule_based.triage import triage

app = FastAPI()


class SymptomRequest(BaseModel):
    symptoms: list[str]


@app.post("/predict")
def predict(request: SymptomRequest):
    return triage(request.symptoms)