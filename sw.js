const CACHE_NAME = "prontuario-static-v1";

const STATIC_FILES = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalação: cache só do essencial
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
});

// Ativação
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
});

// Estratégia de rede
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 🔴 NUNCA cachear Firebase
  if (url.hostname.includes("firebase") || url.hostname.includes("googleapis")) {
    return;
  }

  // 🔵 index.html sempre da internet
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
    return;
  }

  // 🟢 outros arquivos: cache first
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
