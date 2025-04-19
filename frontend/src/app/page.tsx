"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Footer from "./components/Footer";
import LandingHero from "./components/LandingHero";

export default function Home() {
  const router = useRouter();
  
  // When signed in, redirect to the appropriate dashboard
  useEffect(() => {
    const handleSignedInRedirect = async () => {
      // Check if window exists (to avoid SSR issues)
      if (typeof window !== "undefined") {
        try {
          // This is just a client-side check - you'd use Clerk hooks in a real component
          const isSignedIn = localStorage.getItem("clerk-user-session") !== null;
          
          if (isSignedIn) {
            // Redirect to patient dashboard
            // In a real app with multiple roles, you would check the role first
            router.push('/patient');
          }
        } catch (error) {
          console.error("Error checking auth state:", error);
        }
      }
    };
    
    handleSignedInRedirect();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow">
        <SignedOut>
          <LandingHero />
        </SignedOut>
        <SignedIn>
          <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 animate-pulse">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </SignedIn>
      </main>

      <Footer />
    </div>
  );
}
