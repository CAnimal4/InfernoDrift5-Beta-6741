# Backend

The backend is local/production-ready scaffolding for online features. It is not required for GitHub Pages play.

```bash
cp .env.example .env
npm run dev:server
curl http://127.0.0.1:8787/health
```

Features:

- Guest/device usernames
- Private room codes
- Casual/ranked queue-compatible room creation
- 1v1/2v2/3v3 sizing with bot fill
- Lobby chat and quick chat
- Sanitization, rate limits, and speed sanity rejection
- Local JSON persistence in `DATA_DIR`

Configure the frontend only after a real public backend exists. Use a `wss://` endpoint; do not claim backend hosting from GitHub Pages.
