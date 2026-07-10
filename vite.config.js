import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        shop: resolve(__dirname, "shop/index.html"),
        product: resolve(__dirname, "shop/signature-blend/index.html"),
        about: resolve(__dirname, "about/index.html"),
        wholesale: resolve(__dirname, "wholesale/index.html"),
        contact: resolve(__dirname, "contact/index.html"),
        faq: resolve(__dirname, "faq/index.html"),
      },
    },
  },
});
