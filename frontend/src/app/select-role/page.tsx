"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

export default function SelectRolePage() {
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if user data is loaded and role is already set, or if not loaded/logged in
  if (isLoaded && user?.publicMetadata?.role) {
    router.push('/'); // Already has a role, go to main dashboard
    return null;
  }
  if (isLoaded && !user) {
      router.push('/'); // Not logged in, go home
      return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRole || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set role');
      }

      // Role set successfully, force refresh user data and redirect
      await user.reload();
      router.push('/'); // Redirect to main page, which will show the correct dashboard

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select Your Role</CardTitle>
          <CardDescription>Please choose how you&apos;ll be using MedLM Connect.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <RadioGroup
              value={selectedRole ?? undefined}
              onValueChange={setSelectedRole}
              className="space-y-4 mb-6"
            >
              <Label
                htmlFor="doctor"
                className={`flex flex-col space-y-1 border rounded-md p-4 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-muted`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="doctor" id="doctor" />
                  <span className="font-medium">I am a Doctor</span>
                </div>
                <span className="pl-7 text-sm text-muted-foreground">
                  Access tools for patient consultations and management.
                </span>
              </Label>

              <Label
                htmlFor="patient"
                className={`flex flex-col space-y-1 border rounded-md p-4 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-muted`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="patient" id="patient" />
                  <span className="font-medium">I am a Patient</span>
                </div>
                <span className="pl-7 text-sm text-muted-foreground">
                  Connect with doctors and manage your health information.
                </span>
              </Label>
            </RadioGroup>

            {error && (
              <p className="text-destructive text-sm mb-4 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!selectedRole || isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Role
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
