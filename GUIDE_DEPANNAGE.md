# 🔧 GUIDE DE DÉPANNAGE - HealID

## ❌ PROBLÈME : Les modifications ne sont pas visibles

Si vous ne voyez aucun changement après les modifications, suivez ces étapes :

---

## 🔍 ÉTAPE 1 : Vérifier que les serveurs tournent

```bash
# Vérifier le frontend (port 3000)
curl http://localhost:3000/

# Vérifier le backend (port 4000)
curl http://localhost:4000/api/patients
```

**Si les serveurs ne répondent pas :**

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🧹 ÉTAPE 2 : Vider le cache du navigateur

### Méthode 1 : Rechargement forcé
- **Chrome/Edge** : `Ctrl + Shift + R` (Linux/Windows) ou `Cmd + Shift + R` (Mac)
- **Firefox** : `Ctrl + F5` (Linux/Windows) ou `Cmd + Shift + R` (Mac)

### Méthode 2 : Vider le cache manuellement
1. Ouvrir les outils développeur (`F12`)
2. Clic droit sur le bouton de rechargement
3. Sélectionner "Vider le cache et effectuer un rechargement forcé"

### Méthode 3 : Mode navigation privée
Ouvrir le site en navigation privée pour tester sans cache :
- **Chrome/Edge** : `Ctrl + Shift + N`
- **Firefox** : `Ctrl + Shift + P`

---

## 🔄 ÉTAPE 3 : Redémarrer les serveurs

Si les modifications ne sont toujours pas visibles :

```bash
# Arrêter tous les processus Node
pkill -f "node.*server.js"
pkill -f "nodemon"
pkill -f "ts-node-dev"

# Attendre 2 secondes
sleep 2

# Redémarrer le backend
cd backend
npm run start:dev

# Dans un autre terminal, redémarrer le frontend
cd frontend
npm run dev
```

---

## 🧪 ÉTAPE 4 : Utiliser la page de diagnostic

Accédez à : **http://localhost:3000/force-reload.html**

Cette page va :
- ✅ Vérifier que les serveurs répondent
- ✅ Vérifier que les fichiers modifiés sont présents
- ✅ Tester le mode sombre
- ✅ Tester la page QR access
- ✅ Vider le cache automatiquement

---

## 📋 ÉTAPE 5 : Vérifier les modifications spécifiques

### Mode sombre :
1. Ouvrir la console du navigateur (`F12`)
2. Taper : `localStorage.getItem('healid_theme')`
3. Devrait retourner : `"light"` ou `"dark"`
4. Cliquer sur le bouton thème dans le header
5. Vérifier que la classe `dark` est ajoutée au `<body>`

### Page QR Access :
1. Aller sur : `http://localhost:3000/qr-access/test-patient-id`
2. Devrait afficher la page QR access (même si le patient n'existe pas)

### Redirections après login :
1. Se connecter avec un compte patient
2. Devrait rediriger vers `/dashboard-patient`
3. Se connecter avec un compte agent
4. Devrait rediriger vers `/dashboard-agent`

---

## 🐛 PROBLÈMES COURANTS

### Le mode sombre ne fonctionne pas :
```javascript
// Dans la console du navigateur, tester :
document.body.classList.add('dark');
// Si ça fonctionne, le problème est dans le JavaScript
```

### Les redirections ne fonctionnent pas :
```javascript
// Vérifier dans la console :
localStorage.getItem('healid_token');
localStorage.getItem('healid_user');
// Si vides, le login n'a pas fonctionné
```

### La page QR access ne charge pas :
```bash
# Vérifier que la route existe :
curl http://localhost:3000/qr-access/test-123
# Devrait retourner du HTML
```

---

## ✅ VÉRIFICATIONS FINALES

### Fichiers modifiés présents :
```bash
# Vérifier main.js
grep -c "applyTheme" frontend/js/main.js
# Devrait retourner un nombre > 0

# Vérifier qr-access.ejs
ls -la frontend/views/qr-access.ejs
# Le fichier doit exister

# Vérifier server.js
grep -c "qr-access" frontend/server.js
# Devrait retourner un nombre > 0
```

### Backend compilé :
```bash
cd backend
npm run build
# Ne doit pas afficher d'erreurs
```

---

## 🚀 SOLUTION RAPIDE

Si rien ne fonctionne, exécutez ce script :

```bash
#!/bin/bash
# Arrêter tout
pkill -f "node.*server.js"
pkill -f "nodemon"
pkill -f "ts-node-dev"
sleep 2

# Redémarrer backend
cd backend
npm run start:dev &
sleep 3

# Redémarrer frontend
cd ../frontend
npm run dev &
```

Puis :
1. Ouvrir le navigateur en **mode navigation privée**
2. Aller sur `http://localhost:3000`
3. Tester les fonctionnalités

---

## 📞 SI LE PROBLÈME PERSISTE

1. Vérifier les logs des serveurs dans les terminaux
2. Ouvrir la console du navigateur (`F12`) et vérifier les erreurs
3. Utiliser la page de diagnostic : `http://localhost:3000/force-reload.html`
4. Vérifier que les ports 3000 et 4000 ne sont pas utilisés par d'autres applications

---

## 🎯 TESTS À EFFECTUER

1. ✅ **Mode sombre** : Cliquer sur le bouton thème → Le site doit changer de couleur
2. ✅ **Login** : Se connecter → Redirection vers le bon dashboard
3. ✅ **QR Access** : Aller sur `/qr-access/test-id` → Page doit s'afficher
4. ✅ **Dashboard patient** : Se connecter en patient → QR code doit être visible

---

**Si après toutes ces étapes le problème persiste, les modifications sont peut-être dans le cache du serveur. Redémarrez complètement les serveurs.**

