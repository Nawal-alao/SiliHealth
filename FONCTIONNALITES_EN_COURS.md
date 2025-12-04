# 📋 Fonctionnalités en cours d'implémentation

Ce document liste toutes les fonctionnalités qui affichent des messages "en cours de développement" ou qui sont partiellement implémentées dans votre site HealID.

---

## 🚧 Fonctionnalités avec messages "À implémenter"

### 1. **Gestion des rendez-vous** (Dashboard Agent)
**Fichier** : `frontend/views/dashboard-agent.ejs` (ligne 332-333)

**Bouton concerné** : 
- Bouton "Créer RDV" dans la section "Rendez-vous du jour"

**Message actuel** :
```javascript
alert('Fonctionnalité de rendez-vous à implémenter');
```

**Ce qui manque** :
- Modal de création de rendez-vous
- Intégration avec le backend pour créer/modifier/supprimer des rendez-vous
- Affichage des rendez-vous du jour dans le dashboard
- Calendrier de rendez-vous

---

## 🎨 Fonctionnalités avec contenu "Mock" (simulé)

### 2. **Graphiques du Dashboard** (Dashboard général)
**Fichier** : `frontend/views/dashboard.ejs` (ligne 25)

**Élément concerné** :
- Section "Graphiques — mock" dans le dashboard principal

**Contenu actuel** :
```html
<section class="card">
  <h3>Graphiques — mock</h3>
  <div style="...">Graphiques (mock)</div>
</section>
```

**Ce qui manque** :
- Graphiques réels (consultations par mois, activité, etc.)
- Intégration avec une bibliothèque de graphiques (Chart.js, D3.js, etc.)
- Données réelles depuis l'API

---

### 3. **Suivi de grossesse - Risques** (Page Grossesse)
**Fichier** : `frontend/views/pregnancy.ejs` (ligne 13)

**Élément concerné** :
- Section "Risques" dans la page de suivi de grossesse

**Contenu actuel** :
```html
<section>
  <h4>Risques</h4>
  <div class="card-compact muted">Aucun risque majeur détecté (mock).</div>
</section>
```

**Ce qui manque** :
- Calcul automatique des risques basé sur les données du patient
- Algorithme de détection de risques (diabète gestationnel, pré-éclampsie, etc.)
- Affichage des risques avec codes couleur

---

### 4. **Suivi de grossesse - Courbe de croissance** (Page Grossesse)
**Fichier** : `frontend/views/pregnancy.ejs` (ligne 14)

**Élément concerné** :
- Section "Courbe de croissance (mock)" dans la page de suivi de grossesse

**Contenu actuel** :
```html
<section>
  <h4>Courbe de croissance (mock)</h4>
  <div style="...">Courbe (mock)</div>
</section>
```

**Ce qui manque** :
- Graphique réel de la courbe de croissance du fœtus
- Intégration avec les données d'échographie
- Comparaison avec les courbes de référence (percentiles)

---

## ⚠️ Fonctionnalités partiellement implémentées

### 5. **Accès d'urgence** (Bouton URGENCE dans le header)
**Fichier** : `frontend/js/main.js` (ligne 1181)

**Bouton concerné** :
- Bouton "URGENCE" dans le header (visible pour les agents)

**État actuel** :
- Le bouton ouvre une modal pour saisir une raison
- La fonction `handleEmergencyAccess()` est marquée comme "Simulation"
- Redirection vers `/emergency-access` mais la logique complète n'est pas implémentée

**Commentaire dans le code** :
```javascript
// Simulation - en production, rediriger vers page urgence avec contexte
```

**Ce qui manque** :
- Intégration complète avec le backend pour l'accès d'urgence
- Validation du code d'accès d'urgence
- Journalisation complète de l'accès
- Affichage des informations vitales du patient

---

### 6. **Notifications** (Bouton notifications dans le header)
**Fichier** : `frontend/js/main.js` (lignes 1103-1151)

**Bouton concerné** :
- Bouton "Notifications" dans le header (avec badge de compteur)

**État actuel** :
- Le système de notifications est partiellement implémenté
- L'interface UI existe (panneau de notifications)
- La fonction `fetchNotifications()` existe mais peut ne pas être connectée au backend

