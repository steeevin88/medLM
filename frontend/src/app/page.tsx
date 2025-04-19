"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingHero from "./components/LandingHero";
import DoctorDashboard from "./components/DoctorDashboard";
import PatientDashboard from "./components/PatientDashboard";

// Component to handle rendering based on role inside SignedIn
function RoleBasedDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && user && !user.publicMetadata?.role) {
      router.push('/select-role');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user || (user && !user.publicMetadata?.role)) {
    return <div>Loading user data or redirecting...</div>;
  }

  const userRole = user.publicMetadata.role as string;

  if (userRole === 'doctor') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
        <DoctorDashboard />
      </div>
    );
  } else if (userRole === 'patient') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>
        <PatientDashboard />
      </div>
    );
  } else {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-700">Invalid State</h1>
        <p>An unexpected error occurred. Please try signing out and in again.</p>
      </div>
    );
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <SignedOut>
          <LandingHero />
        </SignedOut>
        <SignedIn>
          <RoleBasedDashboard />
        </SignedIn>
      </main>

      <Footer />
    </div>
  );
}
