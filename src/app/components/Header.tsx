"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../context/UserContext';

export default function Header() {
  const { userRole, isAuthenticated, setUserRole, setIsAuthenticated } = useUser();

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-8 h-8"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          MedLM Connect
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-blue-100 transition">Home</Link>
          {userRole === 'doctor' && (
            <>
              <Link href="/doctor/dashboard" className="hover:text-blue-100 transition">Dashboard</Link>
              <Link href="/doctor/patients" className="hover:text-blue-100 transition">Patients</Link>
            </>
          )}
          {userRole === 'patient' && (
            <>
              <Link href="/patient/dashboard" className="hover:text-blue-100 transition">Dashboard</Link>
              <Link href="/patient/consultations" className="hover:text-blue-100 transition">Consultations</Link>
            </>
          )}
          <Link href="/about" className="hover:text-blue-100 transition">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline text-sm">
                {userRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => { setUserRole('doctor'); setIsAuthenticated(true); }}
                className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Doctor Login
              </button>
              <button 
                onClick={() => { setUserRole('patient'); setIsAuthenticated(true); }}
                className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Patient Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 