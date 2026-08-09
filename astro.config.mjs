// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
// https://astro.build/config
export default defineConfig({
  site: "https://takshashilascs.com",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--geist-sans",
      weights: [100, 200, 300, 400, 500, 700, 800],
    },
  ],
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
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/", "/api/", "/storage/"],
        },
      ],
    }),
  ],
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "takshashilascs.com" },
    ],
  },
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
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
