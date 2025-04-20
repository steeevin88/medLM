from letta_client import Letta, MessageCreate, TextContent
import json
import datetime
import uuid
import time

client = Letta(
    token="sk-let-ZmUxOGRhMDItYTk2MC00YWRiLWI5ODUtN2IzZjg2OGFmNGZhOjMwYmNjMWU1LTZjMDktNGE4MS1hOGY3LTU1MzM5ZjQxMzg1NA=="
)


def confidence_agent(context_json=None, result_json=None) -> dict:
    
    # Start timer
    start_time = time.time()
    
    # Prepare data
    if not result_json or "confidence_level" not in result_json:
        return {"error": "No confidence level provided in result_json"}
    
    # Get the confidence level (capitalize the first letter)
    confidence_level = result_json["confidence_level"].title()
    
    try:
        # Create a simple message content with just the confidence level
        # The Letta API expects a string, not a complex object
        message_content = confidence_level
        print(message_content)
        
        # Time before API call
        before_api_call = time.time()
        print(f"Time before API call: {before_api_call - start_time:.3f} seconds")
        
        # Send the message to the Letta agent
        response = client.agents.messages.create(
            agent_id="agent-4fd4c952-ab70-47d6-a316-d68bce1fd75a",
            messages=[
                MessageCreate(
                    role="user",
                    content=[
                        TextContent(
                            text="CONFIDENCE LEVEL: " + message_content
                        )
                    ]
                )
            ]
        )
        
        # Time after API call
        after_api_call = time.time()
        print(f"API call duration: {after_api_call - before_api_call:.3f} seconds")
        
        # Build a response dictionary with the confidence level
        result = {
            "outputs": {
                "confidence_level": confidence_level.lower()
            },
            "request_heartbeat": False
        }
        
        # End timer
        end_time = time.time()
        print(f"Total execution time: {end_time - start_time:.3f} seconds")
        
        return result
        
    except Exception as e:
        # End timer on error
        error_time = time.time()
        print(f"Error occurred after {error_time - start_time:.3f} seconds")
        
        error_message = f"Error in confidence_agent: {str(e)}"
        print(error_message)
        
        # Return error in the expected format
        return {
            "error": error_message,
            "message_type": "system_message",
            "content": json.dumps({"type": "system_alert", "message": "Error", "time": datetime.datetime.utcnow().isoformat(timespec='milliseconds') + "Z"})
        }

if __name__ == "__main__":
    context_json = { 
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
    result_json = {
        "confidence_level": "high"
    }
    
    # Start overall timer
    overall_start = time.time()
    
    response = confidence_agent(context_json, result_json)
    
    # No need to parse, response is already a dictionary
    print(response["outputs"]["confidence_level"])
    
    # End overall timer
    overall_end = time.time()
    print(f"Total script execution time: {overall_end - overall_start:.3f} seconds")
