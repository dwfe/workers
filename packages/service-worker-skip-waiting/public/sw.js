self.isDebug = true;
importScripts('module.sw.js');

const env = new SwEnv('/', {
  database: {
    name: 'db_local',
    version: 1,
    storeNames: {
      cacheVersion: 'cache_version',
    }
  },
  cache: {
    controlExtentions: ['js', 'css', 'woff2', 'ttf', 'otf', 'eot', 'ico'],
    items: [
      {
        title: "root",
        version: {
          fetchPath: "/.version"
        },
        match: {
          order: 100, // все подконтрольные файлы, что не попадают в свои кеши(фильтр по pathStart), попадают в кеш 'root'
          pathStart: "/",
          useInCacheControl: false
        }
      },
      {
        title: "static",
        version: {
          fetchPath: "/cdn/static/.version"
          // value: 'v1'
        },
        match: {
          order: 10,
          pathStart: "/cdn/static",
          useInCacheControl: true
        }
      },
      {
        title: "worker",
        version: {
          fetchPath: "/cdn/worker/.version"
          // value: 'v1'
        },
        match: {
          order: 10,
          pathStart: "/cdn/worker",
          useInCacheControl: true
        }
      },
      {
        title: "api",
        version: {
          fetchPath: "/cdn/api/.version"
          // value: 'v1'
        },
        match: {
          order: 10,
          pathStart: "/cdn/api",
          useInCacheControl: true
        }
      },
      {
        title: "tiles",
        version: {
          fetchPath: "/tiles/version"
          // value: 'v1'
        },
        match: {
          order: 10,
          pathStart: "/tiles",
          useInCacheControl: true
        }
      }
    ],
  }
});
self.env = env;
env.init();

self.addEventListener('install', event => {
  self.skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя и без ожидания его реакции на это событие
  event.waitUntil(
    env.waitForReady() // ожидание инициализации ТЕКУЩЕЙ(ранее установленной) версии sw, либо первичной инициализации sw (перед первой установкой)
      .then(() => self.log('installing…')) // начинается установка НОВОЙ версии sw
      .then(() => env.updateCacheVersions())
      .then(() => env.cache.precache({
        strategy: 'fetch -> cache',
        throwError: true,
        timeout: 10_000,
        paths: [
          '/index.html',
          '/manifest.json',
          '/cdn/static/js/custom-elements.js',
          '/cdn/static/js/luxon.js',
          '/cdn/static/js/resize-observer.js',
          '/cdn/api/dist/index.js',
          '/cdn/worker/dist/worker.js',
          '/cdn/static/fonts/bureausans/light/Bureausans-Light.woff2',
          '/cdn/static/fonts/bureausans/regular/Bureausans-Regular.woff2',
          '/cdn/static/fonts/bureausans/bold/Bureausans-Bold.woff2',
          '/cdn/static/fonts/bureausans/italic/Bureausans-Italic.woff2',
          '/cdn/static/fonts/bureausans/meteo/Bureausans-Meteo-Light-new.woff2',
          '/cdn/static/fonts/PWF/PuansonWind.woff2',
        ]
      }))
      .then(() => self.log('installed'))
  );
});

self.addEventListener('activate', event => {
  self.log('activating…');
  event.waitUntil(
    self.clients.claim() // переключить всех потенциальных клиентов на новый sw
      .then(() => env.cache.clean('delete-uncontrolled')) // клиенты уже смотрят на новый sw, значит можно почистить кеш
      .finally(() => {
        env.exchange.send('RELOAD_PAGE'); // важно для кеширующего sw, т.к. рефреш страницы гарантирует, что новая версия приложения запустилась на клиентах
        self.log('activated');
      })
  );
});

self.addEventListener('fetch', async event => {
  if (env.isReady)
    event.respondWith(env.get(event.request));
});

self.addEventListener('message', event => {
  if (env.isReady)
    env.exchange.process(event);
});
