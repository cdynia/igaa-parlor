/* IGAA Parlor service worker — offline app shell, but fresh-first for pages */
const CACHE = "igaa-parlor-v16";
const ASSETS = [
  "./",
  "index.html",
  "404.html",
  "offline.html",
  "season-art.js",
  "cards.css",
  "cards.js",
  "parlor-nav.js",
  "IGAA-Beginner.html",
  "IGAA-Advanced.html",
  "Times-Up-Jr.html",
  "Set-the-Clock.html",
  "Season-Sweep.html",
  "Appointment-Taker.html",
  "12-Appointments.html",
  "Finish-the-Appointment.html",
  "Priority-Mail.html",
  "Season-Wheel.html",
  "Time-to-Travel.html",
  "Center-Stage.html",
  "Ducks-on-the-Lake.html",
  "Double-Appointment.html",
  "Level-1-Seasons.html",
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
  // never store an error/404 body — that would serve the miss forever after
  if (!res || !res.ok || res.type === "opaque") return res;
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
          caches.match(req).then((hit) => {
            if (hit) return hit;
            // ignore the ?v= cache-buster when looking for a cached page
            if (url.search) {
              return caches.match(url.origin + url.pathname).then((bare) =>
                bare || (req.mode === "navigate" ? caches.match("offline.html") : undefined)
              );
            }
            // a page we've never cached, with no network: show the offline page
            return req.mode === "navigate" ? caches.match("offline.html") : undefined;
          })
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
