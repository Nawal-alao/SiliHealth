# 🚀 Guide Complet de Déploiement sur Railway + Neon

## Architecture du Déploiement

```
┌─────────────────────────────────────────────────────┐
│                  Railway Project A                   │
│                   (Backend NestJS)                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  backend.railway.app                           │ │
│  │  Port: Assigné automatiquement par Railway     │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         ↕ (API Calls)
┌─────────────────────────────────────────────────────┐
│                  Railway Project B                   │
│                  (Frontend Express+EJS)             │
│  ┌────────────────────────────────────────────────┐ │
│  │  frontend.railway.app                          │ │
│  │  Port: Assigné automatiquement par Railway     │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         ↕ (Database Queries)
┌─────────────────────────────────────────────────────┐
│                  Neon PostgreSQL                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  ep-steep-queen-adtatjxy-pooler.c-2...        │ │
│  │  (URL complète de DATABASE_URL)                │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Étape 1 : Configuration de la Base de Données Neon

Vous avez déjà l'URL de Neon. Conservez-la précieusement:

```
DATABASE_URL=postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Cette URL contient:
- **Utilisateur**: `neondb_owner`
- **Mot de passe**: `npg_y0cR7nwJpDEG`
- **Host**: `ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech`
- **Base de données**: `neondb`
- **SSL**: Activé (sslmode=require)

---

## Étape 2 : Déployer le Backend sur Railway (Projet A)

### 2.1 Créer le Projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un nouveau projet: **New Project**
3. Sélectionnez **Deploy from GitHub**
4. Connectez votre repo GitHub SiliHealth
5. Sélectionnez le dossier `backend`

### 2.2 Configurer les Variables d'Environnement

Dans le dashboard Railway du projet A, allez à **Variables** et configurez:

```
DATABASE_URL=postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=your_super_secret_key_min_32_chars_here

NODE_ENV=production

FRONTEND_URL=https://your-frontend.railway.app
```

⚠️ **Important**: Remplacez `your-frontend.railway.app` par l'URL réelle de votre frontend.

### 2.3 Vérifier la Configuration du Build

Dans Railway:
- **Build Command**: Railway détecte automatiquement (npm install + npm run build)
- **Start Command**: `npm start`

Railway utilisera le fichier `railway.json` et `.railway/Procfile` automatiquement.

### 2.4 Déployer

Railway détecte les changements sur GitHub automatiquement. Sinon, cliquez sur **Deploy** dans le dashboard.

**Attendez**: Railway compilera, migrera la base de données, et démarrera le serveur.

Une fois deployé, vous verrez:
```
✓ Build successful
✓ Deployment successful
Backend URL: https://backend-production-xxxx.railway.app
```

### 2.5 Tester le Backend

```bash
curl https://backend-production-xxxx.railway.app/health
```

---

## Étape 3 : Déployer le Frontend sur Railway (Projet B)

### 3.1 Créer le Projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un **Nouveau Projet**: **New Project**
3. Sélectionnez **Deploy from GitHub**
4. Connectez votre repo GitHub SiliHealth
5. Sélectionnez le dossier `frontend`

### 3.2 Configurer les Variables d'Environnement

Dans le dashboard Railway du projet B, allez à **Variables** et configurez:

```
NODE_ENV=production

BACKEND_URL=https://backend-production-xxxx.railway.app
```

⚠️ **Important**: Remplacez `backend-production-xxxx.railway.app` par l'URL réelle de votre backend.

### 3.3 Vérifier la Configuration du Build

- **Build Command**: Railway détecte automatiquement
- **Start Command**: `npm start`

Railway utilisera le fichier `railway.json` et `.railway/Procfile` automatiquement.

### 3.4 Déployer

Railway détecte les changements sur GitHub automatiquement. Sinon, cliquez sur **Deploy** dans le dashboard.

Une fois deployé, vous verrez:
```
✓ Build successful
✓ Deployment successful
Frontend URL: https://frontend-production-xxxx.railway.app
```

---

## Étape 4 : Mettre à Jour la Configuration CORS

Une fois que vous avez les URLs réelles du frontend, retournez au **Projet A (Backend)** et mettez à jour:

```
FRONTEND_URL=https://frontend-production-xxxx.railway.app
```

Puis redéployez le backend.

---

## Étape 5 : Tester l'Application Complète

### 5.1 Accéder au Frontend

Ouvrez: `https://frontend-production-xxxx.railway.app`

### 5.2 Tester une Requête API

