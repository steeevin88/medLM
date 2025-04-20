import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
  hasNewRequests?: boolean;
  size?: 'default' | 'sm';
}

export function NotificationBell({
  count,
  onClick,
  hasNewRequests = false,
  size = 'default'
}: NotificationBellProps) {
  const iconSize = size === 'default' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative",
        hasNewRequests && "animate-pulse"
      )}
      onClick={onClick}
    >
      <Bell className={iconSize} />
      {count > 0 && (
        <Badge
          className={cn(
            "absolute -top-1 -right-1 px-1 min-w-4 h-4 text-[10px]",
            hasNewRequests && "bg-red-500"
          )}
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
