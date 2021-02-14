!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});new(n(1).Init)},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{a(r.next(e))}catch(e){o(e)}}function c(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,c)}a((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.Init=void 0;const i=n(2),o=n(5);t.Init=class{constructor(){self.Cache=i.Cache,self.Exchange=o.Exchange,self.log=(...e)=>{self.isDebug&&console.log("sw",...e)},self.logError=(...e)=>{console.error("sw",...e)},self.delay=e=>r(this,void 0,void 0,(function*(){return new Promise((t,n)=>{setTimeout(t,e)})}))}}},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{a(r.next(e))}catch(e){o(e)}}function c(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,c)}a((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.Cache=void 0;const i=n(3),o=n(4);t.Cache=class{constructor(e){this.controlExtentions=e;const t=new i.CacheName("app",self.APP_VERSION);this.app=new o.CacheItem(t);const n=new i.CacheName("tiles",self.TILES_VERSION);this.tiles=new o.CacheItem(n,"/tiles")}get(e,t,n,i,o=!1){return r(this,void 0,void 0,(function*(){const r=this.getItem(i);switch(e){case"cache || fetch -> cache":return r.get(t,n,i,o);default:throw new Error(`sw unknown strategy '${e}' of Cache.getValue(…)`)}}))}getItem(e){return this.tiles.match(e)?this.tiles:this.app}getItems(){return[this.app,this.tiles]}getInfo(){return r(this,void 0,void 0,(function*(){return Promise.all(this.getItems().map(e=>e.getInfo()))}))}isControl(e){if(e.origin!==self.location.origin)return!1;const t=e.pathname;if(t.includes("sw.js")||t.includes("index.html"))return!1;if(t.startsWith("/static")||t.startsWith("/fonts")||this.tiles.match(t))return!0;const n=t.split(".").pop();return this.controlExtentions.includes(n)}precache(e,t,n=!1){return r(this,void 0,void 0,(function*(){self.log(`pre-caching [${t.length}] files…`),yield Promise.all(t.map(t=>this.get(e,t,t,t,n))),self.log("pre-caching completed")}))}clear(){return r(this,void 0,void 0,(function*(){self.log("cache clearing…");let e=yield this.deleteByStrategy("not-controlled");e.length&&(e=yield this.deleteByStrategy("not-controlled"),e.length&&e.forEach(e=>self.logError(`can't delete cache '${e}', 2 attempts were made`))),self.log("cache clearing completed")}))}deleteByStrategy(e){return r(this,void 0,void 0,(function*(){const t=yield this.getBadNames(e);return Promise.all(t.map(e=>(self.log(`delete cache '${e}'`),self.caches.delete(e)))).then(()=>this.getBadNames(e))}))}getBadNames(e){return r(this,void 0,void 0,(function*(){const t=yield self.caches.keys();switch(e){case"not-controlled":const n=this.getItems().map(e=>e.cacheName.parsed.titleVersion);return t.map(e=>i.CacheName.parse(e)).filter(e=>!i.CacheName.isStructureValid(e)||e.scope!==self.SCOPE||!n.includes(e.titleVersion)).map(e=>e.cacheName);default:throw new Error(`sw unknown strategy '${e}' of Cache.getValue(…)`)}}))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.CacheName=void 0;class r{constructor(e,t){this.title=e,this.version=t,this.value=r.get(e,t),this.parsed=r.parse(this.value)}getInfo(){return{scope:self.SCOPE,title:this.title,version:this.version}}static get(e,t){const n=r.DELIMITER;return`${self.SCOPE}${n}${e}${n}${t}`}static parse(e){const t=e.split(r.DELIMITER),n=t[0],i=t[1],o=t[2];return{scope:n,title:i,version:o,arr:t,cacheName:e,titleVersion:`${i}${r.DELIMITER}${o}`}}static isValid(e){const t=r.parse(e);return r.isStructureValid(t)}static isStructureValid({scope:e,title:t,version:n,arr:r}){return 3===r.length&&!!e&&!!t&&!!n}}t.CacheName=r,r.DELIMITER=":"},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{a(r.next(e))}catch(e){o(e)}}function c(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,c)}a((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.CacheItem=void 0;t.CacheItem=class{constructor(e,t){this.cacheName=e,this.pathStart=t,this.cacheName=e,this.pathStart=t}get(e,t,n,i){return r(this,void 0,void 0,(function*(){const r=yield this.getCache();return(yield r.match(e))||fetch(t).then(t=>{if(t.ok)return r.put(e,t.clone()),this.log(n),t;const o=`fetch '${n}', HTTP status: ${t.status}`;if(i)throw new Error(o);this.logError(o)})}))}getCache(){return r(this,void 0,void 0,(function*(){return self.caches.open(this.cacheName.value)}))}getInfo(){return r(this,void 0,void 0,(function*(){return{cacheName:this.cacheName.getInfo(),length:yield this.getLength()}}))}getLength(){return r(this,void 0,void 0,(function*(){return(yield this.getCache().then(e=>e.keys())).length}))}match(e){return!!this.pathStart&&e.startsWith(this.pathStart)}log(...e){self.log(`cache '${this.cacheName.value}'`,...e)}logError(...e){self.logError(`cache '${this.cacheName.value}'`,...e)}}},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{a(r.next(e))}catch(e){o(e)}}function c(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,c)}a((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.Exchange=void 0;t.Exchange=class{constructor(e){this.cache=e}send(e,t){return r(this,void 0,void 0,(function*(){const n=yield self.clients.matchAll();this.log(`sending '${e}' to [${n.length}] clients…`),n.forEach(n=>n.postMessage({type:e,data:t}))}))}process(e){return r(this,void 0,void 0,(function*(){const{data:t}=e;switch(this.log(`process '${t.type}'`),t.type){case"GET_INFO":this.send("INFO",{caches:yield this.cache.getInfo()});break;default:throw new Error(`sw unknown message type '${t.type}' of Exchange.process(…)`)}}))}log(...e){self.log("exchange",...e)}logError(...e){self.logError("exchange",...e)}}}]);