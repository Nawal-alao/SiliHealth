#!/bin/bash

# Script de déploiement du frontend sur Railway
# Assurez-vous d'avoir configuré les variables d'environnement dans Railway:
# - NODE_ENV=production
# - BACKEND_URL (URL du backend Railway)

echo "🚀 Déploiement Frontend SiliHealth sur Railway"
echo "================================================"

echo "✓ Installation des dépendances..."
npm install

echo "✓ Démarrage du serveur..."
npm start
