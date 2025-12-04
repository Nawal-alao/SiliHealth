# HealID - Séparation des Rôles Patient/Agent de Santé

## Vue d'ensemble

Cette mise à jour implémente une séparation claire et sécurisée entre les comptes **patient** et **agent_de_sante** dans la plateforme HealID. L'ancienne confusion entre "patient" et "médecin" a été résolue avec une architecture basée sur des UUID et des contrôles d'accès stricts.

## Changements Principaux

### 1. Schéma de Base de Données

- **UUID au lieu d'entiers** : Tous les identifiants utilisent maintenant des UUID générés automatiquement
- **Table `users`** : Comptes utilisateur de base avec rôle strict (`patient`, `agent_de_sante`, `admin`)
- **Table `patients`** : Données spécifiques aux patients (one-to-one avec users)
- **Table `agents`** : Données spécifiques aux agents de santé (one-to-one avec users)
- **Table `activity_logs`** : Journal d'audit amélioré avec traçabilité complète

### 2. Architecture de Sécurité

- **Validation stricte des rôles** : Seuls `patient` et `agent_de_sante` sont autorisés
- **Middleware d'autorisation** : Contrôles d'accès basés sur les rôles
- **Permissions granulaires** :
  - Agents peuvent accéder à toutes les données patients
  - Patients ne peuvent accéder qu'à leurs propres données
  - Création de dossiers réservée aux agents

### 3. API Endpoints

#### Authentification
- `POST /api/signup` : Inscription avec validation stricte
- `POST /api/login` : Connexion avec JWT
- `GET /api/me` : Profil utilisateur protégé

#### Patients (protégé)
- `GET /api/patients` : Liste des patients (agents seulement)
- `GET /api/patients/:patientId` : Détails patient (agents ou propriétaire)
- `POST /api/patients` : Créer patient (agents seulement)
- `PUT /api/patients/:patientId` : Modifier patient (agents ou propriétaire limité)

## Installation et Test

### Prérequis

```bash
# PostgreSQL avec extension UUID
# Node.js 18+
# Docker (pour la DB)
```

### Configuration

1. **Démarrer la base de données** :
```bash
cd /home/nawalalao/Documents/SiliHealth
docker-compose up -d
```

2. **Appliquer les migrations** :
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

3. **Démarrer le backend** :
```bash
npm run start:dev
```

### Tests Automatisés

```bash
# Tests d'authentification
npm test -- src/auth/auth.spec.ts

# Tests des patients
npm test -- src/patients/patients.spec.ts

# Tous les tests
npm test
```

## Cas d'Acceptation Testés

### ✅ Test 1 : Inscription Patient
```bash
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Marie Dupont",
    "email": "marie@example.com",
    "password": "SecurePass123",
    "role": "patient",
    "sex": "F"
  }'
```
**Résultat attendu** : `201 Created` avec `patient_id` UUID

### ✅ Test 2 : Inscription Agent
```bash
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Dr. Jean Martin",
    "email": "jean@example.com",
    "password": "SecurePass123",
    "role": "agent_de_sante",
    "licenseNumber": "MED123456"
  }'
```
**Résultat attendu** : `201 Created` avec données agent

### ✅ Test 3 : Accès Refusé aux Patients
```bash
# Se connecter en tant que patient
TOKEN=$(curl -s -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marie@example.com","password":"SecurePass123"}' \
  | jq -r '.token')

# Tenter d'accéder à la liste des patients
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/patients
```
**Résultat attendu** : `403 Forbidden`

### ✅ Test 4 : JWT avec Claim Role
```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean@example.com","password":"SecurePass123"}'
```
**Résultat attendu** : Token JWT contenant `{ role: "agent_de_sante" }`

### ✅ Test 5 : Rôle Invalide Rejeté
```bash
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123",
    "role": "invalid_role"
  }'
```
**Résultat attendu** : `400 Bad Request`

## Sécurité Implémentée

### Validation des Données
- **Rôles stricts** : Seuls `patient` et `agent_de_sante` autorisés
- **Mots de passe forts** : Minimum 8 caractères, maj/min/chiffre
- **Champs requis** : Sex obligatoire pour les patients

### Contrôles d'Accès
- **JWT avec rôles** : Token contient le rôle utilisateur
- **Guards NestJS** : Middleware automatique de vérification
- **Permissions par endpoint** : Décorateurs `@Roles()`

### Audit et Logging
- **Activity logs** : Chaque action sensible tracée
- **Traçabilité** : `actor_user_id`, `action`, `target_patient_id`
- **Timestamps** : Audit complet avec fuseaux horaires

## Migration des Données Existantes

La migration préserve automatiquement les données existantes :

- **Utilisateurs existants** : Convertis avec nouveaux UUID
- **Rôles** : `médecin` → `agent_de_sante`
- **Données liées** : Consultations, uploads, logs migrés

```sql
-- La migration s'exécute automatiquement avec :
npx prisma migrate deploy
```

## Structure des Fichiers Modifiés

```
backend/
├── prisma/
│   ├── schema.prisma                 # Nouveau schéma avec UUID
│   └── migrations/
│       └── 20251202022449_role_separation_uuid/
│           └── migration.sql         # Migration PostgreSQL
├── src/
│   ├── auth/
│   │   ├── auth.service.ts           # Logique inscription/connexion
│   │   ├── auth.controller.ts        # Endpoints avec validation
│   │   ├── roles.guard.ts            # Autorisation par rôles
│   │   ├── dto/
│   │   │   ├── signup.dto.ts         # Validation stricte
│   │   │   ├── patient.dto.ts        # DTO patients
│   │   │   └── agent.dto.ts          # DTO agents
│   │   └── auth.spec.ts              # Tests automatisés
│   └── patients/
│       ├── patients.controller.ts    # Endpoints patients
│       ├── patients.module.ts        # Module patients
│       └── patients.spec.ts          # Tests patients
└── src/app.module.ts                 # Module patients ajouté
```

## Déploiement

### Production
```bash
# Variables d'environnement
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export JWT_SECRET="your-secure-secret-here"

# Migration et démarrage
npx prisma migrate deploy
npm run build
npm run start:prod
```

### Développement
```bash
# Démarrage rapide
npm run start:dev

# Avec DB locale
docker-compose up -d
npx prisma migrate dev
```

## Points d'Attention

1. **UUID vs Int** : Tous les nouveaux IDs sont des UUID
2. **Rôles stricts** : Pas de rôles personnalisés autorisés
3. **Transactions** : Inscriptions utilisent des transactions pour l'atomicité
4. **Audit** : Toutes les actions sensibles sont loggées
5. **Migration** : Données existantes préservées automatiquement

## Support et Maintenance

- **Tests automatisés** : Couvrent les 5 cas d'acceptation critiques
- **Logging détaillé** : Audit trail complet pour debugging
- **Validation stricte** : Erreurs claires en cas de données invalides
- **Documentation** : Ce README pour référence future

---

**🎉 La séparation des rôles est maintenant complètement implémentée et sécurisée !**
