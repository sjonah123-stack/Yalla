import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const artifact = !!process.env.ARTIFACT;

export default defineConfig({
  define: { __ARTIFACT__: JSON.stringify(artifact) },
  plugins: [
    react(),
    ...(artifact
      ? []
      : [
          VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["fonts/*.woff2", "icons/*.png", "icons/*.svg"],
            manifest: {
              name: "Yalla — Hebrew roots",
              short_name: "Yalla",
              description: "A gamified trainer for Hebrew roots (shorashim).",
              theme_color: "#1B3FD1",
              background_color: "#F4F1E8",
              display: "standalone",
              start_url: "/",
              icons: [
                { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
                { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
                { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
              // Firebase Auth serves /__/auth/* on this origin; never answer it with index.html.
              navigateFallbackDenylist: [/^\/__\//],
            },
          }),
        ]),
  ],
  build: artifact
    ? {
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        cssCodeSplit: false,
        modulePreload: false,
        rollupOptions: { output: { inlineDynamicImports: true } },
      }
    : {},
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
} as Parameters<typeof defineConfig>[0]);
