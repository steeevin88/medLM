import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Agent types
type Agent = 'medical_consultant' | 'report_generator' | 'report_cleaner';

// State interface
interface GraphState {
  messages: { role: 'user' | 'assistant', content: string }[];
  patientContext?: string;
  currentAgent: Agent;
  finalResponse?: string;
  generatedReport?: string;
  requestReport: boolean;
}

/**
 * Medical Consultant Agent - Handles general medical discussion and recommendations
 */
async function medicalConsultantAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { messages, patientContext, requestReport } = state;

  // Skip if we're already requesting a report
  if (requestReport) {
    return { currentAgent: 'report_generator' };
  }

  // Configure the model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    }
  });

  // Create system prompt
  const systemPrompt = `You are MedLM, a medical AI assistant trained on healthcare data to help patients understand potential causes of their symptoms.

${patientContext ? `PATIENT CONTEXT (USE FOR ALL RESPONSES): ${patientContext}` : ''}

Follow this diagnostic workflow for medical concerns:
1. BUILD CONTEXT: Gather relevant medical history and symptoms
2. IDENTIFY SUSPECTS: Determine 3-5 potential causes based on symptoms and history
3. INVESTIGATE CAUSES: Assess each potential cause using medical knowledge
4. MAKE REASONABLE ASSUMPTIONS: When information is missing, make reasonable medical assumptions based on context rather than asking many questions
5. TRACK MISSING DATA: Note what tests or lab work that would help confirm diagnosis
6. ASSESS CONFIDENCE: Express confidence level for each potential cause
7. RECOMMEND NEXT STEPS: Suggest sensible actions based on your assessment

IMPORTANT GUIDANCE:
- Limit to 1-2 critical follow-up questions maximum per response
- Focus on providing valuable information rather than gathering excessive details
- Make informed medical assumptions when data is incomplete
- Be decisive in your assessments even with limited information
- If the information is extremely limited, still provide a useful response with general guidance
- Only ask follow-up questions if absolutely necessary to determine critical next steps

MARKDOWN FORMATTING INSTRUCTIONS:
- Structure your response with proper markdown headers and spacing:
  * Use ## for major sections (with a blank line before and after)
  * Use ### for subsections (with a blank line before and after)
- Format lists properly:
  * Leave a blank line before starting any list
  * Use bullet points with proper format: "- Item text" (with a space after the dash)
  * Put each list item on its own line
- Use proper paragraph spacing:
  * Leave a blank line between paragraphs
  * Leave a blank line after headers before starting text
- Use **bold** for important points or terms
- Ensure proper spacing throughout the document to improve readability

IMPORTANT: Only if the user has shared medical symptoms or concerns AND is asking about sending a report to a doctor, indicate that you're helping them create a medical report.`;

  // Format conversation history
  const chatHistory = messages.slice(0, -1)
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const lastUserMessage = messages[messages.length - 1].content;
  const isFirstMessage = messages.length === 1 && messages[0].role === 'user';

  let prompt;
  if (isFirstMessage) {
    prompt = `${systemPrompt}

This is the user's FIRST MESSAGE: ${lastUserMessage}

For first-time messages with symptoms or health concerns:
1. Start with a brief acknowledgment of their concern
2. Structure your response in clean markdown format with proper headers (## and ###)
3. Provide your assessment with 2-3 likely causes based on the limited information
4. Make reasonable medical assumptions rather than asking multiple questions
5. Ask at most ONE critical follow-up question if absolutely necessary
6. Provide actionable initial recommendations

YOUR RESPONSE:`;
  } else {
    prompt = `${systemPrompt}

CONVERSATION HISTORY:
${chatHistory}

USER'S LATEST MESSAGE: ${lastUserMessage}

Structure your response in clean markdown:
1. Acknowledge any new information provided
2. Update your assessment based on all information so far
3. Make informed medical assumptions about missing information rather than asking multiple questions
4. Ask at most ONE critical follow-up question if absolutely necessary
5. Provide clear next steps and recommendations
6. Use proper markdown formatting with headers and spacing

YOUR RESPONSE:`;
  }

  // Call the model
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Check if the user is requesting a report
  const isReportRequest =
    lastUserMessage.toLowerCase().includes('report') &&
    (lastUserMessage.toLowerCase().includes('doctor') ||
     lastUserMessage.toLowerCase().includes('send') ||
     lastUserMessage.toLowerCase().includes('create report') ||
     lastUserMessage.toLowerCase().includes('generate report'));

  // Next agent determination
  let nextAgent: Agent = 'medical_consultant';
  if (isReportRequest) {
    nextAgent = 'report_generator';
  }

  return {
    finalResponse: responseText,
    currentAgent: nextAgent,
    requestReport: isReportRequest
  };
}

