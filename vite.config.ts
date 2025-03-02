import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows external access
    port: 3000, // Optional: Change to your preferred port
    strictPort: true, // Ensures the selected port is used
    cors: true, // Enables CORS
    allowedHosts: true, // Allows all hosts
  },
});
