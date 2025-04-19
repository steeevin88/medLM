"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Your Role</h1>
        <p className="text-gray-600 mb-6 text-center">Please choose how you'll be using MedLM Connect.</p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <label
              htmlFor="doctor"
              className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedRole === 'doctor' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input
                type="radio"
                id="doctor"
                name="role"
                value="doctor"
                checked={selectedRole === 'doctor'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium text-gray-700">I am a Doctor</span>
              <p className="text-sm text-gray-500 mt-1">Access tools for patient consultations and management.</p>
            </label>

            <label
              htmlFor="patient"
              className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedRole === 'patient' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input
                type="radio"
                id="patient"
                name="role"
                value="patient"
                checked={selectedRole === 'patient'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium text-gray-700">I am a Patient</span>
              <p className="text-sm text-gray-500 mt-1">Connect with doctors and manage your health information.</p>
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!selectedRole || isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Confirm Role'}
          </button>
        </form>
      </div>
    </div>
  );
}
