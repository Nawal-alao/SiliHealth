# Railway Environment Variables - Ready to Copy/Paste

## 🔐 Backend (Railway Projet A)

Copier-coller ces variables dans le dashboard Railway du Backend:

```
DATABASE_URL=postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=silihealth_jwt_secret_key_min_32_characters_2025

NODE_ENV=production

FRONTEND_URL=https://frontend-production-xxxx.railway.app
```

**⚠️ À faire:**
1. Remplacez `silihealth_jwt_secret_key_min_32_characters_2025` par une clé plus forte
2. Remplacez `frontend-production-xxxx.railway.app` par votre URL réelle du frontend (après le déploiement du frontend)

---

## 🎨 Frontend (Railway Projet B)

Copier-coller ces variables dans le dashboard Railway du Frontend:

```
NODE_ENV=production

BACKEND_URL=https://backend-production-xxxx.railway.app
```

**⚠️ À faire:**
1. Remplacez `backend-production-xxxx.railway.app` par votre URL réelle du backend

---

## 📋 Ordre de Déploiement

### 1️⃣ Déployer Backend D'ABORD

- Cliquez **Deploy** dans Railway Projet A
- Attendez que le build et les migrations se terminent
- Notez l'URL: `https://backend-production-xxxx.railway.app`

### 2️⃣ Mettre à Jour Frontend

- Allez à Railway Projet B
- Mettez à jour `BACKEND_URL` avec l'URL du backend
- Cliquez **Deploy**
- Attendez que le build se termine
- Notez l'URL: `https://frontend-production-xxxx.railway.app`

### 3️⃣ Mettre à Jour Backend CORS

- Retournez à Railway Projet A
- Mettez à jour `FRONTEND_URL` avec l'URL du frontend
- Cliquez **Redeploy**
- Attendez que le redéploiement se termine

---

## 🔑 Générer une Clé JWT Forte

Si vous voulez générer une clé JWT plus personnalisée, exécutez:

```bash
# Sur votre machine locale
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Résultat exemple:
```
a7f3b2c8d9e1f4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

Utilisez cette chaîne comme `JWT_SECRET`.

---

## 🔄 Structure Complete

```
┌─────────────────────────────────────────────────────────────┐
│ Railway Backend (Projet A)                                  │
├─────────────────────────────────────────────────────────────┤
│ Environment Variables:                                       │
│ • DATABASE_URL → Neon                                       │
│ • JWT_SECRET → Clé secrète                                  │
│ • NODE_ENV → production                                     │
│ • FRONTEND_URL → https://frontend-production-xxxx...        │
│                                                              │
│ URL: https://backend-production-xxxx.railway.app            │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│ Railway Frontend (Projet B)                                  │
├─────────────────────────────────────────────────────────────┤
│ Environment Variables:                                       │
│ • NODE_ENV → production                                     │
│ • BACKEND_URL → https://backend-production-xxxx...          │
│                                                              │
│ URL: https://frontend-production-xxxx.railway.app           │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│ Neon PostgreSQL Database                                    │
├─────────────────────────────────────────────────────────────┤
│ Connection: postgresql://neondb_owner:npg_y0cR7nwJpDEG@...  │
│ Database: neondb                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 Besoin d'aide?

1. Consultez: `DEPLOYMENT_RAILWAY_NEON.md` (guide complet)
2. Consultez: `RAILWAY_QUICK_START.md` (5 minutes)
3. Consultez: `DEPLOYMENT_CHECKLIST.md` (checklist détaillée)
4. Exécutez: `bash health-check.sh <backend-url> <frontend-url>`

---

**Prêt à déployer? Bonne chance! 🚀**
