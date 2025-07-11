import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true,
    allowedHosts: ["db79-2407-4d00-3c00-7ef9-a084-dc84-a30d-4b3d.ngrok-free.app"]
  }
});
