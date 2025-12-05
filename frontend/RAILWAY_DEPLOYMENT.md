# Déploiement sur Railway - Frontend

## Configuration Railway pour le Frontend Express+EJS

Le frontend est configuré pour être déployé sur Railway avec les fichiers suivants:

### Fichiers de configuration
- `railway.json` - Configuration de build et déploiement Railway
- `.railway/Procfile` - Processus de démarrage

### Variables d'environnement recommandées

Vous pouvez configurer les variables d'environnement suivantes dans Railway:

```
NODE_ENV=production
BACKEND_URL=https://votre-backend.railway.app
```

### Build et démarrage

1. **Build**: Installée automatiquement par Nixpacks
   ```bash
   npm install
   ```

2. **Démarrage**: 
   ```bash
   npm start
   ```
   Cette commande démarre le serveur Express sur le port assigné par Railway

### Configuration du port

Le serveur écoute sur `process.env.PORT` (assigné par Railway). En local, il utilise le port 3000.

### EJS Templates

Les templates EJS dans le dossier `views/` sont servis dynamiquement. Ils cachent automatiquement les fichiers en production pour des performances optimales.

### Fichiers statiques

Les fichiers CSS, JS et images sont servis avec compression gzip et cache HTTP.

### Logs et monitoring

Vous pouvez voir les logs en temps réel dans le dashboard Railway ou via:
```bash
railway logs
```

### Configuration CORS du backend

Assurez-vous que votre backend accepte les requêtes de votre frontend Railway. Mettez à jour `src/main.ts`:

```typescript
origin: [
  'http://localhost:3000',
  'https://votre-frontend.railway.app',
  process.env.FRONTEND_URL
],
```

