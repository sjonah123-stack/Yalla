// Bundles index.html + styles.css + data/roots.js + app.js into dist/yalla.html
// (a single self-contained page, used for publishing as a Claude artifact).
// Usage: node build.js
const fs = require("fs"), path = require("path");
const read = (p) => fs.readFileSync(path.join(__dirname, p), "utf8");
let html = read("index.html");
html = html.replace('<link rel="stylesheet" href="styles.css">', `<style>\n${read("styles.css")}\n</style>`);
html = html.replace('<script src="data/roots.js"></script>', `<script>\n${read("data/roots.js")}\n</script>`);
html = html.replace('<script src="app.js"></script>', `<script>\n${read("app.js")}\n</script>`);
// Artifact host wraps the file in its own document skeleton; strip ours.
const artifact = html.replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*/i, "")
  .replace(/<\/head>\s*<body>/i, "").replace(/<\/body>\s*<\/html>\s*$/i, "");
fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "dist/yalla.html"), html);
fs.writeFileSync(path.join(__dirname, "dist/yalla.artifact.html"), artifact);
console.log("built dist/yalla.html (" + (html.length / 1024).toFixed(0) + " KB)");
