self.APP_VERSION = "v1";
self.TILES_VERSION = "v1";
self.SCOPE = "/";
self.isDebug = true;

importScripts("module.sw.js");
const cache = new CacheSw(["js", "css", "woff2", "ttf", "otf", "eot"]);
const exchange = new ExchangeSw(cache);

self.addEventListener("install", event => {
  self.log("installing…");
  self.skipWaiting(); // выполнить принудительную активацию новой версии sw - без информирования пользователя о новой версии приложения и без ожидания его реакции на это событие
  event.waitUntil(
    cache
      .precache("cache || fetch -> cache", [
        "/worker.js",
        "/fonts/BureausansLight.woff2",
        "/fonts/Bureausans-Regular.woff2",
        "/fonts/Bureausans-Bold.woff2",
        "/fonts/Bureausans-Italic.woff2",
        "/fonts/meteo/Bureausans_Meteo-Light.woff2",
        "/fonts/PWF/PuansonWind.woff2"
      ])
      .then(() => self.log("installed"))
  );
});

self.addEventListener("activate", event => {
  self.log("activating…");
  event.waitUntil(
    self.clients
      .claim() // переключить всех клиентов на этот новый sw
      .then(() => cache.clean("not-controlled")) // клиенты уже смотрят на новый sw, значит можно почистить кеш
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
