/* 다시, 나의 일 — 재취업 컨설팅 앱 서비스 워커 (배포판)
   오프라인에서도 실행되도록 앱 파일을 캐시합니다. */
const CACHE = 'consult-v1';
const ASSETS = [
  './',
  'index.html',
  'consult-manifest.json',
  'consult-icon-192.png',
  'consult-icon-512.png',
  'consult-apple-touch.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        try {
          const url = new URL(e.request.url);
          if (url.origin === self.location.origin && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
        } catch (_) {}
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
