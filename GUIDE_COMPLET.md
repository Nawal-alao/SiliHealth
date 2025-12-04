# 📘 Guide Complet HealID — Mode d'emploi Détaillé

## Table des matières

1. [Introduction](#introduction)
2. [Accès au site](#accès-au-site)
3. [Créer un compte (Inscription)](#créer-un-compte-inscription)
4. [Se connecter à votre compte](#se-connecter-à-votre-compte)
5. [Navigation générale](#navigation-générale)
6. [Les modules et fonctionnalités](#les-modules-et-fonctionnalités)
7. [Questions fréquentes](#questions-fréquentes)
8. [Dépannage](#dépannage)

---

## Introduction

**HealID** est une plateforme médicale numérique complète et sécurisée qui vous permet de :
- Gérer vos consultations médicales
- Suivre votre grossesse
- Accéder à vos dossiers médicaux
- Uploader et stocker vos résultats de tests
- Consulter des articles et ressources médicales

**Important** : Toute vos données sont **chiffrées et protégées** par un système d'authentification JWT (token de sécurité).

---

## Accès au site

### URL d'accès

```
http://localhost:3000
```

### Configuration système requise

- **Navigateur moderne** : Chrome, Firefox, Safari, Edge (versions récentes)
- **Connexion Internet** : pour accéder aux services
- **JavaScript activé** : le site utilise du JavaScript pour fonctionner
- **Cookies activés** : pour la sauvegarde de vos identifiants

### État des serveurs

Pour vérifier que tout fonctionne correctement :

- **Frontend** : http://localhost:3000 (interface utilisateur)
- **Backend** : http://localhost:4000 (API sécurisée)

Si vous voyez une page blanche ou une erreur "Cannot GET /", vérifiez que les deux serveurs sont en cours d'exécution.

---

## Créer un compte (Inscription)

### Étape 1 : Accéder à la page d'inscription

1. Allez à `http://localhost:3000`
2. Vous voyez la page d'accueil (landing page)
3. Cliquez sur le bouton **"S'inscrire"** ou allez directement à `http://localhost:3000/signup`

### Étape 2 : Remplir le formulaire d'inscription

Vous verrez un formulaire avec les champs suivants :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom complet** | Votre prénom et nom | Jean Dupont |
| **Email** | Votre adresse email (unique) | jean.dupont@email.com |
| **Mot de passe** | Minimum 6 caractères | SecurePass123 |
| **Rôle** | Type de profil (optionnel) | Patients, Médecin, Admin |

### Étape 3 : Valider l'inscription

1. Vérifiez que tous les champs sont remplis
2. Cliquez sur le bouton **"S'inscrire"**
3. Vous verrez un message : "Opération réussie"
4. Vous serez automatiquement redirigé vers la page de **connexion**

### ⚠️ Points importants

- **Email unique** : Vous ne pouvez pas utiliser un email déjà enregistré
- **Mot de passe sécurisé** : Doit contenir au moins 6 caractères
- **Confidentialité** : Vos données ne sont jamais partagées
- **Chiffrement** : Votre mot de passe est hachés et protégés

---

## Se connecter à votre compte

### Étape 1 : Accéder à la page de connexion

1. Allez à `http://localhost:3000/login`
2. Vous verrez le formulaire de connexion

### Étape 2 : Entrer vos identifiants

| Champ | Description |
|-------|-------------|
| **Email** | L'email utilisé lors de l'inscription |
| **Mot de passe** | Votre mot de passe d'inscription |

### Étape 3 : Se connecter

1. Remplissez vos identifiants
2. Cliquez sur le bouton **"Se connecter"**
3. Si les informations sont correctes, vous verrez : "Opération réussie"
4. Vous serez redirigé vers le **Tableau de bord (Dashboard)**

### Après la connexion

Une fois connecté, un **token de sécurité JWT** est automatiquement sauvegardé dans votre navigateur. Ce token :
- ✅ Vous identifie de manière sécurisée
- ✅ Vous permet d'accéder aux fonctionnalités protégées
- ✅ Expire après 8 heures (vous devrez vous reconnecter)
- ✅ N'est jamais visible ni accessible par d'autres

### 🔐 Conseils de sécurité

```
✓ Utilisez un mot de passe unique et fort
✓ Ne partagez jamais vos identifiants
✓ Déconnectez-vous sur les appareils publics
✓ Effacez vos cookies si vous utilisez un ordinateur partagé
```

---

## Navigation générale

### Barre latérale (Sidebar)

Une fois connecté, vous verrez une **barre latérale** avec plusieurs sections :

#### 📊 Modules disponibles

```
┌─────────────────────────┐
│ 🏥 HEALID           │
├─────────────────────────┤
│ 📈 Tableau de bord      │
│ 🏥 Consultations        │
│ 🤰 Suivi de grossesse   │
│ 📋 Dossiers médicaux    │
│ 👤 Profil               │
│ ⚙️  Paramètres          │
│ 📞 Support              │
│ 📰 Blog                 │
└─────────────────────────┘
```

### En-tête (Header)

En haut de chaque page, vous trouvez :
- Le logo **HealID**
- Un menu de navigation
- Votre nom d'utilisateur
- Un bouton de **déconnexion**

---

## Les modules et fonctionnalités

### 1️⃣ Tableau de bord (Dashboard)

**URL** : `http://localhost:3000/dashboard`

C'est votre **page d'accueil personnelle** après connexion.

#### Fonctionnalités :

| Élément | Description |
|---------|-------------|
| **Statistiques** | Vue d'ensemble de vos activités médicales |
| **Consultations récentes** | Vos dernières consultations médicales |
| **Raccourcis** | Accès rapide aux fonctionnalités principales |
| **Actualités** | Les dernières informations de santé |

#### Actions possibles :

- Voir vos consultations à venir
- Accéder rapidement aux autres modules
- Consulter votre profil
- Voir les notifications importantes

---

### 2️⃣ Consultations médicales

#### 📋 Lister les consultations

**URL** : `http://localhost:3000/consultations`

Affiche la **liste complète** de toutes vos consultations.

##### Ce que vous voyez :

```
Consultation 1
├─ Patient : Jane Doe
├─ Date : 2 octobre 2025
├─ Médecin : Dr. Martin
└─ Statut : Terminée ✓

Consultation 2
├─ Patient : Anne Dupont
├─ Date : 14 octobre 2025
├─ Médecin : Dr. Leroy
└─ Statut : En attente ⏳
```

##### Actions disponibles :

- 👁️ **Voir les détails** : cliquez pour voir la consultation complète
- 📝 **Éditer** : modifier les informations (si disponible)
- ❌ **Supprimer** : annuler une consultation (si disponible)
- ➕ **Ajouter une consultation** : créer une nouvelle consultation

---

#### ➕ Créer une nouvelle consultation

**URL** : `http://localhost:3000/consultation-new`

Cette page vous permet de **planifier une nouvelle consultation**.

##### Champs à remplir :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom du patient** | Votre nom ou nom du patient | Jean Dupont |
| **Date** | Date de la consultation | 15 novembre 2025 |
| **Médecin** | Nom du médecin (optionnel) | Dr. Martin |
| **Type de consultation** | Type médical | Consultation générale |

##### Processus :

1. Remplissez les champs
2. Cliquez sur **"Créer"**
3. Vous verrez : "Opération réussie"
4. Vous serez redirigé vers la liste des consultations
5. Votre consultation apparaît dans la liste

**Important** : ✅ Seuls les utilisateurs connectés peuvent créer une consultation

---

#### 📖 Détails d'une consultation

**URL** : `http://localhost:3000/consultation-detail`

Affiche les **détails complets** d'une consultation spécifique.

##### Informations visibles :

```
┌──────────────────────────────────┐
│ Détails de la Consultation       │
├──────────────────────────────────┤
│ ID : 1                           │
│ Patient : Jane Doe               │
│ Date : 02/10/2025                │
│ Médecin : Dr. Martin             │
│ Statut : Terminée                │
│ Notes : (si disponibles)         │
│ Pièces jointes : (fichiers)      │
└──────────────────────────────────┘
```

##### Actions :

- 📥 **Télécharger** les pièces jointes
- 🔄 **Mettre à jour** les informations
- 📞 **Contacter** le médecin
- 🔒 **Partager** de manière sécurisée

---

### 3️⃣ Suivi de grossesse

#### 🤰 Module grossesse

**URL** : `http://localhost:3000/pregnancy`

Espace dédié pour les **femmes enceintes** ou en suivi de grossesse.

##### Fonctionnalités :

| Fonctionnalité | Description |
|----------------|-------------|
| **Profil de grossesse** | Vos informations de grossesse |
| **Date prévue d'accouchement** | Calculée automatiquement |
| **Trimestre** | En quel trimestre vous êtes |
| **Ressources** | Articles et conseils de grossesse |
| **Suivi médical** | Consultations liées à la grossesse |

---

#### 🧮 Calculatrice de grossesse

**URL** : `http://localhost:3000/pregnancy-calculator`

Outil pour **calculer l'avancement de votre grossesse**.

##### Comment l'utiliser :

1. **Entrez la date** de vos dernières règles
2. Le système calcule automatiquement :
   - Nombre de semaines de grossesse
   - Date prévue d'accouchement (DPA)
   - Trimestre actuel
3. **Exemple** :
   ```
   Dernières règles : 1er janvier 2025
   → Résultat :
      - Semaines : 46
      - DPA : 8 octobre 2025
      - Trimestre : 3ème trimestre
   ```

---

#### 📊 Historique des tests

**URL** : `http://localhost:3000/tests-history`

Liste de vos **tests de laboratoire et échographies**.

##### Tests visibles :

```
Test 1 - Échographie
├─ Date : 10 juin 2025
├─ Type : Échographie
├─ Résultat : Normal ✓
└─ Fichier : echo_2025.pdf

Test 2 - Analyse de sang
├─ Date : 15 septembre 2025
├─ Type : Analyse sanguine
├─ Résultat : En attente ⏳
└─ Fichier : analyse_sept.pdf
```

---

### 4️⃣ Dossiers médicaux

#### 📄 Mon dossier patient

**URL** : `http://localhost:3000/patient-record`

Votre **dossier médical complet** stocké de manière sécurisée.

##### Informations contenues :

| Rubrique | Contenu |
|----------|---------|
| **Données personnelles** | Nom, prénom, date de naissance, email |
| **Allergies** | Vos allergies connues |
| **Conditions médicales** | Maladies chroniques, antécédents |
| **Médicaments** | Liste des médicaments actuels |
| **Vaccinations** | Historique de vaccination |
| **Consultations passées** | Historique médical complet |

---

#### 🔐 Historique d'accès

**URL** : `http://localhost:3000/access-history`

Voir **qui a accédé** à votre dossier médical.

##### Informations visibles :

```
Accès 1
├─ Utilisateur : Dr. Martin
├─ Date : 2 novembre 2025 à 14:30
├─ Type : Consultation
└─ Durée : 2 minutes

Accès 2
├─ Utilisateur : Vous-même
├─ Date : 3 novembre 2025 à 09:15
├─ Type : Visualisation personnelle
└─ Durée : 5 minutes
```

**Sécurité** : ✅ Vous pouvez voir exactement qui a consulté votre dossier

---

#### 📝 Journal d'activité

**URL** : `http://localhost:3000/activity-log`

Enregistrement de **toutes vos actions** sur la plateforme.

##### Exemple d'activité :

```
14:30 - Connexion à votre compte
14:32 - Consultation du dossier médical
14:35 - Création d'une consultation
15:00 - Upload d'un fichier (résultats de tests)
15:15 - Déconnexion
```

---

#### 🔑 Permissions et partage

**URL** : `http://localhost:3000/permissions`

Gérez **qui peut voir** vos informations médicales.

##### Actions possibles :

- ✅ Autoriser un médecin à consulter votre dossier
- ❌ Révoquer l'accès à une personne
- 👁️ Voir les permissions actuelles
- ⏰ Définir une durée d'accès limitée

##### Exemple :

```
Permissions actuelles :

Dr. Martin
├─ Type : Accès complet
├─ Depuis : 1er octobre 2025
└─ Jusqu'à : 1er janvier 2026 ✓

Infirmière Sophie
├─ Type : Accès limité (consultations seulement)
├─ Depuis : 15 novembre 2025
└─ Jusqu'à : 31 décembre 2025 ✓
```

---

### 5️⃣ Upload de résultats

**URL** : `http://localhost:3000/upload-results`

**Uploader vos résultats de tests** de manière sécurisée.

#### Comment uploader un fichier :

1. **Cliquez sur le zone d'upload** ou glissez-déposez
2. **Sélectionnez votre fichier** (PDF, image, etc.)
3. **Cliquez sur "Upload"**
4. Vous verrez une **barre de progression**
5. Après succès : "Opération réussie"

#### Formats acceptés :

- 📄 PDF
- 🖼️ Images (JPG, PNG, GIF)
- 📊 Fichiers Excel
- 📝 Fichiers Word

#### Exemple de résultats uploadés :

```
Fichier 1 : Résultats analyses avril 2025
├─ Type : PDF
├─ Taille : 2.3 MB
├─ Date d'upload : 4 novembre 2025
└─ Statut : ✓ Traité

Fichier 2 : Résultats échographie
├─ Type : PDF
├─ Taille : 5.1 MB
├─ Date d'upload : 3 novembre 2025
└─ Statut : ✓ Traité
```

**Important** : 🔒 Tous les fichiers sont chiffrés et sécurisés

---

### 6️⃣ Profil utilisateur

**URL** : `http://localhost:3000/profile`

Votre **page de profil personnelle**.

#### Informations affichées :

| Information | Description |
|-------------|-------------|
| **Photo de profil** | Votre avatar personnel |
| **Nom complet** | Jean Dupont |
| **Email** | jean.dupont@email.com |
| **Date d'inscription** | 1er janvier 2025 |
| **Rôle** | Patient / Médecin / Admin |
| **Statut** | Actif ✓ |

#### Actions possibles :

- ✏️ **Modifier vos informations**
- 🖼️ **Changer votre photo**
- 🔐 **Changer votre mot de passe**
- 📧 **Modifier votre email**
- 🗑️ **Supprimer votre compte**

---

### 7️⃣ Paramètres système

**URL** : `http://localhost:3000/system-settings`

Configurez les **paramètres généraux** de votre compte.

#### Options disponibles :

| Paramètre | Options |
|-----------|---------|
| **Langue** | Français, Anglais, Espagnol |
| **Thème** | Clair, Sombre, Auto |
| **Notifications** | Email, SMS, Push (activer/désactiver) |
| **Fuseau horaire** | Automatique ou manuel |
| **Historique** | Conserver / Supprimer automatiquement |
| **Deux facteurs** | Activer l'authentification 2FA |

---

### 8️⃣ Support et aide

**URL** : `http://localhost:3000/support`

Besoin d'aide ? Consultez le **centre de support**.

#### Sections :

| Section | Contenu |
|---------|---------|
| **FAQ** | Questions fréquemment posées |
| **Tutoriels** | Guides étape par étape |
| **Contactez-nous** | Formulaire de contact |
| **Statut système** | État des serveurs |
| **Chat support** | Support en direct (si disponible) |

#### Soumettre un ticket :

1. Remplissez le formulaire de contact
2. Décrivez votre problème en détail
3. Joignez des captures d'écran si nécessaire
4. Cliquez sur **"Envoyer"**
5. Vous recevrez une confirmation par email

---

### 9️⃣ Blog et ressources

**URL** : `http://localhost:3000/blog`

Lisez des **articles de santé** et des ressources éducatives.

#### Fonctionnalités :

- 📰 Liste des articles récents
- 🔍 Recherche d'articles
- 📌 Articles populaires
- 💾 Sauvegarder articles préférés
- 📧 S'abonner à la newsletter

#### Exemple d'article :

**URL** : `http://localhost:3000/article`

```
Titre : "Les 10 conseils pour une grossesse saine"

Auteur : Dr. Marie Dupont
Date : 15 novembre 2025
Temps de lecture : 5 minutes

Contenu : Article complet avec conseils médicaux...

Actions :
├─ ❤️ Aimer
├─ 📤 Partager
├─ 💾 Sauvegarder
└─ 💬 Commenter
```

---

## Questions fréquentes

### ❓ Comment réinitialiser mon mot de passe ?

1. Allez à la page de connexion
2. Cliquez sur **"Mot de passe oublié"**
3. Entrez votre email
4. Vous recevrez un lien de réinitialisation
5. Cliquez sur le lien et créez un nouveau mot de passe

*Note : Actuellement, cette fonctionnalité peut nécessiter du support*

---

### ❓ Combien de temps dure une session ?

Votre session dure **8 heures** après la dernière action.

Après ce délai, vous devez vous **reconnecter**.

---

### ❓ Mes données sont-elles sécurisées ?

✅ **OUI**, complètement !

**Mesures de sécurité** :
- 🔐 Connexion JWT (tokens sécurisés)
- 🔒 Mots de passe hachés avec bcryptjs
- 📡 Communication chiffrée (HTTPS en production)
- 🔑 Contrôle d'accès strict
- 📝 Audit logging complet

---

### ❓ Puis-je partager mon dossier médical avec mon médecin ?

✅ **OUI**, via la section **"Permissions"**.

Vous pouvez :
- Autoriser des médecins spécifiques
- Fixer une durée d'accès
- Révoquer à tout moment
- Voir qui y a accédé

---

### ❓ Quel type de fichiers puis-je uploader ?

✅ **Fichiers acceptés** :
- PDF (recommandé pour les rapports)
- Images (JPG, PNG, GIF)
- Excel, Word
- Autres formats courants

❌ **Non acceptés** :
- Fichiers exécutables (.exe, .bat)
- Fichiers compressés volumineux

---

### ❓ Puis-je exporter mes données ?

✅ Fonctionnalité prévue (bientôt disponible)

Vous pourrez exporter :
- Dossier médical complet (PDF)
- Historique des consultations
- Résultats de tests

---

### ❓ Y a-t-il une limite d'espace de stockage ?

Actuellement : **Illimité** pour les essais

En production : À définir selon votre forfait

---

## Dépannage

### 🚨 Je n'arrive pas à me connecter

**Vérifiez :**

1. ✅ Votre email est correctement orthographié
2. ✅ Votre mot de passe est exact
3. ✅ Votre compte a bien été créé
4. ✅ Vous êtes connecté à Internet
5. ✅ JavaScript est activé

**Solution** :
- Essayez de réinitialiser votre mot de passe
- Videz votre cache/cookies
- Essayez un autre navigateur

---

### 🚨 Le site ne charge pas

**Causes possibles :**

| Problème | Solution |
|----------|----------|
| **Frontend non démarré** | Lancez : `cd frontend && npm run start` |
| **Backend non démarré** | Lancez : `cd backend && npm run start:dev` |
| **Port occupé** | Changez le port ou tuez le processus existant |
| **Pas de connexion** | Vérifiez votre connexion Internet |

**Commandes de diagnostic** :

```bash
# Vérifier que le frontend répond
curl http://localhost:3000

# Vérifier que le backend répond
curl http://localhost:4000/api/consultations
```

---

### 🚨 Message "Unauthorized" quand j'envoie un formulaire

**Cause** : Vous n'êtes pas connecté ou votre token a expiré

**Solution** :
1. Déconnectez-vous complètement
2. Videz les cookies
3. Reconnectez-vous
4. Réessayez

---

### 🚨 Mes fichiers uploadés ne s'affichent pas

**Vérifiez :**

1. ✅ Le fichier s'est bien uploadé (message "Opération réussie")
2. ✅ Vous êtes toujours connecté
3. ✅ Vous allez dans la bonne section
4. ✅ Le fichier n'est pas corrompu

**Si le problème persiste** :
- Essayez un autre fichier
- Essayez un autre format
- Contactez le support

---

### 🚨 Je reçois une erreur "500 Internal Server Error"

**Problème serveur** : Le backend a rencontré une erreur

**Solution rapide** :
1. Attendez quelques secondes
2. Rafraîchissez la page (F5)
3. Réessayez

**Si ça continue** :
- Redémarrez le backend
- Vérifiez les logs d'erreur
- Contactez le support

---

## Raccourcis clavier

| Clavier | Action |
|---------|--------|
| **F5** | Rafraîchir la page |
| **Ctrl+C** (terminal) | Arrêter un serveur |
| **Ctrl+Shift+Del** | Effacer cache/cookies |

---

## Informations de contact

### 📞 Support technique

- **Email** : support@healid.com
- **Chat** : Disponible dans la section Support
- **Téléphone** : (à remplir selon votre organisation)

### 🐛 Signaler un bug

Allez à la section **Support** et créez un ticket en décrivant :
- Ce que vous faisiez
- Quel navigateur vous utilisiez
- Quelle erreur vous avez reçue
- Des captures d'écran

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **JWT Token** | Code sécurisé qui prouve votre identité |
| **Hachage** | Conversion sécurisée de votre mot de passe |
| **Backend** | Serveur qui traite vos données |
| **Frontend** | Interface que vous voyez dans le navigateur |
| **API** | Système permettant à frontend et backend de communiquer |
| **Deux facteurs (2FA)** | Protection extra avec code SMS ou app |
| **Chiffrement** | Technique pour protéger vos données |

---

## Conseils pour la meilleure expérience

### ✅ Bonnes pratiques

1. **Sauvegardez régulièrement vos données** : téléchargez vos dossiers
2. **Mettez à jour votre profil** : gardez vos infos à jour
3. **Vérifiez votre historique d'accès** : voyez qui consulte votre dossier
4. **Utilisez un mot de passe fort** : au moins 12 caractères
5. **Déconnectez-vous sur les appareils publics** : pour votre sécurité
6. **Lisez les articles du blog** : restez informé
7. **Participez aux consultations** : suivi médical régulier

---

## Résumé rapide des URLs

| Page | URL |
|------|-----|
| Accueil | http://localhost:3000 |
| Inscription | http://localhost:3000/signup |
| Connexion | http://localhost:3000/login |
| Tableau de bord | http://localhost:3000/dashboard |
| Consultations | http://localhost:3000/consultations |
| Nouvelle consultation | http://localhost:3000/consultation-new |
| Détail consultation | http://localhost:3000/consultation-detail |
| Suivi grossesse | http://localhost:3000/pregnancy |
| Calculatrice grossesse | http://localhost:3000/pregnancy-calculator |
| Historique tests | http://localhost:3000/tests-history |
| Dossier patient | http://localhost:3000/patient-record |
| Historique d'accès | http://localhost:3000/access-history |
| Journal d'activité | http://localhost:3000/activity-log |
| Permissions | http://localhost:3000/permissions |
| Upload résultats | http://localhost:3000/upload-results |
| Profil | http://localhost:3000/profile |
| Paramètres | http://localhost:3000/system-settings |
| Support | http://localhost:3000/support |
| Blog | http://localhost:3000/blog |
| Article | http://localhost:3000/article |

---

## Derniers conseils

🎯 **Pour débuter** :
1. Créez un compte
2. Connectez-vous
3. Explorez le tableau de bord
4. Lisez les articles du blog
5. Contactez le support si besoin

💡 **Pour maximiser votre utilisation** :
1. Organisez vos consultations
2. Uploader régulièrement vos résultats
3. Gérez vos permissions de partage
4. Restez à jour avec les notifications

🔒 **Pour rester sécurisé** :
1. Utilisez un mot de passe unique
2. Déconnectez-vous régulièrement
3. Vérifiez votre historique d'accès
4. Soyez vigilant avec vos données

---

**Merci d'utiliser HealID !** 🏥

Pour toute question, contactez le support ou consultez cette documentation.

*Dernière mise à jour : 24 novembre 2025*

---

## Appendice : Aide visuelle

### Structure générale du site

```
┌─────────────────────────────────────────┐
│          HEALID - ACCUEIL           │
│  (Avant connexion - Landing page)       │
└────────────────────────────────┬────────┘
                                 │
                    ┌────────────┴───────────┐
                    ↓                        ↓
            ┌───────────────┐        ┌───────────────┐
            │  S'INSCRIRE   │        │ SE CONNECTER  │
            │   (Signup)    │        │   (Login)     │
            └───────┬───────┘        └───────┬───────┘
                    │                        │
                    └────────────┬───────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │  TABLEAU DE BORD        │
                    │  (Dashboard - accueil)  │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ↓                        ↓                        ↓
    ┌─────────────┐          ┌──────────────┐         ┌──────────┐
    │CONSULTATIONS│          │SUIVI GROSSES │         │DOSSIERS  │
    ├─────────────┤          ├──────────────┤         ├──────────┤
    │• Lister     │          │• Pregnancy   │         │• Records │
    │• Créer      │          │• Calculatrice│         │• Access  │
    │• Détails    │          │• Tests       │         │• Activity│
    │• Upload     │          │              │         │• Perms   │
    └─────────────┘          └──────────────┘         └──────────┘
        │                            │                        │
        └────────────────────────────┼────────────────────────┘
                                     ↓
                        ┌────────────────────────┐
                        │  PROFIL & PARAMÈTRES   │
                        │  (Profile & Settings)  │
                        └────────────────────────┘
                                     ↓
                        ┌────────────────────────┐
                        │  SUPPORT & BLOG        │
                        │  (Help & Resources)    │
                        └────────────────────────┘
```

---

**Fin du guide complet HealID** 🎉
