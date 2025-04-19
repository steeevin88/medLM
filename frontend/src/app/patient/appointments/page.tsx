"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  VideoIcon, 
  MessageSquare, 
  User, 
  Plus, 
  CalendarPlus 
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  date: string; // ISO string
  time: string;
  type: "video" | "chat";
  status: "upcoming" | "completed" | "cancelled";
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "2023-12-15",
      time: "10:00 AM",
      type: "video",
      status: "upcoming",
    },
    {
      id: "2",
      doctorName: "Dr. Michael Chen",
      specialty: "Dermatology",
      date: "2023-12-10",
      time: "2:30 PM",
      type: "chat",
      status: "upcoming",
    },
    {
      id: "3",
      doctorName: "Dr. Emily Taylor",
      specialty: "General Practice",
      date: "2023-11-28",
      time: "9:15 AM",
      type: "video",
      status: "completed",
    },
  ]);

  const upcomingAppointments = appointments.filter(
    (app) => app.status === "upcoming"
  );
  const pastAppointments = appointments.filter(
    (app) => app.status !== "upcoming"
  );

  const cancelAppointment = (id: string) => {
    setAppointments(
      appointments.map((app) =>
        app.id === id ? { ...app, status: "cancelled" } : app
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Book a consultation with a healthcare provider
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select>
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Practice</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="psychiatry">Psychiatry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select disabled>
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder">Please select a specialty first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Select>
                  <SelectTrigger id="date">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomorrow">Tomorrow, Dec 8</SelectItem>
                    <SelectItem value="next-week">Monday, Dec 11</SelectItem>
                    <SelectItem value="next-week-2">Tuesday, Dec 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select disabled>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder">Please select a date first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Schedule Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((app) => (
                  <Card key={app.id} className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{app.doctorName}</h3>
                          <p className="text-sm text-muted-foreground">{app.specialty}</p>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>{new Date(app.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span>{app.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              {app.type === "video" ? (
                                <VideoIcon className="h-4 w-4 text-blue-600" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="capitalize">{app.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full">
                            {app.type === "video" ? "Join Call" : "Open Chat"}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-destructive hover:text-destructive/80"
                            onClick={() => cancelAppointment(app.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule New Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>{/* Same content as above dialog */}</DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((app) => (
                  <Card
                    key={app.id}
                    className={`border-l-4 ${
                      app.status === "completed"
                        ? "border-green-500"
                        : "border-gray-400"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{app.doctorName}</h3>
                          <p className="text-sm text-muted-foreground">{app.specialty}</p>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span>{new Date(app.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span>{app.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              {app.type === "video" ? (
                                <VideoIcon className="h-4 w-4 text-gray-600" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-gray-600" />
                              )}
                              <span className="capitalize">{app.type}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                app.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          {app.status === "completed" && (
                            <Button variant="outline" size="sm">
                              View Summary
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past appointments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 