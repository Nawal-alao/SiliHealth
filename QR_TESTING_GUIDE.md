# 🧪 Guide de test - Fonctionnalité Scanner QR Code

## Configuration du test

### Prérequis
- ✅ Frontend lancé : `http://localhost:3000`
- ✅ Backend lancé : `http://localhost:4000`
- ✅ PostgreSQL actif (docker-compose ou local)
- ✅ Téléphone ou caméra pour tester le scan

---

## Scénario 1️⃣ : Test complet du flux (recommandé en premier)

### Étape 1 : Créer un compte test

```
URL : http://localhost:3000/signup

Données à entrer :
├─ Nom complet : Jean Dupont
├─ Email : jean@example.com
├─ Mot de passe : Password123!
├─ Confirmation : Password123!
└─ Rôle : Patient

Cliquer : [S'inscrire]

Résultat attendu :
✓ Message "Inscription réussie!"
✓ Redirection vers login
```

### Étape 2 : Se connecter

```
URL : http://localhost:3000/login

Données à entrer :
├─ Email : jean@example.com
└─ Mot de passe : Password123!

Cliquer : [Se connecter]

Résultat attendu :
✓ JWT token stocké en localStorage
✓ Accès au dashboard
✓ Message "Connexion réussie!"
```

### Étape 3 : Vérifier l'ID du patient

```
Action : Ouvrir la console du navigateur (F12)
         Onglet "Console"

Exécuter :
localStorage.getItem('token')

Résultat : Un JWT token s'affiche
```

**Extraction de l'ID** :
```javascript
// Dans la console, exécutez :
const decoded = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
console.log(decoded.id);  // Affiche l'ID du patient (ex: 1, 2, 3, etc.)
```

Notez cet ID pour la suite. Assumons ID = **1**.

### Étape 4 : Générer un QR code

```
URL : http://localhost:3000/generate-qr

Données à entrer :
└─ ID Patient : 1

Cliquer : [Générer QR Code]

Résultat attendu :
✓ QR code affiché à l'écran
✓ Boutons disponibles : [Télécharger] [Imprimer]
```

### Étape 5 : Scanner le QR code

#### Option A : Sur le même appareil (simulation)

```
URL : http://localhost:3000/scan-qr

Cliquer : [Démarrer le scanner]

Résultat attendu :
✓ Demande d'accès à la caméra
✓ Vidéo de la caméra affichée

Puis :
├─ Orienter l'écran avec le QR code vers la caméra
├─ Attendre la détection
└─ Message "QR code détecté!"
```

#### Option B : Deux appareils (recommandé)

```
Appareil 1 (PC) : Générer QR code
  ├─ URL : http://localhost:3000/generate-qr
  ├─ Afficher QR code à l'écran
  └─ Laisser afficher

Appareil 2 (Téléphone) : Scanner
  ├─ URL : http://192.168.X.X:3000/scan-qr
  │   (remplacer X.X par IP de votre PC, ex: 192.168.1.100)
  ├─ Cliquer : [Démarrer le scanner]
  ├─ Accepter accès caméra
  └─ Pointer vers l'écran avec le QR code
```

### Étape 6 : Vérifier les informations affichées

```
Après scan réussi :

Affichage attendu :
┌─────────────────────────────┐
│ Informations du patient     │
├─────────────────────────────┤
│ ID patient : 1              │
│ Nom : Jean Dupont           │
│ Email : jean@example.com    │
│ Date naissance : -           │
│ Dernier accès : [timestamp] │
│ Statut : Actif              │
└─────────────────────────────┘

Message de sécurité affiché :
┌─────────────────────────────┐
│ 🔒 Accès complet            │
│ Pour voir l'historique      │
│ complet, connectez-vous     │
├─────────────────────────────┤
│ [Se connecter]              │
│ [Créer un compte]           │
└─────────────────────────────┘
```

### Étape 7 : Se connecter après scan

```
Cliquer : [Se connecter]

URL : http://localhost:3000/login

Se connecter avec :
├─ Email : jean@example.com
└─ Mot de passe : Password123!

Après connexion :
└─ Accès au dashboard complet
   └─ Historique des consultations visible
   └─ Dossier médical complet accessible
```

---

## Scénario 2️⃣ : Test des erreurs

### Test A : QR code invalide

```
URL : http://localhost:3000/scan-qr

Cliquer : [Démarrer le scanner]

Montrer à la caméra :
├─ Code-barres traditionnel ❌
├─ QR code aléatoire ❌
└─ QR code d'un autre site ❌

Résultat attendu :
✓ Message : "QR code invalide (format non reconnu)"
✓ Pas de crash
✓ Scanner continue
```

### Test B : Patient inexistant

```
1. Modifier manuellement l'ID du patient dans le code
  └─ Changer HEALID_1 en HEALID_99999

2. URL : http://localhost:3000/scan-qr

3. Scanner le QR code modifié

Résultat attendu :
✓ Message : "Patient non trouvé"
✓ Aucune info affichée
✓ Pas d'erreur technique
```

### Test C : Accès à la caméra refusée

```
URL : http://localhost:3000/scan-qr

Cliquer : [Démarrer le scanner]

Refuser l'accès à la caméra

Résultat attendu :
✓ Message : "Accès à la caméra refusé"
✓ Proposition de reconnaître les permissions
```

---

## Scénario 3️⃣ : Test backend directement

### Test endpoint `/api/qr-verify`

