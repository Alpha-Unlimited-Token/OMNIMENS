/**
 * OMNIMENS Service Worker
 * © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Enables offline support and PWA installability.
 */

const CACHE_NAME = "omnimens-v6";

const PRECACHE = [
  "/godflesh/",
  "/godflesh/images/emblem.png",
  "/godflesh/images/emblem-192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.includes("/assets/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === "navigate") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") {
            return caches.match("/godflesh/");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
