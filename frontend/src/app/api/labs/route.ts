import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient, LabTestStatus, ActivityLevel, Allergy, Medication, HealthIssue, Diet } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch lab tests for the current user
export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get query parameters
    const status = url.searchParams.get('status');
    const showAnonymous = url.searchParams.get('anonymous') === 'true';
    
    // Find if the current user is a patient
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    if (!patient) {
      return NextResponse.json({ error: 'Only patients can view lab tests' }, { status: 403 });
    }
    
    // Get lab tests for the patient
    const labTests = await prisma.labTest.findMany({
      where: {
        patientId: userId,
        ...(status ? { status: status as LabTestStatus } : {}),
        ...(showAnonymous ? {} : { isAnonymous: false }),
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });
    
    return NextResponse.json({ labTests });
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Schedule a new lab test
export async function POST(request: Request) {
  const { userId } = await auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      testName, 
      date, 
      time, 
      location, 
      address, 
      reason, 
      orderedBy,
      isAnonymous 
    } = await request.json();
    
    // Validate required fields
    if (!testName || !date || !time || !location || !orderedBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: testName, date, time, location, orderedBy are all required' 
      }, { status: 400 });
    }
    
    // Find or Create Patient
    let patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    if (!patient) {
      console.log(`Patient record not found for userId: ${userId}. Creating one with default values.`);
      try {
        patient = await prisma.patient.create({
          data: {
            id: userId, // Use Clerk userId as Patient ID
            // Provide default/placeholder values for required fields
            sex: false, // Default placeholder
            age: 0,     // Default placeholder
            height: 0,  // Default placeholder
            weight: 0,  // Default placeholder
            activityLevel: ActivityLevel.LOW, // Default placeholder
            allergies: [],
            medications: [],
            healthIssues: [],
            diet: [],
            // Optional fields are omitted (firstName, lastName, email, etc.)
          }
        });
        console.log(`Created new Patient record for userId: ${userId}`);
      } catch (createError) {
        console.error('Error creating placeholder Patient record:', createError);
        return NextResponse.json({ error: 'Failed to initialize patient profile. Please try again later.' }, { status: 500 });
      }
    }
    
    // Create obfuscated user if anonymous
    let obfuscatedUserId = null;
    
    if (isAnonymous) {
      // Check if this patient already has an obfuscated user
      const existingObfuscatedUser = await prisma.obfuscatedUser.findFirst({
        where: { userId: patient.id },
      });
      
      if (existingObfuscatedUser) {
        obfuscatedUserId = existingObfuscatedUser.id;
      } else {
        // Ensure all required fields from patient exist before creating obfuscated user
        if (patient.age === null || patient.sex === null || patient.activityLevel === null) {
           console.error('Cannot create obfuscated user due to missing required fields on patient record:', patient.id);
           // Decide how to handle this - maybe prevent anonymous scheduling?
           // For now, let's prevent anonymous scheduling if base patient data is incomplete
           // (This scenario should only happen if someone manually deleted fields from the placeholder)
            return NextResponse.json({ error: 'Patient profile incomplete, cannot schedule anonymously.' }, { status: 400 });
        }
        const newObfuscatedUser = await prisma.obfuscatedUser.create({
          data: {
            userId: patient.id,
            age: patient.age,
            sex: patient.sex,
            activityLevel: patient.activityLevel,
            allergies: patient.allergies,
            healthIssues: patient.healthIssues,
            diet: patient.diet,
          },
        });
        
        obfuscatedUserId = newObfuscatedUser.id;
      }
    }
    
    // Create the lab test
    const labTest = await prisma.labTest.create({
      data: {
        testName,
        date: new Date(date),
        time,
        location,
        address,
        reason,
        orderedBy,
        status: LabTestStatus.SCHEDULED,
        isAnonymous: !!isAnonymous,
        patient: { connect: { id: patient.id } },
        ...(obfuscatedUserId ? { obfuscatedUser: { connect: { id: obfuscatedUserId } } } : {}),
      },
    });
    
    return NextResponse.json({ labTest });
  } catch (error) {
    console.error('Error scheduling lab test:', error);
    return NextResponse.json({ error: 'An internal server error occurred while scheduling the lab test.' }, { status: 500 });
  }
}

// PATCH - Update a lab test (cancel, complete, add results)
export async function PATCH(request: Request) {
  const { userId } = await auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, results } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Lab test ID is required' }, { status: 400 });
    }
    
    // Find the lab test
    const labTest = await prisma.labTest.findUnique({
      where: { id },
    });
    
    if (!labTest) {
      return NextResponse.json({ error: 'Lab test not found' }, { status: 404 });
    }
    
    // Find if the current user is a patient
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    // Verify the user has access to this lab test
    if (patient && labTest.patientId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status as LabTestStatus;
    }
    
    if (results) {
      updateData.results = results;
      // If results are being added, automatically set status to RESULTS_READY
      updateData.status = LabTestStatus.RESULTS_READY;
    }
    
    // Update the lab test
    const updatedLabTest = await prisma.labTest.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({ labTest: updatedLabTest });
  } catch (error) {
    console.error('Error updating lab test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 