"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export type DummyDataResult = {
  success: boolean;
  chatsCreated: number;
  messagesCreated: number;
  error?: string;
};

export async function generateDummyChats(): Promise<DummyDataResult> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return { 
        success: false, 
        chatsCreated: 0, 
        messagesCreated: 0,
        error: "User not authenticated" 
      };
    }

    // Sample chat data
    const sampleChats = [
      {
        title: "Headache and Fever Symptoms",
        messages: [
          { content: "I've been having a headache and fever for the last two days.", isAI: false },
          { content: "I'm sorry to hear you're not feeling well. Can you tell me more about your symptoms? When did they start and have you taken any medication?", isAI: true },
          { content: "It started on Monday night. I've taken some ibuprofen which helped a bit but the symptoms came back.", isAI: false },
          { content: "Thank you for sharing. Headache and fever can be symptoms of many conditions, including viral infections like the flu or common cold. It's important to stay hydrated and rest. If your fever is high (above 101°F or 38.3°C) or persists for more than three days, you should consider seeing a healthcare provider.", isAI: true }
        ]
      },
      {
        title: "Back Pain Consultation",
        messages: [
          { content: "I'm experiencing lower back pain, especially when I sit for long periods.", isAI: false },
          { content: "Back pain can be uncomfortable and disruptive. Can you describe the pain? Is it sharp, dull, or achy? And have you noticed any activities that make it better or worse?", isAI: true },
          { content: "It's a dull pain that gets worse when I sit at my desk. Standing and walking seem to help a bit.", isAI: false },
          { content: "That's helpful information. Lower back pain that improves with movement could be related to posture or ergonomics. Consider taking short breaks to stand and stretch when sitting for long periods. You might also benefit from core-strengthening exercises. If the pain persists or worsens, a physical therapist could provide personalized recommendations.", isAI: true }
        ]
      },
      {
        title: "Sleep Issues Discussion",
        messages: [
          { content: "I've been having trouble falling asleep lately. Any suggestions?", isAI: false },
          { content: "Sleep difficulties can be frustrating. To help better understand your situation, could you share more about your sleep routine? What time do you typically go to bed, and have you noticed any factors that might be affecting your sleep?", isAI: true },
          { content: "I usually go to bed around 11pm but end up scrolling on my phone. I also drink coffee in the afternoon sometimes.", isAI: false },
          { content: "Those are important factors to consider. Screen time before bed and caffeine in the afternoon can both interfere with sleep. Try establishing a wind-down routine without screens 30-60 minutes before bed, and consider limiting caffeine to the morning hours. Creating a cool, dark, and quiet sleeping environment can also help. Consistent sleep and wake times, even on weekends, help regulate your body's internal clock.", isAI: true }
        ]
      }
    ];

    let totalChats = 0;
    let totalMessages = 0;

    // Create each chat with its messages
    for (const chatData of sampleChats) {
      const chat = await prisma.chat.create({
        data: {
          title: chatData.title,
          userId: userId,
          messages: {
            create: chatData.messages.map(msg => ({
              content: msg.content,
              isAI: msg.isAI,
              userId: userId
            }))
          }
        },
        include: {
          messages: true
        }
      });

      totalChats++;
      totalMessages += chat.messages.length;
    }

    // Revalidate the chats page to show the new data
    revalidatePath('/dashboard/chats');

    return {
      success: true,
      chatsCreated: totalChats,
      messagesCreated: totalMessages
    };
  } catch (error) {
    console.error("Error generating dummy data:", error);
    return {
      success: false,
      chatsCreated: 0,
      messagesCreated: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
} 