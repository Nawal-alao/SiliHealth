# Playwright E2E tests

This folder contains Playwright tests for the HealID frontend.

Setup (local dev):

1) Install Playwright (must be run from the project root where you have node):

```bash
# install playright in your environment (example using npm)
cd e2e
npm init -y
npm i -D @playwright/test
npx playwright install --with-deps
```

2) Start servers:

- Start Postgres (docker-compose up -d)
- Start backend (see backend/.env) on :4000
- Start frontend on :3000

3) Run Playwright tests:

```bash
cd e2e
npx playwright test
```

Notes:
- The tests expect the app to be available at http://localhost:3000 and backend on 4000 for API behavior.
- CI steps later can be added to automate server start and test execution.
