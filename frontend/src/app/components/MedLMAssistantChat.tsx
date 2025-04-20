"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import ChatInterface, { ChatMessage } from "./ChatInterface";

export default function MedLMAssistantChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Add initial welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: "Hello! I'm your MedLM assistant. How can I help you with your health questions today?",
        timestamp: getCurrentTime(),
      }]);
    }
  }, [messages.length]);

  // Helper to get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'patient',
      senderName: user?.fullName || 'Patient',
      message: message,
      timestamp: getCurrentTime(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: getAIResponse(message),
        timestamp: getCurrentTime(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Simple AI response generator - in a real app, this would call an API
  const getAIResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('headache') || lowerCaseMessage.includes('head pain')) {
      return "I'm sorry to hear you're experiencing headaches. How long have you been having them? Are they accompanied by any other symptoms like nausea or sensitivity to light?";
    } else if (lowerCaseMessage.includes('sleep') || lowerCaseMessage.includes('insomnia')) {
      return "Sleep issues can significantly impact your health. I recommend maintaining a consistent sleep schedule, avoiding screens before bed, and creating a comfortable sleep environment. Would you like more specific recommendations?";
    } else if (lowerCaseMessage.includes('diet') || lowerCaseMessage.includes('nutrition')) {
      return "Nutrition is key to overall health. Based on general guidelines, a balanced diet rich in fruits, vegetables, lean proteins, and whole grains is beneficial. Would you like me to provide more specific dietary information?";
    } else if (lowerCaseMessage.includes('exercise') || lowerCaseMessage.includes('workout')) {
      return "Regular physical activity is important for maintaining health. The CDC recommends at least 150 minutes of moderate-intensity exercise per week. Would you like some suggestions for exercises that might work for you?";
    } else if (lowerCaseMessage.includes('thank')) {
      return "You're welcome! I'm here to help with any health questions you might have.";
    } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! How can I assist with your health questions today?";
    } else {
      return "Thank you for sharing that information. Is there anything specific about your health you'd like to discuss or learn more about?";
    }
  };

  // Get user initials for avatar fallback (if needed)
  const getUserInitials = () => {
    if (!user) return "?";
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return firstInitial + lastInitial || user.username?.[0] || "?";
  };

  return (
    <ChatInterface
      chatId={1}
      messages={messages}
      onSendMessage={handleSendMessage}
      headerInfo={{
        title: "MedLM Assistant",
        subtitle: "AI-powered health support"
      }}
      userInfo={{
        imageUrl: user?.imageUrl || "/avatar-placeholder.png",
        fullName: user?.fullName || user?.username || "User",
        initials: getUserInitials()
      }}
    />
  );
} 