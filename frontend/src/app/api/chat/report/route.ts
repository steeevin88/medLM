import { NextRequest, NextResponse } from 'next/server';
import { getPatientByUserId } from '@/actions/user';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, cleanReport } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Get patient context from database if userId is provided
    let patientContext = '';
    if (userId) {
      const { patient, error } = await getPatientByUserId(userId);
      if (patient) {
        patientContext = `
Patient Information:
- Age: ${patient.age}
- Gender: ${patient.sex ? 'Male' : 'Female'}
- Height: ${patient.height}cm
- Weight: ${patient.weight}kg
- Activity Level: ${patient.activityLevel}
- Allergies: ${patient.allergies?.length ? patient.allergies.join(', ') : 'None'}
- Medications: ${patient.medications?.length ? patient.medications.join(', ') : 'None'}
- Health Issues: ${patient.healthIssues?.length ? patient.healthIssues.join(', ') : 'None'}
- Diet: ${patient.diet?.length ? patient.diet.join(', ') : 'None'}
${patient.additionalInfo ? `- Additional Information: ${patient.additionalInfo}` : ''}
${patient.heartRate ? `- Heart Rate: ${patient.heartRate}` : ''}
${patient.bloodPressure ? `- Blood Pressure: ${patient.bloodPressure}` : ''}
`;
      } else if (error) {
        console.error('Error fetching patient data:', error);
      }
    }

    // First, generate a comprehensive report
    const reportModel = genAI.getGenerativeModel({
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
    const reportPrompt = `You are MedLM, a medical AI assistant trained on healthcare data, now in REPORT GENERATION MODE to create a clinical report for a doctor.

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

    const prompt = `${reportPrompt}

CONVERSATION HISTORY:
${chatHistory}

You are now in REPORT GENERATION MODE. Create a comprehensive, professional medical report based on the conversation above. The report will be sent to a medical professional.

IMPORTANT: This is a formal medical document, not a conversational response. Format it professionally.`;

    // Call the model to generate the report
    const reportResult = await reportModel.generateContent(prompt);
    const generatedReport = reportResult.response.text();

    // Now, clean the report with the report cleaner
    const cleanerModel = genAI.getGenerativeModel({
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
7. DO NOT add any introductory text or explanations, just the pure report

MEDICAL REPORT TO CLEAN:
${generatedReport}

CLEANED REPORT:`;

    // Call the model to clean the report
    const cleanResult = await cleanerModel.generateContent(cleaningPrompt);
    const cleanedReport = cleanResult.response.text();

    // Return just the clean report
    return NextResponse.json({ report: cleanedReport });
  } catch (error) {
    console.error('Error in report generation API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate medical report' },
      { status: 500 }
    );
  }
}
