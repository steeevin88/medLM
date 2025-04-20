"use client";
import { useUser } from "@clerk/nextjs";
import PatientOnboarding from "../components/PatientOnboarding";
import DoctorOnboarding from "../components/DoctorOnboarding";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return user?.publicMetadata.role == "patient" ? (
    <PatientOnboarding />
  ) : (
    <DoctorOnboarding />
  );
}
