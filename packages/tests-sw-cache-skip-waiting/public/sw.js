const VERSION = "v1";
const SCOPE = "/";
const CACHE_NAME = `${VERSION}`;
const isDebug = true;

addEventListener("install", event => {
  log("installing…");
  skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя о новой версии приложения и без ожидания его реакции на это событие
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
  if (url.origin === location.origin && isCacheControl(url)) {
    event.respondWith(getFromCacheOrFetch(req, url));
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

function isCacheControl(url) {
  const pathname = url.pathname;
  if (pathname.includes("sw.js") || pathname.includes("index.html"))
    return false;
  else if (pathname.startsWith("/static") || pathname.startsWith("/fonts"))
    return true;
  const ext = pathname.split(".").pop();
  return ["js", "woff2", "css"].includes(ext);
}

async function removeOldCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(cacheName => cacheName !== CACHE_NAME)
      .map(cacheName => caches.delete(cacheName)) // удалить кеш всех старых версий приложения
  );
}

async function getFromCacheOrFetch(req, url) {
  const key = req;
  const cache = await getCache();
  const resp = await cache.match(key);
  return (
    resp ||
    fetch(req).then(response => {
      cache.put(key, response.clone());
      log("cache", url.pathname);
      return response;
    })
  );
}

async function getCacheLength() {
  const keys = await getCache().then(cache => cache.keys());
  return keys.length;
}

function getCache() {
  return caches.open(CACHE_NAME);
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
