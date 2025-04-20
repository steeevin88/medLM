"use client";

import React, { useState, useEffect } from 'react';
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
import { NotificationBell } from "./NotificationBell";
import { NotificationModal } from "./NotificationModal";
import { getDataRequestsForPatient } from "@/actions/dataRequest";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function PatientNavigation({ activeTab, onTabChange }: NavigationProps) {
  const { user } = useUser();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pendingRequestsCount = dataRequests.filter(req => req.status === 'PENDING').length;

  // Fetch data requests
  useEffect(() => {
    const fetchDataRequests = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const { dataRequests, error } = await getDataRequestsForPatient(user.id);

        if (error) {
          console.error("Error fetching data requests:", error);
          return;
        }

        setDataRequests(dataRequests || []);
      } catch (error) {
        console.error("Failed to fetch data requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataRequests();
  }, [user?.id]);

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
        <NotificationBell
          count={pendingRequestsCount}
          onClick={() => setIsNotificationModalOpen(true)}
          size="sm"
        />
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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        dataRequests={dataRequests}
      />
    </Card>
  );
}
