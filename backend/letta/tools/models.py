from pydantic import BaseModel, Field
from typing import List, Optional, Union, Any


class BasicInfo(BaseModel):
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    sex: Optional[str] = None  # "male", "female", "other"


class MedicalHistory(BaseModel):
    past_events: List[str] = Field(default_factory=list)  # e.g., surgeries, previous diagnoses
    current_illnesses: List[str] = Field(default_factory=list)  # chronic or active known conditions
    symptoms: List[str] = Field(default_factory=list)  # user-reported symptoms
    medications: List[str] = Field(default_factory=list)  # currently taken meds
    allergies: List[str] = Field(default_factory=list)  # known allergies
    lifestyle_notes: List[str] = Field(default_factory=list)  # includes diet, physical activity, smoking, etc.


class PatientContext(BaseModel):
    basic_info: BasicInfo
    question: str = ""  # The user's main concern or initial message
    medical_history: MedicalHistory


# Result model
class ResultData(BaseModel):
    current_hypothesis: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    potential_cause: Optional[str] = None
    reasoning_summary: str = ""
    stage_origin: str = ""
    confidence_score: Optional[float] = None
    confidence_level: str = ""
    user_given_info: str = ""


# Message and Response models for API interactions
class MessageContent(BaseModel):
    content: ResultData
    prompt: str


class ResultResponse(BaseModel):
    agent_id: str
    messages: List[MessageContent] = Field(default_factory=list)
    result: Optional[ResultData] = None


