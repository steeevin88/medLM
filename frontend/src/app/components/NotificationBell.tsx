import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
  size?: 'default' | 'sm';
}

export function NotificationBell({ count, onClick, size = 'default' }: NotificationBellProps) {
  const iconSize = size === 'default' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className={iconSize} />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 px-1 min-w-4 h-4 text-[10px]">
          {count}
        </Badge>
      )}
    </Button>
  );
}
