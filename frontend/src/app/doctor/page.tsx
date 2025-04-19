"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import DoctorDashboard from "../components/DoctorDashboard";

export default function DoctorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      // Redirect to homepage if not signed in
      if (!user) {
        router.push('/');
        return;
      }
      
      // Redirect to role selection if no role set
      if (!user.publicMetadata?.role) {
        router.push('/select-role');
        return;
      }
      
      // Redirect to patient dashboard if user is a patient
      if (user.publicMetadata.role !== 'doctor') {
        router.push('/patient');
        return;
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
      <DoctorDashboard />
    </div>
  );
} 