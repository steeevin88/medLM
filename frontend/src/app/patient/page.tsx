"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivitySquare, Calendar, ClipboardList, FileUp, User } from "lucide-react";
import Link from "next/link";

type HealthStat = {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
};

export default function PatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock health data
  const [healthStats, setHealthStats] = useState<HealthStat[]>([
    { label: "Heart Rate", value: 72, unit: "bpm", change: 2 },
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", change: -5 },
    { label: "Weight", value: 68.5, unit: "kg", change: -0.5 },
    { label: "Activity", value: 6500, unit: "steps", change: 1200 },
  ]);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Welcome to Your Health Dashboard</h2>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/patient/profile">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium">Update Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your health information</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/patient/appointments">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-medium">Appointments</h3>
                <p className="text-sm text-muted-foreground">Schedule a consultation</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/patient/records">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FileUp className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-medium">Upload Records</h3>
                <p className="text-sm text-muted-foreground">Add medical documents</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
      
      {/* Health Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivitySquare className="h-5 w-5 text-blue-600" />
            Health Statistics
          </CardTitle>
          <CardDescription>Your recent health measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {healthStats.map((stat, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1">
                    {stat.value} {stat.unit && <span className="text-sm font-normal">{stat.unit}</span>}
                  </div>
                  {stat.change && (
                    <div className={`text-xs mt-1 ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)} from last measurement
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <h3 className="font-medium">Dr. Sarah Johnson</h3>
                  <p className="text-sm text-muted-foreground">Cardiology</p>
                  <p className="text-sm">Dec 15, 2023 · 10:00 AM</p>
                </div>
                <Link href="/patient/appointments">
                  <Button size="sm" variant="outline">Details</Button>
                </Link>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Dr. Michael Chen</h3>
                  <p className="text-sm text-muted-foreground">Dermatology</p>
                  <p className="text-sm">Dec 10, 2023 · 2:30 PM</p>
                </div>
                <Link href="/patient/appointments">
                  <Button size="sm" variant="outline">Details</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 h-10 w-10 rounded-md flex items-center justify-center text-red-700">
                    PDF
                  </div>
                  <div>
                    <h3 className="font-medium">Blood Test Results</h3>
                    <p className="text-sm text-muted-foreground">Oct 15, 2023</p>
                  </div>
                </div>
                <Link href="/patient/records">
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 h-10 w-10 rounded-md flex items-center justify-center text-blue-700">
                    IMG
                  </div>
                  <div>
                    <h3 className="font-medium">X-Ray Report</h3>
                    <p className="text-sm text-muted-foreground">Sep 22, 2023</p>
                  </div>
                </div>
                <Link href="/patient/records">
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 