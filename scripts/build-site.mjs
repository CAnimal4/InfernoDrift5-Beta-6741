import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, "dist");

const result = spawnSync(
  "npx",
  ["vite", "build", "--config", "client/vite.config.ts"],
  { cwd: root, stdio: "inherit" },
);
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

for (const file of [
  "manifest.webmanifest",
  "icon.svg",
  "favicon.ico",
  "icon-192.png",
  "icon-512.png",
  "icon-64.png",
  "sw.js",
]) {
  const source = path.join(root, file);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(dist, file));
}

fs.mkdirSync(path.join(dist, "output", "imagegen"), { recursive: true });
for (const file of ["infernodrift33-card.svg", "infernodriftmax1-card.svg"]) {
  const source = path.join(root, "output", "imagegen", file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(dist, "output", "imagegen", file));
  }
}

fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log("Built InfernoDrift4 React site to dist/");
