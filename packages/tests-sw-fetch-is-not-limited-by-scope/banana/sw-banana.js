self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('installingâ€¦');
})
self.addEventListener('activate', event => {
  console.log('activatingâ€¦');
  event.waitUntil(self.clients.claim());
})
self.addEventListener('fetch', event => {
  const scope = self.registration.scope;
  const req = event.request;
  const url = new URL(req.url);
  console.log(`handle fetch in sw scope '${scope}'`, req.method, url.pathname)
})
