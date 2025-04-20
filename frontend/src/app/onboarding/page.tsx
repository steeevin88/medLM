"use client";
import { useUser } from "@clerk/nextjs";
import PatientOnboarding from "../components/PatientOnboarding";
import DoctorOnboarding from "../components/DoctorOnboarding";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    } else if (isLoaded && user && !user.publicMetadata?.role) {
      // If user doesn't have a role, redirect to select-role
      router.push('/select-role');
    }
  }, [isLoaded, user, router]);

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

  // If user has no role, show loading while redirect happens
  if (!user?.publicMetadata?.role) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 animate-pulse">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Now we can safely check the specific role
  if (user.publicMetadata.role === "patient") {
    return <PatientOnboarding />;
  } else if (user.publicMetadata.role === "doctor") {
    return <DoctorOnboarding />;
  } else {
    // This shouldn't happen with the redirects above, but just in case
    router.push('/select-role');
    return null;
  }
}
