"use client";

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/nextjs';

export default function Header() {
  const { user, isLoaded } = useUser();
 const userRole = isLoaded ? user?.publicMetadata?.role as string | undefined : undefined;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm text-black">
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

        <SignedIn>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-blue-100 transition">Home</Link>
            {isLoaded && userRole === 'doctor' && (
              <>
                <Link href="/doctor" className="hover:text-blue-100 transition">Dashboard</Link>
              </>
            )}
            {isLoaded && userRole === 'patient' && (
              <>
                <Link href="/patient" className="hover:text-blue-100 transition">Dashboard</Link>
              </>
            )}
            <Link href="/about" className="hover:text-blue-100 transition">About</Link>
          </nav>
        </SignedIn>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
