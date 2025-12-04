# HealID Plateforme Médicale Numérique — Guide d'Intégration

## Vue d'ensemble

HealID est une plateforme médicale numérique complète comprenant :
- **Frontend** : EJS/Express dev server avec interface premium ultra-minimaliste (CSS design system)
- **Backend** : NestJS + Fastify + Prisma + PostgreSQL, avec JWT auth et endpoints protégés
- **Base de données** : PostgreSQL (local ou Docker)

## Architecture

```
frontend/                      backend/
├── views/                      ├── src/
│   ├── partials/              │   ├── auth/              [signup/login, JWT guard]
│   ├── index.ejs              │   ├── consultations/    [CRUD]
│   ├── signup.ejs             │   ├── upload/           [multipart file uploads]
│   ├── login.ejs              │   ├── prisma/           [DB service]
│   ├── dashboard.ejs          │   └── app.module.ts
│   ├── consultations.ejs      ├── prisma/
│   └── [18+ pages]            │   └── schema.prisma     [User, Consultation, Upload]
├── css/style.css              ├── .env
├── js/main.js                 ├── docker-compose.yml
└── server.js                  └── package.json
```

## Démarrage rapide

### 1. Frontend (port 3000)

```bash
cd /home/nawalalao/Documents/SiliHealth/frontend
npm install
npm run start
# ou : node server.js
# Accessible à http://localhost:3000
```

### 2. Backend (port 4000)

#### Prérequis : PostgreSQL en cours d'exécution

```bash
# Option A : PostgreSQL local (vous devez l'avoir installé)
# Assurez-vous que Postgres écoute sur localhost:5432

# Option B : PostgreSQL via Docker
cd /home/nawalalao/Documents/SiliHealth/backend
docker-compose up -d  # démarre Postgres sur le port 5432
```

#### Installation et démarrage du serveur Nest

```bash
cd /home/nawalalao/Documents/SiliHealth/backend
npm install
npx prisma generate      # générer le client Prisma
npx prisma migrate dev --name init   # appliquer migrations
npm run start:dev        # démarrer le serveur dev (port 4000)
```

**Log de succès attendu :**
```
HealID backend running at http://localhost:4000
```

## Endpoints API

### Authentification (publics)

#### POST `/api/signup`
Créer un nouvel utilisateur.

```bash
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Jean Dupont",
    "email": "jean@example.com",
    "password": "SecurePass123",
    "role": "patient"
  }'
```

**Réponse :**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "fullname": "Jean Dupont",
    "email": "jean@example.com",
    "role": "patient",
    "createdAt": "2025-11-24T..."
  }
}
```

#### POST `/api/login`
Se connecter et obtenir un JWT.

```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "SecurePass123"
  }'
```

**Réponse :**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "jean@example.com", ... }
}
```

### Consultations (protégés — JWT requis)

#### GET `/api/consultations`
Lister toutes les consultations (pas besoin de JWT).

```bash
curl -X GET http://localhost:4000/api/consultations
```

#### POST `/api/consultations` ⚠️ JWT requis
Créer une nouvelle consultation.

```bash
TOKEN="<JWT du login>"
curl -X POST http://localhost:4000/api/consultations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patient": "Jean Dupont",
    "date": "2025-12-15",
    "doctor": "Dr. Martin"
  }'
```

**Erreur si pas de token :**
```json
{
  "statusCode": 401,
  "message": "No authorization header",
  "error": "Unauthorized"
}
```

### Uploads (protégés — JWT requis)

#### POST `/api/upload` ⚠️ JWT requis, multipart
Uploader un fichier (résultats de tests, etc.).

```bash
TOKEN="<JWT du login>"
curl -X POST http://localhost:4000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@path/to/file.pdf"
```

**Réponse :**
```json
{
  "ok": true,
  "files": [
    {
      "id": 1,
      "filename": "file.pdf",
      "path": "/uploads/1699633200000-file.pdf",
      "createdAt": "2025-11-24T..."
    }
  ]
}
```

## Flux d'intégration Frontend ↔ Backend

### 1. Inscription

1. Utilisateur accède à `http://localhost:3000/signup`
2. Remplit le formulaire (fullname, email, password)
3. Frontend soumet via `POST http://localhost:4000/api/signup`
4. Backend valide (class-validator DTOs), hache le mot de passe (bcrypt), crée l'utilisateur
5. Frontend redirige vers `/login`

### 2. Connexion

