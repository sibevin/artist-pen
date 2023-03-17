import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "=": path.resolve(__dirname, "./test"),
    },
  },
  plugins: [vue(), basicSsl()],
});
