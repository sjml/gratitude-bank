// This is from before I was using workbox to generate the service worker.
//   I would still very much prefer to use this approach because it seems
//   like it should be a simple thing to achieve, but the tooling around
//   service workers on Safari (both desktop and iOS) is extremely weak so
//   I could never figure out why this wasn't pulling updated assets even
//   though the new worker code was being fetched from the server. Maybe
//   it was never being activated or installed? No way to tell.
//
// In the end, workbox seems to get it all done, but how sad that these
//   20 lines of code couldn't do it.

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
