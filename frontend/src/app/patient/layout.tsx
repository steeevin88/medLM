"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  User, 
  CalendarClock, 
  FileText, 
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Redirect to home if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Show loading state while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/patient",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/patient"
    },
    {
      name: "Profile",
      href: "/patient/profile",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/patient/profile"
    },
    {
      name: "Appointments",
      href: "/patient/appointments",
      icon: <CalendarClock className="h-5 w-5" />,
      active: pathname === "/patient/appointments"
    },
    {
      name: "Records",
      href: "/patient/records",
      icon: <FileText className="h-5 w-5" />,
      active: pathname === "/patient/records"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">MedLM Health Portal</h1>
        <SignOutButton signOutCallback={() => router.push('/')}>
          <Button variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <Card className="p-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    item.active 
                      ? "bg-blue-100 text-blue-900" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
} 