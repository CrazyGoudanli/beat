import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

function htmlIncludes(): Plugin {
  return {
    name: "html-includes",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(/<include\s+([^>]*?)\s*\/>/g, (_match, raw: string) => {
          const attrs: Record<string, string> = {};
          for (const found of raw.matchAll(/([\w-]+)="([^"]*)"/g)) {
            attrs[found[1]] = found[2];
          }
          if (!attrs.src) return "";
          const current = attrs.current ?? "";
          const flags: Record<string, string> = {
            ariaHome: current === "home" ? 'aria-current="page"' : "",
            ariaJournal: current === "journal" ? 'aria-current="page"' : "",
            ariaSource: current === "source" ? 'aria-current="page"' : "",
            ariaAbout: current === "about" ? 'aria-current="page"' : "",
          };
          const partial = fs.readFileSync(resolve(root, attrs.src), "utf8");
          return partial.replace(/\{\{([\w-]+)\}\}/g, (_token, key: string) => {
            if (key in flags) return flags[key];
            return attrs[key] ?? "";
          });
        });
      },
    },
  };
}

export default defineConfig({
  base: "/beat/",
  appType: "mpa",
  plugins: [htmlIncludes()],
  server: {
    host: "0.0.0.0",
    port: 4731,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4731,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        about: resolve(root, "about/index.html"),
        source: resolve(root, "source/index.html"),
        journal: resolve(root, "journal/index.html"),
        foundation: resolve(root, "journal/foundation/index.html"),
        ai: resolve(root, "journal/ai/index.html"),
        iteration: resolve(root, "journal/iteration/index.html"),
        notFound: resolve(root, "404.html"),
      },
    },
  },
});
