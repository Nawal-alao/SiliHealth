# Guide API Patients - HealID

## Vue d'ensemble

L'API Patients fournit une gestion complète des dossiers médicaux avec séparation stricte des rôles et validations de sécurité.

## Endpoints Disponibles

### Création de Patient
**POST** `/api/patients`

Créé un dossier médical pour un patient (accessible uniquement aux patients).

#### Requête
```json
{
  "firstName": "Marie",
  "lastName": "Dupont",
  "birthDate": "1990-05-15",
  "sexAtBirth": "F",
  "email": "marie@example.com",
  "phone": "+33123456789",
  "consentForDataProcessing": true,
  "menarcheAge": 13,
  "pregnantCurrent": false
}
```

#### Réponse (201 Created)
```json
{
  "ok": true,
  "message": "Patient record created successfully",
  "patient": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid-here",
    "firstName": "Marie",
    "lastName": "Dupont",
    "birthDate": "1990-05-15",
    "sexAtBirth": "F",
    "createdAt": "2025-12-02T01:30:00.000Z"
  }
}
```

### Liste des Patients
**GET** `/api/patients`

Liste tous les patients (accessible uniquement aux agents de santé).

#### Réponse
```json
{
  "ok": true,
  "patients": [
    {
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "Marie",
      "lastName": "Dupont",
      "birthDate": "1990-05-15",
      "sexAtBirth": "F",
      "phone": "+33123456789",
      "emergencyContactName": "John Dupont"
    }
  ],
  "total": 1
}
```

### Détails Patient
**GET** `/api/patients/{patientId}`

Accède aux détails complets d'un patient.

#### Permissions
- **Agents** : Peuvent voir tous les patients
- **Patients** : Peuvent voir uniquement leur propre dossier

#### Réponse
```json
{
  "ok": true,
  "patient": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid-here",
    "firstName": "Marie",
    "lastName": "Dupont",
    "birthDate": "1990-05-15",
    "sexAtBirth": "F",
    "email": "marie@example.com",
    "phone": "+33123456789",
    "heightCm": 165.5,
    "weightKg": 60.2,
    "bmi": 22.1,
    "menarcheAge": 13,
    "pregnantCurrent": false,
    "consentForDataProcessing": true,
    "createdAt": "2025-12-02T01:30:00.000Z"
  }
}
```

### Mise à Jour Patient
**PUT** `/api/patients/{patientId}`

Met à jour les informations d'un patient.

#### Permissions
- **Agents** : Peuvent modifier tous les dossiers
- **Patients** : Peuvent modifier uniquement leur profil de base

#### Requête
```json
{
  "phone": "+33123456789",
  "emergencyContactName": "John Dupont",
  "emergencyContactPhone": "+33123456788",
  "heightCm": 165.5,
  "weightKg": 60.2
}
```

## Champs par Catégorie

### Identification (Obligatoire)
- `firstName`, `lastName` : Noms (requis)
- `birthDate` : Date de naissance (requis, passé)
- `sexAtBirth` : "M", "F", ou "Other" (requis)

### Contact (Optionnel)
- `email` : Format email valide
- `phone` : Format français (+33123456789)
- `emergencyContactName/Phone` : Contacts d'urgence

### Mesures Médicales (Optionnel)
- `heightCm` : 50-250 cm
- `weightKg` : 2-300 kg
- `bloodPressureSystolic/Diastolic` : Pression artérielle
- `heartRate` : 40-200 bpm
- `temperatureC` : 30-45°C

### Données Féminines (F seulement)
- `menarcheAge` : 8-18 ans
- `menstrualCycleRegular` : Boolean
- `menstrualCycleLength` : 21-35 jours
- `contraception` : Array des méthodes
- `pregnantCurrent` : Statut grossesse
- `pregnancyDetails` : Détails obstétricaux
- `gynecologicalHistory` : Historique gynéco

### Données Masculines (M seulement)
- `urologicalHistory` : Historique urologique
- `testicularExamNotes` : Notes d'examen

### Consentement (Obligatoire)
- `consentForDataProcessing` : true requis
- `shareWithResearch` : false par défaut

## Validations et Règles

### Règles Métier
1. **Consentement obligatoire** : `consentForDataProcessing: true`
2. **Date de naissance** : Doit être dans le passé
3. **Sexe strict** : Uniquement "M", "F", "Other"
4. **Champs spécifiques au sexe** : Respect des contraintes

### Formats Requis
- **Email** : RFC valide
- **Téléphone** : Format français
- **Code postal** : 5 chiffres
- **Dates** : ISO 8601 (YYYY-MM-DD)

### Contraintes de Sécurité
- **PII à chiffrer** : `nationalIdNumber`, `insuranceNumber`
- **Audit complet** : Toutes modifications tracées
- **Accès contrôlé** : Rôles stricts appliqués

## Exemples d'Utilisation

### 1. Création Femme Enceinte
```bash
curl -X POST http://localhost:4000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sophie",
    "lastName": "Martin",
    "birthDate": "1988-12-10",
    "sexAtBirth": "F",
    "consentForDataProcessing": true,
    "menarcheAge": 12,
    "menstrualCycleRegular": true,
    "menstrualCycleLength": 28,
    "pregnantCurrent": true,
    "pregnancyDetails": {
      "gestationalAgeWeeks": 24,
      "expectedDeliveryDate": "2026-08-15",
      "obstetricHistory": [{"G": 2, "P": 1, "dates": "2020, 2023"}],
      "complications": "Pré-éclampsie légère"
    }
  }'
```

### 2. Mise à Jour Homme
```bash
curl -X PUT http://localhost:4000/api/patients/PATIENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occupation": "Ingénieur",
    "smokingStatus": "never",
    "alcoholUse": "social",
    "heightCm": 180,
    "weightKg": 75
  }'
```

### 3. Accès Agent
```bash
# Liste tous les patients
curl -H "Authorization: Bearer AGENT_TOKEN" \
  http://localhost:4000/api/patients

# Détails spécifiques
curl -H "Authorization: Bearer AGENT_TOKEN" \
  http://localhost:4000/api/patients/PATIENT_ID
```

## Codes d'Erreur

- **400 Bad Request** : Validation échouée
- **401 Unauthorized** : Token manquant/invalide
- **403 Forbidden** : Permissions insuffisantes
- **404 Not Found** : Patient inexistant
- **500 Internal Error** : Erreur serveur

## Tests Recommandés

### Tests Fonctionnels
```bash
# Test création patient femme
npm test -- --testNamePattern="Patient should create own medical record"

# Test permissions
npm test -- src/patients/patients.spec.ts

# Tests validation
npm test -- --testNamePattern="should validate"
```

### Tests de Sécurité
- Tentative d'accès sans token → 401
- Patient accédant à autre dossier → 403
- Champs interdits par sexe → 400
- Données invalides → 400

## Migration de Données

Si vous avez des données existantes, la migration automatique :
1. Préserve les données utilisateurs
2. Crée les dossiers patients correspondants
3. Génère les `patient_id` UUID automatiquement
4. Migre les données médicales disponibles

```sql
-- Appliquer la migration
npx prisma migrate deploy
npx prisma generate
```

---

**🔒 Sécurité :** Toutes les données sensibles sont chiffrées et auditées.

**📊 Conformité :** Respecte les normes médicales et RGPD.

**🚀 Performance :** Index optimisés pour les requêtes fréquentes.
