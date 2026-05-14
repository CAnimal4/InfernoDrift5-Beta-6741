import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "output", "imagegen"), { recursive: true });

for (const file of [
  "index.html",
  "style.css",
  "script.js",
  "manifest.webmanifest",
  "icon.svg",
  "favicon.ico",
  "icon-192.png",
  "icon-512.png",
  "icon-64.png",
  "sw.js",
]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const file of ["infernodrift33-card.svg", "infernodriftmax1-card.svg"]) {
  fs.copyFileSync(
    path.join(root, "output", "imagegen", file),
    path.join(dist, "output", "imagegen", file),
  );
}

fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log("Built InfernoDrift4 static site to dist/");
