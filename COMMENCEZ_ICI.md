# 🎬 COMMENCEZ ICI - Guide de Déploiement Railway

Bienvenue! Votre application SiliHealth est complètement prête à être déployée sur Railway avec Neon.

## ⚡ Démarrage Rapide (5 étapes)

### Étape 1️⃣ : Créer Compte Railway (si nécessaire)

- Allez sur [railway.app](https://railway.app)
- Cliquez **Sign Up**
- Connectez-vous avec GitHub

### Étape 2️⃣ : Créer Projet Backend (Railway Projet A)

1. Dans Railway: **New Project** → **Deploy from GitHub**
2. Sélectionnez votre repo **SiliHealth**
3. Sélectionnez le dossier **backend** à déployer
4. Railway commencera le build automatiquement

### Étape 3️⃣ : Configurer les Variables Backend

Dans le dashboard Railway du backend:

1. Allez à **Variables**
2. Cliquez **Add Variable** et ajoutez:

```
DATABASE_URL
postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
JWT_SECRET
silihealth_secret_key_2025_production
```

```
NODE_ENV
production
```

```
FRONTEND_URL
http://localhost:3000
```

(Vous mettrez à jour `FRONTEND_URL` plus tard)

3. Cliquez **Deploy** (ou Railway déploie automatiquement)
4. ⏳ Attendez le déploiement (~5 min)

**Notez votre URL Backend:**
```
https://backend-production-xxxx.railway.app
```

### Étape 4️⃣ : Créer Projet Frontend (Railway Projet B)

1. Allez sur Railway: **New Project** → **Deploy from GitHub**
2. Sélectionnez votre repo **SiliHealth**
3. Sélectionnez le dossier **frontend** à déployer
4. Railway commencera le build automatiquement

### Étape 5️⃣ : Configurer les Variables Frontend

Dans le dashboard Railway du frontend:

1. Allez à **Variables**
2. Cliquez **Add Variable** et ajoutez:

```
NODE_ENV
production
```

```
BACKEND_URL
https://backend-production-xxxx.railway.app
```

(Remplacez `backend-production-xxxx` par votre URL réelle du backend)

3. Cliquez **Deploy**
4. ⏳ Attendez le déploiement (~3 min)

**Notez votre URL Frontend:**
```
https://frontend-production-xxxx.railway.app
```

---

## ✅ Mis à Jour Final de CORS

Pour que tout communique correctement, retournez au backend:

1. Projet Railway A (Backend)
2. Allez à **Variables**
3. Modifiez `FRONTEND_URL`:
```
FRONTEND_URL
https://frontend-production-xxxx.railway.app
```
4. Cliquez **Redeploy**

---

## 🎉 C'est Fait!

Votre application est maintenant en production!

**Accédez à votre application:**
- 🌐 Frontend: `https://frontend-production-xxxx.railway.app`
- 🔌 Backend API: `https://backend-production-xxxx.railway.app`

---

## 📚 Documentation Complète

Pour plus de détails et troubleshooting:

| Document | Quand l'utiliser |
|----------|------------------|
| **RAILWAY_QUICK_START.md** | Vue d'ensemble rapide |
| **DEPLOYMENT_RAILWAY_NEON.md** | Guide complet détaillé |
| **DEPLOYMENT_CHECKLIST.md** | Vérifier chaque étape |
| **ENV_VARIABLES_RAILWAY.md** | Variables à copier/coller |
| **DEPLOYMENT_READY.md** | Résumé de ce qui a été créé |

---

## 🧪 Tester Votre Déploiement

### Test 1: Accéder au Frontend

Ouvrez: `https://frontend-production-xxxx.railway.app`

Vous devriez voir la page d'accueil.

### Test 2: Vérifier la Configuration API

1. Ouvrez les Developer Tools (F12)
2. Allez à: `https://frontend-production-xxxx.railway.app/api/config`
3. Vous devriez voir JSON avec `apiBase` pointant vers votre backend

### Test 3: Tester la Connexion

1. Allez à `/login`
2. Ouvrez la console (F12)
3. Testez une connexion
4. Vérifiez que la requête va vers votre backend (pas d'erreur CORS)

---

## 🆘 Troubleshooting Rapide

### ❌ Backend n'est pas déployé

**Solution:**
- Vérifiez les logs: Cliquez sur le backend dans Railway → **Logs**
- Cherchez les erreurs
- Vérifiez `DATABASE_URL` est correcte

### ❌ CORS error au frontend

**Solution:**
- Vérifiez `FRONTEND_URL` dans le backend
- Redéployez le backend

### ❌ Frontend ne peut pas joindre le backend

**Solution:**
- Vérifiez `BACKEND_URL` dans le frontend
- Vérifiez que le backend répond: `curl https://backend-url`

### ❌ Database connection error

**Solution:**
- Testez Neon localement: `psql 'postgresql://...'`
- Vérifiez `DATABASE_URL` est exacte
- Vérifiez les logs du backend

---

## 📞 Commandes Utiles

```bash
# Afficher les logs en temps réel
railway logs --follow

# Afficher les variables
railway variables

# Redéployer
railway deploy
```

---

## 🚀 Prochaines Étapes

1. ✅ Application deployée
2. 📊 Surveiller les logs
3. 🧪 Tester en production
4. 📈 Monitoriser les performances
5. 🔄 Mettre en place un CI/CD

---

## 📖 Lire Ensuite

- **RAILWAY_QUICK_START.md** - Vue d'ensemble détaillée
- **DEPLOYMENT_RAILWAY_NEON.md** - Guide complet avec troubleshooting
- **DEPLOYMENT_CHECKLIST.md** - Checklist avant déploiement

---

**Félicitations! Votre application est en production! 🎉**

Pour toute question, consultez la documentation ou les logs.

---

**Besoin d'aide?**
- 📖 Guides: Consultez les fichiers `.md` listés ci-dessus
- 🏥 Health Check: `bash health-check.sh <backend-url> <frontend-url>`
- 📋 Checklist: `DEPLOYMENT_CHECKLIST.md`
