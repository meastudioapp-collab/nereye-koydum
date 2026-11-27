// Ağ öncelikli: çevrimiçiyken her açılışta en yeni sürüm, çevrimdışıyken son kopya.
const CACHE = 'nereye-koydum-3c1f4c93f3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'gizlilik.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const network = fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  });
  const cached = () => caches.match(req, {ignoreSearch: true}).then(hit => hit || caches.match('index.html'));
  // Zayıf bağlantıda açılış takılmasın: ağ 4 sn içinde yanıt vermezse önbellekteki kopya.
  const slow = new Promise(resolve => setTimeout(resolve, 4000)).then(cached).then(hit => hit || network);
  e.waitUntil(network.catch(() => {}));
  e.respondWith(Promise.race([network, slow]).catch(cached));
});
