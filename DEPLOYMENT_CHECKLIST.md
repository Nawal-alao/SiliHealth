# ✅ Checklist de Déploiement Railway + Neon

## 🔍 Vérification Pré-Déploiement

### Backend (NestJS)

- [ ] **Code prêt**
  - [ ] `src/main.ts` écoute sur `process.env.PORT`
  - [ ] CORS accepte `*.railway.app`
  - [ ] Pas d'URLs localhost codées en dur

- [ ] **Base de données**
  - [ ] Prisma schema correct (`schema.prisma`)
  - [ ] `npm run build` fonctionne localement
  - [ ] `npm run prisma:generate` fonctionne

- [ ] **Variables d'environnement**
  - [ ] `DATABASE_URL` de Neon préparée
  - [ ] `JWT_SECRET` généré (min 32 chars)
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` préparée (obtenue après frontend deploy)

- [ ] **Fichiers de configuration**
  - [ ] `backend/railway.json` existe ✓
  - [ ] `backend/.railway/Procfile` existe ✓
  - [ ] `backend/package.json` a `start` script ✓

### Frontend (Express + EJS)

- [ ] **Code prêt**
  - [ ] `server.js` écoute sur `process.env.PORT`
  - [ ] `/api/config` endpoint existe
  - [ ] `main.js` utilise `initializeApiBase()`
  - [ ] Pas d'URLs localhost codées en dur

- [ ] **Templates**
  - [ ] Tous les fichiers `.ejs` existent dans `views/`
  - [ ] CSS et JS statiques sont corrects

- [ ] **Variables d'environnement**
  - [ ] `NODE_ENV=production`
  - [ ] `BACKEND_URL` préparée (obtenue après backend deploy)

- [ ] **Fichiers de configuration**
  - [ ] `frontend/railway.json` existe ✓
  - [ ] `frontend/.railway/Procfile` existe ✓
  - [ ] `frontend/package.json` a `start` script ✓

---

## 🚀 Étapes de Déploiement

### 1️⃣ Préparation Neon

- [ ] Compte Neon créé
- [ ] Base de données créée
- [ ] URL DATABASE_URL copiée et sauvegardée:
  ```
  postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```

### 2️⃣ Déploiement Backend (Projet Railway A)

- [ ] Compte Railway créé
- [ ] Projet Railway A créé
- [ ] GitHub connecté à Railway
- [ ] Dossier `backend` sélectionné
- [ ] Variables d'environnement configurées:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (temporaire: http://localhost:3000)

- [ ] Déploiement lancé
- [ ] Build réussi ✓
- [ ] Migrations exécutées ✓
- [ ] URL Backend notée:
  ```
  https://backend-production-xxxx.railway.app
  ```

- [ ] Tests:
  - [ ] Backend répond: `curl https://backend-production-xxxx.railway.app`
  - [ ] Logs sans erreur: `railway logs --follow`

### 3️⃣ Déploiement Frontend (Projet Railway B)

- [ ] Projet Railway B créé
- [ ] GitHub connecté à Railway
- [ ] Dossier `frontend` sélectionné
- [ ] Variables d'environnement configurées:
  - [ ] `NODE_ENV=production`
  - [ ] `BACKEND_URL=https://backend-production-xxxx.railway.app`

- [ ] Déploiement lancé
- [ ] Build réussi ✓
- [ ] URL Frontend notée:
  ```
  https://frontend-production-xxxx.railway.app
  ```

- [ ] Tests:
  - [ ] Frontend répond: `curl https://frontend-production-xxxx.railway.app`
  - [ ] `/api/config` retourne l'URL du backend
  - [ ] Logs sans erreur: `railway logs --follow`

### 4️⃣ Mise à Jour Configuration CORS

- [ ] Retour au projet Railway A (Backend)
- [ ] `FRONTEND_URL` mise à jour:
  ```
  FRONTEND_URL=https://frontend-production-xxxx.railway.app
  ```
- [ ] Backend redéployé
- [ ] CORS maintenant accepte le frontend ✓

---

## 🧪 Tests de Déploiement

### Test 1: Accès Frontend

- [ ] Ouvrir: `https://frontend-production-xxxx.railway.app`
- [ ] Page se charge complètement
- [ ] CSS/JS chargent correctement
- [ ] Pas d'erreurs 404

### Test 2: Configuration API

- [ ] Ouvrir console du navigateur (F12)
- [ ] Aller à: `https://frontend-production-xxxx.railway.app/api/config`
- [ ] Voir JSON avec `apiBase` pointant vers backend ✓

### Test 3: Authentification

- [ ] Aller à `/login`
- [ ] Ouvrir les Network tabs (F12)
- [ ] Tenter une connexion
- [ ] Voir requête POST vers backend ✓
- [ ] Réponse 200 ou 401 (pas CORS error) ✓

### Test 4: Base de Données

- [ ] Voir les logs du backend: `railway logs --project-id=backend`
- [ ] Pas d'erreurs de connexion à Neon
- [ ] Migrations appliquées au démarrage

---

## 🆘 Troubleshooting Checklist

### Si Backend ne démarre pas

- [ ] Vérifier `DATABASE_URL` en logs
- [ ] Vérifier Neon accessible: `psql 'postgresql://...'`
- [ ] Vérifier migrations: `railway run npm run prisma:migrate:prod`
- [ ] Vérifier `npm run build` localement

### Si Frontend ne démarre pas

- [ ] Vérifier `npm start` localement
- [ ] Vérifier `server.js` écoute sur `process.env.PORT`
- [ ] Vérifier logs pour erreurs Node.js

### Si CORS error

- [ ] Vérifier `FRONTEND_URL` dans backend
- [ ] Redéployer backend
- [ ] Vérifier `/api/config` du frontend
- [ ] Vérifier `BACKEND_URL` du frontend

### Si Database connection error

- [ ] Vérifier URL Neon exacte
- [ ] Tester localement: `psql 'postgresql://...'`
- [ ] Vérifier SSL mode = require
- [ ] Vérifier firewall Neon (IP whitelist)

---

## 📊 Suivi Post-Déploiement

### Monitoring Quotidien

- [ ] Vérifier logs backend: `railway logs --project-id=backend --follow`
- [ ] Vérifier logs frontend: `railway logs --project-id=frontend --follow`
- [ ] Tester authentification
- [ ] Vérifier Database dans Neon dashboard

### Maintenance

- [ ] Sauvegardes Neon configurées
- [ ] Alertes Railway activées
- [ ] Plan de rollback préparé
- [ ] Documentation mise à jour

---

## ✅ Déploiement Réussi!

Quand tout est coché, votre application est en production! 🎉

```
✓ Backend déployé sur Railway
✓ Frontend déployé sur Railway
✓ Database sur Neon
✓ Communication frontend ←→ backend testée
✓ CORS configuré correctement
✓ Logs normaux sans erreurs
✓ Application accessible publiquement
```

**URLs de Production:**
- Frontend: `https://frontend-production-xxxx.railway.app`
- Backend: `https://backend-production-xxxx.railway.app`
- Database: Neon

---

## 📞 Support

- 📖 Documentation: `DEPLOYMENT_RAILWAY_NEON.md`
- ⚡ Quick Start: `RAILWAY_QUICK_START.md`
- 🏥 Health Check: `bash health-check.sh <backend-url> <frontend-url>`
