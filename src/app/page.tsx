"use client";

import { useUser } from "./context/UserContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingHero from "./components/LandingHero";
import DoctorDashboard from "./components/DoctorDashboard";
import PatientDashboard from "./components/PatientDashboard";

export default function Home() {
  const { userRole, isAuthenticated } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {!isAuthenticated ? (
          <LandingHero />
        ) : userRole === 'doctor' ? (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
            <DoctorDashboard />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>
            <PatientDashboard />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
