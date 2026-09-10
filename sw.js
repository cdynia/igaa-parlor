/* IGAA Parlor service worker — offline app shell, but fresh-first for pages */
const CACHE = "igaa-parlor-v4";
const ASSETS = [
  "./",
  "index.html",
  "IGAA-Beginner.html",
  "IGAA-Advanced.html",
  "Times-Up-Jr.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function putCache(req, res) {
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Same-origin (pages, CSS, JS, icons): network-FIRST so every deploy shows
  // immediately; fall back to cache (then index.html for navigations) offline.
  if (sameOrigin) {
    e.respondWith(
      fetch(req)
        .then((res) => putCache(req, res))
        .catch(() =>
          caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : undefined))
        )
    );
    return;
  }

  // Cross-origin (Google Fonts): stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => putCache(req, res)).catch(() => hit);
      return hit || net;
    })
  );
});
