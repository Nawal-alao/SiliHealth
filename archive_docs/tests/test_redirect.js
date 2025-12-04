// Test de redirection après inscription/connexion
const fetch = require('node-fetch');

async function testSignupAndLogin() {
  console.log('🧪 Test des redirections après inscription et connexion\n');

  // Test 1: Inscription patient
  console.log('1️⃣ Test inscription patient...');
  try {
    const signupResponse = await fetch('http://localhost:4000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test.patient.redirect@example.com',
        password: 'SecurePass123',
        role: 'patient',
        sexAtBirth: 'F',
        birthDate: '1995-05-15',
        consentForDataProcessing: true
      })
    });

    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Inscription réussie');

      // Test 2: Connexion
      console.log('\n2️⃣ Test connexion...');
      const loginResponse = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test.patient.redirect@example.com',
          password: 'SecurePass123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Connexion réussie');
        console.log('Token généré:', loginData.token ? 'Oui' : 'Non');
        console.log('Rôle utilisateur:', loginData.user.role);

        // Test 3: Accès au profil
        console.log('\n3️⃣ Test accès profil...');
        const profileResponse = await fetch('http://localhost:4000/api/patients/profile', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profil accessible');
          console.log('Nom:', profileData.patient.firstName, profileData.patient.lastName);
        } else {
          console.log('❌ Erreur accès profil:', profileResponse.status);
        }

        // Test 4: Simulation frontend - ce qui devrait se passer
        console.log('\n4️⃣ Simulation logique frontend...');
        console.log('Après connexion, redirection vers:', loginData.user.role === 'patient' ? '/dashboard-patient' : '/dashboard-agent');

        return loginData;

      } else {
        console.log('❌ Échec connexion');
      }
    } else {
      console.log('❌ Échec inscription:', signupResponse.status);
      const errorData = await signupResponse.text();
      console.log('Détails:', errorData);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSignupAndLogin();
