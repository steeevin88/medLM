"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  FileText, 
  User, 
  Heart, 
  Activity, 
  Calendar, 
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Custom Prescription icon since it's not included in lucide-react
const Prescription = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21h6m-6 0v-3.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V21m-6 0H4a1 1 0 0 1-1-1v-3.5a6 6 0 0 1 6-6h0" />
    <path d="M20 10h-3.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H20a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1Z" />
    <path d="M9 5.5V.5" />
    <path d="M6 3h6" />
  </svg>
);

export default function PatientNavigation({ activeTab, onTabChange }: NavigationProps) {
  const { user } = useUser();
  
  const navigationItems = [
    {
      id: 'chat',
      name: 'Chat',
      icon: <MessageSquare className="h-5 w-5" />,
      notifications: 0
    },
    {
      id: 'profile',
      name: 'Health Profile',
      icon: <User className="h-5 w-5" />,
      notifications: 0
    },
    {
      id: 'documents',
      name: 'Medical Documents',
      icon: <FileText className="h-5 w-5" />,
      notifications: 1
    },
    {
      id: 'vitals',
      name: 'Health Vitals',
      icon: <Heart className="h-5 w-5" />,
      notifications: 0
    },
    {
      id: 'activity',
      name: 'Activity & Exercise',
      icon: <Activity className="h-5 w-5" />,
      notifications: 0
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: <Calendar className="h-5 w-5" />,
      notifications: 2
    },
    {
      id: 'prescriptions',
      name: 'Prescriptions',
      icon: <Prescription className="h-5 w-5" />,
      notifications: 1
    }
  ];

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return "?";
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return firstInitial + lastInitial || user.username?.[0] || "?";
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.imageUrl || "/avatar-placeholder.png"} alt={user?.fullName || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0">
          <h2 className="font-medium text-sm truncate">{user?.fullName || user?.username || "User"}</h2>
          <p className="text-xs text-muted-foreground">Patient</p>
        </div>
      </div>
      <div className="px-2 py-4 flex-grow overflow-y-auto">
        <div className="space-y-1 text-sm font-medium">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full flex justify-start gap-2 py-2 px-3 mb-1",
                "text-left",
                activeTab === item.id 
                  ? "" 
                  : "text-muted-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
              {item.notifications > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-auto flex-shrink-0 px-1 min-w-5 h-5 text-xs"
                >
                  {item.notifications}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onTabChange('settings')}>
          <Settings className="h-4 w-4" />
          <span className="truncate">Settings</span>
        </Button>
      </div>
    </Card>
  );
} 