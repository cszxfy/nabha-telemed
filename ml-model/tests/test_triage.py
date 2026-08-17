"""
Tests for the rule-based triage logic.
Run these with: python -m pytest
"""
from rule_based.triage import triage


def test_two_symptoms_returns_medium():
    result = triage(["fever", "cough"])
    assert result["urgencyLevel"] == "medium"
    assert result["suggestedDept"] == "General Medicine"
    assert result["source"] == "rule_based"


def test_single_symptom_returns_low():
    result = triage(["fever"])
    assert result["urgencyLevel"] == "low"


def test_three_or_more_symptoms_returns_high():
    result = triage(["fever", "cough", "fatigue"])
    assert result["urgencyLevel"] == "high"


def test_red_flag_combo_always_returns_high_emergency():
    result = triage(["chest_pain", "breathlessness"])
    assert result["urgencyLevel"] == "high"
    assert result["suggestedDept"] == "Emergency"


def test_red_flag_combo_wins_even_with_extra_symptoms():
    result = triage(["chest_pain", "breathlessness", "fatigue"])
    assert result["urgencyLevel"] == "high"
    assert result["suggestedDept"] == "Emergency"


def test_department_routing_for_stomach_symptoms():
    result = triage(["vomiting"])
    assert result["suggestedDept"] == "Gastroenterology"


def test_no_symptoms_returns_low_and_general_medicine():
    result = triage([])
    assert result["urgencyLevel"] == "low"
    assert result["suggestedDept"] == "General Medicine"

def test_duplicate_symptoms_do_not_increase_urgency():
    result = triage(["fever", "fever"])

    assert result["urgencyLevel"] == "low"
    assert result["suggestedDept"] == "General Medicine"

def test_unknown_symptoms_are_ignored():
    result = triage(["fever", "banana"])

    assert result["urgencyLevel"] == "low"
    assert result["suggestedDept"] == "General Medicine"
    assert result["source"] == "rule_based"

def test_only_unknown_symptoms_returns_low_and_general_medicine():
    result = triage(["banana", "pizza"])

    assert result["urgencyLevel"] == "low"
    assert result["suggestedDept"] == "General Medicine"
    assert result["source"] == "rule_based"

def test_department_routing_for_chest_pain():
    result = triage(["chest_pain"])
    assert result["suggestedDept"] == "Cardiology"


def test_department_routing_for_breathlessness():
    result = triage(["breathlessness"])
    assert result["suggestedDept"] == "Pulmonology"