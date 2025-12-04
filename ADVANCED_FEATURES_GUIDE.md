# Nouvelles Fonctionnalités Avancées - Guide d'Intégration

## Vue d'ensemble

Les fonctionnalités suivantes ont été ajoutées à HealID sans modification de l'UI existante:

### 1. Suivi Prénatal Avancé
- **Module**: `prenatal/`
- **Endpoints**:
  - `GET /api/prenatal/:patientId` - Récupère le suivi prénatal actuel
  - `POST /api/prenatal` - Crée un nouveau suivi
  - `PUT /api/prenatal/:followUpId` - Met à jour le suivi
  - `GET /api/prenatal/alerts/:agentId` - Récupère les alertes de grossesses à risque
- **Fonctionnalités**:
  - Alertes automatiques pour grossesses à risque (plus de 2 facteurs de risque)
  - Planification des consultations prénatales
  - Notifications automatiques si risque détecté
  - Intégration avec les résultats de labo (graphiques de tendances)

### 2. Résultats de Laboratoire avec Graphiques
- **Module**: `lab-results/`
- **Endpoints**:
  - `GET /api/lab-results/patient/:patientId` - Tous les résultats du patient
  - `POST /api/lab-results` - Ajouter un résultat
  - `GET /api/lab-results/critical/:patientId` - Résultats critiques seulement
  - `GET /api/lab-results/stats/:agentId` - Statistiques par agent
- **Fonctionnalités**:
  - Détection automatique des valeurs critiques
  - Groupage par type de test pour analyse de tendances
  - Notifications si seuil critique dépassé
  - Historique complet avec dates

### 3. Gestion Avancée des Rendez-vous
- **Module**: `shared-agenda/`
- **Endpoints**:
  - `GET /api/shared-agenda/agent/:agentId` - Agenda partagé
  - `POST /api/shared-agenda/share` - Partager un RDV
  - `GET /api/shared-agenda/conflicts/:agentId` - Détecte les conflits
- **Fonctionnalités**:
  - Agenda partagé entre agents pour éviter les doublons
  - Détection automatique des conflits horaires
  - Notifications quand agenda partagé
  - Vue complète des RDV de tous les agents (si partagé)

### 4. Tableaux de Bord Statistiques et Reporting
- **Module**: `health-stats/`
- **Endpoints**:
  - `GET /api/health-stats/agent/:agentId` - Stats d'un agent
  - `POST /api/health-stats` - Enregistrer des stats
  - `GET /api/health-stats/center/:centerId` - Statistiques centre
  - `GET /api/health-stats/export/pdf/:agentId` - Export PDF
  - `GET /api/health-stats/export/csv/:agentId` - Export CSV
- **Métriques suivies**:
  - Nombre de patients suivis
  - Consultations complétées
  - Examens effectués
  - Grossesses suivies
  - Vaccinations administrées
  - Patients avec maladies chroniques
  - Accès d'urgence

### 5. Mode Offline avec Synchronisation Automatique
- **Module**: `sync/`
- **Tables**: `SyncQueue` - file d'attente de synchronisation
- **Endpoints**:
  - `POST /api/sync/queue` - Ajouter à la queue
  - `GET /api/sync/pending` - Récupère les items non syncés
  - `POST /api/sync/execute` - Exécute la sync
  - `POST /api/sync/mark-synced` - Marque comme syncé
- **Fonctionnalités**:
  - Stockage local des consultations, RDV, résultats en cas de déconnexion
  - Synchronisation automatique au retour de connexion
  - Queue persistante jusqu'à succès
  - Support des créations, modifications, suppressions

---

## Modifications de Schéma Prisma

### Nouvelles Tables:
1. **prenatal_follow_ups** - Suivi des grossesses
2. **lab_results** - Résultats de labo avec seuils
3. **shared_agendas** - Agendas partagés entre agents
4. **health_statistics** - Statistiques de santé
5. **sync_queue** - File d'attente offline

### Relations Ajoutées:
- Patient → PrenatalFollowUp (1:many)
- Patient → LabResult (1:many)
- Agent → PrenatalFollowUp (1:many)
- Agent → LabResult (1:many)
- Agent → SharedAgenda (1:many)
- Agent → HealthStatistic (1:many)

---

## Installation et Migration

1. **Appliquer les migrations**:
```bash
cd backend
npx prisma migrate dev --name add_advanced_features
```

2. **Redémarrer le backend**:
```bash
npm run start:dev
```

---

## Utilisation Frontend (Sans Changement UI)

### Suivi Prénatal
Les données de suivi prénatal peuvent être affichées de manière discrète dans:
- Page patient-record
- Dashboard agent (section spécialisée)
- Via les consultations existantes

### Résultats de Labo
Intégration transparente:
- Affichage dans les dossiers patients existants
- Graphiques petit format intégrés aux consultations
- Alertes via le système de notification existant

### Statistiques
Export via endpoints et affichage au demande:
- Dashboard agent avec stats (sans restructurer UI)
- Export PDF/CSV pour rapports
- Intégration aggrégée au centre

### Synchronisation Offline
Gérée entièrement côté backend:
- Frontend utilise localStorage pour queue locale
- API endpoint `/api/sync/execute` déclenche sync
- Service Worker détecte retour en ligne et appelle sync

---

## Notes Importantes

- **Pas de modification UI**: Toutes les nouvelles fonctionnalités s'intègrent aux interfaces existantes
- **Backward compatibility**: Les endpoints existants restent inchangés
- **Notifications**: Alertes automatiques via le système existant
- **Sécurité**: Tous les endpoints sont protégés par JwtAuthGuard
- **Scalabilité**: Architecture modulaire pour ajouts futurs

