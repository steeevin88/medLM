# MedLM - Medical Analysis Pipeline

MedLM is a medical analysis system that uses advanced language models to analyze patient data and provide diagnostic insights.

## System Components

1. **Identify Agent** - Analyzes patient data to identify potential causes for symptoms
2. **Confidence Agent** - Evaluates the confidence level of the analysis

## How to Use

### Running the Complete Pipeline

The simplest way to use MedLM is to run the complete pipeline:

```bash
python -m letta.run_pipeline <input_file> -o <output_directory>
```

This will:

1. Process patient data with the identify agent
2. Run a second round of analysis if confidence is low
3. Pass the results to the confidence agent
4. Save all results to the specified output directory

### Running Individual Agents

You can also run the agents individually:

#### Identify Agent

```bash
python -m letta.agents.identify_agent <input_file> <output_directory>
```

#### Confidence Agent

The confidence agent is typically called with the results from the identify agent, but you can test it directly:

```bash
python -m letta.agents.confidence_agent
```

## Input Format

The system expects a JSON file with the following structure:

```json
{
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
    "lifestyle_notes": [
      "sedentary lifestyle",
      "salt-heavy diet",
      "does not monitor BP regularly"
    ]
  }
}
```

## Output Format

The system produces several JSON files:

- `context.json` - The original input data
- `identify_result.json` - The analysis results from the identify agent
- `confidence_result.json` - The evaluation from the confidence agent
- `pipeline_result.json` - The complete results including all of the above

## Example Output

The identify agent produces results in this format:

```json
{
  "current_hypothesis": [
    "The patient's symptoms may be related to hypertension and medication side effects."
  ],
  "evidence": [
    "Patient has hypertension",
    "Takes lisinopril",
    "Experiences morning headaches and lightheadedness"
  ],
  "potential_cause": [
    "Medication side effects",
    "Blood pressure fluctuations",
    "Dehydration",
    "Poor sleep",
    "Stress"
  ],
  "reasoning_summary": "Morning headaches combined with hypertension and lisinopril use suggest blood pressure regulation issues.",
  "stage_origin": "Identify",
  "confidence_level": "Medium"
}
```

The confidence agent produces a system message with the confidence assessment.
