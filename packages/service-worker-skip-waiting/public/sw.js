self.APP_VERSION = 'v1';
self.TILES_VERSION = 'v2';

self.cacheControlExtentions = ['js', 'css', 'woff2', 'ttf', 'otf', 'eot'];
self.SCOPE = '/';
self.isDebug = true;
importScripts('module.sw.js');

self.addEventListener('install', event => {
  self.log('installing…');
  self.skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя о новой версии приложения и без ожидания его реакции на это событие
  event.waitUntil(
    self.ModuleSw.init()
      .then(() => self.cache.precache({
        strategy: 'cache || fetch -> cache',
        throwError: false,
        connectionTimeout: 10_000,
        paths: [
          '/worker.js',
          '/fonts/BureausansLight.woff2',
          '/fonts/Bureausans-Regular.woff2',
          '/fonts/Bureausans-Bold.woff2',
          '/fonts/Bureausans-Italic.woff2',
          '/fonts/meteo/Bureausans_Meteo-Light.woff2',
          '/fonts/PWF/PuansonWind.woff2'
        ]
      }))
      .then(() => self.log('installed'))
  );
});

self.addEventListener('activate', event => {
  self.log('activating…');
  event.waitUntil(
    self.clients.claim() // переключить всех клиентов на этот новый sw
      .then(() => self.cache.clean('uncontrolled')) // клиенты уже смотрят на новый sw, значит можно почистить кеш
      .then(() => self.delay(5_000))
      .then(() => self.exchange.send('RELOAD_PAGE'))
      .then(() => self.log('activated'))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method === 'GET' && self.cache.isControl(url)) {
    event.respondWith(cache.get('cache || fetch -> cache', {req}));
  }
});

self.addEventListener('message', event => self.exchange.process(event));