**Ce qui manque** :
- Endpoint backend pour récupérer les notifications
- Système de création de notifications automatiques
- Types de notifications (consultations, rendez-vous, alertes, etc.)
- Marquer comme lu/non lu fonctionnel

---

## 📍 Emplacements des boutons/fonctionnalités

### Dans le Header (`frontend/views/partials/header.ejs`) :

1. **Bouton Scanner QR** (ligne 249-263)
   - ✅ Fonctionnel (ouvre une modal de warning)
   - ⚠️ Nécessite peut-être une amélioration de l'intégration caméra

2. **Bouton Nouveau Patient** (ligne 266-278)
   - ✅ Fonctionnel (redirige vers `/signup?role=patient`)

3. **Bouton Notifications** (ligne 281-292)
   - ⚠️ Partiellement implémenté (voir section 6 ci-dessus)

4. **Bouton URGENCE** (ligne 313-322)
   - ⚠️ Partiellement implémenté (voir section 5 ci-dessus)

5. **Bouton Thème** (ligne 295-309)
   - ✅ Fonctionnel

---

## 🔍 Résumé par priorité

### 🔴 Priorité HAUTE (affecte l'expérience utilisateur)
1. **Gestion des rendez-vous** - Message d'alerte visible
2. **Accès d'urgence** - Fonctionnalité critique partiellement implémentée

### 🟡 Priorité MOYENNE (amélioration de l'expérience)
3. **Notifications** - Système partiellement fonctionnel
4. **Graphiques du dashboard** - Contenu mock visible

### 🟢 Priorité BASSE (améliorations futures)
5. **Suivi de grossesse - Risques** - Contenu mock
6. **Suivi de grossesse - Courbe de croissance** - Contenu mock
7. **Page Consultations** - Données statiques (mock)
8. **Page Dossier Patient** - Données statiques (mock)

---

### 7. **Page Consultations** (Liste des consultations)
**Fichier** : `frontend/views/consultations.ejs` (lignes 12-17)

**Contenu actuel** :
- Tableau avec des données statiques hardcodées
- Exemples : "Jane Doe", "Anne Dupont" avec dates et statuts fixes

**Ce qui manque** :
- Récupération des consultations depuis l'API backend
- Affichage dynamique des consultations réelles
- Filtres et recherche
- Pagination si nécessaire

---

### 8. **Page Dossier Patient** (Détails du patient)
**Fichier** : `frontend/views/patient-record.ejs` (lignes 10-15)

**Contenu actuel** :
- Données statiques hardcodées ("Jane Doe", "1990-08-12", etc.)
- Informations médicales en dur

**Ce qui manque** :
- Récupération des données du patient depuis l'API
- Affichage dynamique basé sur l'ID patient dans l'URL
- Intégration avec les vraies données médicales du patient

---

## 📝 Notes importantes

- Les fonctionnalités marquées "mock" sont des placeholders visuels
- Les fonctionnalités avec `alert()` ou `TODO` nécessitent une implémentation complète
- Les fonctionnalités "partiellement implémentées" ont une base mais nécessitent une intégration backend complète

---

## 🛠️ Prochaines étapes recommandées

1. **Implémenter la gestion des rendez-vous** :
   - Créer le modèle `Appointment` dans Prisma (déjà présent dans le schéma)
   - Créer les endpoints backend pour CRUD des rendez-vous
   - Créer la modal de création/modification de rendez-vous
   - Afficher les rendez-vous du jour dans le dashboard agent

2. **Finaliser l'accès d'urgence** :
   - Implémenter la validation du code d'accès
   - Connecter avec le backend pour récupérer les informations vitales
   - Améliorer la journalisation

3. **Compléter le système de notifications** :
   - Vérifier/créer les endpoints backend
   - Implémenter les différents types de notifications
   - Tester le marquage comme lu/non lu

4. **Remplacer les contenus mock** :
   - Intégrer une bibliothèque de graphiques
   - Implémenter le calcul des risques de grossesse
   - Créer les graphiques de courbe de croissance

---

**Dernière mise à jour** : Décembre 2024

