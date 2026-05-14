# Deployment

Frontend deployment uses GitHub Pages Actions.

1. Push `main`.
2. Ensure Settings -> Pages -> Source is GitHub Actions.
3. Wait for `Deploy GitHub Pages`.
4. Open https://canimal4.github.io/InfernoDrift4/.

The workflow runs `npm ci`, type checks, tests, builds `dist/`, uploads the Pages artifact, and deploys with official Pages actions.

Backend deployment is separate. Deploy `apps/server` to a Node/WebSocket host, then configure the client with a public `wss://` server URL.
