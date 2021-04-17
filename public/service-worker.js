const cacheName = "gratitude-bank-assets-v1";
/* ASSET LIST START */
const assetList = {
};
/* ASSET LIST END */

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(Object.keys(assetList));
    })
  );
});

self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((res) => {
      return res || fetch(evt.request);
    })
  );
});
