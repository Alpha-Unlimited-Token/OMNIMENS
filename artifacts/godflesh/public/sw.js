/**
 * OMNIMENS Service Worker
 * © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Enables offline support and PWA installability.
 */

const CACHE_NAME = "omnimens-v3";

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

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache API calls — always go to network
  if (url.pathname.startsWith("/api/")) return;

  // For navigation requests: network-first so fresh content always loads
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match("/godflesh/") || caches.match(request))
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|ttf)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      });
    })
  );
});
