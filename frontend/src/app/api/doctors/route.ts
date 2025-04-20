import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch available doctors
export async function GET(request: Request) {
  const { userId } = await auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find doctors
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        location: true,
      },
    });
    
    // If no doctors found, create a sample doctor for development
    if (doctors.length === 0) {
      console.log("[DEBUG] No doctors found, creating a sample doctor for development");
      
      try {
        // Create a sample doctor
        const sampleDoctor = await prisma.doctor.create({
          data: {
            id: "sample-doctor-id", // This ID will be recognizable for debugging
            firstName: "John",
            lastName: "Smith",
            sex: true, // Required field
            age: 45,  // Required field
            location: "Medical Center", // Required field
            fieldOfStudy: "Medicine", // Required field
            specialization: "Cardiology",
            yearsExperience: 15,
            hospital: "City Hospital",
          }
        });
        
        console.log("[DEBUG] Created sample doctor:", sampleDoctor);
        return NextResponse.json({ doctors: [sampleDoctor] });
      } catch (error) {
        console.error("[DEBUG] Error creating sample doctor:", error);
        return NextResponse.json({ doctors: [] });
      }
    }
    
    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new doctor (admin only)
export async function POST(request: Request) {
  const { userId } = await auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      firstName, 
      lastName, 
      sex,
      age,
      location,
      fieldOfStudy,
      specialization,
      yearsExperience,
      licenseNumber,
      hospital,
      bio
    } = await request.json();
    
    // Validate required fields
    if (!firstName || !lastName || sex === undefined || !age || !location || !fieldOfStudy) {
      return NextResponse.json({ 
        error: 'Missing required fields: firstName, lastName, sex, age, location, fieldOfStudy are required' 
      }, { status: 400 });
    }
    
    // Create the doctor
    const doctor = await prisma.doctor.create({
      data: {
        id: userId, // Use the authenticated user's ID
        firstName,
        lastName,
        sex: !!sex,
        age,
        location,
        fieldOfStudy,
        specialization,
        yearsExperience,
        licenseNumber,
        hospital,
        bio,
      },
    });
    
    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 