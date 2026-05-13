# Deployment

The Pages workflow deploys `apps/web/dist` from `main`.

## Automatic Path

1. Push to `main`.
2. Ensure repository Settings -> Pages -> Source is set to GitHub Actions.
3. Run or wait for `Deploy GitHub Pages`.
4. Open https://canimal4.github.io/InfernoDrift4/.

## Manual Fallback

If Pages is not enabled programmatically:

1. Open `https://github.com/CAnimal4/InfernoDrift4/settings/pages`.
2. Under Source, choose `GitHub Actions`.
3. Save.
4. Open Actions and run `Deploy GitHub Pages` with `workflow_dispatch`.

Backend hosting is separate. Only configure `VITE_SERVER_URL` for Pages after a public `wss://` backend is deployed and verified.
