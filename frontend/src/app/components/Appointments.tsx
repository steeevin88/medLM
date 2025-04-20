"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, User, Phone, Video, MapPin, AlertCircle, Plus, Calendar, FlaskConical, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";

export default function Appointments() {
  const { user } = useUser();

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
        type: "in-person", // or "video" or "phone"
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
      default: 
        return <Badge>Unknown</Badge>;
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
      case "upcoming": 
        return appointments.upcoming;
      case "past": 
        return appointments.past;
      case "requested": 
        return appointments.requested;
      default: 
        return appointments.upcoming;
    }
  };

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
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="requested">Requested</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="labs">Recommended Labs</TabsTrigger>
            </TabsList>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </div>

          {["upcoming", "requested", "past"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {getAppointmentList(tabValue).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No {tabValue} appointments</h3>
                    <p className="text-gray-500 mb-4">
                      {tabValue === "upcoming" 
                        ? "You don't have any upcoming appointments scheduled." 
                        : tabValue === "requested"
                          ? "You haven't requested any appointments yet."
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
                            {getStatusBadge(appointment.status)}
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                            <p className="text-sm text-gray-600">{appointment.location}</p>
                            {appointment.address && (
                              <p className="text-sm text-gray-600">{appointment.address}</p>
                            )}
                          </div>
                          
                          {appointment.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                              <p className="text-sm text-gray-600">{appointment.notes}</p>
                            </div>
                          )}
                          
                          {appointment.status === "confirmed" && (
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {activeTab !== "past" && getAppointmentList(tabValue).length > 0 && (
                <Button variant="outline" className="w-full">
                  {activeTab === "upcoming" ? "Manage Appointments" : "Submit New Request"}
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