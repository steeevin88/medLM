"use client";

import React from 'react';
import Footer from "./components/Footer";
import LandingHero from "./components/LandingHero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow">
        <LandingHero />
      </main>
      <Footer />
    </div>
  );
}
