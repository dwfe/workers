const VERSION = "v1";
const SCOPE = "/";
const CACHE_NAME = `${VERSION}`;
const isDebug = true;

addEventListener("install", event => {
  log("installing…");
  skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя о новой версии приложения и без ожидания его реакции на это событие
  event.waitUntil(
    precache(CACHE_NAME, [])
  );
});

addEventListener("activate", event => {
  log("activating…");
  event.waitUntil(
    removeOldCache()
      .then(() => clients.claim()) // всем клиентам переопределить sw на только что активированный
      .then(() => sendToClients({type: "RELOAD_PAGE"}))
  );
});

addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (url.origin === location.origin && isCacheControl(pathname)) {
    event.respondWith(getFromCacheOrFetch(req, pathname));
  }
});

addEventListener("message", async ({data}) => {
  switch (data.type) {
    case "GET_INFO":
      sendToClients({
        type: "INFO",
        data: {
          version: VERSION,
          cacheLength: await getCacheLength()
        }
      });
      break;
    default:
      logError(`unknown message type ${data.type}`);
  }
});

//region Cache

function isCacheControl(pathname) {
  if (pathname.includes("sw.js") || pathname.includes("index.html"))
    return false;
  else if (pathname.startsWith("/static") || pathname.startsWith("/fonts"))
    return true;
  const ext = pathname.split(".").pop();
  return ["js", "woff2", "css"].includes(ext);
}

async function precache(cacheName, pathnames, throwError = false) {
  const cache = await getCache(cacheName);
  await Promise.all(
    pathnames.map(pathname =>
      fetch(pathname).then(resp => {
        if (resp.ok) {
          return cacheResponse(cache, pathname, resp, pathname);
        }
        const message = `precache '${pathname}', HTTP status: ${resp.status}`;
        if (throwError)
          throw new Error(message);
        logError(message);
      }))
  );
}

async function removeOldCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(cacheName => cacheName !== CACHE_NAME)
      .map(cacheName => caches.delete(cacheName)) // удалить кеш всех старых версий приложения
  );
}

async function getFromCacheOrFetch(req, pathname) {
  const key = req;
  const cache = await getCache();
  const resp = await cache.match(key);
  return (
    resp ||
    fetch(req).then(response => {
      cacheResponse(cache, key, response, pathname)
      return response;
    })
  );
}

async function cacheResponse(cache, key, resp, pathname) {
  log("cache", pathname);
  return cache.put(key, resp.clone());
}

async function getCacheLength() {
  const keys = await getCache().then(cache => cache.keys());
  return keys.length;
}

function getCache(cacheName = CACHE_NAME) {
  return caches.open(cacheName);
}

//endregion

//region Clients

function getClients() {
  return clients.matchAll();
}

async function sendToClients(data) {
  const clients = await getClients();
  clients.forEach(client => client.postMessage(data));
}

//endregion

//region Support

function log(...args) {
  if (isDebug) {
    // const date = new Date();
    // const isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    // console.log(`[${isoDateTime}] sw '${VERSION}'`, ...args);

    console.log(`sw '${VERSION}'`, ...args);
  }
}

function logError(...args) {
  console.error(`sw '${VERSION}'`, ...args);
}

//endregion
