#!/bin/bash

# Script de déploiement du backend sur Railway
# Assurez-vous d'avoir configuré les variables d'environnement dans Railway:
# - DATABASE_URL (depuis Neon)
# - JWT_SECRET
# - NODE_ENV=production
# - FRONTEND_URL (URL du frontend Railway)

echo "🚀 Déploiement Backend SiliHealth sur Railway"
echo "================================================"

# Vérifier que DATABASE_URL est configurée
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERREUR: DATABASE_URL n'est pas configurée"
  exit 1
fi

echo "✓ DATABASE_URL configurée"
echo "✓ Installation des dépendances..."
npm install

echo "✓ Compilation TypeScript..."
npm run build

echo "✓ Génération des types Prisma..."
npm run prisma:generate

echo "✓ Exécution des migrations..."
npm run prisma:migrate:prod

echo "✓ Démarrage du serveur..."
npm start
