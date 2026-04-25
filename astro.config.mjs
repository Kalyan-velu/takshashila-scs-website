// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
// https://astro.build/config
export default defineConfig({
  site: "https://www.takshashilascs.com",
  trailingSlash: "ignore",
  integrations: [
    react(),
    vue(),
    sitemap({
      xslURL: "/sitemap.xsl",
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    robotsTxt(),
  ],
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "takshashilascs.com" },
      { protocol: "https", hostname: "takshashilascs.com" },
    ],
  },
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    server: {
      proxy: {
        "/storage": {
          target: "https://crm.takshashilascs.com",
          changeOrigin: true,
        },
        "/wp-json": {
          target: "https://crm.takshashilascs.com",
          changeOrigin: true,
        },
      },
    },
  },
});
