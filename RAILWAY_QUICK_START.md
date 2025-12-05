# ⚡ Déploiement Rapide sur Railway + Neon

## 📋 Vue d'ensemble

Votre application SiliHealth est maintenant configurée pour un déploiement facile sur Railway avec une base de données Neon.

**Architecture:**
- 🟦 **Backend**: Railway Projet A (NestJS + Fastify)
- 🟩 **Frontend**: Railway Projet B (Express + EJS)
- 🐘 **Database**: Neon PostgreSQL

---

## 🚀 Déploiement en 5 Minutes

### Étape 1: Préparer Neon (déjà fait ✓)

Votre URL Neon est:
```
postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Étape 2: Créer Projet Railway A (Backend)

1. Allez sur [railway.app](https://railway.app)
2. Cliquez **New Project** → **Deploy from GitHub**
3. Sélectionnez votre repo **SiliHealth**
4. Sélectionnez le dossier **backend**
5. Confirmez le déploiement

### Étape 3: Configurer Backend

Dans le dashboard Railway du projet A:
1. Allez à **Variables**
2. Ajoutez ces variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_y0cR7nwJpDEG@ep-steep-queen-adtatjxy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=votre_secret_jwt_min_32_chars
NODE_ENV=production
FRONTEND_URL=https://frontend-production-xxxx.railway.app
```

### Étape 4: Créer Projet Railway B (Frontend)

1. Allez sur [railway.app](https://railway.app)
2. Cliquez **New Project** → **Deploy from GitHub**
3. Sélectionnez votre repo **SiliHealth**
4. Sélectionnez le dossier **frontend**
5. Confirmez le déploiement

### Étape 5: Configurer Frontend

Dans le dashboard Railway du projet B:
1. Allez à **Variables**
2. Ajoutez ces variables:

```env
NODE_ENV=production
BACKEND_URL=https://backend-production-xxxx.railway.app
```

⚠️ **Note**: Remplacez `backend-production-xxxx.railway.app` par votre URL réelle du backend.

---

## 🔗 Accéder à Votre Application

Une fois les deux projets deployés:

- **Frontend**: `https://your-frontend.railway.app`
- **Backend API**: `https://your-backend.railway.app`

Ouvrez le frontend dans votre navigateur et testez !

---

## 📊 Monitoring

Voir les logs en temps réel:

```bash
# Logs Backend
railway logs --project-id=<backend-project-id> --follow

# Logs Frontend
railway logs --project-id=<frontend-project-id> --follow
```

---

## 🔍 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| CORS Error | Mettez à jour `FRONTEND_URL` dans le backend |
| Database Connection Error | Vérifiez `DATABASE_URL` et testez la connexion Neon |
| Frontend ne trouve pas le backend | Vérifiez `BACKEND_URL` dans le frontend |
| Migrations échouent | Vérifiez les logs: `railway logs --follow` |

---

## 📚 Documentation Complète

Consultez **DEPLOYMENT_RAILWAY_NEON.md** pour un guide détaillé complet avec troubleshooting avancé.

---

## ✅ Checklist Rapide

- [ ] URL Neon préparée
- [ ] Projet Railway A (Backend) créé
- [ ] Projet Railway B (Frontend) créé
- [ ] Variables d'environnement Backend configurées
- [ ] Variables d'environnement Frontend configurées
- [ ] Déploiement Backend complété
- [ ] Déploiement Frontend complété
- [ ] Frontend → Backend communication testée

---

## 🆘 Besoin d'Aide?

1. Consultez **DEPLOYMENT_RAILWAY_NEON.md** pour la documentation complète
2. Vérifiez les logs: `railway logs --follow`
3. Exécutez le health check: `bash health-check.sh <backend-url> <frontend-url>`

---

**Bienvenue sur Railway! 🚀**
