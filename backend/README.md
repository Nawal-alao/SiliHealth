# HealID Backend (scaffold)

This is a minimal NestJS-style backend scaffold using Fastify + Prisma.

Quick start (local):

1. Install dependencies

```bash
cd backend
npm install
```

2. Start Postgres (recommended via Docker Compose):

```bash
docker-compose up -d
```

3. Generate Prisma client and migrate

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start dev server

```bash
npm run start:dev
```

API endpoints (mocked/DB ready):
- POST `/api/signup`
- POST `/api/login`
- GET `/api/consultations` / POST `/api/consultations`
- POST `/api/upload` (multipart)
- GET `/api/pregnancy/calc?last_period=YYYY-MM-DD`
