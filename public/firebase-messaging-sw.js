self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    const json = event.data ? event.data.json() : {};
    payload = json.data || json;
  } catch {
    payload = {};
  }

  const title = payload.title || 'ウンlist';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      tag: payload.tag || undefined,
      data: { url: payload.url || '/today' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/today', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => client.url === target && 'focus' in client);
      return existing ? existing.focus() : self.clients.openWindow(target);
    }),
  );
});
