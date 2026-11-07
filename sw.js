// Guarda o app no celular para abrir sem internet.
// Ao publicar uma versão nova, mude o número abaixo.
const VERSAO = 'calculadora-al-v2';
const ARQUIVOS = [
  './', 'index.html', 'styles.css', 'calc.js', 'app.js', 'manifest.webmanifest',
  'icones/icone.svg', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/icone-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Usa a cópia salva e atualiza em segundo plano quando houver internet.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSAO).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((salvo) => {
        const rede = fetch(e.request)
          .then((resp) => { if (resp.ok) cache.put(e.request, resp.clone()); return resp; })
          .catch(() => salvo);
        return salvo || rede;
      })
    )
  );
});
