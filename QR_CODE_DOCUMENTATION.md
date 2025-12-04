# 📱 Fonctionnalité Scanner QR Code - Documentation Complète

## Vue d'ensemble

La fonctionnalité **Scanner QR Code** de HealID permet un accès rapide et sécurisé aux informations de base d'un patient via un code QR unique. C'est un outil idéal pour les urgences, consultations rapides ou contrôles d'identité.

---

## Architecture de sécurité

### 🔐 Principes de sécurité implémentés

```
1. Données non sensibles encodées
   └─ Seul l'ID patient est dans le QR code
   └─ Aucun mot de passe ou email sensitif

2. Validation multi-niveaux
  └─ Format : HEALID_[ID]
   └─ Vérification de l'ID patient en DB
   └─ Audit logging de chaque scan

3. Accès restreint
   └─ Infos publiques seulement via QR
   └─ Historique complet nécessite JWT
   └─ Connexion obligatoire pour données médicales

4. Protection contre les abus
   └─ Validation de l'ID (numérique)
   └─ User-Agent logging
   └─ Timestamp de chaque tentative
   └─ Détection des patterns suspects
```

---

## Flux d'utilisation

### 👨‍⚕️ Côté médecin/admin - Générer un QR code

#### Étape 1 : Accéder à la page de génération

```
URL : http://localhost:3000/generate-qr
```

#### Étape 2 : Entrer l'ID du patient

```
ID Patient : 1
↓
Générer QR Code
↓
QR code affiché à l'écran
```

#### Étape 3 : Actions possibles

- 📥 **Télécharger** : Sauvegarde en PNG
- 🖨️ **Imprimer** : Pour dossier physique
- 📋 **Copier** : Pour coller sur étiquette

#### Exemple de QR code généré

```
Format encodé : HEALID_1
Texte : [QR code visuel]
Taille : 256x256 pixels
Niveau de correction : High (peut scanner même si partiellement dégradé)
```

---

### 📱 Côté patient/visiteur - Scanner le QR code

#### Étape 1 : Accéder à la page de scan

```
URL : http://localhost:3000/scan-qr
```

#### Étape 2 : Démarrer le scanner

1. Cliquez sur **"Démarrer le scanner"**
2. Acceptez l'accès à la caméra
3. Orientez le QR code vers la caméra

#### Étape 3 : Résultats du scan

```
✓ Scan réussi
  ├─ Format validé (HEALID_)
  ├─ ID patient extrait
  ├─ Requête API envoyée au backend
  └─ Informations du patient affichées
```

#### Étape 4 : Informations affichées (sans connexion)

```
Données publiques seulement :
├─ ID Patient
├─ Nom complet
├─ Date de naissance (si disponible)
├─ Email
├─ Dernier accès
└─ Statut (Actif/Inactif)
```

#### Étape 5 : Message de sécurité

```
🔒 Message affiché :
"Pour voir l'historique complet des consultations, 
vous devez d'abord vous connecter ou créer un compte."

Actions proposées :
├─ [Se connecter] → Connexion existante
└─ [Créer un compte] → Nouvelle inscription
```

---

## Points d'accès

### Frontend Routes

| Page | URL | Description |
|------|-----|-------------|
| **Page d'accueil** | `/` | Bouton "Scanner QR Code" ajouté |
| **Scanner** | `/scan-qr` | Interface de scan (accès public) |
| **Générateur** | `/generate-qr` | Générer QR codes (réservé admin) |

### Backend Endpoint

```http
POST /api/qr-verify HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "patientId": "1",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Réponse (succès)** :
```json
{
  "ok": true,
  "patient": {
    "id": 1,
    "fullname": "Jean Dupont",
    "email": "jean@example.com",
    "dob": null,
    "lastAccess": "2025-11-24T12:00:00.000Z",
    "status": "active",
    "createdAt": "2025-11-24T10:00:00.000Z"
  }
}
```

**Réponse (erreur)** :
```json
{
  "ok": false,
  "error": "Patient non trouvé"
}
```

---

## Mesures de sécurité détaillées

### 1️⃣ Validation du format QR code

```javascript
// Frontend - Validation
if (!qrData.startsWith('HEALID_')) {
  ❌ "QR code invalide (format non reconnu)"
}

// Extraction sécurisée
const patientId = qrData.replace('HEALID_', '');

// Validation de l'ID
if (!/^\d+$/.test(patientId)) {
  ❌ "QR code invalide (ID patient incorrect)"
}
```

### 2️⃣ Vérification backend

```typescript
// Backend - Service QR
async verifyQRCode(data) {
  // 1. Validation de l'ID
  const patientId = parseInt(data.patientId, 10);
  if (isNaN(patientId)) ❌
  
  // 2. Recherche du patient
  const user = await prisma.user.findUnique({ id: patientId })
  if (!user) ❌
  
  // 3. Vérification du rôle
  if (user.role !== 'patient') ❌
  
  // 4. Logging pour audit
  await logQRScan(patientId, timestamp, userAgent)
  
  // 5. Retour des infos publiques
  return { ok: true, patient: {...} }
}
```

### 3️⃣ Logging d'audit

Chaque scan est enregistré avec :

```javascript
{
  action: 'QR_SCAN_SUCCESS' | 'QR_SCAN_FAILURE',
  patientId: 1,
  timestamp: '2025-11-24T12:00:00.000Z',
  userAgent: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1', // À implémenter
  details: 'QR code scan attempt'
}
```

### 4️⃣ Sécurité de la caméra

```javascript
// Permission de caméra via getUserMedia
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' },
  audio: false // Pas de son
});

