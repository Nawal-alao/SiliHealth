```markdown
# E2E Smoke Tests

This folder contains two quick end-to-end smoke test helpers for development.

1) scripts/run-e2e.sh (bash + curl)
- Signs up a new test user
- Logs in and prints the returned token
- Calls /api/me and /api/qr-verify

Run:

```bash
chmod +x scripts/run-e2e.sh
./scripts/run-e2e.sh
```

2) tests/e2e-client.js (Node)
- Uses `fetch` (Node 18+) to programmatically perform signup/login/me/qr-verify

Run:

```bash
node tests/e2e-client.js
```

Note: backend must be running on http://localhost:4000 and PostgreSQL should be available.

```
