"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, User, Phone, Video, MapPin, AlertCircle, Plus, Calendar, Lock, FlaskConical, MessageCircle, Shield, EyeOff, SendHorizontal, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

// Frontend Appointment type (used for rendering)
interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  type: string;
  notes: string;
  status: string;
  isAnonymous: boolean;
}

// Frontend LabTest type (used for rendering)
interface LabTest {
  id: string;
  testName: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  status: string;
  reason: string;
  orderedBy: string;
  isAnonymous: boolean;
  recommendedBy?: string;
}

type AppointmentOrLab = Appointment | LabTest;

export default function Appointments() {
  const { user } = useUser();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{[key: string]: {sender: 'user' | 'doctor', message: string, timestamp: string}[]}>({});
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Form state for appointment form
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [appointmentSpecialty, setAppointmentSpecialty] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [appointmentLocation, setAppointmentLocation] = useState<string>("");
  const [appointmentAddress, setAppointmentAddress] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [appointmentIsAnonymous, setAppointmentIsAnonymous] = useState<boolean>(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState<boolean>(false);

  // Hardcoded data for appointments and labs
  const hardcodedData = {
    upcoming: [
      {
        id: "upcoming-1",
        doctorName: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        date: "June 15, 2025",
        time: "10:30 AM",
        location: "Heart Health Clinic",
        address: "123 Medical Center Blvd.",
        type: "IN_PERSON",
        notes: "Annual heart checkup",
        status: "CONFIRMED",
        isAnonymous: false
      },
      {
        id: "upcoming-2",
        doctorName: "Dr. Michael Chen",
        specialty: "Dermatologist",
        date: "June 22, 2025",
        time: "2:15 PM",
        location: "Online",
        type: "VIDEO",
        notes: "Follow-up on skin condition",
        status: "CONFIRMED",
        isAnonymous: true
      }
    ],
    past: [
      {
        id: "past-1",
        doctorName: "Dr. Emily Roberts",
        specialty: "General Practitioner",
        date: "May 5, 2023",
        time: "9:00 AM",
        location: "Family Health Center",
        address: "456 Wellness Way",
        type: "IN_PERSON",
        notes: "Regular checkup",
        status: "COMPLETED",
        isAnonymous: false
      },
      {
        id: "past-2",
        doctorName: "Dr. James Wilson",
        specialty: "Orthopedist",
        date: "April 18, 2023",
        time: "11:45 AM",
        location: "Phone Consultation",
        type: "PHONE",
        notes: "Discuss knee pain",
        status: "COMPLETED",
        isAnonymous: true
      }
    ],
    requested: [
      {
        id: "requested-1",
        doctorName: "Dr. Lisa Martinez",
        specialty: "Neurologist",
        date: "Pending",
        time: "Pending",
        location: "Neurology Partners",
        address: "789 Brain Ave.",
        type: "IN_PERSON",
        notes: "Consultation for headaches",
        status: "REQUESTED",
        isAnonymous: true
      }
    ],
    labs: [
      {
        id: "lab-1",
        testName: "Complete Blood Count",
        date: "June 30, 2025",
        time: "8:00 AM",
        location: "MedLab Testing Center",
        address: "456 Health Pkwy",
        status: "SCHEDULED",
        reason: "Annual wellness check",
        orderedBy: "Dr. Sarah Johnson",
        isAnonymous: true,
        recommendedBy: "Dr. Sarah Johnson"
      },
      {
        id: "lab-2",
        testName: "Lipid Panel",
        date: "July 5, 2025",
        time: "9:30 AM",
        location: "MedLab Testing Center",
        address: "456 Health Pkwy",
        status: "SCHEDULED",
        reason: "Cholesterol monitoring",
        orderedBy: "Dr. Michael Chen",
        isAnonymous: false,
        recommendedBy: "AI Health Assistant"
      },
      {
        id: "lab-3",
        testName: "Urinalysis",
        date: "May 15, 2023",
        time: "10:15 AM",
        location: "City Hospital Lab",
        address: "789 Hospital Dr.",
        status: "COMPLETED",
        reason: "Kidney function test",
        orderedBy: "Dr. Emily Roberts",
        isAnonymous: false,
        recommendedBy: "Dr. Emily Roberts"
      },
      {
        id: "lab-4",
        testName: "A1C Test",
        date: "Pending Approval",
        time: "To be scheduled",
        location: "Your preferred facility",
        status: "RECOMMENDED",
        reason: "Diabetes screening based on your health profile",
        orderedBy: "Not yet ordered",
        isAnonymous: false,
        recommendedBy: "AI Health Assistant"
      }
    ]
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch(type) {
      case "IN_PERSON": 
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case "VIDEO": 
        return <Video className="h-4 w-4 text-green-500" />;
      case "PHONE": 
        return <Phone className="h-4 w-4 text-amber-500" />;
      default: 
        return <MapPin className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "CONFIRMED": 
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case "REQUESTED": 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "COMPLETED": 
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
      case "CANCELLED": 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case "SCHEDULED": 
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case "RECOMMENDED":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Recommended</Badge>;
      default: 
        return <Badge>Unknown</Badge>;
    }
  };

  const getAppointmentList = (type: string): AppointmentOrLab[] => {
    switch(type) {
      case "upcoming": return hardcodedData.upcoming;
      case "past": return hardcodedData.past;
      case "requested": return hardcodedData.requested;
      case "labs": return hardcodedData.labs;
      default: return [];
    }
  };

  const sendMessage = async (appointmentId: string) => {
    if (!newMessage.trim()) return;
    
    const now = new Date();
    const formattedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Optimistically update UI
    const newMessages = chatMessages[appointmentId] || [];
    const updatedMessages = [
      ...newMessages,
      { sender: 'user' as const, message: newMessage, timestamp: formattedTime }
    ];
    
    setChatMessages({ ...chatMessages, [appointmentId]: updatedMessages });
    setNewMessage("");
    
    // Simulate doctor response
    setTimeout(() => {
      const doctorResponse = { 
        sender: 'doctor' as const, 
        message: "Thank you for your message. I've received it and will respond promptly. Your privacy is fully protected.", 
        timestamp: formattedTime 
      };
      
      setChatMessages(prev => ({
        ...prev,
        [appointmentId]: [...(prev[appointmentId] || []), doctorResponse]
      }));
    }, 1500);
  };

  const loadMessages = async (appointmentId: string) => {
    // For demo, simulate loading messages
    if (!chatMessages[appointmentId]) {
      const initialMessages = [
        { 
          sender: 'doctor' as const, 
          message: "Hello! How can I help you today?", 
          timestamp: "9:30" 
        }
      ];
      
      setChatMessages(prev => ({
        ...prev,
        [appointmentId]: initialMessages
      }));
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, appointmentId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(appointmentId);
    }
  };
  
  const acceptLabRecommendation = (labId: string) => {
    toast({
      title: "Lab Test Accepted",
      description: `Lab test #${labId.slice(-4)} has been accepted and will be scheduled. You'll receive further instructions.`,
    });
  };
  
  const scheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAppointment(true);

    // Simulate submission delay
    setTimeout(() => {
      toast({
        title: "Appointment Scheduled",
        description: "Your appointment request has been submitted.",
      });

      setNewAppointmentModalOpen(false);
      // Reset form state
      setAppointmentType("");
      setAppointmentSpecialty("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentLocation("");
      setAppointmentAddress("");
      setAppointmentNotes("");
      setAppointmentIsAnonymous(false);
      setIsSubmittingAppointment(false);
    }, 1000);
  };

  // Helper to check if an item is a lab test
  const isLabTest = (item: AppointmentOrLab): item is LabTest => {
    return 'testName' in item;
  };

  // Helper to check if an item is an appointment
  const isAppointment = (item: AppointmentOrLab): item is Appointment => {
    return 'doctorName' in item;
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Appointments & Labs
            </CardTitle>
            <CardDescription>
              Manage your healthcare appointments and lab recommendations
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="anonymous-mode" className="text-sm">
              <Lock className="h-3.5 w-3.5 inline-block mr-1 text-amber-500" />
              Anonymous Mode
            </Label>
            <Switch
              id="anonymous-mode"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="requested">Requested</TabsTrigger>
              <TabsTrigger value="labs">Lab Recommendations</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Dialog open={newAppointmentModalOpen} onOpenChange={setNewAppointmentModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span>New Appointment</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Appointment</DialogTitle>
                    <DialogDescription>
                      Schedule a new appointment with a healthcare provider
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={scheduleAppointment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointment-type">Appointment Type</Label>
                      <Select value={appointmentType} onValueChange={setAppointmentType} required>
                        <SelectTrigger id="appointment-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_PERSON">In Person</SelectItem>
                          <SelectItem value="VIDEO">Video Call</SelectItem>
                          <SelectItem value="PHONE">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Select value={appointmentSpecialty} onValueChange={setAppointmentSpecialty} required>
                        <SelectTrigger id="specialty">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="general">General Practice</SelectItem>
                          <SelectItem value="orthopedic">Orthopedics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-date">Preferred Date</Label>
                      <Input 
                        id="appointment-date" 
                        type="date" 
                        value={appointmentDate} 
                        onChange={(e) => setAppointmentDate(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-time">Preferred Time</Label>
                      <Input 
                        id="appointment-time" 
                        type="time" 
                        value={appointmentTime} 
                        onChange={(e) => setAppointmentTime(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-location">Location</Label>
                      <Input 
                        id="appointment-location" 
                        placeholder="e.g., City Medical Center" 
                        value={appointmentLocation} 
                        onChange={(e) => setAppointmentLocation(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-address">Address (Optional)</Label>
                      <Input 
                        id="appointment-address" 
                        placeholder="e.g., 123 Health St." 
                        value={appointmentAddress} 
                        onChange={(e) => setAppointmentAddress(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-reason">Reason</Label>
                      <Textarea 
                        id="appointment-reason" 
                        placeholder="Briefly describe the reason for this appointment" 
                        value={appointmentNotes} 
                        onChange={(e) => setAppointmentNotes(e.target.value)} 
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="appointment-anonymous" 
                        checked={appointmentIsAnonymous} 
                        onCheckedChange={(checked: boolean | string) => setAppointmentIsAnonymous(checked === true)} 
                      />
                      <Label htmlFor="appointment-anonymous" className="text-sm">Schedule anonymously</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmittingAppointment}>
                        {isSubmittingAppointment ? 'Scheduling...' : 'Schedule Appointment'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {["upcoming", "requested", "past", "labs"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {getAppointmentList(tabValue).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      {tabValue === "labs" ? (
                        <FlaskConical className="h-6 w-6 text-gray-400" />
                      ) : (
                        <CalendarIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No {tabValue === "labs" ? "lab recommendations" : tabValue + " appointments"}</h3>
                    <p className="text-gray-500 mb-4">
                      {tabValue === "upcoming" 
                        ? "You don't have any upcoming appointments scheduled." 
                        : tabValue === "requested"
                          ? "You haven't requested any appointments yet."
                          : tabValue === "labs" 
                            ? "You don't have any lab tests recommended."
                            : "You don't have any past appointments."}
                    </p>
                    {tabValue !== "past" && tabValue !== "labs" && (
                      <Button onClick={() => setNewAppointmentModalOpen(true)}>
                        Schedule an Appointment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                getAppointmentList(tabValue)
                  .filter(appointment => !isAnonymous || appointment.isAnonymous)
                  .map((appointment) => (
                  <Card key={appointment.id} className={`overflow-hidden ${appointment.isAnonymous ? 'border-amber-300' : ''}`}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-4 md:w-1/3 bg-blue-50 flex flex-col justify-center">
                          {appointment.isAnonymous && (
                            <Badge className="self-start mb-2 bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 hover:bg-amber-100">
                              <Lock className="h-3 w-3" />
                              Anonymous
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            {tabValue === "labs" ? (
                              <FlaskConical className="h-4 w-4 text-purple-500" />
                            ) : (
                              isAppointment(appointment) && getAppointmentTypeIcon(appointment.type)
                            )}
                            <span className="text-sm text-blue-700 capitalize">
                              {tabValue === "labs" ? "Lab Test" : isAppointment(appointment) && `${appointment.type} Appointment`}
                            </span>
                          </div>
                          <h3 className="font-medium text-lg mb-1">
                            {isLabTest(appointment) ? appointment.testName : appointment.doctorName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {isLabTest(appointment) ? 
                              `Recommended by: ${appointment.recommendedBy || appointment.orderedBy}` : 
                              appointment.specialty}
                          </p>
                          
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
                              <span className="text-sm text-gray-600">
                                {appointment.isAnonymous ? (
                                  <span className="flex items-center gap-1">
                                    <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                                    Anonymous Patient
                                  </span>
                                ) : (
                                  `Patient: ${user?.fullName || user?.username || "User"}`
                                )}
                              </span>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                            <p className="text-sm text-gray-600">{appointment.location}</p>
                            {appointment.address && (
                              <p className="text-sm text-gray-600">{appointment.address}</p>
                            )}
                          </div>
                          
                          {isLabTest(appointment) && appointment.reason && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Reason</h4>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                          )}
                          
                          {isAppointment(appointment) && appointment.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                              <p className="text-sm text-gray-600">{appointment.notes}</p>
                            </div>
                          )}
                          
                          {isAppointment(appointment) && appointment.status === "CONFIRMED" && tabValue !== "labs" && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {appointment.type === "VIDEO" && (
                                <Button className="gap-1">
                                  <Video className="h-4 w-4" />
                                  Join Video Call
                                </Button>
                              )}
                              <Button variant="outline" className="gap-1">
                                <AlertCircle className="h-4 w-4" />
                                Reschedule
                              </Button>
                            </div>
                          )}
                          
                          {isLabTest(appointment) && appointment.status === "RECOMMENDED" && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button 
                                className="gap-1"
                                onClick={() => acceptLabRecommendation(appointment.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Accept Recommendation
                              </Button>
                              <Button variant="outline" className="gap-1">
                                <MessageCircle className="h-4 w-4" />
                                Ask Questions
                              </Button>
                            </div>
                          )}
                          
                          {isAppointment(appointment) && tabValue !== "labs" && tabValue !== "past" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="mt-4 w-full gap-1"
                                  onClick={() => {
                                    loadMessages(appointment.id);
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  {appointment.isAnonymous ? "Private Chat" : "Message Doctor"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {appointment.isAnonymous && <Lock className="h-4 w-4 text-amber-500" />}
                                    {appointment.isAnonymous ? "Private Chat" : "Chat with"} {appointment.doctorName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {appointment.isAnonymous 
                                      ? "This chat is private and anonymous. Your identity is protected." 
                                      : "Send a message to your healthcare provider."}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 mb-3">
                                  {!chatMessages[appointment.id]?.length ? (
                                    <div className="text-center text-sm text-gray-500 p-4">
                                      <p>No messages yet. Start a conversation.</p>
                                      {appointment.isAnonymous && (
                                        <div className="mt-2 flex justify-center">
                                          <Badge variant="outline" className="flex items-center gap-1">
                                            <Shield className="h-3.5 w-3.5 text-green-500" />
                                            Your identity is protected
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    chatMessages[appointment.id].map((msg, idx) => (
                                      <div 
                                        key={idx} 
                                        className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        {msg.sender === 'doctor' && (
                                          <Avatar className="h-7 w-7 mr-2">
                                            <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                                              DR
                                            </AvatarFallback>
                                          </Avatar>
                                        )}
                                        <div 
                                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                            msg.sender === 'user' 
                                              ? 'bg-blue-100 text-blue-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          <p>{msg.message}</p>
                                          <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                                        </div>
                                        {msg.sender === 'user' && (
                                          <div className="h-7 w-7 ml-2 flex items-center justify-center rounded-full bg-blue-100">
                                            {appointment.isAnonymous ? (
                                              <EyeOff className="h-4 w-4 text-blue-600" />
                                            ) : (
                                              <User className="h-4 w-4 text-blue-600" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder={`Type your message${appointment.isAnonymous ? ' (anonymous)' : ''}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => handleChatKeyDown(e, appointment.id)}
                                    className="flex-1"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => sendMessage(appointment.id)}
                                  >
                                    <SendHorizontal className="h-5 w-5" />
                                  </Button>
                                </div>
                                
                                {appointment.isAnonymous && (
                                  <div className="mt-2 flex items-center justify-center">
                                    <Badge variant="outline" className="bg-amber-50 text-amber-800 flex items-center gap-1">
                                      <Lock className="h-3.5 w-3.5" />
                                      Anonymous messaging enabled
                                    </Badge>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {activeTab !== "past" && activeTab !== "labs" && getAppointmentList(tabValue).length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setNewAppointmentModalOpen(true)}
                >
                  {activeTab === "upcoming" 
                    ? "Schedule New Appointment" 
                    : "Submit New Request"}
                </Button>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 