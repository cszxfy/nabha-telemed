"""
Flask/FastAPI microservice exposing /predict for symptom triage.
"""
from fastapi import FastAPI

app = FastAPI()

@app.get("/predict")
def predict():
    return {"result": "not implemented"}