```bash
# Ouverture terminal
curl -X POST http://localhost:4000/api/qr-verify \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "1",
    "timestamp": "2025-11-24T12:00:00.000Z",
    "userAgent": "Mozilla/5.0"
  }'
```

**Réponse attendue** (succès) :
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

### Test avec ID invalide

```bash
curl -X POST http://localhost:4000/api/qr-verify \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "abc",
    "timestamp": "2025-11-24T12:00:00.000Z",
    "userAgent": "Mozilla/5.0"
  }'
```

**Réponse attendue** :
```json
{
  "ok": false,
  "error": "ID patient invalide"
}
```

### Test avec patient inexistant

```bash
curl -X POST http://localhost:4000/api/qr-verify \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "99999",
    "timestamp": "2025-11-24T12:00:00.000Z",
    "userAgent": "Mozilla/5.0"
  }'
```

**Réponse attendue** :
```json
{
  "ok": false,
  "error": "Patient non trouvé ou accès refusé"
}
```

---

## Scénario 4️⃣ : Test de sécurité

### Test A : Pas d'exposition de données sensibles

```
Actions :
1. Générer QR pour patient ID = 1
2. Lire le contenu du QR (ex avec https://webqr.com)

Résultat attendu :
✓ Contenu visible : "HEALID_1"
✓ Pas de mot de passe dans le QR
✓ Pas d'email en clair dans le QR
✓ Pas de données sensibles encodées
```

### Test B : Audit logging

```
Action : Scanner plusieurs fois le même QR code

Vérifier dans les logs backend :

[NestJS logs]
QR Scan detected for patient ID: 1
Timestamp: 2025-11-24T12:00:00.000Z
User-Agent: Mozilla/5.0...
```

### Test C : Impossible d'accéder aux données sans JWT après scan

```
Actions :
1. Scanner un QR code ✓
2. Voir les infos du patient ✓
3. Essayer d'accéder à /api/consultations sans token ❌

Résultat attendu :
✓ Message : "Accès non autorisé (pas de token)"
✓ Pas d'exposition d'historique médical
```

---

## Scénario 5️⃣ : Test de performance

### Temps de scan

```
Mesurer : Temps du clic [Démarrer] à détection du QR

Résultat attendu :
✓ < 2 secondes en conditions normales
✓ < 5 secondes en mauvais éclairage
```

### Charge du backend

```bash
# Générer 100 requêtes QR simultanées
ab -n 100 -c 10 -X POST \
   -H "Content-Type: application/json" \
   -d '{"patientId":"1","timestamp":"2025-11-24T12:00:00.000Z","userAgent":"test"}' \
   http://localhost:4000/api/qr-verify
```

**Résultat attendu** :
- ✅ Temps réponse moyen < 50ms
- ✅ Aucune erreur 500
- ✅ Pas de crash backend

---

## Checklist de validation complète

### Frontend

- [ ] Page `/` affiche bouton "Scanner QR Code"
- [ ] Clic sur bouton redirige vers `/scan-qr`
- [ ] Page `/scan-qr` charge correctement
- [ ] Caméra fonctionne après permission
- [ ] QR code détecté en < 2 secondes
- [ ] Infos du patient affichées correctement
- [ ] Message de sécurité visible
- [ ] Boutons [Se connecter] et [Créer un compte] fonctionnent
- [ ] Page `/generate-qr` affiche formulaire
- [ ] Génération du QR code fonctionne
- [ ] Téléchargement PNG fonctionne
- [ ] Impression fonctionne

### Backend

- [ ] Endpoint `/api/qr-verify` accessible
- [ ] Validation du format ID
- [ ] Recherche patient en BD
- [ ] Retour des données publiques
- [ ] Pas d'exposition de données sensibles
- [ ] Erreurs retournées correctement
- [ ] Logging d'audit fonctionne
- [ ] Performance < 50ms par requête

### Sécurité

- [ ] QR code contient seulement "HEALID_[ID]"
- [ ] Aucun mot de passe jamais exposé
- [ ] Aucun email sensible dans le QR
- [ ] JWT requis pour accès complet après scan
- [ ] Validation multi-couches du format
- [ ] Scan sans authentification = infos publiques seulement
- [ ] Audit log de chaque tentative

### UX

- [ ] Interface intuitive et simple
- [ ] Messages d'erreur clairs
- [ ] Aucun crash ou écran blanc
- [ ] Responsive sur mobile et desktop
- [ ] Temps de chargement acceptable

---

## Résolution des problèmes courants

### Frontend ne répond pas

```bash
# Redémarrer frontend
cd /home/nawalalao/Documents/SiliHealth/frontend
npm run start
```

### Backend ne répond pas

```bash
# Redémarrer backend
cd /home/nawalalao/Documents/SiliHealth/backend
npm run start:dev
```

### BD vide (pas de patient)

```bash
# Créer un compte via signup
# OU via curl

curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test Patient",
    "email": "test@example.com",
    "password": "Password123!",
    "role": "patient"
  }'
```

### Caméra ne fonctionne pas

```
Vérifier :
1. Permission donnée au navigateur
2. HTTPS en production (HTTP OK en dev)
3. Autre app n'utilise pas la caméra
4. Redémarrer navigateur
5. Essayer navigateur différent
```

---

## Rapport de test à compléter

```
Date test : ______________
Testeur : ______________
Navigateur : ______________
Système : ______________

Tests passés : _____ / 24
Tests échoués : _____ / 24

Problèmes rencontrés :
1. _____________________________
2. _____________________________
3. _____________________________

Notes additionnelles :
___________________________________
___________________________________
```

---

**Fin du guide de test**
