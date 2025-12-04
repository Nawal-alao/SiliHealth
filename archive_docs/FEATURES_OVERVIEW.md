```markdown
# HealID — Fonctionnalités Complètes

Ce document regroupe toutes les fonctionnalités du site HealID, de A à Z, incluant les interfaces, pages, sécurité, logique métier et automatisations.

---

## 1. Pages et Interfaces Utilisateur

### Accueil
- Présentation du service HealID
- Accès rapide à l'inscription et la connexion
- Liens vers actualités, support, blog

### Inscription / Connexion
- Formulaires sécurisés (validation côté client et serveur)
- Inscription patient et agent de santé
- Gestion des rôles (patient, agent)
- Redirection automatique selon le rôle

### Tableau de bord Patient
- Vue synthétique du dossier médical
- Accès à l'historique des consultations, tests, documents
- Affichage des notifications et alertes
- Accès rapide au profil et aux paramètres

### Tableau de bord Agent
- Liste des patients et consultations
- Recherche avancée (nom, ID, dossier)
- Accès aux dossiers patients, consultations, documents
- Gestion des rendez-vous et notifications

### Profil Patient
- Affichage et modification des informations personnelles
- Photo de profil (avatar) : upload, affichage immédiat, avatar par défaut
- Informations médicales : allergies, antécédents, traitements, vaccinations
- Champs spécifiques (femme, grossesse, contraception)
- Consentements RGPD et partage recherche

### Profil Agent
- Informations professionnelles
- Accès aux paramètres et audit

### Consultations
- Liste, création, modification, historique
- Ajout de notes médicales, documents

### Documents Médicaux
- Upload, visualisation, téléchargement
- Historique des uploads

### QR Code
- Génération et scan de QR code pour accès rapide au dossier
- Historique des accès QR

### Support & Blog
- FAQ, documentation, guides
- Actualités médicales

### Paramètres Système
- Thème (clair/sombre)
- Préférences utilisateur

---

## 2. Sécurité

- Authentification JWT (token sécurisé, stockage local)
- Séparation stricte des rôles (patient/agent)
- Contrôles d'accès backend (guards, claims)
- Chiffrement des mots de passe (bcrypt)
- Protection CORS (backend)
- Validation des entrées (class-validator, pipes)
- Upload sécurisé (vérification du token, limite taille, stockage isolé)
- Logs d'activité et audit
- RGPD : consentement explicite, anonymisation pour la recherche

---

## 3. Logique Métier & Automatisations

- Calcul automatique de l'IMC
- Gestion des cycles et informations spécifiques femmes
- Génération automatique de QR code
- Notifications temps réel (backend)
- Orchestration des migrations et seed DB (scripts)
- Tests automatisés (API, E2E, smoke-check)
- Service Worker (PWA, offline)

---

## 4. API & Backend

- Endpoints RESTful : /api/signup, /api/login, /api/me, /api/patients/profile, /api/upload, /api/consultations, /api/qr-verify, etc.
- ORM Prisma (PostgreSQL)
- Gestion des uploads (fichiers, avatars, documents)
- Séparation des modules (auth, patients, agents, consultations, uploads, notifications)
- Dockerisation base de données

---

## 5. Expérience Utilisateur

- UI responsive (mobile, desktop)
- Feedback instantané (toasts, notifications)
- Avatar circulaire, affichage immédiat après upload
- Navigation fluide sans rechargement
- Accessibilité (labels, navigation clavier)
- Thème clair/sombre
- PWA (installation, offline)

---

## 6. Tests & Maintenance

- Scripts de test API, E2E, smoke-check
- Documentation technique et guides utilisateurs
- Scripts de démarrage et maintenance (DB, backend, frontend)
- Logs détaillés (backend, frontend)

---

## 7. Divers

- Gestion des erreurs (frontend/backend)
- Nettoyage automatique des scripts inutiles
- Mise à jour automatique des avatars et profils
- Support multi-rôles et évolutivité

---

> Ce document est à jour au 03/12/2025. Pour toute nouvelle fonctionnalité, mettre à jour ce fichier.

```