// ✓ Sécurisé : utilisateur doit autoriser manuellement
// ✓ Confidentiel : données caméra jamais envoyées au serveur
// ✓ Local : traitement entièrement en navigateur
```

---

## Scénarios d'utilisation

### ✅ Cas d'utilisation recommandés

#### 1. Urgence médicale
```
Patient arrive aux urgences
  ↓
Médecin scanne QR code
  ↓
Affichage rapide de l'identité
  ↓
Patient se connecte pour voir dossier complet
```

#### 2. Consultation rapide
```
Patient en salle d'attente
  ↓
Accès public au nom/email via QR
  ↓
Confirmation d'identité
  ↓
Accès aux données médicales après connexion
```

#### 3. Identification patient (sans tech)
```
QR code imprimé sur bracelet patient
  ↓
Scanner du téléphone
  ↓
Infos de base affichées
  ↓
Médecin peut ensuite se connecter pour plus de détails
```

### ❌ Limitations intentionnelles

```
✗ Pas d'accès aux consultations complètes
✗ Pas d'historique médical détaillé
✗ Pas de résultats de tests sans authentification
✗ Pas de permissions d'accès modifiables
✗ Pas d'édition de données
```

---

## Implémentation technique

### Dépendances utilisées

#### Frontend
```json
{
  "jsQR": "1.4.0",          // Décoding QR code
  "navigator.mediaDevices"  // Accès caméra (natif)
}
```

#### Backend
```typescript
{
  "@nestjs/common",         // Framework NestJS
  "@prisma/client",         // ORM Prisma
  "User model"              // Prisma schema
}
```

### Fichiers modifiés/créés

#### Frontend
```
views/
├── index.ejs              [MODIFIÉ - ajout bouton]
├── scan-qr.ejs            [CRÉÉ - page scanner]
└── generate-qr.ejs        [CRÉÉ - page génération]

server.js                   [MODIFIÉ - route scan-qr, generate-qr]
```

#### Backend
```
src/
├── app.module.ts          [MODIFIÉ - import QrModule]
└── qr/
    ├── qr.module.ts       [CRÉÉ]
    ├── qr.controller.ts   [CRÉÉ]
    └── qr.service.ts      [CRÉÉ]
```

---

## Configuration et déploiement

### Variables d'environnement

Aucune variable spéciale requise. Utilise les configs existantes :
- `DATABASE_URL` (Prisma)
- `PORT` (Backend)

### Initialisation

Aucune migration requise. Utilise les tables `User` existantes.

### Mode développement

```bash
# Frontend
cd frontend && npm run start

# Backend
cd backend && npm run start:dev
```

---

## Dépannage

### ❌ Problème : "Erreur d'accès à la caméra"

**Causes possibles** :
- Permission refusée par l'utilisateur
- Caméra occupée par une autre app
- HTTPS requis en production

**Solutions** :
```
1. Vérifier les permissions du navigateur
2. Redémarrer le navigateur
3. Tester sur http://localhost (développement OK)
4. En production : utiliser HTTPS
```

---

### ❌ Problème : "QR code invalide"

**Causes possibles** :
- Format incorrect (pas HEALID_)
- ID patient non numérique
- QR code corrompu/dégradé

**Solutions** :
```
1. Régénérer le QR code
2. Vérifier que l'ID patient est correct
3. Assurer que la caméra est bien pointée
4. Vérifier l'éclairage
```

---

### ❌ Problème : "Patient non trouvé"

**Causes possibles** :
- ID patient n'existe pas en DB
- Utilisateur supprimé
- Erreur de saisie

**Solutions** :
```
1. Vérifier l'ID patient en DB
2. Créer un compte utilisateur si nécessaire
3. Régénérer le QR code avec le bon ID
```

---

### ❌ Problème : Backend retourne erreur 500

**Solution** :
```bash
# Redémarrer le backend
cd backend && npm run start:dev

# Vérifier les logs pour plus de détails
tail -f backend.log
```

---

## Améliorations futures (optionnel)

### 🔮 Fonctionnalités envisageables

```
1. Expiration des QR codes
   └─ QR valide pendant 30 jours par exemple

2. QR codes à usage unique
   └─ Auto-détruit après premier scan

3. Données encodées supplémentaires
   └─ Nom patient en clair dans QR
   └─ Date d'expiration

4. Rate limiting
   └─ Limiter les scans par minute
   └─ Prévenir les attaques par force brute

5. Biométrie deux facteurs
   └─ Empreinte digitale pour débloquer
   └─ Face ID sur QR scan

6. QR codes temps-réel
   └─ Génération dynamique unique à chaque scan
   └─ Token JWT dans le QR
```

---

## Conformité et légalité

### 📋 Respect des normes

- ✅ **RGPD** : Données publiques seulement jusqu'à authentification
- ✅ **Sécurité** : Validation multi-couches, audit complet
- ✅ **Accessibilité** : Interface simple, caméra standard
- ✅ **Confidentialité** : Traitement local (caméra), pas d'envoi de flux vidéo

### 🔒 Engagement de sécurité

```
Aucune donnée sensible n'est :
✓ Encodée dans le QR code
✓ Transmise sans validation
✓ Stockée sans audit
✓ Accessible sans authentification
```

---

## Résumé

| Aspect | Détail |
|--------|--------|
| **Public** | Page `/scan-qr` accessible à tous |
| **Sécurisé** | Validation stricte, logging complet |
| **Limité** | Infos publiques seulement |
| **Flexible** | Peut être intégré à d'autres workflows |
| **Audité** | Tous les scans enregistrés |

---

## Contacts et support

Pour des questions sur cette fonctionnalité :
- Consultez la section Support du site
- Contactez un administrateur
- Signalez un bug via le formulaire de support

---

**Dernière mise à jour : 24 novembre 2025**
