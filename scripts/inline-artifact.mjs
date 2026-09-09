// Emit a single self-contained HTML file from the artifact build (dist-artifact/):
// JS, CSS and fonts inlined; plus a head/body-stripped variant for pasting into a Claude artifact.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "dist-artifact";
let html = readFileSync(join(dir, "index.html"), "utf8");

const asset = (p) => readFileSync(join(dir, p.replace(/^\//, "")));

// Fonts referenced from CSS as url("/fonts/x.woff2") -> data URIs.
const inlineFonts = (css) =>
  css.replace(
    /url\(["']?(\/[^"')]+\.woff2)["']?\)/g,
    (_, p) => `url(data:font/woff2;base64,${asset(p).toString("base64")})`,
  );

html = html.replace(
  /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_, href) => `<style>\n${inlineFonts(asset(href).toString("utf8"))}\n</style>`,
);
html = html.replace(
  /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, src) => `<script type="module">\n${asset(src).toString("utf8")}\n</script>`,
);
// Drop icon links and modulepreloads — no external requests allowed.
html = html.replace(/<link rel="(icon|apple-touch-icon|modulepreload|manifest)"[^>]*>\s*/g, "");

// The artifact is offline-only: the Firebase cloud module must have been folded out by `__ARTIFACT__`.
if (/firebase|firestore\.googleapis/i.test(html))
  throw new Error("Firebase leaked into the artifact build — check __ARTIFACT__ in cloud-loader.ts");

mkdirSync("dist", { recursive: true });
writeFileSync("dist/yalla.html", html);
const artifact = html
  .replace(/^[\s\S]*?<head>/, "")
  .replace(/<\/head>\s*<body>/, "")
  .replace(/<\/body>\s*<\/html>\s*$/, "");
writeFileSync("dist/yalla.artifact.html", artifact);
console.log(
  `dist/yalla.html ${(html.length / 1024).toFixed(0)} KB · dist/yalla.artifact.html ${(artifact.length / 1024).toFixed(0)} KB`,
);
console.log("assets left in", dir, ":", readdirSync(join(dir, "assets")).join(", "));
