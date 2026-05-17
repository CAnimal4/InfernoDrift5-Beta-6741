// InfernoDrift4 clears older shell caches so GitHub Pages always serves the
// current static launch build.
// This kill-switch clears older caches and removes itself so GitHub Pages always
// serves the current files.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("infernodrift4-"))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        for (const client of clients) client.navigate(client.url);
      })
      .catch(() => undefined),
  );
});