1. Allez à `/login`
2. Entrez vos identifiants
3. Vérifiez dans la console navigateur (F12) que les requêtes vont vers votre backend

### 5.3 Vérifier les Logs

**Backend (Projet A)**:
```bash
railway logs --project-a
```

**Frontend (Projet B)**:
```bash
railway logs --project-b
```

---

## ⚙️ Variables d'Environnement Récapitulatif

### Backend (Railway Projet A)

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `DATABASE_URL` | URL Neon complète | `postgresql://neondb_owner:...` |
| `JWT_SECRET` | Secret JWT (min 32 chars) | `your_super_secret_key_min_32_chars_here` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | URL frontend Railway | `https://frontend-production-xxxx.railway.app` |

### Frontend (Railway Projet B)

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `NODE_ENV` | `production` | `production` |
| `BACKEND_URL` | URL backend Railway | `https://backend-production-xxxx.railway.app` |

---

## 🔍 Troubleshooting

### ❌ Erreur: "Connection refused"

**Cause**: Le frontend ne peut pas joindre le backend.

**Solution**:
1. Vérifiez que `BACKEND_URL` est correct dans le Projet B
2. Vérifiez que le backend est deployé et running
3. Vérifiez les logs: `railway logs --project-a`

### ❌ Erreur: "CORS error"

**Cause**: Le backend n'accepte pas les requêtes du frontend.

**Solution**:
1. Vérifiez que `FRONTEND_URL` est configurée dans le Projet A
2. Redéployez le backend
3. Vérifiez `src/main.ts` - CORS doit accepter `*.railway.app`

### ❌ Erreur: "Database connection failed"

**Cause**: `DATABASE_URL` est incorrecte ou Neon n'est pas accessible.

**Solution**:
1. Vérifiez l'URL Neon complète
2. Testez la connexion localement: `psql 'postgresql://...'`
3. Vérifiez les logs: `railway logs --project-a`

### ❌ Erreur: "Table does not exist"

**Cause**: Les migrations Prisma n'ont pas été exécutées.

**Solution**:
1. Les migrations s'exécutent automatiquement au démarrage via `npm start`
2. Vérifiez les logs: `railway logs --project-a`
3. Exécutez manuellement: `railway run npm run prisma:migrate:prod`

### ❌ Build fails: "Out of memory"

**Cause**: Le plan gratuit de Railway a des limites.

**Solution**:
1. Augmentez les ressources dans Railway (plan payant)
2. Optimisez les dépendances

---

## 📊 Monitoring et Logs

### Logs du Backend

```bash
railway logs --project-id=backend-project-id
```

### Logs du Frontend

```bash
railway logs --project-id=frontend-project-id
```

### Dashboard Railway

- **Deployments**: Voir les déploiements précédents
- **Metrics**: CPU, mémoire, uptime
- **Logs**: Logs en temps réel
- **Variables**: Variables d'environnement

---

## 🔒 Sécurité

- ✅ JWT_SECRET: Utilisez une clé forte et secrète
- ✅ DATABASE_URL: Ne partagez jamais cette URL
- ✅ HTTPS: Railway fourni automatiquement
- ✅ CORS: Configuré pour ne permettre que votre frontend

---

## 📝 Commandes Utiles

```bash
# Se connecter à Railway
railway login

# Afficher les projets
railway projects

# Afficher les logs en temps réel
railway logs --follow

# Exécuter une commande (ex: migration)
railway run npm run prisma:migrate:prod

# Voir les variables
railway variables
```

---

## ✅ Checklist de Déploiement

- [ ] URL Neon récupérée et testée
- [ ] Projet Railway A créé (Backend)
- [ ] Projet Railway B créé (Frontend)
- [ ] Variables d'environnement Backend configurées
- [ ] Variables d'environnement Frontend configurées
- [ ] Backend deployé et testé
- [ ] Frontend deployé et testé
- [ ] Requête API frontend → backend fonctionnelle
- [ ] Base de données accessible et migrations exécutées
- [ ] CORS configuré correctement
- [ ] Logs vérifiés et pas d'erreurs

---

## 🎉 Succès!

Votre application est maintenant en production sur Railway avec:
- ✅ Backend sur Railway Projet A
- ✅ Frontend sur Railway Projet B
- ✅ Base de données PostgreSQL sur Neon
- ✅ Communication sécurisée via HTTPS
- ✅ Déploiement automatique depuis GitHub

**Frontend URL**: `https://frontend-production-xxxx.railway.app`
**Backend API**: `https://backend-production-xxxx.railway.app`

Profitez! 🚀
