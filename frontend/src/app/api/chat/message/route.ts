"use server";

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Send a new message
export async function POST(request: Request) {
  console.log("API ROUTE: /api/chat/message POST handler invoked.");
  const { userId } = await auth();
  console.log("API ROUTE: /api/chat/message - User ID from auth:", userId);
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log("API ROUTE: /api/chat/message - Entering try block.");
    const { conversationId, content, appointmentId } = await request.json();
    console.log("API ROUTE: /api/chat/message - Request body parsed:", { conversationId, content, appointmentId });
    
    // Validate input
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }
    
    // Find if the current user is a patient or doctor
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
    });
    
    if (!patient && !doctor) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let conversation;
    
    // If conversationId is provided, use existing conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      // Verify the user has access to this conversation
      if (patient && conversation.patientId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (doctor && conversation.doctorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } 
    // If appointmentId is provided but not conversationId, find or create conversation for that appointment
    else if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { conversation: true },
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
      
      // Use existing conversation or create a new one
      if (appointment.conversation) {
        conversation = appointment.conversation;
      } else {
        // Create a new conversation for this appointment
        conversation = await prisma.conversation.create({
          data: {
            title: `Appointment on ${new Date(appointment.date).toLocaleDateString()}`,
            isAnonymous: appointment.isAnonymous,
            patient: { connect: { id: appointment.patientId } },
            doctor: { connect: { id: appointment.doctorId } },
            appointments: { connect: { id: appointmentId } },
            ...(appointment.isAnonymous && appointment.obfuscatedUserId 
              ? { obfuscatedUser: { connect: { id: appointment.obfuscatedUserId } } } 
              : {})
          }
        });
        
        // Update the appointment with the new conversation
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { conversation: { connect: { id: conversation.id } } }
        });
      }
    } else {
      return NextResponse.json({ error: 'Either conversationId or appointmentId is required' }, { status: 400 });
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        sentByPatient: !!patient,
        sentByDoctor: !!doctor,
        conversation: { connect: { id: conversation.id } },
        ...(patient ? { patient: { connect: { id: userId } } } : {}),
        ...(doctor ? { doctor: { connect: { id: userId } } } : {})
      }
    });
    
    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch messages for a conversation
export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conversationId = url.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    // Find if the current user is a patient or doctor
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
    });
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
    });
    
    if (!patient && !doctor) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the conversation and verify access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Verify the user has access to this conversation
    if (patient && conversation.patientId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (doctor && conversation.doctorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get messages for this conversation
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        patient: !conversation.isAnonymous ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        } : false,
      }
    });
    
    // Mark unread messages as read
    if (patient) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          sentByDoctor: true,
          isRead: false,
        },
        data: { isRead: true }
      });
    } else if (doctor) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          sentByPatient: true,
          isRead: false,
        },
        data: { isRead: true }
      });
    }
    
    // For anonymous conversations, remove patient details for doctors
    if (doctor && conversation.isAnonymous) {
      const sanitizedMessages = messages.map(msg => {
        if (msg.sentByPatient) {
          return {
            ...msg,
            patient: null,
            patientId: null,
          };
        }
        return msg;
      });
      
      return NextResponse.json({ messages: sanitizedMessages });
    }
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 