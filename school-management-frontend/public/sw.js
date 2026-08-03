const CACHE_NAME = 'myacademia-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. Installation du Service Worker
self.addEventListener('install', (event) => {
  // Forcer l'activation immédiate du nouveau Service Worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.warn("Certaines ressources initiales n'ont pas pu être mises en cache :", err);
      })
  );
});

// 2. Activation et suppression automatique des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache Service Worker :', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Prendre immédiatement le contrôle des clients/onglets actifs
      return self.clients.claim();
    })
  );
});

// 3. Interception des requêtes avec stratégie Réseau d'abord (Network First)
self.addEventListener('fetch', (event) => {
  // Traitement réservé uniquement aux requêtes HTTP/HTTPS GET
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la réponse réseau est valide, mise à jour dynamique du cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne réseau ou accès hors-ligne, retour vers le cache
        return caches.match(event.request);
      })
  );
});