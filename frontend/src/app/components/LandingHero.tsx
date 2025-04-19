"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton } from "@clerk/nextjs";
// import { Icons } from '@/components/icons';

export default function LandingHero() {
  // Remove state setting logic - Clerk handles authentication
  // const { setUserRole, setIsAuthenticated } = useUser();

  // Remove these handlers - login flow is handled by Clerk's SignInButton
  // const handleDoctorLogin = () => { ... };
  // const handlePatientLogin = () => { ... };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy-First Healthcare Access for <span className="text-blue-600">Everyone</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect anonymously with healthcare providers, get AI-powered insights, and maintain control of your medical data.
            </p>

            {/* Sign In Info/Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <p className="text-gray-700 pt-2">Please sign in to access your dashboard.</p>
              {/* Add SignInButton wrapped in Shadcn Button if desired */}
              <SignInButton mode="modal">
                <Button size="lg">Sign In / Sign Up</Button>
              </SignInButton>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600">Anonymized doctor-patient consultations</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600">AI-powered symptom analysis</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600">Full control of your medical data sharing</span>
            </div>
          </div>

          {/* AI Assistant Demo Card */}
          <div className="relative">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </div>
                <CardTitle>AI Health Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-foreground">I&apos;ve been experiencing headaches and dizziness for the past week.</p>
                </div>

                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-blue-800">Based on your symptoms, I&apos;d like to ask a few follow-up questions:</p>
                  <ul className="mt-2 space-y-1 text-blue-800">
                    <li>• Are the headaches constant or intermittent?</li>
                    <li>• Does anything make the dizziness worse?</li>
                    <li>• Have you experienced any changes in vision?</li>
                  </ul>
                </div>

                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-gray-700">The headaches come and go, and the dizziness gets worse when I stand up quickly.</p>
                </div>

                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-blue-800">
                    Your symptoms could be related to several conditions including dehydration, low blood pressure, or migraine.
                    I recommend connecting with a specialist anonymously for further evaluation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="hidden md:block absolute -top-6 -right-6 w-24 h-24 bg-yellow-100 rounded-full z-0"></div>
            <div className="hidden md:block absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100 rounded-full z-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
