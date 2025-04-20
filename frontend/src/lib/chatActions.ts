"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Get user ID from Clerk auth
const getUserId = async () => {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  // In a real app, you'd have a mapping between Clerk user IDs and your database user IDs
  // For this mockup, we'll assume userId is directly usable
  return userId;
};

// Create a new chat
export async function createChat(initialMessage: string) {
  try {
    const userId = await getUserId();
    
    // Create a new chat
    const chat = await prisma.chat.create({
      data: {
        title: initialMessage.substring(0, 50) + (initialMessage.length > 50 ? "..." : ""),
        userId: userId,
        messages: {
          create: [
            {
              content: initialMessage,
              isAI: false,
              userId: userId
            }
          ]
        }
      },
      include: {
        messages: true
      }
    });
    
    return chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

// Get all chats for the current user
export async function getUserChats() {
  try {
    const userId = await getUserId();
    
    const chats = await prisma.chat.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    return chats;
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
}

// Get a specific chat by ID
export async function getChat(chatId: string) {
  try {
    const userId = await getUserId();
    
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: userId // Ensure the chat belongs to the requesting user
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    return chat;
  } catch (error) {
    console.error("Error getting chat:", error);
    throw error;
  }
}

// Save a new message to a chat
export async function saveMessage({
  chatId,
  content,
  isAI
}: {
  chatId: string;
  content: string;
  isAI: boolean;
}) {
  try {
    const userId = await getUserId();
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        isAI,
        chatId,
        userId
      }
    });
    
    // Update the chat's updatedAt timestamp
    await prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        updatedAt: new Date()
      }
    });
    
    return message;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

// Delete a chat
export async function deleteChat(chatId: string) {
  try {
    const userId = await getUserId();
    
    // First delete all messages in the chat
    await prisma.message.deleteMany({
      where: {
        chatId,
        chat: {
          userId
        }
      }
    });
    
    // Then delete the chat itself
    await prisma.chat.delete({
      where: {
        id: chatId,
        userId
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

// Archive a chat
export async function archiveChat(chatId: string) {
  try {
    const userId = await getUserId();
    
    await prisma.chat.update({
      where: {
        id: chatId,
        userId
      },
      data: {
        isArchived: true
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error archiving chat:", error);
    throw error;
  }
} 