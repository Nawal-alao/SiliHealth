# Déploiement sur Railway - Backend

## Configuration Railway pour le Backend NestJS

Le backend est configuré pour être déployé sur Railway avec les fichiers suivants:

### Fichiers de configuration
- `railway.json` - Configuration de build et déploiement Railway
- `.railway/Procfile` - Processus de démarrage

### Variables d'environnement requises

Vous devez configurer les variables d'environnement suivantes dans Railway:

```
DATABASE_URL=postgresql://user:password@hostname:port/dbname
NODE_ENV=production
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=https://votre-frontend.railway.app
```

### Build et démarrage

1. **Build**: TypeScript sera compilé en JavaScript
   ```bash
   npm run build
   npm run prisma:generate
   ```

2. **Démarrage**: 
   ```bash
   npm start
   ```
   Cette commande:
   - Génère les types Prisma
   - Exécute les migrations de base de données
   - Démarre le serveur NestJS

### Base de données

Railway gère automatiquement la création d'une base de données PostgreSQL si vous la configurez dans votre projet Railway.

### Logs et monitoring

Vous pouvez voir les logs en temps réel dans le dashboard Railway ou via:
```bash
railway logs
```

### Troubleshooting

- **Erreur de migration**: Assurez-vous que `DATABASE_URL` est correctement configurée
- **Port**: Railway assigne automatiquement un port via la variable `PORT`
- **CORS**: Mettez à jour les origines CORS acceptées dans `src/main.ts` avec votre domaine Railway