/**
 * Report Generator Agent - Creates structured medical reports
 */
async function reportGeneratorAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { messages, patientContext } = state;

  // Configure the model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.2, // Lower temperature for more structured output
      maxOutputTokens: 2048,
    }
  });

  // Create system prompt for report generation
  const systemPrompt = `You are MedLM, a medical AI assistant trained on healthcare data, generating a clinical report for a doctor.

${patientContext ? `PATIENT DATA: ${patientContext}` : ''}

Create a concise medical report that follows this clinical workflow:
1. "## Medical Report" - Start with this heading
2. "### Patient Information" - Summarize relevant patient data
3. "### Chief Complaint" - Clearly state the main health concern
4. "### Suspected Causes" - List the most likely diagnoses in order of probability
5. "### Supporting Evidence" - List key symptoms and findings that support these diagnoses
6. "### Missing Information" - Note what lab work, tests or additional patient information would help confirm diagnosis
7. "### MedLM Recommendations" - Suggest next clinical steps

FORMAT RULES:
- Use clean, professional markdown formatting
- Be concise and clinically focused
- Include only objective medical information
- Omit disclaimers, copy instructions, or meta-commentary
- Do not say "AI assessment" or include any references to AI
- Do not include confidence scoring numbers (1-5, etc.)
- DO NOT include a question at the end asking if they want a report prepared
- DO NOT include any conversational elements in the report`;

  // Format conversation history
  const chatHistory = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const prompt = `${systemPrompt}

CONVERSATION HISTORY:
${chatHistory}

Generate a comprehensive medical report based on the conversation above. The report will be sent to a medical professional.`;

  // Call the model
  const result = await model.generateContent(prompt);
  const reportText = result.response.text();

  // Move to the report cleaner
  return {
    generatedReport: reportText,
    currentAgent: 'report_cleaner'
  };
}

/**
 * Report Cleaner Agent - Removes AI artifacts and cleans up the report
 */
async function reportCleanerAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { generatedReport } = state;

  if (!generatedReport) {
    return {
      finalResponse: "I apologize, but I couldn't generate a proper report. Please try again.",
      currentAgent: 'medical_consultant'
    };
  }

  // Configure the model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.1, // Very low temperature for consistent cleaning
      maxOutputTokens: 2048,
    }
  });

  const cleaningPrompt = `You are a medical document formatter. You're given a medical report that may contain AI conversational elements, questions, or meta-commentary. Your job is to clean it up and return ONLY the professional medical report content.

RULES:
1. Remove any AI-like phrases such as "I've prepared", "I've created", "Based on our conversation", etc.
2. Remove any questions to the user like "Would you like me to...", "Is there anything else..."
3. Remove any instructions about how to use the report
4. Make sure all markdown formatting is correct with proper spacing
5. Start the report with "## Medical Report" or keep the existing title if it's already there
6. Return ONLY the cleaned report content, nothing else

MEDICAL REPORT TO CLEAN:
${generatedReport}

CLEANED REPORT:`;

  // Call the model to clean the report
  const result = await model.generateContent(cleaningPrompt);
  const cleanedReport = result.response.text();

  // Final response back to user with the cleaned report
  const finalResponse = `I've prepared a medical report based on our conversation:

${cleanedReport}

You can send this report to your doctor using the "Send to Doctor" button.`;

  return {
    finalResponse,
    currentAgent: 'medical_consultant'
  };
}

/**
 * The main agent router function that determines which agent to call next
 */
export async function processWithLangGraph(
  messages: { role: 'user' | 'assistant', content: string }[],
  patientContext?: string
): Promise<string> {
  // Initialize the state
  let state: GraphState = {
    messages,
    patientContext,
    currentAgent: 'medical_consultant',
    requestReport: false
  };

  // Simple state machine implementation
  while (true) {
    let updates: Partial<GraphState> = {};

    // Route to the appropriate agent
    switch (state.currentAgent) {
      case 'medical_consultant':
        updates = await medicalConsultantAgent(state);
        break;
      case 'report_generator':
        updates = await reportGeneratorAgent(state);
        break;
      case 'report_cleaner':
        updates = await reportCleanerAgent(state);
        break;
    }

    // Update state
    state = { ...state, ...updates };

    // Check if we have a final response
    if (state.finalResponse && state.currentAgent === 'medical_consultant') {
      return state.finalResponse;
    }
  }
}
