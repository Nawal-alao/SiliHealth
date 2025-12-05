# 🏥 SiliHealth - Plateforme de Gestion Médicale Numérique

Une solution complète de gestion des données médicales pour les patients et les professionnels de santé, avec authentification sécurisée, QR codes, et synchronisation hors ligne.

**Statut** : ✅ Production-Ready | **Dernière mise à jour** : Décembre 2025

---

## 📋 Vue d'ensemble

SiliHealth est une application web full-stack conçue pour :
- **Patients** : Gestion de leurs dossiers médicaux, consultations et resultats
- **Agents de santé** : Accès sécurisé aux données patient via QR codes
- **Professionnels de santé** : Gestion complète des consultations et traitements
- **Système** : Support hors ligne et synchronisation automatique

## 🏗️ Architecture

### Structure du Projet

```
SiliHealth/
├── backend/              # API NestJS + Fastify + Prisma
│   ├── src/
│   │   ├── auth/        # Authentification & JWT
│   │   ├── patients/    # Gestion des patients
│   │   ├── consultations/
│   │   ├── appointments/
│   │   ├── treatments/
│   │   ├── medical-notes/
│   │   ├── lab-results/
│   │   ├── health-stats/
│   │   ├── prenatal/    # Suivi prénatal
│   │   ├── qr/          # QR codes sécurisés
│   │   ├── emergency/   # Accès d'urgence
│   │   ├── notifications/
│   │   ├── upload/      # Gestion des documents
│   │   └── agents/      # Gestion des agents de santé
│   └── prisma/          # Schéma base de données
├── frontend/            # Interface Express + EJS
│   ├── views/           # Templates EJS (28+ pages)
│   ├── public/          # Assets & Service Worker
│   ├── js/              # Client-side JavaScript
│   │   ├── main.js
│   │   ├── offline-sync.js
│   │   ├── qr-generator.js
│   │   └── validation-utils.js
│   └── css/             # Styles CSS
├── e2e/                 # Tests Playwright
├── tests/               # Tests d'intégration
├── scripts/             # Scripts utilitaires
└── database/            # Schémas SQL
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 16
- npm ou yarn
- Docker & Docker Compose (optionnel)
- PostgreSQL

### Installation (5 minutes)

1. **Cloner et accéder au projet**
```bash
git clone https://github.com/Nawal-alao/SiliHealth.git
cd SiliHealth
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**

