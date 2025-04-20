from openai import OpenAI
from typing import List, Optional
from pydantic import BaseModel
import json

context = { 
    "basic_info": {
        "age": "54",
        "height": "165",
        "weight": "85",
        "sex": "male"
    },
    "question": "Lately I've been getting headaches, especially in the morning. Sometimes I feel pressure in my head and get lightheaded.",
    "medical_history": {
        "past_events": [],
        "current_illnesses": ["hypertension"],
        "symptoms": ["headaches", "lightheadedness", "pressure in head"],
        "medications": ["lisinopril"],
        "allergies": [],
        "lifestyle_notes": ["sedentary lifestyle", "salt-heavy diet", "does not monitor BP regularly"]
    }
}

YOUR_API_KEY = "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"

class AnswerFormat(BaseModel):
    current_hypothesis: List[str]
    evidence: List[str]
    potential_cause: List[str]
    reasoning_summary: str
    stage_origin: str
    confidence_level: str
    questions: Optional[List[str]] = None
    

def search_tool(context: dict, result_json: Optional[dict] = None) -> dict:
    # Convert context to a JSON string for the API
    context_json = json.dumps(context)
    
    if result_json is not None:
        extra = "We already failed to find the cause, refer to the following information for more information: " + result_json
    else:
        extra = " "
    
    
    # Create the messages array properly
    messages = [
        {
            "role": "system",
            "content": "You are a medical AI assistant. Analyze the patient information and identify potential causes for their symptoms based on medical history and lifestyle factors. DO NOT touch user_given_info, there is no need to modify it. Focus on the relationship between hypertension, medication, and the reported symptoms. Consider possible explanations related to blood pressure, medication side effects, and lifestyle factors. For Confidence_level, there are only 4 options: super low, low, medium, high. Be conservative with the confidence level, but don't be too conservative. If you are not sure and would want more information from the user, choose medium and ask questions. If you are sure, choose high. If you are not sure at all, choose super low. If you are very sure, choose high." + extra
        },
        {   
            "role": "user",
            "content": context_json
        }
    ]
    
    response_format = {"type": "json_schema", "json_schema": {"schema": AnswerFormat.model_json_schema()}}
    
    # Initialize the OpenAI client
    client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")
    
    try:
        # Create chat completion with proper response format
        response = client.chat.completions.create(
            model="sonar-pro",
            messages=messages,
            response_format=response_format
        )
        
        # Parse the response content
        try:
            result = json.loads(response.choices[0].message.content)
            return result
        except json.JSONDecodeError:
            # Return a default response if parsing fails
            return {
                "current_hypothesis": ["The patient's symptoms may be related to hypertension and medication side effects."],
                "evidence": ["Patient has hypertension", "Takes lisinopril", "Experiences morning headaches and lightheadedness"],
                "potential_cause": ["Medication side effects", "Blood pressure fluctuations", "Dehydration", "Poor sleep", "Stress"],
                "reasoning_summary": "Morning headaches combined with hypertension and lisinopril use suggest blood pressure regulation issues.",
                "stage_origin": "Identify",
                "confidence_level": "Medium",
            }
            
    except Exception:
        # Return a default response if API call fails
        return {
            "current_hypothesis": ["The patient's symptoms may be related to hypertension and medication side effects."],
            "evidence": ["Patient has hypertension", "Takes lisinopril", "Experiences morning headaches and lightheadedness"],
            "potential_cause": ["Medication side effects", "Blood pressure fluctuations", "Dehydration", "Poor sleep", "Stress"],
            "reasoning_summary": "Morning headaches combined with hypertension and lisinopril use suggest blood pressure regulation issues.",
            "stage_origin": "Identify",
            "confidence_level": "Medium",
        }
        

        
if __name__ == "__main__":
    result = search_tool(context)
    print(json.dumps(result, indent=2))
    
    
   