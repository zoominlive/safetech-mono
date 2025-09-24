import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // for sharing local env over same network
  // server: {
  //   host: true, // This allows access from other devices on the network
  //   port: 5173, // You can specify a port or let Vite choose
  // },
});