**backend/.env**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/silihealth
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=3001
```

**frontend/.env**
```env
API_URL=http://localhost:3001
NODE_ENV=development
PORT=3000
```

4. **Initialiser la base de données**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

5. **Lancer l'application**
```bash
npm run dev
```

Accédez à :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001

### Avec Docker

```bash
docker-compose up -d
npm run dev
```

## 🚀 Déploiement sur Railway + Neon

SiliHealth est configurée pour un déploiement facile sur Railway avec une base de données Neon PostgreSQL.

### 📚 Guide Rapide

**Pour déployer rapidement en 5 minutes:**
→ Consultez **[RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md)**

**Pour un guide détaillé complet:**
→ Consultez **[DEPLOYMENT_RAILWAY_NEON.md](./DEPLOYMENT_RAILWAY_NEON.md)**

### Architecture de Déploiement

```
Railway Projet A          Railway Projet B          Neon
(Backend NestJS)    ←→    (Frontend Express)  ←→   (PostgreSQL)
backend.railway.app       frontend.railway.app      Database
```

### Variables d'Environnement Requises

**Backend (Railway Projet A):**
```env
DATABASE_URL=postgresql://...  # Depuis Neon
JWT_SECRET=votre_secret_jwt
NODE_ENV=production
FRONTEND_URL=https://frontend-production-xxxx.railway.app
```

**Frontend (Railway Projet B):**
```env
NODE_ENV=production
BACKEND_URL=https://backend-production-xxxx.railway.app
```

## 🎯 Fonctionnalités Principales

### 👤 Authentification & Profils
- ✅ Signup & Login sécurisés (JWT 8h)
- ✅ Hachage Bcrypt des mots de passe
- ✅ Gestion de rôles (Patient, Agent, Médecin, Admin)
- ✅ Permissions granulaires

### 📋 Pour les Patients
- ✅ Tableau de bord personnel
- ✅ Consultation de dossier médical complet
- ✅ Historique des consultations
- ✅ Résultats de laboratoire
- ✅ Suivi de grossesse avec calculateur EDD
- ✅ Gestion des traitements
- ✅ Partage de données via QR code
- ✅ Historique d'accès
- ✅ Gestion des permissions

### 🏥 Pour les Agents de Santé
- ✅ Scan QR code caméra (jsQR)
- ✅ Accès sécurisé aux données patient
- ✅ Historique des accès
- ✅ Tableau de bord agent
- ✅ Profil agent

### 👨‍⚕️ Pour les Professionnels de Santé
- ✅ Gestion des consultations
- ✅ Création et édition de consultations
- ✅ Prescription de traitements
- ✅ Partage d'agendas
- ✅ Notes médicales
- ✅ Téléchargement de documents
- ✅ Historique des tests

### 🖥️ Fonctionnalités Système
- ✅ Authentification JWT sécurisée
- ✅ Synchronisation hors ligne (Service Worker)
- ✅ QR codes dynamiques & vérification
- ✅ Notifications en temps réel
- ✅ Audit d'accès complet
- ✅ Gestion de rôles et permissions
- ✅ Téléchargement et gestion de fichiers
- ✅ Thème sombre/clair persistent
- ✅ Blog & articles

## 🛠️ Stack Technologique

### Frontend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Templating** : EJS
- **Styling** : CSS pur (variables CSS)
- **Client-side** : Vanilla JavaScript
- **Offline** : Service Worker
- **QR** : jsQR library
- **Testing** : Vitest, Playwright
- **Zero heavy dependencies** ⚡

### Backend
- **Framework** : NestJS
- **Runtime** : Fastify (ultra-rapide < 50ms)
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : JWT + Bcrypt
- **Validation** : class-validator
- **Upload** : Multipart via @fastify/multipart
- **Performance** : Compression gzip

### DevOps
- **Containerization** : Docker & Docker Compose
- **Database** : PostgreSQL dans Docker
- **Testing** : Playwright E2E, Vitest unit
- **Qualité** : Axe accessibility audit

## 📱 Pages Principales (28+ pages)

### Authentification
- `/login` - Connexion
- `/signup` - Inscription

### Patient
- `/` - Tableau de bord patient
- `/consultations` - Historique des consultations
- `/consultation-detail/:id` - Détail consultation
- `/consultation-new` - Créer consultation
- `/profile` - Profil patient
- `/profil-patient` - Infos personnelles
- `/activity-log` - Journaux d'activité
- `/pregnancy` - Suivi de grossesse
- `/pregnancy-calculator` - Calculateur EDD
- `/access-history` - Historique d'accès
- `/permissions` - Gestion des permissions
- `/upload-results` - Télécharger résultats

### Agent de Santé
- `/scan-qr` - Scanner QR code
- `/qr-access` - Accès via QR code
- `/dashboard-agent` - Tableau de bord agent
- `/profil-agent` - Profil agent

### Médecin/Professionnel
- `/generate-qr` - Générer QR patient
- `/dashboard` - Tableau de bord
- `/tests-history` - Historique des tests
- `/patient-record` - Dossier patient

### Système & Navigation
- `/system-settings` - Paramètres système
- `/support` - Support utilisateur
- `/blog` - Blog & articles
- `/article/:slug` - Détail article

## 🔐 Sécurité

### Authentification
- **JWT** : Tokens signés avec expiration 8h
- **Bcrypt** : Hachage 10 rounds des mots de passe
- **Session** : Validation des sessions actives
- **CORS** : Configuration stricte

### Autorisation
- **RBAC** : Contrôle d'accès basé sur les rôles
- **Permissions** : Granularité par action
- **Guards JWT** : Protection des routes
- **Audit** : Logs complets d'accès

### QR Codes
- **Dynamiques** : Génération à la demande
- **Expirables** : Validité temporelle
- **Signature** : Vérification d'intégrité
- **Audit** : Historique des scans

## 🧪 Tests

### E2E avec Playwright
```bash
npm run e2e:playwright
```

### Validation
```bash
npm run test:validation
```

### Tests unitaires
```bash
npm --prefix frontend run test:unit
```

### Audit d'accessibilité
```bash
cd e2e && npm run audit
```

## 📊 Base de Données

### Tables principales
- `users` - Utilisateurs
- `patients` - Dossiers patients
- `consultations` - Consultations médicales
- `appointments` - Rendez-vous
- `treatments` - Traitements
- `medical_notes` - Notes médicales
- `lab_results` - Résultats de laboratoire
- `health_stats` - Statistiques de santé
- `pregnancies` - Suivi de grossesse
- `qr_tokens` - Tokens QR
- `access_logs` - Journaux d'accès

## 🔄 Synchronisation Hors Ligne

L'application supporte la synchronisation automatique :
- **Service Worker** : Cache des assets
- **Local Storage** : Données utilisateur
- **Queue** : Opérations en attente
- **Auto-sync** : Synchronisation au retour de connexion

## 📈 Performance

| Métrique | Temps |
|----------|-------|
| Frontend (port 3000) | < 1 ms |
| Backend API (port 3001) | < 50 ms |
| Chargement complet | < 2 s |
| First Contentful Paint | < 1 s |

## 🤝 Contribution

Les contributions sont bienvenues ! Processus :
1. Fork le repository
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit les changements (`git commit -am 'Ajout feature'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📝 Licence

MIT - Libre d'utilisation à titre commercial et personnel

## 👥 Auteur

**Nawal Alao** - [@Nawal-alao](https://github.com/Nawal-alao)

## 📞 Support & Documentation

- 📖 Documentation complète : `/docs`
- 🐛 Rapporter un bug : Issues GitHub
- 💬 Questions : Discussions GitHub
- 📧 Support : Section Support dans l'app

---

**SiliHealth** – Plateforme médicale numérique sécurisée, performante et prête pour la production.

*Dernière mise à jour : Décembre 2025*
