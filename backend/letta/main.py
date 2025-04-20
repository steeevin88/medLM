from letta_client import Letta
import json

# Initialize client with API key
client = Letta(token="sk-let-ZmUxOGRhMDItYTk2MC00YWRiLWI5ODUtN2IzZjg2OGFmNGZhOjMwYmNjMWU1LTZjMDktNGE4MS1hOGY3LTU1MzM5ZjQxMzg1NA==")

# Patient data in JSON format
patient_data = {
    "basic_info": {
        "age": "54",
        "height": "165",
        "weight": "85",
        "sex": "male"
    },
    "question": "Lately I've been getting headaches, especially in the morning. Sometimes I feel pressure in my head and get lightheaded.",
    "goal": "Figure out what's causing these morning headaches.",
    "medical_history": {
        "past_events": [],
        "current_illnesses": ["hypertension"],
        "symptoms": ["headaches", "lightheadedness", "pressure in head"],
        "medications": ["lisinopril"],
        "allergies": [],
        "lifestyle_notes": ["sedentary lifestyle", "salt-heavy diet", "does not monitor BP regularly"]
    }
}

# Convert to string for API request
patient_json = json.dumps(patient_data)

try:
    # Hard-code the agent ID from your template
    agent_id = "agent-eab80451-3b3d-426c-bf64-1c71b01bddac"
    print(f"Using agent with ID: {agent_id}")
    
    # Simple message text
    message_text = f"Please analyze this patient data: {patient_json}"
    
    # Send a message using the simplest approach
    response = client.agents.messages.create(
        agent_id=agent_id,
        messages=[
            {"role": "user", "content": message_text}
        ]
    )
    
    # Print the raw response to debug
    print("\nRaw response:", response)
    
except Exception as e:
    print(f"Error occurred: {str(e)}")
