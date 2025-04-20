import { NextRequest, NextResponse } from 'next/server';
import { getPatientByUserId } from '@/actions/user';
import { processWithLangGraph } from './langgraph';

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json();

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

    // Process with our LangGraph implementation
    const response = await processWithLangGraph(messages, patientContext);

    // Return the response
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with AI provider' },
      { status: 500 }
    );
  }
}
