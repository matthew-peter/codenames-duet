'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';

export function NotificationToggle() {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission,
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  if (permission === 'denied') {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="text-gray-400"
        title="Notifications blocked - enable in browser settings"
      >
        <BellOff className="w-4 h-4" />
      </Button>
    );
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={isSubscribed ? 'text-green-600' : 'text-gray-500'}
      title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
    </Button>
  );
}
