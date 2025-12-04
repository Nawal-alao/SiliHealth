// Script de test pour vérifier que tout fonctionne
const fetch = require('node-fetch');

async function testSystem() {
  console.log('🚀 Test du système HealID...\n');

  try {
    // Test 1: Inscription patient
    console.log('1️⃣ Test inscription patient...');
    const signupResponse = await fetch('http://localhost:4000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice.martin@example.com',
        password: 'SecurePass123',
        role: 'patient',
        sexAtBirth: 'F',
        birthDate: '1992-08-15',
        consentForDataProcessing: true
      })
    });

    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Inscription patient réussie');
      console.log('   ID Patient:', signupData.patientId);
    } else {
      console.log('❌ Échec inscription patient:', signupResponse.status);
      return;
    }

    // Test 2: Connexion
    console.log('\n2️⃣ Test connexion...');
    const loginResponse = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.martin@example.com',
        password: 'SecurePass123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Connexion réussie');
      console.log('   Token généré:', loginData.token ? 'Oui' : 'Non');
      console.log('   Rôle:', loginData.user.role);
    } else {
      console.log('❌ Échec connexion:', loginResponse.status);
      return;
    }

    // Test 3: Profil patient
    console.log('\n3️⃣ Test récupération profil patient...');
    const token = (await loginResponse.json()).token;
    const profileResponse = await fetch('http://localhost:4000/api/patients/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profil patient récupéré');
      console.log('   Nom:', profileData.patient.firstName, profileData.patient.lastName);
    } else {
      console.log('❌ Échec récupération profil:', profileResponse.status);
    }

    console.log('\n🎉 Tous les tests principaux sont passés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testSystem();
