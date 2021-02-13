self.APP_VERSION = "v1";
self.TILES_VERSION = "v1";
self.SCOPE = "/";
self.controlExtentions = ["js", "css", "woff2", "ttf", "otf", "eot"];
self.isDebug = true;

importScripts(
  "/sw/common.sw.js",
  "/sw/cache-item.sw.js",
  "/sw/cache.sw.js",
  "/sw/clients.sw.js",
  "/sw/exchange.sw.js"
);

const cache = new Cache();
const exchange = new Exchange(cache);

self.addEventListener("install", event => {
  self.log("installing…");
  self.skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя о новой версии приложения и без ожидания его реакции на это событие
  event.waitUntil(
    cache
      .precaching("cache || fetch -> cache", [])
      .then(() => self.log("installed"))
  );
});

self.addEventListener("activate", event => {
  self.log("activating…");
  event.waitUntil(
    Clients.claim() // переключить всех клиентов на этот новый sw
      .then(() => cache.clear()) // клиенты уже смотрят на новый sw, значит можно почистить кеш
      .then(() => self.delay(5_000))
      .then(() => exchange.send("RELOAD_PAGE"))
      .then(() => self.log("activated"))
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (cache.isControl(url)) {
    event.respondWith(
      cache.get("cache || fetch -> cache", req, req, url.pathname)
    );
  }
});

self.addEventListener("message", event => exchange.process(event));
