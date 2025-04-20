"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, User, Phone, Video, MapPin, AlertCircle, Plus, Calendar, Lock, FlaskConical, MessageCircle, Shield, EyeOff, SendHorizontal } from "lucide-react";
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
  doctorName: string; // Note: API might return nested doctor object
  specialty: string;  // Note: API might return nested doctor object
  date: string;      // Note: API might return Date object
  time: string;
  location: string;
  address?: string;
  type: string;      // Note: API might return AppointmentType enum
  notes: string;
  status: string;     // Note: API might return AppointmentStatus enum
  isAnonymous: boolean;
}

// Frontend LabTest type (used for rendering)
interface LabTest {
  id: string;
  testName: string;
  date: string;      // Note: API might return Date object
  time: string;
  location: string;
  address?: string;
  status: string;     // Note: API might return LabTestStatus enum
  reason: string;
  orderedBy: string;
  isAnonymous: boolean;
}

// Type matching the structure returned by GET /api/appointments
// Adjust based on the actual include/select in your API route
interface ApiAppointment {
  id: string;
  date: string | Date; // API might send string or Date
  time: string;
  location: string;
  address?: string;
  notes?: string;
  type: string; // Should match AppointmentType enum values
  status: string; // Should match AppointmentStatus enum values
  isAnonymous: boolean;
  specialtyType?: string; // Included from schema
  patientId: string;
  doctorId: string;
  conversationId?: string;
  conversation?: { // Based on include in GET /api/appointments
    id: string;
    messages?: { createdAt: string | Date }[];
  } | null;
  doctor?: { // Based on include in GET /api/appointments
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    specialization?: string | null;
  } | null;
  // Add other fields returned by your API if needed
}

// Type matching the structure returned by GET /api/labs
interface ApiLabTest {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  testName: string;
  date: string | Date;
  time: string;
  location: string;
  address?: string | null;
  reason?: string | null;
  status: string; // Should match LabTestStatus enum
  isAnonymous: boolean;
  results?: string | null;
  patientId: string;
  orderedBy: string;
  obfuscatedUserId?: string | null;
  // Add other fields returned by your API if needed
}

type AppointmentOrLab = Appointment | LabTest;

