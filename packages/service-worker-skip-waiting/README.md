# Ссылки

[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)  
[Recipes by Google](https://googlechrome.github.io/samples/service-worker/)  
[Cookbook by Mozilla](https://serviceworke.rs/)

#### Jake Archibald

- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
- [The Offline Cookbook](https://web.dev/offline-cookbook/)
- [Different versions of your site can be running at the same time](https://jakearchibald.com/2020/multiple-versions-same-time/)
- [Service workers and base URIs](https://jakearchibald.com/2016/service-workers-and-base-uris/)
- [Speed up Service Worker with Navigation Preloads](https://developers.google.com/web/updates/2017/02/navigation-preload)

#### Progressive Web Apps Training

- [Introduction to Service Worker](https://developers.google.com/web/ilt/pwa/introduction-to-service-worker)
- [Lab: Scripting the Service Worker](https://developers.google.com/web/ilt/pwa/lab-scripting-the-service-worker)
- [Live Data in the Service Worker](https://developers.google.com/web/ilt/pwa/live-data-in-the-service-worker)
- [Caching Files with Service Worker](https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker)

#### sw cache vs HTTP cache

- [Prevent unnecessary network requests with the HTTP Cache](https://web.dev/http-cache/)

#### habr

- [Service Workers. Инструкция по применению](https://habr.com/ru/company/2gis/blog/345552/)
- [Обновление вашего PWA в продакшене](https://habr.com/ru/post/535428/)
- [Как мы запустили offline-версию сайта RG.RU](https://habr.com/ru/company/oleg-bunin/blog/348150/)
- [Подводные камни Service Workers(когда надо использовать IndexedDB)](https://habr.com/ru/post/351194/)

[Service workers and the Cache Storage API](https://web.dev/service-workers-cache-storage/)

# Использование

```
[packages]
  |
  |-- service-worker-skip-waiting
  |    |-- public
  |    |    |-- index.html   - содержит скрипт, исполняемый в Main-thread. Скрипт надо руками скопировать в [packages]/tests-sw-cache-skip-waiting/public/index.html
  |    |    |                  Выполняет служебные задачи, связанные с sw.
  |    |    |-- module.sw.js - зависимости, необходимые для sw.js . Здесь появляется при prod-сборке sw.
  |    |    |-- sw.js        - основной файл sw, исполняется в выделенном thread.
  |    |
  |    |-- package.json      - содержит скрипты для сборки sw.
  |
  | ...
  |
  |-- tests-sw-cache-skip-waiting
  |    |-- public
  |    |    |-- index.html
  |
```

В `[packages]/service-worker-skip-waiting/package.json` подготовлены два скрипта `dev` и `prod`.

## Скрипт `dev`

1. Собирает `module.sw.js`
2. Копирует из проекта `[packages]/service-worker-skip-waiting/` файлы `./dist/module.sw.js` и `./public/sw.js` в папку `[packages]/tests-sw-cache-skip-waiting/public`

Перед запуском скрипта надо руками прописать актуальную версию кешей в файле `[packages]/service-worker-skip-waiting/public/sw.js`:

```js
self.APP_VERSION = "актуальная версия кеша приложения";
self.TILES_VERSION = "актуальная версия кеша тайлов";
```

За инициацию установки приложения и за периодическую проверку на наличие новой версии отвечает скрипт в `index.html`.  
Если содержимое файла `sw.js` или `module.sw.js` изменилось по сравнению с прошлой проверкой, тогда браузер считает, что появилась новая версия приложения.  
Первую установку приложения и обновление на новую версию приложения браузер производит одинаково, последовательно эмитит события `install` и `activate`, которые необходимо перехватывать в `sw.js`.

```js
self.SCOPE = "/";
self.isDebug = true;
```

Переменная `isDebug` вкл/выкл вывод в консоль браузера информационных сообщений.  
Переменная `SCOPE` хранит scope sw. Используется при определении имени кеша. Здесь задается вручную, чтобы было наглядно видно - этот `sw.js` работает на таком-то scope.

А, вообще, реальный scope sw доступен в `self.registration.scope` и всегда включает origin. Предположим на origin `http://localhost:2020` зарегистрировано два sw для scope `/` и `/banana/`, полностью их scope выглядят так:

- для sw#1 = `http://localhost:2020/`
- для sw#2 = `http://localhost:2020/banana/`

Браузер выбирает sw, основываясь на содержимом браузерной строки.  
Например, пользователь перешел по пути `http://localhost:2020/banana/index.html`, значит браузер задействует sw#2, а следовательно **любая** сетевая активность пользователя начнет проходить через событие `fetch` sw#2, не важно захочет пользователь получить файл `/123.txt`, `/banana/123.txt` или `/какой/угодно/путь/123.txt`.  
Если пользователь в браузерной строке перейдет по пути `http://localhost:2020/banana-apple/index.html` или `http://localhost:2020/index.html`, тогда браузер задействует sw#1, потому что `/banana-apple/` и `/` подпадают только под scope `http://localhost:2020/`.

## Скрипт `prod`

1. Собирает `module.sw.js`
2. В проекте `[packages]/service-worker-skip-waiting/` копирует файл `./dist/module.sw.js` в папку `./public`

После выполнения скрипта файлы `sw.js` и `module.sw.js` в папке `[packages]/service-worker-skip-waiting/public` готовы для деплоя.  
Осталось только не забыть прописать актуальные версии кешей в файле `sw.js`.

# События

## `install`

Здесь можно сделать прекеш. При отсутствии прекеша следующая загрузка приложения(сразу после установки/обновления) стартует как если бы кеша нет - все качается по сети - то есть смысл в том, что **не быстро**. А уже после перезагрузки приложения из кеша.

## `activate`

Здесь можно почистить кеш.

## `fetch`

Сюда браузер пробрасывает все запросы пользователя, поэтому тут происходит основная работа кеширующего sw.

# Особенности

- на все данные, что мы хотим кешировать, сервер(если эти данные у него отсутствуют) должен возвращать корректную ошибку в HTTP status code. В противном случае, если сервер при отсутствии данных отдает, например, статус 200 + html страницу, где сообщается, что произошла такая-то ошибка, тогда в кеш вместо ожидаемого файла попадет эта самая страница. Соответственно, когда браузер вместо, скажем, шрифта получает содержимое html страницы, то приложение будет работать непредсказуемо. Варианты решения:
  - положить файл в нужное место -> обновить sw.js, чтобы активировать на клиентах обновление кеша(т.к. кривота уже сохранена в кеше и появление файла на сервере не решит проблему);
  - делать прекеш с привязкой к Content-Type, если не тот что ожидатся - не кешировать файл.
- sw обновление на chrome. Если открыть и закрыть инспектор(иногда и без этих действий), то следующее обновление произойдет так:
  - качается новая версия sw файла
  - хром чего-то ждет **ровно** 5 минут
  - запускает цикл обновления

