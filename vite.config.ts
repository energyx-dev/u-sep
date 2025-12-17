import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
// import jsx from "vite-plugin-jsx";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === "electron";

  return {
    base: isElectron ? "./" : "/",
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      open: isElectron ? false : true,
    },
  };
});
