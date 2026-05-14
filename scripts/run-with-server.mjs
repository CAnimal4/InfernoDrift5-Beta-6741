import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";

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
const server = spawn(
  "npx",
  ["http-server", ".", "-p", String(port), "-c-1", "--silent"],
  {
    stdio: ["ignore", "inherit", "inherit"],
  },
);
const url = `http://127.0.0.1:${port}/index.html`;

try {
  await waitForHttp(url);
  const child = spawn("node", [targetScript], {
    stdio: "inherit",
    env: { ...process.env, SMOKE_URL: url },
  });
  const [code] = await once(child, "exit");
  process.exitCode = code ?? 1;
} finally {
  server.kill("SIGTERM");
}
