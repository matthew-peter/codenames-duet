// Service Worker for Web Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) return;

  const data = event.data.json();
  const gameId = data.gameId;
  
  // Check if user is currently viewing this game
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if any client is currently viewing this specific game
      for (const client of clientList) {
        if (client.url.includes('/game/' + gameId) && client.visibilityState === 'visible') {
          // User is already viewing this game, don't show notification
          return;
        }
      }
      
      // User is not viewing this game, show notification
      const options = {
        body: data.body || "It's your turn!",
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/',
          gameId: gameId
        },
        actions: [
          { action: 'open', title: 'Open Game' }
        ],
        tag: gameId || 'codenames-turn',
        renotify: true
      };

      return self.registration.showNotification(data.title || 'Codenames Duet', options);
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/game/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