export default function Appointments() {
  const { user } = useUser();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{[key: string]: {sender: 'user' | 'doctor', message: string, timestamp: string}[]}>({});
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);

  // State for the Schedule Lab modal form
  const [labTestType, setLabTestType] = useState<string>("");
  const [labDate, setLabDate] = useState<string>("");
  const [labTime, setLabTime] = useState<string>("");
  const [labReason, setLabReason] = useState<string>("");
  const [labIsAnonymous, setLabIsAnonymous] = useState<boolean>(false);
  const [isSubmittingLab, setIsSubmittingLab] = useState<boolean>(false);
  const [labLocation, setLabLocation] = useState<string>("");
  const [labOrderedBy, setLabOrderedBy] = useState<string>("");

  // State for the Schedule Appointment modal form
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [appointmentSpecialty, setAppointmentSpecialty] = useState<string>("");
  const [appointmentDoctorId, setAppointmentDoctorId] = useState<string>("sample-doctor-id");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [appointmentLocation, setAppointmentLocation] = useState<string>("");
  const [appointmentAddress, setAppointmentAddress] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [appointmentIsAnonymous, setAppointmentIsAnonymous] = useState<boolean>(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState<boolean>(false);

  // Placeholder for fetched data (replace with actual fetching logic)
  const [appointmentsData, setAppointmentsData] = useState<{
    upcoming: Appointment[];
    past: Appointment[];
    requested: Appointment[];
    labs: LabTest[];
  }>({ upcoming: [], past: [], requested: [], labs: [] });

  const [activeTab, setActiveTab] = useState('upcoming');

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed": 
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case "pending": 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "completed": 
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
      case "cancelled": 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case "scheduled": 
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      default: 
        return <Badge>Unknown</Badge>;
    }
  };

  const getAppointmentList = (type: string): AppointmentOrLab[] => {
    // Use fetched data instead of dummy data
    switch(type) {
      case "upcoming": return appointmentsData.upcoming;
      case "past": return appointmentsData.past;
      case "requested": return appointmentsData.requested;
      case "labs": return appointmentsData.labs;
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
    
    try {
      // Find matching appointment from our local data
      let selectedAppointment: AppointmentOrLab | undefined;
      for (const tab of ["upcoming", "requested", "past"]) {
        selectedAppointment = getAppointmentList(tab).find(a => a.id === appointmentId);
        if (selectedAppointment) break;
      }
      
      if (!selectedAppointment || !isAppointment(selectedAppointment)) {
        throw new Error("Appointment not found");
      }
      
      // Send message to the API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          content: newMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Clear input field
      setNewMessage("");
      
      // For demo purposes, simulate doctor response
      // In a real app, the doctor would receive the message and respond later
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
        
        // In a real app, this would be sent by the doctor, not simulated
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert the optimistic update if there was an error
      setChatMessages(prev => ({ 
        ...prev,
        [appointmentId]: newMessages
      }));
      
      // Show error to user (you could add a toast notification here)
      alert('Failed to send message. Please try again.');
    }
  };

  // Load existing messages when a chat is opened
  const loadMessages = async (appointmentId: string) => {
    try {
      // Find matching appointment from our local data
      let selectedAppointment: AppointmentOrLab | undefined;
      for (const tab of ["upcoming", "requested", "past"]) {
        selectedAppointment = getAppointmentList(tab).find(a => a.id === appointmentId);
        if (selectedAppointment) break;
      }
      
      if (!selectedAppointment || !isAppointment(selectedAppointment)) {
        throw new Error("Appointment not found");
      }
      
      // First check if we have a conversation for this appointment
      const appointmentResponse = await fetch(`/api/appointments?appointmentId=${appointmentId}`, {
        method: 'GET',
      });
      
      if (!appointmentResponse.ok) {
        throw new Error('Failed to fetch appointment details');
      }
      
      const appointmentData = await appointmentResponse.json();
      const conversationId = appointmentData.appointment?.conversation?.id;
      
      if (!conversationId) {
        // No conversation exists yet, nothing to load
        return;
      }
      
      // Fetch messages for this conversation
      const response = await fetch(`/api/chat/message?conversationId=${conversationId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Format messages for the UI
      const formattedMessages = data.messages.map((msg: { sentByPatient: boolean; content: string; createdAt: string }) => ({
        sender: msg.sentByPatient ? 'user' as const : 'doctor' as const,
        message: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      
      // Update state with fetched messages
      setChatMessages(prev => ({
        ...prev,
        [appointmentId]: formattedMessages
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      // Show error to user (you could add a toast notification here)
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, appointmentId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(appointmentId);
    }
  };
  
  const scheduleLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmittingLab) return;

    console.log("[DEBUG] Starting scheduleLab...");
    const labData = {
      testName: labTestType,
      date: labDate,
      time: labTime,
      location: labLocation,
      reason: labReason,
      orderedBy: labOrderedBy,
      isAnonymous: labIsAnonymous
    };
    console.log("[DEBUG] Lab form data:", labData);

    setIsSubmittingLab(true);

    // Basic validation (add more as needed)
    if (!labTestType || !labDate || !labTime || !labLocation || !labOrderedBy) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required lab test details (type, date, time, location, ordered by).",
        variant: "destructive",
      });
      setIsSubmittingLab(false);
      return;
    }

    try {
      console.log("[DEBUG] Sending POST request to /api/labs...");
      const response = await fetch('/api/labs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labData),
      });

      const responseData = await response.json();
      console.log("[DEBUG] Lab creation response:", responseData);
      
      // Save the created lab test to localStorage for debugging
      if (responseData.labTest) {
        window.localStorage.setItem('lastCreatedLabTest', JSON.stringify(responseData.labTest));
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to schedule lab test');
      }

      toast({
        title: "Lab Test Scheduled",
        description: "Your lab test request has been submitted.",
      });

      setLabModalOpen(false);
      // Reset form state
      setLabTestType("");
      setLabDate("");
      setLabTime("");
      setLabReason("");
      setLabIsAnonymous(false);
      setLabLocation("");
      setLabOrderedBy("");
      
      // Refresh the appointments/labs list
      console.log("[DEBUG] Refreshing data after lab creation");
      await fetchAppointmentsAndLabs();

    } catch (error) {
      console.error('[DEBUG] Error scheduling lab test:', error);
      toast({
        title: "Error Scheduling Lab Test",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLab(false);
    }
  };
  
  const scheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmittingAppointment) return;

    console.log("[DEBUG] Starting scheduleAppointment...");
    const appointmentData = {
      doctorId: appointmentDoctorId,
      date: appointmentDate,
      time: appointmentTime,
      location: appointmentLocation,
      address: appointmentAddress || undefined,
      type: appointmentType,
      notes: appointmentNotes || undefined,
      specialtyType: appointmentSpecialty,
      isAnonymous: appointmentIsAnonymous,
    };
    console.log("[DEBUG] Appointment form data:", appointmentData);

    setIsSubmittingAppointment(true);

    // Basic validation
    if (!appointmentType || !appointmentSpecialty || !appointmentDate || !appointmentTime || !appointmentLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required appointment details (type, specialty, date, time, location).",
        variant: "destructive",
      });
      setIsSubmittingAppointment(false);
      return;
    }

    try {
      console.log("[DEBUG] Sending POST request to /api/appointments...");
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const responseData = await response.json();
      console.log("[DEBUG] Appointment creation response:", responseData);
      
      // Save the created appointment to localStorage for debugging
      if (responseData.appointment) {
        window.localStorage.setItem('lastCreatedAppointment', JSON.stringify(responseData.appointment));
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to schedule appointment');
      }

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
      
      // Refresh the appointments/labs list
      console.log("[DEBUG] Refreshing data after appointment creation");
      await fetchAppointmentsAndLabs();

    } catch (error) {
      console.error('[DEBUG] Error scheduling appointment:', error);
      toast({
        title: "Error Scheduling Appointment",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  // Helper to check if an item is a lab test
  const isLabTest = (item: AppointmentOrLab): item is LabTest => {
    return 'testName' in item;
  };

  // Helper to check if an item is an appointment
  const isAppointment = (item: AppointmentOrLab): item is Appointment => {
    return 'doctorName' in item;
  };

  // Implement fetch function with proper error handling and data mapping
  const fetchAppointmentsAndLabs = async () => {
    console.log("[DEBUG] Starting fetchAppointmentsAndLabs...");
    try {
      // Fetch appointments
      console.log("[DEBUG] Fetching appointments from /api/appointments...");
      const appointmentsRes = await fetch('/api/appointments');
      let appointmentsData: ApiAppointment[] = [];
      
      if (appointmentsRes.ok) {
        const appointmentsResult = await appointmentsRes.json();
        console.log("[DEBUG] Appointments API response:", appointmentsResult);
        // Use the defined ApiAppointment type
        appointmentsData = appointmentsResult.appointments || [];
        console.log("[DEBUG] Parsed appointments data:", appointmentsData);
      } else {
        console.error(`[DEBUG] Failed to fetch appointments: ${appointmentsRes.statusText}`);
        // Try to get error details
        try {
          const errorDetails = await appointmentsRes.json();
          console.error("[DEBUG] Appointments API error details:", errorDetails);
        } catch {
          // Using empty catch block is fine
          console.error("[DEBUG] Could not parse error response from appointments API");
        }
      }

      // Fetch lab tests
      console.log("[DEBUG] Fetching lab tests from /api/labs...");
      const labsRes = await fetch('/api/labs');
      let labsData: ApiLabTest[] = [];
      
      if (labsRes.ok) {
        const labsResult = await labsRes.json();
        console.log("[DEBUG] Labs API response:", labsResult);
        // Get the lab tests from the response
        labsData = labsResult.labTests || [];
        console.log("[DEBUG] Parsed lab tests data:", labsData);
      } else {
        console.error(`[DEBUG] Failed to fetch lab tests: ${labsRes.statusText}`);
        // Try to get error details
        try {
          const errorDetails = await labsRes.json();
          console.error("[DEBUG] Labs API error details:", errorDetails);
        } catch {
          // Using empty catch block is fine
          console.error("[DEBUG] Could not parse error response from labs API");
        }
      }

      // If both requests failed, show a toast
      if (!appointmentsRes.ok && !labsRes.ok) {
        toast({
          title: "Error Fetching Data",
          description: "Could not load appointments and labs. Please try again later.",
          variant: "destructive",
        });
        return; // Exit without updating state
      }

      // Process fetched appointments
      const now = new Date();
      const upcoming: Appointment[] = [];
      const past: Appointment[] = [];
      const requested: Appointment[] = [];

      appointmentsData.forEach(appt => {
        // Map ApiAppointment to the frontend Appointment type
        const frontendAppt: Appointment = {
          id: String(appt.id),
          doctorName: `${appt.doctor?.firstName || ''} ${appt.doctor?.lastName || ''}`.trim() || 'Unknown Doctor',
          specialty: appt.doctor?.specialization || appt.specialtyType || 'Unknown Specialty',
          date: typeof appt.date === 'string' ? appt.date : new Date(appt.date).toLocaleDateString(), // Format date
          time: appt.time,
          location: appt.location,
          address: appt.address,
          type: appt.type,
          notes: appt.notes || '',
          status: appt.status,
          isAnonymous: appt.isAnonymous,
        };

        // Categorize by status and date
        if (appt.status === 'REQUESTED') {
          requested.push(frontendAppt);
        } else if (appt.status === 'COMPLETED' || appt.status === 'CANCELLED') {
          past.push(frontendAppt);
        } else {
          const apptDate = new Date(appt.date);
          if (!isNaN(apptDate.getTime())) { // Check if date is valid
            if (apptDate >= now) {
              upcoming.push(frontendAppt);
            } else {
              past.push(frontendAppt);
            }
          } else {
            console.warn("Invalid date found for appointment:", appt.id, appt.date);
            past.push(frontendAppt); // Default to past if date is invalid
          }
        }
      });

      // Process fetched labs - map from API format to frontend format
      const labs: LabTest[] = labsData.map(lab => ({
        id: String(lab.id),
        testName: lab.testName,
        date: typeof lab.date === 'string' ? lab.date : new Date(lab.date).toLocaleDateString(),
        time: lab.time,
        location: lab.location,
        address: lab.address || undefined, // Convert null to undefined to match LabTest type
        status: lab.status,
        reason: lab.reason || '',
        orderedBy: lab.orderedBy,
        isAnonymous: lab.isAnonymous,
      }));

      console.log("Categorized data:", { upcoming, past, requested, labs });

      // Update state with the processed data
      setAppointmentsData({
        upcoming,
        past,
        requested,
        labs,
      });

    } catch (error) {
      console.error("Error fetching appointments and labs:", error);
      toast({
        title: "Error Fetching Data",
        description: "Could not load appointments and labs. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Add a function to fetch available doctors
  const fetchAvailableDoctors = async () => {
    try {
      console.log("[DEBUG] Fetching available doctors...");
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        console.log("[DEBUG] Available doctors:", data.doctors);
        // If we have doctors, update the doctor ID
        if (data.doctors && data.doctors.length > 0) {
          setAppointmentDoctorId(data.doctors[0].id);
        }
      } else {
        console.error("[DEBUG] Failed to fetch doctors:", response.statusText);
      }
    } catch (error) {
      console.error("[DEBUG] Error fetching doctors:", error);
    }
  };

  // Call fetchAppointmentsAndLabs when component mounts
  useEffect(() => {
    fetchAppointmentsAndLabs();
    fetchAvailableDoctors();
  }, []);

  // Replace the useEffect for dummy data to always display the recently created lab test
  useEffect(() => {
    // Debug: Directly check and display the lab test that was just created
    const debugMode = true;
    
    if (debugMode && window.localStorage.getItem('lastCreatedLabTest')) {
      try {
        const lastLabTest = JSON.parse(window.localStorage.getItem('lastCreatedLabTest') || '{}');
        console.log('[DEBUG] Found last created lab test in localStorage:', lastLabTest);
        
        // Force display the lab test
        const formattedLabTest: LabTest = {
          id: lastLabTest.id || 'debug-id',
          testName: lastLabTest.testName || 'Debug Test',
          date: lastLabTest.date 
            ? (typeof lastLabTest.date === 'string' 
                ? lastLabTest.date 
                : new Date(lastLabTest.date).toLocaleDateString())
            : new Date().toLocaleDateString(),
          time: lastLabTest.time || '12:00',
          location: lastLabTest.location || 'Debug Location',
          address: lastLabTest.address,
          status: lastLabTest.status || 'SCHEDULED',
          reason: lastLabTest.reason || 'Debug reason',
          orderedBy: lastLabTest.orderedBy || 'Debug Doctor',
          isAnonymous: !!lastLabTest.isAnonymous,
        };
        
        // Add this lab test to the existing list if it's not already there
        if (!appointmentsData.labs.some(lab => lab.id === formattedLabTest.id)) {
          console.log('[DEBUG] Adding forced lab test to display:', formattedLabTest);
          setAppointmentsData(prev => ({
            ...prev,
            labs: [...prev.labs, formattedLabTest],
          }));
        }
      } catch (err) {
        console.error('[DEBUG] Error parsing last created lab test:', err);
      }
    }
    
    // If no data at all, add dummy data (from previous code)
    else if (appointmentsData.upcoming.length === 0 &&
        appointmentsData.past.length === 0 &&
        appointmentsData.requested.length === 0 &&
        appointmentsData.labs.length === 0) {
      
      console.log("No data from API, adding dummy data for preview");
      
      // Example dummy data - this will help visualize UI until backend is fully connected
      setAppointmentsData({
        upcoming: [{
          id: "dummy-1",
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
        }],
        past: [{
          id: "dummy-3",
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
        }],
        requested: [{
          id: "dummy-6",
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
        }],
        labs: [{
          id: "dummy-lab-101",
          testName: "Complete Blood Count",
          date: "June 30, 2025",
          time: "8:00 AM",
          location: "MedLab Testing Center",
          address: "456 Health Pkwy",
          status: "SCHEDULED",
          reason: "Annual checkup",
          orderedBy: "Dr. Sarah Johnson",
          isAnonymous: true
        }]
      });
    }
  }, [appointmentsData]);

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
              Manage your healthcare appointments and lab tests
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
              <TabsTrigger value="labs">Lab Tests</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Dialog open={labModalOpen} onOpenChange={setLabModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <FlaskConical className="h-4 w-4" />
                    <span>Schedule Lab</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Lab Test</DialogTitle>
                    <DialogDescription>
                      Schedule a laboratory test or procedure
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={scheduleLab} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-type">Test Type</Label>
                      <Select value={labTestType} onValueChange={setLabTestType} required>
                        <SelectTrigger id="test-type">
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blood">Blood Panel</SelectItem>
                          <SelectItem value="urine">Urinalysis</SelectItem>
                          <SelectItem value="imaging">Imaging</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-date">Preferred Date</Label>
                      <Input id="test-date" type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-time">Preferred Time</Label>
                      <Input id="test-time" type="time" value={labTime} onChange={(e) => setLabTime(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-location">Location</Label>
                      <Input id="test-location" placeholder="e.g., MedLab Testing Center" value={labLocation} onChange={(e) => setLabLocation(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-ordered-by">Ordered By</Label>
                      <Input id="test-ordered-by" placeholder="e.g., Dr. Smith or Self-requested" value={labOrderedBy} onChange={(e) => setLabOrderedBy(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-reason">Reason</Label>
                      <Textarea id="test-reason" placeholder="Briefly describe why you need this test" value={labReason} onChange={(e) => setLabReason(e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="test-anonymous" checked={labIsAnonymous} onCheckedChange={(checked: boolean | string) => setLabIsAnonymous(checked === true)} />
                      <Label htmlFor="test-anonymous" className="text-sm">Schedule anonymously</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmittingLab}>
                        {isSubmittingLab ? 'Scheduling...' : 'Schedule Test'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No {tabValue === "labs" ? "lab tests" : tabValue + " appointments"}</h3>
                    <p className="text-gray-500 mb-4">
                      {tabValue === "upcoming" 
                        ? "You don't have any upcoming appointments scheduled." 
                        : tabValue === "requested"
                          ? "You haven't requested any appointments yet."
                          : tabValue === "labs" 
                            ? "You don't have any lab tests scheduled."
                            : "You don't have any past appointments."}
                    </p>
                    {tabValue !== "past" && (
                      <Button onClick={() => tabValue === "labs" ? setLabModalOpen(true) : setNewAppointmentModalOpen(true)}>
                        {tabValue === "labs" ? "Schedule a Lab Test" : "Schedule an Appointment"}
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
                            {isLabTest(appointment) ? `Ordered by: ${appointment.orderedBy}` : appointment.specialty}
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
                          
                          {isAppointment(appointment) && appointment.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                              <p className="text-sm text-gray-600">{appointment.notes}</p>
                            </div>
                          )}
                          
                          {isAppointment(appointment) && appointment.status === "confirmed" && tabValue !== "labs" && (
                            <div className="mt-4 flex flex-wrap gap-2">
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
              
              {activeTab !== "past" && getAppointmentList(tabValue).length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => activeTab === "labs" ? setLabModalOpen(true) : setNewAppointmentModalOpen(true)}
                >
                  {activeTab === "labs" 
                    ? "Schedule Another Test" 
                    : activeTab === "upcoming" 
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