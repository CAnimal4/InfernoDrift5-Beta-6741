import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const targetScript = process.argv[2];
if (!targetScript) {
  console.error("Usage: node scripts/run-with-server.mjs <script>");
  process.exit(1);
}

async function getFreePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 4173;
  server.close();
  await once(server, "close");
  return port;
}

function waitForHttp(url, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) return resolve();
      } catch {
        // Keep polling until the static server has finished booting.
      }
      if (Date.now() > deadline)
        return reject(new Error(`Timed out waiting for ${url}`));
      setTimeout(tick, 150);
    };
    tick();
  });
}

const port = await getFreePort();
const build = spawnSync("npm", ["run", "build:web"], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);
const serveRoot = fs.mkdtempSync(path.join(os.tmpdir(), "id4-pages-smoke-"));
const mount = path.join(serveRoot, "InfernoDrift4");
fs.symlinkSync(path.join(process.cwd(), "dist"), mount, "dir");
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};
const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  let relativePath = decodeURIComponent(requestUrl.pathname);
  if (relativePath.endsWith("/")) relativePath += "index.html";
  const filePath = path.normalize(path.join(serveRoot, relativePath));
  if (!filePath.startsWith(serveRoot)) {
    response.writeHead(403);
    response.end("forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type":
        contentTypes[path.extname(filePath)] ?? "application/octet-stream",
    });
    response.end(data);
  });
});
const url = `http://127.0.0.1:${port}/InfernoDrift4/`;

try {
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  await waitForHttp(url);
  const child = spawn("node", [targetScript], {
    stdio: "inherit",
    env: { ...process.env, SMOKE_URL: url },
  });
  const [code] = await once(child, "exit");
  process.exitCode = code ?? 1;
} finally {
  server.close();
  fs.rmSync(serveRoot, { recursive: true, force: true });
}