1. Utilisateur accède à `http://localhost:3000/login`
2. Remplit le formulaire (email, password)
3. Frontend soumet via `POST http://localhost:4000/api/login`
4. Backend valide les credentials, émet un JWT
5. **Frontend stocke le JWT dans localStorage** (`healid_token`)
6. Frontend redirige vers `/dashboard`

### 3. Actions protégées

1. Utilisateur crée une consultation à partir de `/consultations` ou `/consultation-new`
2. Frontend récupère le JWT depuis localStorage
3. Frontend inclut le header `Authorization: Bearer <JWT>` dans la requête
4. Backend valide le JWT via `JwtAuthGuard`
5. Si valide, le endpoint traite la requête ; sinon retourne 401 Unauthorized

### 4. Upload de fichiers

1. Utilisateur visite `/upload-results` ou utilise un formulaire d'upload
2. Frontend soumet avec `multipart/form-data` + header `Authorization: Bearer <JWT>`
3. Backend vérifie le JWT, accepte le fichier
4. Backend sauvegarde en local (`/uploads/<timestamp>-filename`) et enregistre metadata en DB
5. Frontend affiche la confirmation ou un lien vers le fichier

## Configuration

### Variables d'environnement

#### Backend (`.env` dans `/backend`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/healid?schema=public"
PORT=4000
JWT_SECRET="your-secure-secret-in-production"  # optionnel, par défaut = "dev-secret-change-me"
```

#### Frontend

- L'API base est définie dans `frontend/js/main.js` : `API_BASE = 'http://localhost:4000'`
- Modifiez si vous déployez sur d'autres hôtes

### Prisma Schema

Located at `backend/prisma/schema.prisma`. Contient :

- **User** : id, fullname, email, password (bcrypt), role, createdAt
- **Consultation** : id, patient, date, status, doctor, createdAt
- **Upload** : id, filename, path, createdAt
- **ActivityLog** : pour les logs d'audit (future utilisation)

## Développement & Troubleshooting

### Erreur : "Cannot connect to database"

- Vérifiez que Postgres écoute sur `localhost:5432`
- Vérifiez la variable `DATABASE_URL` dans `.env`
- Essayez : `psql postgresql://postgres:postgres@localhost:5432/postgres -c "SELECT 1"`

### Erreur : 401 Unauthorized sur endpoints protégés

- Assurez-vous que le JWT est inclus dans le header `Authorization: Bearer <token>`
- Vérifiez que le token n'a pas expiré (8h par défaut, voir `auth.service.ts`)
- Testez avec le même token que celui reçu lors du login

### Erreur : "No authorization header"

- L'endpoint requiert un JWT mais aucun n'a été fourni
- Pour les tests : ajouter `-H "Authorization: Bearer <token>"` au curl

### Générer une migration après changement de schema

```bash
cd backend
npx prisma migrate dev --name <name>
```

### Nettoyer les uploads locaux

```bash
cd backend
rm -rf uploads/*
```

## Prochaines étapes (Optionnel)

### Sécurité & Production

- [ ] Passer `JWT_SECRET` via `process.env` en production
- [ ] Ajouter HTTPS/TLS sur le serveur Nest
- [ ] Ajouter rate-limiting sur `/api/signup` et `/api/login`
- [ ] Implémenter Redis pour les sessions/cache de tokens
- [ ] Configurer S3 pour les uploads (au lieu de local filesystem)
- [ ] Ajouter scanning antivirus pour les uploads
- [ ] Implémenter RBAC (Role-Based Access Control) avec guards supplémentaires

### Features

- [ ] Pagination sur GET `/api/consultations`
- [ ] Soft-delete pour les consultations/uploads
- [ ] Endpoints pour les tests de laboratoire (`/api/tests`)
- [ ] Calcul de grossesse intégré au backend
- [ ] Notifications (email, SMS)
- [ ] Export données (PDF, Excel)
- [ ] Audit logging complet

### Tests

- [ ] Ajouter unit tests (Jest)
- [ ] Ajouter integration tests (Supertest)
- [ ] Tests E2E (Cypress ou Playwright)

### Déploiement

- [ ] Créer Dockerfile pour le backend
- [ ] Créer docker-compose final avec frontend + backend + Postgres
- [ ] Déployer sur AWS ECS / Kubernetes / Railway / Fly.io

## Support

Pour les questions ou problèmes :
1. Consultez les logs (`backend.log`, stderr/stdout du frontend)
2. Vérifiez que les ports 3000 et 4000 sont libres
3. Assurez-vous que Postgres est en cours d'exécution
4. Testez les endpoints avec curl avant de tester via le frontend

---

**HealID - Plateforme Médicale Numérique**  
Dernière mise à jour : novembre 2025
