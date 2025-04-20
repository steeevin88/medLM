import json
import os
from typing import Optional, Dict, Tuple
from letta.tools.search_tool import search_tool

def identify_agent(context_json: Dict, result_json: Optional[Dict] = None) -> Dict:
    """
    Identify agent that processes patient data and returns the analysis results.
    
    Args:
        context_json: Patient context data as a dictionary
        result_json: Optional previous analysis results if this is a second round
        
    Returns:
        dict: Analysis results from the search tool
    """
    try:
        # If there's a previous result, this is a second attempt at analysis
        is_second_round = result_json is not None
        
        if is_second_round:
            print("Processing second round of analysis...")
            result = search_tool(context_json, result_json)
        else:
            print("Processing initial analysis...")
            result = search_tool(context_json)
        
        return result
        
    except Exception as e:
        error_message = f"Error in identify_agent: {str(e)}"
        print(error_message)
        return {
            "error": error_message,
            "current_hypothesis": ["Analysis failed due to an error"],
            "evidence": ["Error occurred during processing"],
            "potential_cause": ["System error", "Data format issue"],
            "reasoning_summary": "An error occurred while analyzing the patient data.",
            "stage_origin": "Identify",
            "confidence_level": "super low"
        }

def run_identify_agent(input_file: str = None, output_dir: str = None) -> Tuple[Dict, Dict]:
    """
    Run the identify agent with file input/output.
    
    Args:
        input_file: Path to input JSON file with patient context
        output_dir: Directory to save output files
        
    Returns:
        tuple: (context, result) containing the original context and analysis results
    """
    # Load context from file
    if input_file:
        try:
            with open(input_file, 'r') as f:
                context = json.load(f)
        except Exception as e:
            print(f"Error loading input file: {e}")
            return None, None
    else:
        print("No input file provided")
        return None, None
    
    # Run the identify agent
    result = identify_agent(context)
    
    # Save output if directory is specified
    if output_dir:
        try:
            # Create directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Save context and result files
            with open(os.path.join(output_dir, "context.json"), 'w') as f:
                json.dump(context, f, indent=2)
                
            with open(os.path.join(output_dir, "result.json"), 'w') as f:
                json.dump(result, f, indent=2)
                
            print(f"Results saved to {output_dir}")
        except Exception as e:
            print(f"Error saving output files: {e}")
    
    return context, result

if __name__ == "__main__":
    import sys
    
    # Parse command line arguments
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) >= 3 else "./output"
        
        context, result = run_identify_agent(input_file, output_dir)
        
        # Print result to stdout
        if result:
            print(json.dumps(result, indent=2))
    else:
        print("Usage: python -m letta.agents.identify_agent <input_json_file> [output_directory]")
