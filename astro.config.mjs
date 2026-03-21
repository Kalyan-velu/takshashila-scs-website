
// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), vue()],
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "takshashilascs.com" },
    ],
  },
  // Remove the redirects - they don't work for external URLs
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