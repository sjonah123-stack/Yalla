/*
 * Yalla daily reminder: Web Push handlers, pulled into the generated Workbox service worker by
 * `workbox.importScripts` in vite.config.ts (web build only; the artifact build has no SW).
 * The payload comes from functions/src/index.ts: { title, body, url, tag }.
 */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Yalla!";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "A few roots today keeps the streak alive.",
      icon: "/icons/icon-192.png",
      // No `badge` yet: Android masks it to its alpha channel, and the app icon is an opaque
      // square. Add a white-on-transparent glyph (e.g. /icons/badge-96.png) and set it here.
      tag: data.tag || "yalla-daily",
      lang: "en",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    (event.notification.data && event.notification.data.url) || "/",
    self.location.origin,
  );
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = wins.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) return open.focus();
      return self.clients.openWindow(target.href);
    })(),
  );
});
