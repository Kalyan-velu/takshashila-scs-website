// @ts-check
import tailwindcss from "@tailwindcss/vite";
import {defineConfig} from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
// https://astro.build/config
export default defineConfig({
  site: "https://takshashilascs.com",
  trailingSlash: "ignore",
  integrations: [react(), vue(), sitemap(), robotsTxt()],
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "takshashilascs.com" },
    ],
  },
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    server: {
      proxy: {
        "/storage": {
          target: "https://takshashilascs.com",
          changeOrigin: true,
        },
        "/wp-json": {
          target: "https://takshashilascs.com",
          changeOrigin: true,
        },
      },
    },
  },
});