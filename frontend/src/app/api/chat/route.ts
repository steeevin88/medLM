import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch conversations for the current user
export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get query parameters
    const appointmentId = url.searchParams.get('appointmentId');
    const showAnonymous = url.searchParams.get('anonymous') === 'true';
    
    // Find if the current user is a patient or doctor
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
    });
    
    let conversations;
    
    // If specific appointment provided, get that conversation
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          conversation: {
            include: {
              messages: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          },
        },
      });
      
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      
      // Verify the user has access to this appointment
      if (patient && appointment.patientId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (doctor && appointment.doctorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      return NextResponse.json({ conversation: appointment.conversation });
    }
    
    // Otherwise, get all conversations for the user
    if (patient) {
      // For patients, get all their conversations
      conversations = await prisma.conversation.findMany({
        where: {
          patientId: userId,
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
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Just get latest message for preview
          },
          appointments: {
            select: {
              id: true,
              date: true,
              type: true,
              status: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } else if (doctor) {
      // For doctors, get all their conversations
      conversations = await prisma.conversation.findMany({
        where: {
          doctorId: userId,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          obfuscatedUser: showAnonymous ? {
            select: {
              id: true,
              age: true,
              sex: true,
            },
          } : false,
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Just get latest message for preview
          },
          appointments: {
            select: {
              id: true,
              date: true,
              type: true,
              status: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      // For anonymous conversations, remove patient details for doctors
      if (conversations) {
        conversations = conversations.map(convo => {
          if (convo.isAnonymous) {
            return {
              ...convo,
              patient: null,
              patientId: null,
            };
          }
          return convo;
        });
      }
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 