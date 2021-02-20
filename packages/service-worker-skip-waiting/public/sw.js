self.isDebug = true;
importScripts('module.sw.js');

const sw = new SwEnv('/', {
  database: {
    name: 'db_local'
  },
  cache: {
    controlExtentions: ['js', 'css', 'woff2', 'ttf', 'otf', 'eot'],
    itemVersionDBStoreName: 'cache_item_versions',
    items: [
      {
        title: 'app',
        version: {
          // value: 'v2'
          fetchPath: '/hello/world'
        },
        match: {
          order: 10,
          pathStart: '/',
          useInCacheControl: false
        }
      },
      {
        title: 'tiles',
        version: {
          // value: 'v2'
          fetchPath: '/hello/world'
        },
        match: {
          order: 1,
          pathStart: '/tiles',
          useInCacheControl: true
        }
      }
    ],
  }
});
sw.init();

self.addEventListener('install', event => {
  self.log('installing…');
  self.skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя о новой версии приложения и без ожидания его реакции на это событие
  event.waitUntil(
    sw.cache.versionLoader.run()
      .then(() => sw.init())
      .then(() => sw.cache.precache({
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
      .then(() => sw.cache.clean('delete-uncontrolled')) // клиенты уже смотрят на новый sw, значит можно почистить кеш
      .then(() => self.delay(5_000))
      .then(() => sw.exchange.send('RELOAD_PAGE'))
      .then(() => self.log('activated'))
  );
});

self.addEventListener('fetch', event => {
  if (sw.isReady) {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method === 'GET' && sw.cache.isControl(url)) {
      event.respondWith(sw.cache.get('cache || fetch -> cache', {req}));
    }
  }
});

self.addEventListener('message', event => {
  if (sw.isReady) {
    sw.exchange.process(event);
  }
});
