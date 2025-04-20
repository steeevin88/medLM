import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient, AppointmentType, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch appointments for the current user
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
    
    // Find if the current user is a patient or doctor
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
    });
    
    let appointments;
    
    // Get appointments for the user
    if (patient) {
      // For patients, get all their appointments
      appointments = await prisma.appointment.findMany({
        where: {
          patientId: userId,
          ...(status ? { status: status as AppointmentStatus } : {}),
          ...(showAnonymous ? {} : { isAnonymous: false }),
        },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
          conversation: {
            select: {
              id: true,
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: [
          { date: 'asc' },
          { time: 'asc' },
        ],
      });
    } else if (doctor) {
      // For doctors, get all their appointments
      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: userId,
          ...(status ? { status: status as AppointmentStatus } : {}),
        },
        include: {
          patient: !showAnonymous ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          } : false,
          obfuscatedUser: showAnonymous ? {
            select: {
              id: true,
              age: true,
              sex: true,
              healthIssues: true,
              allergies: true,
            },
          } : false,
          conversation: {
            select: {
              id: true,
              isAnonymous: true,
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: [
          { date: 'asc' },
          { time: 'asc' },
        ],
      });
      
      // For anonymous appointments, ensure patient details are hidden
      if (appointments) {
        appointments = appointments.map(appt => {
          if (appt.isAnonymous) {
            return {
              ...appt,
              patient: null,
              patientId: null,
            };
          }
          return appt;
        });
      }
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new appointment
export async function POST(request: Request) {
  const { userId } = await auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      doctorId, 
      date, 
      time, 
      location, 
      address, 
      type, 
      notes, 
      specialtyType,
      isAnonymous 
    } = await request.json();
    
    // Validate required fields
    if (!doctorId || !date || !time || !location || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: doctorId, date, time, location, type are all required' 
      }, { status: 400 });
    }
    
    // Find if the current user is a patient
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    if (!patient) {
      return NextResponse.json({ error: 'Only patients can create appointments' }, { status: 403 });
    }
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
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
        // Create new obfuscated user
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
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        time,
        location,
        address,
        notes,
        type: type as AppointmentType,
        status: AppointmentStatus.REQUESTED,
        isAnonymous: !!isAnonymous,
        specialtyType,
        patient: { connect: { id: patient.id } },
        doctor: { connect: { id: doctorId } },
        ...(obfuscatedUserId ? { obfuscatedUser: { connect: { id: obfuscatedUserId } } } : {}),
      },
    });
    
    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update an appointment (confirm, cancel, reschedule)
export async function PATCH(request: Request) {
  const { userId } = await auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, date, time, notes } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Find if the current user is a patient or doctor
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
    });
    
    // Verify the user has access to this appointment
    if (patient && appointment.patientId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (doctor && appointment.doctorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status as AppointmentStatus;
    }
    
    if (date) {
      updateData.date = new Date(date);
    }
    
    if (time) {
      updateData.time = time;
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 