"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DoctorDashboard from '../components/DoctorDashboard';

export default function DoctorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasHealthProfile, setHasHealthProfile] = useState(false);
  
  useEffect(() => {
    // Check if user has completed health profile
    const checkUserProfile = () => {
      try {
        const storedProfile = localStorage.getItem('userHealthProfile');
        
        if (storedProfile) {
          console.log('Found health profile, showing doctor dashboard');
          setHasHealthProfile(true);
        } else {
          console.log('No health profile found, redirecting to onboarding');
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error checking health profile:', error);
        router.push('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserProfile();
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!hasHealthProfile) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
      <DoctorDashboard />
    </div>
  );
} 