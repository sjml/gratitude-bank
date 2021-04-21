/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: {url: '/', static: true},
    src: {url: '/dist'},
  },
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-dotenv',
    [
      '@snowpack/plugin-typescript',
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? {tsc: 'yarn pnpify tsc'} : {}),
      },
    ],
  ],
  routes: [],
  optimize: {
    bundle: true,
    minify: true,
    treeshake: true,
    sourcemap: false,
  },
  packageOptions: {},
  devOptions: {
    hostname: "0.0.0.0",
    port: 5000,
    open: "none",
  },
  buildOptions: {
    baseUrl: './',
    out: 'dist',
  },
};
