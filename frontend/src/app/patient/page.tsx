"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import PatientNavigation from "../components/PatientNavigation";
import PatientOnboarding from "../components/PatientOnboarding";
import DocumentUpload from "../components/DocumentUpload";
import MedLMAssistantChat from "../components/MedLMAssistantChat";
import HealthVitals from "../components/HealthVitals";
import ActivityExercise from "../components/ActivityExercise";
import Appointments from "../components/Appointments";
import PatientPrescriptions from "../components/PatientPrescriptions";
import SendDoctorReport from "../components/SendDoctorReport";
import { Card, CardContent } from "@/components/ui/card";
import { handleRoleRedirects } from "@/utils/roles";

// Create a client component that uses useSearchParams
function TabParamManager({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    // Set active tab based on URL parameter if present
    if (tabParam && ['chat', 'profile', 'documents', 'vitals', 'activity',
                      'appointments', 'prescriptions', 'doctor-report', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, setActiveTab]);

  return null;
}

export default function PatientPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    handleRoleRedirects(user, isLoaded, 'patient', router);
  }, [isLoaded, user, router]);

  // Update URL when active tab changes
  useEffect(() => {
    if (activeTab !== 'chat') {
      router.push(`/patient?tab=${activeTab}`, { scroll: false });
    } else {
      router.push('/patient', { scroll: false });
    }
  }, [activeTab, router]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderActiveTabContent = () => {
    switch(activeTab) {
      case 'chat':
        return <MedLMAssistantChat />;
      case 'profile':
        return <PatientOnboarding />;
      case 'documents':
        return <DocumentUpload />;
      case 'vitals':
        return <HealthVitals />;
      case 'activity':
        return <ActivityExercise />;
      case 'appointments':
        return <Appointments />;
      case 'prescriptions':
        return <PatientPrescriptions />;
      case 'doctor-report':
        return <SendDoctorReport />;
      case 'settings':
        return (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Settings</h3>
                <p className="text-muted-foreground">Settings page is coming soon.</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <MedLMAssistantChat />;
    }
  };

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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Suspense boundary for TabParamManager */}
      <Suspense fallback={null}>
        <TabParamManager setActiveTab={setActiveTab} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)]">
        {/* Left sidebar with navigation */}
        <div className="md:col-span-3 lg:col-span-2 mb-4 md:mb-0 md:h-full">
          <PatientNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Main content area */}
        <div className="md:col-span-9 lg:col-span-10 flex-1 md:h-full overflow-auto">
          <div className="h-full overflow-auto">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
