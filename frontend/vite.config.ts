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
      includeAssets: ["pedcalc-icon.svg"],
      manifest: {
        name: "PEDCALC",
        short_name: "PEDCALC",
        description: "Calculadora pediátrica offline para posologia em mL.",
        theme_color: "#5ADB91",
        background_color: "#F9FAFB",
        display: "standalone",
        orientation: "portrait",
        scope: isGitHubPages ? "/PEDCALC/" : "/",
        start_url: isGitHubPages ? "/PEDCALC/" : "/",
        icons: [
          {
            src: "/pedcalc-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
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
