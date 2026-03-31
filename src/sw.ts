/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

self.addEventListener('push', (event: PushEvent) => {
  let data: { title?: string; body?: string; cascadeId?: string } = {};
  try {
    data = event.data?.json() as typeof data ?? {};
  } catch {
    data = { title: '⚡ SIGNAL', body: event.data?.text() ?? '' };
  }

  const title = data.title ?? '⚡ SIGNAL :: Antigravity';
  const body = data.body ?? '「Neural link complete」— AI transmission received';
  const cascadeId = data.cascadeId ?? '';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: `ag-remote-${cascadeId}`,
      renotify: true,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    } as NotificationOptions),
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow('/');
      }),
  );
});
