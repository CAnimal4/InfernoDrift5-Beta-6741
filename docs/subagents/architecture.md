# Architecture / Build Subagent Report

- Acceptance checks: install, typecheck, lint, test, build, smoke, e2e, Pages workflow.
- Decision: restart from the current single-page InfernoDrift code and layer ID4 systems conservatively instead of reviving the rejected monorepo.
- Build: `scripts/build-site.mjs` copies the static client into `dist/` with `.nojekyll` for GitHub Pages.
- CI/Pages: workflows run from `main`, install with `npm ci`, validate, build, upload `dist/`, and deploy with official Pages actions.
