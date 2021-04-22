module.exports = {
  globDirectory: "dist/",
  globPatterns: [
      "**/*.{babylon,png,fx,css,js,woff,woff2,txt,webmanifest,ico,html,md}",
  ],
  maximumFileSizeToCacheInBytes: 10e7,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  directoryIndex: "index.html",
  sourcemap: false,
  skipWaiting: true,
  swDest: "dist/service-worker.js",
};
