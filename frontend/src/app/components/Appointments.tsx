"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, User, Phone, Video, MapPin, AlertCircle, Plus, Calendar, FlaskConical, Stethoscope, MessageSquare, ArrowLeft, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define chat message type
interface ChatMessage {
  id: number;
  sender: 'doctor' | 'patient' | 'ai';
  senderName: string;
  message: string;
  timestamp: string;
}

// Define appointment type
interface Appointment {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  type: 'in-person' | 'video' | 'phone';
  notes: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  chatHistory?: ChatMessage[];
}

export default function Appointments() {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock chat histories
  const chatHistories: Record<number, ChatMessage[]> = {
    1: [
      { id: 1, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: 'Hello! How are you feeling today?', timestamp: '10:30 AM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: "I've been having some chest discomfort occasionally.", timestamp: '10:31 AM' },
      { id: 3, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "I see. Can you describe the discomfort? Is it a sharp pain, pressure, or something else?", timestamp: '10:32 AM' },
      { id: 4, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'It\'s more like pressure, especially after walking up stairs.', timestamp: '10:33 AM' },
      { id: 5, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "Thank you for that information. I'd like to run some tests during your upcoming appointment. In the meantime, please avoid strenuous activities.", timestamp: '10:35 AM' },
      { id: 6, sender: 'ai', senderName: 'MedAI', message: "Just a reminder: It's important to note any other symptoms like shortness of breath or dizziness. This will help Dr. Johnson with her assessment.", timestamp: '10:36 AM' }
    ],
    2: [
      { id: 1, sender: 'doctor', senderName: 'Dr. Michael Chen', message: 'How has your skin been responding to the new treatment?', timestamp: '3:15 PM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'The redness has decreased, but I still have some itching.', timestamp: '3:17 PM' },
      { id: 3, sender: 'doctor', senderName: 'Dr. Michael Chen', message: "That's good progress. The itching might take a bit longer to subside. Have you been applying the cream twice daily as prescribed?", timestamp: '3:19 PM' },
      { id: 4, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'Yes, morning and night as directed.', timestamp: '3:20 PM' },
      { id: 5, sender: 'ai', senderName: 'MedAI', message: 'Tip: Taking photos of your affected skin areas daily can help track progress over time. Would you like me to create a reminder for this?', timestamp: '3:21 PM' }
    ],
    3: [
      { id: 1, sender: 'doctor', senderName: 'Dr. Emily Roberts', message: 'Your annual checkup results look good overall.', timestamp: '9:15 AM' },
      { id: 2, sender: 'doctor', senderName: 'Dr. Emily Roberts', message: 'Your blood pressure is slightly elevated though. Have you been experiencing stress lately?', timestamp: '9:16 AM' },
      { id: 3, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'Work has been quite demanding the past few months.', timestamp: '9:18 AM' },
      { id: 4, sender: 'doctor', senderName: 'Dr. Emily Roberts', message: "I understand. Let's discuss some stress management techniques you could incorporate into your routine.", timestamp: '9:20 AM' },
      { id: 5, sender: 'ai', senderName: 'MedAI', message: "I can suggest some meditation apps that have been clinically shown to reduce stress and lower blood pressure. Would that be helpful?", timestamp: '9:21 AM' }
    ],
    4: [
      { id: 1, sender: 'doctor', senderName: 'Dr. James Wilson', message: "Based on what you've described about your knee pain, it sounds like it could be a minor strain.", timestamp: '11:50 AM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: "Is that serious? Should I be worried?", timestamp: '11:51 AM' },
      { id: 3, sender: 'doctor', senderName: 'Dr. James Wilson', message: "It's not typically serious, but we should monitor it. Try resting the knee and applying ice for 15-20 minutes a few times daily.", timestamp: '11:53 AM' },
      { id: 4, sender: 'ai', senderName: 'MedAI', message: 'Research shows that gentle strengthening exercises can help with knee strains. I can provide some recommended exercises after Dr. Wilson approves them for your specific situation.', timestamp: '11:55 AM' }
    ],
    5: [
      { id: 1, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "Thank you for coming in today. After our consultation, I'd like to monitor your heart health more closely.", timestamp: '10:45 AM' },
      { id: 2, sender: 'patient', senderName: user?.fullName || 'Patient', message: "Is there something concerning in my results?", timestamp: '10:46 AM' },
      { id: 3, sender: 'doctor', senderName: 'Dr. Sarah Johnson', message: "Nothing alarming, but given your family history, I prefer to be proactive. I'm recommending some additional tests.", timestamp: '10:48 AM' },
      { id: 4, sender: 'ai', senderName: 'MedAI', message: "Dr. Johnson has ordered an EKG and lipid panel. I'll send you preparation instructions and fasting requirements prior to these tests.", timestamp: '10:50 AM' }
    ],
    6: [
      { id: 1, sender: 'patient', senderName: user?.fullName || 'Patient', message: "I've been experiencing frequent headaches that seem to be getting worse.", timestamp: '2:30 PM' },
      { id: 2, sender: 'doctor', senderName: 'Dr. Lisa Martinez', message: "I'm sorry to hear that. Can you describe the pain and frequency?", timestamp: '2:35 PM' },
      { id: 3, sender: 'patient', senderName: user?.fullName || 'Patient', message: 'They happen almost daily, usually throbbing pain on one side of my head.', timestamp: '2:37 PM' },
      { id: 4, sender: 'doctor', senderName: 'Dr. Lisa Martinez', message: 'Thank you for sharing this information. This helps me prepare for our consultation. In the meantime, please keep a headache journal noting frequency, duration, and potential triggers.', timestamp: '2:40 PM' },
      { id: 5, sender: 'ai', senderName: 'MedAI', message: 'I can help you track your headaches. Would you like me to set up a digital headache journal for you?', timestamp: '2:42 PM' }
    ]
  };

  // Dummy appointment data
  const appointments = {
    upcoming: [
      {
        id: 1,
        doctorName: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        date: "June 15, 2023",
        time: "10:30 AM",
        location: "Heart Health Clinic",
        address: "123 Medical Center Blvd.",
        type: "in-person",
        notes: "Annual heart checkup",
        status: "confirmed"
      },
      {
        id: 2,
        doctorName: "Dr. Michael Chen",
        specialty: "Dermatologist",
        date: "June 22, 2023",
        time: "2:15 PM",
        location: "Online",
        type: "video",
        notes: "Follow-up on skin condition",
        status: "confirmed"
      }
    ],
    past: [
      {
        id: 3,
        doctorName: "Dr. Emily Roberts",
        specialty: "General Practitioner",
        date: "May 5, 2023",
        time: "9:00 AM",
        location: "Family Health Center",
        address: "456 Wellness Way",
        type: "in-person",
        notes: "Regular checkup",
        status: "completed"
      },
      {
        id: 4,
        doctorName: "Dr. James Wilson",
        specialty: "Orthopedist",
        date: "April 18, 2023",
        time: "11:45 AM",
        location: "Phone Consultation",
        type: "phone",
        notes: "Discuss knee pain",
        status: "completed"
      },
      {
        id: 5,
        doctorName: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        date: "March 22, 2023",
        time: "10:00 AM",
        location: "Heart Health Clinic",
        address: "123 Medical Center Blvd.",
        type: "in-person",
        notes: "Initial consultation",
        status: "completed"
      }
    ],
    requested: [
      {
        id: 6,
        doctorName: "Dr. Lisa Martinez",
        specialty: "Neurologist",
        date: "Pending",
        time: "Pending",
        location: "Neurology Partners",
        address: "789 Brain Ave.",
        type: "in-person",
        notes: "Consultation for headaches",
        status: "pending"
      }
    ]
  };

  // Dummy recommended labs data
  const recommendedLabs = [
    {
      id: 1,
      labName: "Comprehensive Metabolic Panel",
      recommendedBy: "Dr. Sarah Johnson",
      recommendedByType: "doctor",
      dueBy: "July 15, 2023",
      reason: "Annual checkup follow-up",
      labLocation: "LabCorp - Medical Center",
      address: "123 Health Blvd, Suite 200",
      status: "pending",
      priority: "high"
    },
    {
      id: 2,
      labName: "Complete Blood Count (CBC)",
      recommendedBy: "MedAI",
      recommendedByType: "ai",
      dueBy: "July 20, 2023",
      reason: "Routine health monitoring based on your profile",
      labLocation: "Quest Diagnostics",
      address: "456 Care Street",
      status: "pending",
      priority: "medium"
    },
    {
      id: 3,
      labName: "Lipid Panel",
      recommendedBy: "MedAI",
      recommendedByType: "ai",
      dueBy: "August 5, 2023",
      reason: "Monitor cholesterol levels - recommended based on family history",
      labLocation: "LabCorp - Medical Center",
      address: "123 Health Blvd, Suite 200",
      status: "pending",
      priority: "medium"
    }
  ];

  const [activeTab, setActiveTab] = useState('current');

  const getAppointmentTypeIcon = (type: string) => {
    switch(type) {
      case "in-person": 
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case "video": 
        return <Video className="h-4 w-4 text-green-500" />;
      case "phone": 
        return <Phone className="h-4 w-4 text-amber-500" />;
      default: 
        return <MapPin className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high": 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Priority</Badge>;
      case "medium": 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Priority</Badge>;
      case "low": 
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low Priority</Badge>;
      default: 
        return <Badge>Unknown</Badge>;
    }
  };

  const getAppointmentList = (type: string) => {
    switch(type) {
      case "current": 
        return [...appointments.upcoming, ...appointments.requested];
      case "past": 
        return appointments.past;
      default: 
        return [...appointments.upcoming, ...appointments.requested];
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    // In a real app, you would send this to an API
    // For now, we'll just clear the input
    setNewMessage('');
  };

  const getSenderAvatar = (sender: string, name: string) => {
    switch(sender) {
      case 'doctor':
        return (
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-800">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        );
      case 'patient':
        return (
          <Avatar>
            <AvatarImage src={user?.imageUrl ?? ''} alt={name} />
            <AvatarFallback className="bg-gray-100 text-gray-800">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        );
      case 'ai':
        return (
          <Avatar>
            <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
          </Avatar>
        );
      default:
        return (
          <Avatar>
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        );
    }
  };

  // Get the current appointment being viewed in chat
  const getCurrentAppointment = () => {
    if (!selectedChat) return null;
    
    const allAppointments = [
      ...appointments.upcoming,
      ...appointments.requested,
      ...appointments.past
    ];
    
    return allAppointments.find(a => a.id === selectedChat);
  };

  if (selectedChat) {
    const currentAppointment = getCurrentAppointment();
    const chatMessages = chatHistories[selectedChat] || [];
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedChat(null)}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to appointments
            </Button>
            <div className="flex items-center gap-2">
              {currentAppointment && (
                <>
                  <span className="font-medium">{currentAppointment.doctorName}</span>
                  <Badge variant="outline">{currentAppointment.specialty}</Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                {getSenderAvatar(msg.sender, msg.senderName)}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.senderName}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <div className={`rounded-lg p-3 mt-1 ${
                    msg.sender === 'doctor' ? 'bg-blue-50' :
                    msg.sender === 'ai' ? 'bg-purple-50' : 'bg-gray-50'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="gap-1">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Appointments
        </CardTitle>
        <CardDescription>
          Manage your healthcare appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Tabs defaultValue="current" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="labs">Recommended Labs</TabsTrigger>
            </TabsList>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </div>

          {["current", "past"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {getAppointmentList(tabValue).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No {tabValue} appointments</h3>
                    <p className="text-gray-500 mb-4">
                      {tabValue === "current" 
                        ? "You don't have any current or requested appointments." 
                        : "You don't have any past appointments."}
                    </p>
                    {tabValue !== "past" && (
                      <Button>Schedule an appointment</Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                getAppointmentList(tabValue).map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Status ribbon */}
                        <div className="absolute top-0 right-0 z-10">
                          <div className={`
                            px-4 py-1 text-xs font-medium uppercase tracking-wider
                            ${appointment.status === 'confirmed' ? 'bg-green-500 text-white' : 
                              appointment.status === 'pending' ? 'bg-amber-500 text-white' : 
                              appointment.status === 'completed' ? 'bg-gray-500 text-white' : 
                              appointment.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}
                          `}>
                            {appointment.status}
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row">
                          <div className="p-4 md:w-1/3 bg-blue-50 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              {getAppointmentTypeIcon(appointment.type)}
                              <span className="text-sm text-blue-700 capitalize">
                                {appointment.type} Appointment
                              </span>
                            </div>
                            <h3 className="font-medium text-lg mb-1">{appointment.doctorName}</h3>
                            <p className="text-sm text-gray-600 mb-3">{appointment.specialty}</p>
                            
                            <div className="flex items-center gap-2 text-gray-700 mb-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span className="text-sm">{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{appointment.time}</span>
                            </div>
                          </div>
                          
                          <div className="p-4 md:w-2/3">
                            <div className="flex justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Patient: {user?.fullName || user?.username || "User"}</span>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                              <p className="text-sm text-gray-600">{appointment.location}</p>
                              {appointment.address && (
                                <p className="text-sm text-gray-600">{appointment.address}</p>
                              )}
                            </div>
                            
                            {appointment.notes && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                              </div>
                            )}
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button 
                                onClick={() => setSelectedChat(appointment.id)}
                                variant="outline" 
                                className="gap-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                                View Conversation
                              </Button>

                              {appointment.status === "confirmed" && activeTab === "current" && (
                                <>
                                  {appointment.type === "video" && (
                                    <Button className="gap-1">
                                      <Video className="h-4 w-4" />
                                      Join Video Call
                                    </Button>
                                  )}
                                  <Button variant="outline" className="gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Reschedule
                                  </Button>
                                </>
                              )}

                              {appointment.status === "pending" && activeTab === "current" && (
                                <>
                                  <Button className="gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    Check Availability
                                  </Button>
                                  <Button variant="outline" className="gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Cancel Request
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {activeTab === "current" && getAppointmentList(tabValue).length > 0 && (
                <Button variant="outline" className="w-full">
                  Manage Appointments
                </Button>
              )}
            </TabsContent>
          ))}

          <TabsContent value="labs" className="space-y-4">
            {recommendedLabs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FlaskConical className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No recommended labs</h3>
                  <p className="text-gray-500 mb-4">
                    You don&apos;t have any recommended lab tests at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              recommendedLabs.map((lab) => (
                <Card key={lab.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:w-1/3 bg-purple-50 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <FlaskConical className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-purple-700">Lab Test</span>
                        </div>
                        <h3 className="font-medium text-lg mb-1">{lab.labName}</h3>
                        <div className="flex items-center gap-2 mt-2 mb-1">
                          {lab.recommendedByType === "ai" ? (
                            <div className="flex items-center gap-1">
                              <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">AI</span>
                              </div>
                              <span className="text-sm text-gray-600">Recommended by {lab.recommendedBy}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-600">Recommended by {lab.recommendedBy}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 mb-1 mt-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-sm">Due by: {lab.dueBy}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Patient: {user?.fullName || user?.username || "User"}</span>
                          </div>
                          {getPriorityBadge(lab.priority)}
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Reason</h4>
                          <p className="text-sm text-gray-600">{lab.reason}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                          <p className="text-sm text-gray-600">{lab.labLocation}</p>
                          {lab.address && (
                            <p className="text-sm text-gray-600">{lab.address}</p>
                          )}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button className="gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            Schedule Lab Visit
                          </Button>
                          <Button variant="outline" className="gap-1">
                            <AlertCircle className="h-4 w-4" />
                            More Information
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {recommendedLabs.length > 0 && (
              <Button variant="outline" className="w-full">
                View All Lab Recommendations
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 