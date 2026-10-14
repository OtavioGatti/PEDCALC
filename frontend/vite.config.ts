import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isGitHubPages ? "/PEDCALC/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pedcalc-icon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "PEDCALC",
        short_name: "PEDCALC",
        lang: "pt-BR",
        description: "Calculadora pediátrica offline para posologia em mL.",
        theme_color: "#FFFFFF",
        background_color: "#F6F7F9",
        display: "standalone",
        orientation: "portrait",
        scope: isGitHubPages ? "/PEDCALC/" : "/",
        start_url: isGitHubPages ? "/PEDCALC/" : "/",
        // Relative paths: the app is served under /PEDCALC/ on GitHub Pages.
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pedcalc-pages"
            }
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "pedcalc-assets"
            }
          }
        ]
      }
    })
  ]
});
