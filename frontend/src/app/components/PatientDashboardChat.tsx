"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import ChatInterface, { ChatMessage } from "./ChatInterface";

export default function PatientDashboardChat() {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data for chat contacts
  const chatContacts = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      lastMessage: "Thank you for sharing this information. I'll review your ECG results.",
      lastMessageTime: "10:45 AM",
      unread: 0
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      role: "Dermatologist",
      lastMessage: "Remember to apply the cream twice daily and avoid sun exposure.",
      lastMessageTime: "Yesterday",
      unread: 2
    },
    {
      id: 3,
      name: "MedAI Assistant",
      role: "AI Health Assistant",
      lastMessage: "I've analyzed your sleep data. Would you like some tips for better sleep?",
      lastMessageTime: "Yesterday",
      unread: 1
    }
  ];

  // Dummy chat histories
  const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>({
    1: [
      { id: 1, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: 'Hello! How are you feeling today?', timestamp: '10:30 AM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: "I've been having some chest discomfort occasionally.", timestamp: '10:31 AM' },
      { id: 3, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "I see. Can you describe the discomfort? Is it a sharp pain, pressure, or something else?", timestamp: '10:32 AM' },
      { id: 4, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'It\'s more like pressure, especially after walking up stairs.', timestamp: '10:33 AM' },
      { id: 5, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "Thank you for that information. I'd like to run some tests during your upcoming appointment. In the meantime, please avoid strenuous activities.", timestamp: '10:35 AM' },
      { id: 6, sender: 'ai', senderName: 'MedAI', message: "Just a reminder: It's important to note any other symptoms like shortness of breath or dizziness. This will help Dr. Johnson with her assessment.", timestamp: '10:36 AM' },
      { id: 7, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "Thank you for sharing this information. I'll review your ECG results.", timestamp: '10:45 AM' }
    ],
    2: [
      { id: 1, sender: 'doctor', senderName: 'Dr. Michael Chen', message: 'How has your skin been responding to the new treatment?', timestamp: '3:15 PM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'The redness has decreased, but I still have some itching.', timestamp: '3:17 PM' },
      { id: 3, sender: 'doctor', senderName: 'Dr. Michael Chen', message: "That's good progress. The itching might take a bit longer to subside. Have you been applying the cream twice daily as prescribed?", timestamp: '3:19 PM' },
      { id: 4, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'Yes, morning and night as directed.', timestamp: '3:20 PM' },
      { id: 5, sender: 'ai', senderName: 'MedAI', message: 'Tip: Taking photos of your affected skin areas daily can help track progress over time. Would you like me to create a reminder for this?', timestamp: '3:21 PM' },
      { id: 6, sender: 'doctor', senderName: 'Dr. Michael Chen', message: 'Remember to apply the cream twice daily and avoid sun exposure.', timestamp: 'Yesterday' }
    ],
    3: [
      { id: 1, sender: 'ai', senderName: 'MedAI', message: 'Good morning! How did you sleep last night?', timestamp: '8:00 AM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'Not great. Woke up a few times.', timestamp: '8:05 AM' },
      { id: 3, sender: 'ai', senderName: 'MedAI', message: "I'm sorry to hear that. Your sleep tracker shows you were restless between 2-4 AM. Would you like some tips for better sleep?", timestamp: '8:07 AM' },
      { id: 4, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'Yes, please.', timestamp: '8:10 AM' },
      { id: 5, sender: 'ai', senderName: 'MedAI', message: "1. Maintain a consistent sleep schedule\n2. Avoid screens 1 hour before bed\n3. Keep your bedroom cool (65-68°F)\n4. Try deep breathing exercises\n5. Limit caffeine after noon", timestamp: '8:12 AM' },
      { id: 6, sender: 'ai', senderName: 'MedAI', message: "I've analyzed your sleep data. Would you like me to share this information with Dr. Roberts before your next appointment?", timestamp: 'Yesterday' }
    ]
  });

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
    if (!selectedChat) return;

    // Add the new message to chat history
    setChatHistories(prev => {
      const currentChat = prev[selectedChat] || [];
      const newId = currentChat.length > 0 ? Math.max(...currentChat.map(msg => msg.id)) + 1 : 1;

      // Create new message with proper types
      const newMsg: ChatMessage = {
        id: newId,
        sender: 'patient',
        senderName: user?.fullName || 'Patient',
        message: message,
        timestamp: getCurrentTime()
      };

      const updatedChat = [...currentChat, newMsg];

      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiResponseId = updatedChat.length > 0 ? Math.max(...updatedChat.map(msg => msg.id)) + 1 : 1;

        // Create AI or doctor response based on the chat ID
        const aiResponse: ChatMessage = {
          id: aiResponseId,
          sender: selectedChat === 3 ? 'ai' : 'doctor',
          senderName: selectedChat === 3 ? 'MedAI' :
                     selectedChat === 1 ? 'Dr. Sarah Johnson' : 'Dr. Michael Chen',
          message: selectedChat === 3 ?
                   "I'll analyze your message and provide assistance shortly." :
                   "Thank you for your message. I'll get back to you as soon as possible.",
          timestamp: getCurrentTime()
        };

        setChatHistories(prevChats => ({
          ...prevChats,
          [selectedChat]: [...prevChats[selectedChat], aiResponse]
        }));
      }, 1000);

      return {
        ...prev,
        [selectedChat]: updatedChat
      };
    });
  };

  // Get filtered contacts based on search query
  const filteredContacts = chatContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the current contact information for the header
  const getCurrentContactInfo = () => {
    if (!selectedChat) return null;
    return chatContacts.find(contact => contact.id === selectedChat);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "?";
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return firstInitial + lastInitial || user.username?.[0] || "?";
  };

  if (selectedChat) {
    const contactInfo = getCurrentContactInfo();

    return (
      <ChatInterface
        chatId={selectedChat}
        messages={chatHistories[selectedChat] || []}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedChat(null)}
        headerInfo={contactInfo ? {
          title: contactInfo.name,
          subtitle: contactInfo.role
        } : undefined}
        userInfo={{
          imageUrl: user?.imageUrl || "/avatar-placeholder.png",
          fullName: user?.fullName || user?.username || "User",
          initials: getUserInitials()
        }}
      />
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Messages
        </CardTitle>
        <CardDescription>
          Chat with your healthcare providers
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations found</h3>
              <p className="text-xs text-gray-500">Try a different search term</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedChat(contact.id)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{contact.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-gray-600">{contact.role}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                      {contact.unread}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
