import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: "es2015",
    rollupOptions: {
      input: {
        "src/content": "src/content.ts",
        "src/background": "src/background.ts",
        "src/popup/popup": "src/popup/popup.ts",
        "src/popup/popup_module": "src/popup/popup.html"
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});