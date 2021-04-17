import App from './App.svelte';

var app = new App({
  target: document.body,
});

export default app;

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
else {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then(res => {/* console.log("registered service worker!"); */})
        .catch(err => {/* console.log("problem with service worker", err); */})
    });
  }
}
