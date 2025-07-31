import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      "a7c7-2600-8807-c186-f900-9d1b-9e70-b178-5447.ngrok-free.app",
    ],
    port: 8080,
    open: false,
  },
});
