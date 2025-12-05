// Global config and storage keys (available to all functions)
let API_BASE = 'http://localhost:4000';
const TOKEN_KEY = 'healid_token';
const USER_KEY = 'healid_user';

// Initialize API_BASE from server config
async function initializeApiBase() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      API_BASE = config.apiBase;
      console.log('📡 API_BASE loaded:', API_BASE);
    }
  } catch (error) {
    console.warn('⚠️ Could not load API config, using default:', API_BASE, error);
  }
  // expose globals for inline handlers
  try { window.API_BASE = API_BASE; window.TOKEN_KEY = TOKEN_KEY; window.USER_KEY = USER_KEY; } catch (e) { }
}

// Call initialization first
initializeApiBase();

document.addEventListener('DOMContentLoaded', function(){
  console.log('🎯 DOM Content Loaded - Initialisation HealID');

  // Vérifier l'accès selon le rôle de l'utilisateur
  checkRoleBasedAccess();

  // Capture-level submit handler: prevent native POST fallback for forms
  // with `data-api` even if other script initialization fails.
  document.addEventListener('submit', function(ev){
    try{
      const form = ev.target;
      if(form && form.hasAttribute && form.hasAttribute('data-api')){
        // prevent default navigation fallback
        if(!ev.defaultPrevented) ev.preventDefault();
        // if the main submit handler is available, delegate to it
        if(typeof submitFormToApi === 'function'){
          const api = form.getAttribute('data-api');
          // run asynchronously but don't block
          setTimeout(()=> { submitFormToApi(form, api); }, 0);
        }
      }
    }catch(e){ console.error('submit capture error', e); }
  }, true);

  // sidebar toggle for small screens
  const toggle = document.querySelector('[data-toggle="sidebar"]');
  if(toggle){ toggle.addEventListener('click', ()=> document.querySelector('.sidebar').classList.toggle('open')); }

  console.log('✅ Initialisation terminée');

  // file preview
  window.previewFiles = function(input, previewEl){
    const container = document.querySelector(previewEl);
    container.innerHTML='';
    const files = input.files || [];
    Array.from(files).forEach(f=>{
      const url = URL.createObjectURL(f);
      if(f.type.startsWith('image/')){
        const img = document.createElement('img'); img.src = url; container.appendChild(img);
      } else {
        const box = document.createElement('div'); box.textContent = f.name; box.style.padding='8px'; box.style.borderRadius='8px'; box.style.background='#fff'; box.style.boxShadow='0 4px 10px rgba(0,0,0,0.04)'; container.appendChild(box);
      }
    });
  }

  // pregnancy calculator
  window.calculatePregnancy = function(form){
    const last = form.querySelector('[name="last_period"]').value;
    const out = form.querySelector('[data-result]');
    if(!last){ out.textContent='Entrez la date des dernières règles.'; return; }
    const d = new Date(last);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000*60*60*24));
    const weeks = Math.floor(diff / 7);
    const edd = new Date(d.getTime() + (280 * 24*60*60*1000));
    const trimester = weeks < 14 ? '1er trimestre' : (weeks < 28 ? '2ème trimestre' : '3ème trimestre');
    out.textContent = `${weeks} semaines — Est. accouchement : ${edd.toLocaleDateString()} (${trimester})`;
  }

  // minimal form validation (uses validation-utils if available)
  function clearFieldErrors(form){
    form.querySelectorAll('.field-error').forEach(el=>el.remove());
    form.querySelectorAll('[aria-invalid]').forEach(i=>{ i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
  }
  function showFieldError(fieldEl, message){
    if(!fieldEl) return;
    fieldEl.setAttribute('aria-invalid','true');
    const id = fieldEl.id || (fieldEl.name ? 'err-'+fieldEl.name : 'err-'+Math.random().toString(36).slice(2,8));
    const msgId = id+'-error';
    fieldEl.id = fieldEl.id || id;
    fieldEl.setAttribute('aria-describedby', msgId);
    const span = document.createElement('div'); span.className='field-error'; span.id = msgId; span.role='alert'; span.textContent = message; span.style.color = 'var(--danger)'; span.style.marginTop='6px'; span.style.fontSize='13px';
    if(fieldEl.nextSibling) fieldEl.parentNode.insertBefore(span, fieldEl.nextSibling); else fieldEl.parentNode.appendChild(span);
  }

  // PWA: handle beforeinstallprompt for native install banner
  window.deferredPWAInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    window.deferredPWAInstallPrompt = e;
    console.log('PWA beforeinstallprompt captured');
    // Keep the event for manual triggering by calling window.deferredPWAInstallPrompt.prompt()
  });

  // PWA: register service worker if available
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Service Worker registered:', reg.scope);
        }).catch(err => {
          console.warn('Service Worker registration failed:', err);
        });
    });
  }

  console.log('🔍 Initialisation des formulaires...');
  const forms = document.querySelectorAll('form[data-validate]');
  console.log(`📊 ${forms.length} formulaire(s) trouvé(s) avec data-validate`);

  if (forms.length === 0) {
    console.warn('⚠️ Aucun formulaire avec data-validate trouvé !');
  }

  forms.forEach((f, index)=>{
    const api = f.getAttribute('data-api');
    const action = f.getAttribute('action');
    console.log(`📝 Formulaire ${index + 1}:`, { api, action, method: f.method });

    // Vérifier que le formulaire a bien les attributs requis
    if (!api) {
      console.error(`❌ Formulaire ${index + 1} n'a pas d'attribut data-api !`);
    }

    f.addEventListener('submit', function(e){
      console.log('🚀 Soumission de formulaire interceptée:', api);
      console.log('📋 Formulaire:', f);
      console.log('📋 Données du formulaire:', Object.fromEntries(new FormData(f)));

      // Vérifier que preventDefault est appelé
      if (!e.defaultPrevented) {
        console.log('🛑 Appel de preventDefault()');
        e.preventDefault();
      }
      clearFieldErrors(f);
      // use ValidationUtils if available (browser UMD), otherwise fallback
      const V = (typeof ValidationUtils !== 'undefined') ? ValidationUtils : (typeof require === 'function' ? require('./validation-utils') : null);
      let errs = [];
      if(V && V.requiredFields) errs = errs.concat(V.requiredFields(f));
      else {
        // fallback: simple required check
        Array.from(f.querySelectorAll('[required]')).forEach(inp=>{ if(!inp.value || String(inp.value).trim()==='') errs.push({ name: inp.name||inp.id, message: 'Ce champ est requis', element: inp }); });
      }
      // password match
      if(f.getAttribute('data-api') && f.getAttribute('data-api').includes('signup')){
        const pwErr = (V && V.passwordMatch) ? V.passwordMatch(f) : ( (f.querySelector('[name="password"]') && f.querySelector('[name="confirm_password"]') && (f.querySelector('[name="password"]').value !== f.querySelector('[name="confirm_password"]').value) ) ? { name:'confirm_password', message:'Les mots de passe ne correspondent pas', element: f.querySelector('[name="confirm_password"]') } : null );
        if(pwErr) errs.push(pwErr);
      }
      if(errs.length){ e.preventDefault(); errs.forEach(ei=>{ showFieldError(ei.element, ei.message); }); const fFirst = errs[0].element; if(fFirst && typeof fFirst.focus === 'function') fFirst.focus(); return; }
      // if form has data-api attribute, submit via fetch
      const api = f.getAttribute('data-api');
      if(api){
        e.preventDefault();
        submitFormToApi(f, api);
      }
    });
  });

  // generic form submit via fetch for forms with data-api

// --- Role-based access control ---
function checkRoleBasedAccess() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userData = localStorage.getItem(USER_KEY);

  if (!token || !userData) {
    // Pas connecté, rediriger vers login sauf si on est déjà sur login/signup/index
    const currentPath = window.location.pathname;
    if (!['/login', '/signup', '/', '/debug_form.html', '/integration_test.html'].includes(currentPath)) {
      window.location.href = '/login';
    }
    return;
  }

  try {
    const user = JSON.parse(userData);
    const currentPath = window.location.pathname;

    // Pages accessibles à tous les utilisateurs connectés
    const publicPages = ['/profile', '/profil-patient', '/profil-agent', '/system-settings'];

    // Pages réservées aux patients
    const patientOnlyPages = ['/dashboard-patient'];

    // Pages réservées aux agents de santé
    const agentOnlyPages = ['/dashboard-agent', '/consultations', '/consultation-new', '/consultation-detail', '/patient-record'];

    // NE PAS rediriger automatiquement après connexion/inscription
    // Laisser la logique explicite de redirection faire son travail

    // Vérifier l'accès selon le rôle - seulement si on essaie d'accéder à une page interdite
    if (user.role === 'patient') {
      // Les patients ne peuvent pas accéder aux pages agents
      if (agentOnlyPages.some(page => currentPath.startsWith(page))) {
        showToast('Accès non autorisé pour les patients.', 'error');
        setTimeout(() => window.location.href = '/dashboard-patient', 2000);
        return;
      }
    } else if (user.role === 'agent_de_sante') {
      // Les agents ne peuvent pas accéder aux pages patients
      if (patientOnlyPages.some(page => currentPath.startsWith(page))) {
        showToast('Accès non autorisé pour les agents de santé.', 'error');
        setTimeout(() => window.location.href = '/dashboard-agent', 2000);
        return;
      }
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des droits d\'accès:', error);
    // En cas d'erreur, déconnecter l'utilisateur
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  }
}

// --- Small toast notifications (non-blocking) ---
function showToast(message, type = 'info'){
    try{
      let container = document.getElementById('sili-toast-container');
      if(!container){ container = document.createElement('div'); container.id = 'sili-toast-container'; container.style.position='fixed'; container.style.right='18px'; container.style.top='18px'; container.style.zIndex=9999; document.body.appendChild(container); }
      const el = document.createElement('div');
      el.className = 'sili-toast ' + type;
      el.style.background = type === 'error' ? '#fef2f2' : (type === 'success' ? '#f0fdf4' : '#ffffff');
      el.style.border = type === 'error' ? '1px solid #fecaca' : (type === 'success' ? '1px solid #bbf7d0' : '1px solid rgba(0,0,0,0.06)');
      el.style.padding = '10px 14px'; el.style.marginTop='8px'; el.style.borderRadius='10px'; el.style.boxShadow='var(--shadow)'; el.style.color='var(--text)'; el.textContent = message;
      container.appendChild(el);
      setTimeout(()=>{ el.style.opacity = '0'; setTimeout(()=> el.remove(), 300); }, 3200);
    }catch(e){ console.log('toast error', e); }
  }
  // expose showToast globally so handlers outside this scope can call it
  try{ window.showToast = showToast; }catch(e){}

  // --- Theme handling ---
  function applyTheme(theme){
    // support 'system' to follow OS preference
    const useDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(useDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // persist choice
    try{ localStorage.setItem('healid_theme', theme); }catch(e){ /* ignore storage errors */ }

    // expose theme on root for easier CSS selectors and debugging
    try{ document.documentElement.setAttribute('data-theme', useDark ? 'dark' : 'light'); }catch(e){}
    
    // update header toggle icons
    const headerToggle = document.getElementById('theme-toggle');
    if(headerToggle) {
      const lightIcon = headerToggle.querySelector('.theme-icon--light');
      const darkIcon = headerToggle.querySelector('.theme-icon--dark');
      
      if(useDark) {
        if(lightIcon) lightIcon.style.display = 'none';
        if(darkIcon) darkIcon.style.display = 'block';
        headerToggle.setAttribute('aria-pressed', 'true');
        headerToggle.setAttribute('title', 'Basculer vers le thème clair');
      } else {
        if(lightIcon) lightIcon.style.display = 'block';
        if(darkIcon) darkIcon.style.display = 'none';
        headerToggle.setAttribute('aria-pressed', 'false');
        headerToggle.setAttribute('title', 'Basculer vers le thème sombre');
      }
    }
    
    // update settings select if present
    const settingsSelect = document.getElementById('theme-select');
    if(settingsSelect && settingsSelect.value !== theme) {
      settingsSelect.value = theme;
    }
  }
  
  // init theme
  const savedTheme = localStorage.getItem('healid_theme') || 'light';
  applyTheme(savedTheme);
  
  // header button or settings select can both control theme
  const headerThemeControl = document.getElementById('theme-toggle');
  const settingsThemeControl = document.getElementById('theme-select');
  
  if(settingsThemeControl) {
    settingsThemeControl.value = savedTheme;
    settingsThemeControl.addEventListener('change', ()=> {
      applyTheme(settingsThemeControl.value);
    });
  }
  
  if(headerThemeControl) {
    if(headerThemeControl.tagName.toLowerCase() === 'select'){
      headerThemeControl.value = savedTheme;
      headerThemeControl.addEventListener('change', ()=> applyTheme(headerThemeControl.value));
    } else {
      headerThemeControl.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        // toggle between light and dark only (click toggles)
        const current = localStorage.getItem('healid_theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
  }
  
  // sync theme if system preference changes and user chose 'system'
  if(window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const currentTheme = localStorage.getItem('healid_theme');
      if(currentTheme === 'system') {
        applyTheme('system');
      }
    };
    // Support both addEventListener and addListener for older browsers
    if(mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if(mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }

  // --- Auth UI ---
  function renderAuthUI(){
    const actions = document.getElementById('auth-actions');
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    if(!actions) return;
    if(token && userData){
      try {
        const user = JSON.parse(userData);
        actions.innerHTML = '';
        const access = document.createElement('a');
        access.className = 'btn';

        // Rediriger vers le bon dashboard selon le rôle
        if (user.role === 'patient') {
          access.href = '/dashboard-patient';
          access.textContent = 'Mon Espace Patient';
        } else if (user.role === 'agent_de_sante') {
          access.href = '/dashboard-agent';
          access.textContent = 'Dashboard Agent';
        } else {
          access.href = '/dashboard';
          access.textContent = 'Accéder à la plateforme';
        }

        const logout = document.createElement('button');
        logout.className='btn btn--secondary';
        logout.textContent='Se déconnecter';
        logout.addEventListener('click', ()=>{ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); renderAuthUI(); window.location.href='/'; });
        actions.appendChild(access);
        actions.appendChild(logout);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        // Fallback en cas d'erreur
        actions.innerHTML = '<a class="btn" style="background: #059669; border-color: #059669;" href="/signup">S\'inscrire</a><a class="btn" href="/login">Se connecter</a>';
      }
    } else {
      actions.innerHTML = '<a class="btn" style="background: #059669; border-color: #059669;" href="/signup">S\'inscrire</a><a class="btn" href="/login">Se connecter</a>';
    }
  }
  renderAuthUI();
  // expose renderAuthUI so external handlers can refresh UI after logout
  try{ window.renderAuthUI = renderAuthUI; }catch(e){}

  // --- Modal scanner in dashboard ---
  const modal = document.getElementById('scanner-modal');
  const modalStart = document.getElementById('modal-start');
  const modalStop = document.getElementById('modal-stop');
  const modalVideo = document.getElementById('modal-qr-video');
  const modalStatus = document.getElementById('modal-qr-status');
  const modalInfo = document.getElementById('modal-patient-info');
  let modalStream = null;
  let modalScanning = false;

  async function modalStartScan(){
    if(!modal || !modalStart) return;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden','false');
    try{
      modalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio:false });
      modalVideo.srcObject = modalStream; modalVideo.style.display='block'; modalVideo.play();
      modalStart.style.display='none'; modalStop.style.display='inline-block';
      modalScanning = true; modalScanLoop(); modalStatus.textContent='Scanner actif...';
    }catch(e){ modalStatus.textContent = 'Erreur caméra: '+(e.message||e); }
  }
  function modalStopScan(){
    modalScanning = false; if(modalStream) modalStream.getTracks().forEach(t=>t.stop()); modalVideo.style.display='none'; modalStart.style.display='inline-block'; modalStop.style.display='none'; modalStatus.textContent='Scanner arrêté';
    if(modal) modal.setAttribute('aria-hidden','true');
  }
  async function modalScanLoop(){
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    async function loop(){
      if(!modalScanning) return;
      if(modalVideo.readyState === modalVideo.HAVE_ENOUGH_DATA){ canvas.width = modalVideo.videoWidth; canvas.height = modalVideo.videoHeight; ctx.drawImage(modalVideo,0,0,canvas.width,canvas.height); const imageData = ctx.getImageData(0,0,canvas.width,canvas.height); const code = window.jsQR ? jsQR(imageData.data, imageData.width, imageData.height) : null; if(code){ await handleModalQRCode(code.data); modalStopScan(); return; } }
      requestAnimationFrame(loop);
    }
    loop();
  }
  async function handleModalQRCode(qrData){
    modalStatus.textContent='Vérification...';
    try{
      let json = null;

      // If QR payload is a full URL, try to extract token or patientId
      if(qrData.startsWith('http://') || qrData.startsWith('https://')){
        try{
          const parsed = new URL(qrData);
          // /qr-access/{patientId}
          const m = parsed.pathname.match(/\/qr-access\/([a-f0-9-]+)/i);
          if(m){
            const patientId = m[1];
            const res = await fetch(`${API_BASE}/api/qr/access/${patientId}`);
            json = await res.json();
          } else {
            // try token based routes (/api/qr/scan/:token or /patient/scan/:token)
            const parts = parsed.pathname.split('/').filter(Boolean);
            const token = parts.pop();
            if(token){
              const res = await fetch(`${API_BASE}/api/qr/scan/${token}`);
              json = await res.json();
            }
          }
        }catch(e){ /* ignore URL parse errors */ }
      } else if(/^[a-f0-9]{64}$/i.test(qrData)){
        // secureToken (hex 64)
        const res = await fetch(`${API_BASE}/api/qr/scan/${qrData}`);
        json = await res.json();
      } else if(qrData.startsWith('HEALID_')){
        // legacy format: HEALID_{patientId}
        const patientId = qrData.replace('HEALID_','');
        // supports numeric or uuid-like ids
        const res = await fetch(`${API_BASE}/api/qr-verify`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ patientId, timestamp:new Date().toISOString(), userAgent:navigator.userAgent }) });
        json = await res.json();
      } else {
        modalStatus.textContent='QR non reconnu';
        return;
      }

      if(!json || !json.ok){ modalStatus.textContent = 'Patient non trouvé'; return; }
      const patient = json.patient || json;
      modalInfo.style.display='block';
      modalInfo.innerHTML = `<strong>${patient.fullname || patient.fullname}</strong><div>ID: ${patient.patientId || patient.id || '-'} </div><div>Email: ${patient.email||'-'}</div>`;
      modalStatus.textContent='Patient trouvé';
    }catch(e){ modalStatus.textContent='Erreur: '+(e.message||e); }
  }
  if(modalStart) modalStart.addEventListener('click', modalStartScan);
  if(modalStop) modalStop.addEventListener('click', modalStopScan);
  async function submitFormToApi(form, api){
    console.log('📡 Envoi de formulaire vers API:', api);
    console.log('📋 Form element:', form);

    // Vérifier que l'API est accessible
    if (!api) {
      console.error('❌ Pas d\'API spécifiée pour le formulaire');
      showToast('Erreur: API non spécifiée', 'error');
      return;
    }

    // Vérifier que le formulaire existe
    if (!form) {
      console.error('❌ Formulaire non fourni');
      showToast('Erreur: Formulaire non trouvé', 'error');
      return;
    }

    try{
      const method = form.method || 'POST';
      const isMultipart = form.enctype === 'multipart/form-data' || form.querySelector('input[type=file]');
      let body;
      let headers = {};
      // attach token if present
      const token = localStorage.getItem(TOKEN_KEY);
      if(token) headers['Authorization'] = `Bearer ${token}`;
      if(isMultipart){
        body = new FormData(form);
      } else {
        const data = {};
        new FormData(form).forEach((v,k)=>{
          // Convertir les checkboxes en boolean
          if (k === 'consentForDataProcessing' || k === 'shareWithResearch') {
            data[k] = v === 'true';
          } else {
            data[k] = v;
          }
        });
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }
      const url = api.startsWith('http') ? api : `${API_BASE}${api}`;
      console.log('📡 Envoi requête vers:', url);
      const res = await fetch(url, { method, body, headers });
      console.log('📡 Réponse HTTP:', res.status, res.statusText);

      const json = await res.json();
      // If backend returned validation messages in format { statusCode:400, message: [...] }
      if(json && json.statusCode === 400 && Array.isArray(json.message) && json.message.length){
        // show friendly modal with all messages and stop further processing
        showValidationErrorsPopup(json.message);
        return json;
      }
      console.log('📡 Réponse JSON:', json);

      if(!json || !json.ok){
        console.error('❌ Erreur API:', json);
        // if backend returned structured field errors, display them inline
        if(json && json.errors && Array.isArray(json.errors) && form){
          clearFieldErrors(form);
          json.errors.forEach(err=>{
            const field = form.querySelector(`[name="${err.field}"]`);
            showFieldError(field || form, err.message || (err.error||'Erreur champ'));
          });
          // focus first error
          const firstErr = form.querySelector('[aria-invalid="true"]'); if(firstErr) firstErr.focus();
          return json;
        }
        throw new Error(json && json.error ? json.error : 'API error');
      }
      console.log('✅ Réponse API valide:', json);
      // friendly success toast
      showToast('Opération réussie', 'success');
      // simple behaviors after success
      if(api.includes('signup')) {
        console.log('📝 Traitement réponse inscription');
        showToast('Inscription réussie ! Connexion en cours...', 'success');

        // Récupérer les données du formulaire pour la connexion automatique
        const formData = {};
        new FormData(form).forEach((v,k) => { formData[k] = v; });
        console.log('📊 Données formulaire récupérées');

        setTimeout(async () => {
          console.log('🔄 Début connexion automatique');
          try {
            // Connexion automatique après inscription
            const loginResponse = await fetch(`${API_BASE}/api/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: formData.email,
                password: formData.password
              })
            });
            console.log('📡 Réponse connexion automatique:', loginResponse.status);

            const loginData = await loginResponse.json();

            if (loginData.ok && loginData.token) {
              console.log('✅ Connexion automatique réussie');
              // Stocker le token et les infos utilisateur
              localStorage.setItem(TOKEN_KEY, loginData.token);
              localStorage.setItem(USER_KEY, JSON.stringify(loginData.user));

              // Mettre à jour l'UI
              renderAuthUI();

              // Rediriger vers le bon dashboard selon le rôle
              showToast('Bienvenue sur HealID !', 'success');
              const userRole = loginData.user.role;
              console.log('🔄 Redirection après inscription vers:', userRole === 'patient' ? '/dashboard-patient' : '/dashboard-agent');
              setTimeout(() => {
                console.log('⚡ Exécution redirection inscription');
                if (userRole === 'patient') {
                  window.location.href = '/dashboard-patient';
                } else if (userRole === 'agent_de_sante') {
                  window.location.href = '/dashboard-agent';
                } else {
                  window.location.href = '/dashboard'; // fallback
                }
              }, 1000);
            } else {
              console.log('❌ Échec connexion automatique:', loginData);
              // Si la connexion automatique échoue, rediriger vers login
              showToast('Inscription réussie. Veuillez vous connecter manuellement.', 'info');
              setTimeout(() => window.location.href = '/login', 2000);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la connexion automatique:', error);
            showToast('Inscription réussie. Erreur de connexion automatique. Veuillez vous connecter manuellement.', 'warning');
            setTimeout(() => window.location.href = '/login', 2000);
          }
        }, 1000);
      }
      if(api.includes('login')){
        console.log('🔐 Traitement réponse connexion');
        console.log('📋 Données reçues:', json);

        // Vérifier que la réponse contient les données nécessaires
        if (!json.token || !json.user) {
          console.error('❌ Réponse connexion incomplète:', json);
          showToast('Erreur: Réponse serveur incomplète', 'error');
          return;
        }

        // if the API returned a token, persist it
        localStorage.setItem(TOKEN_KEY, json.token);
        console.log('💾 Token stocké:', json.token.substring(0, 20) + '...');

        localStorage.setItem(USER_KEY, JSON.stringify(json.user));
        console.log('👤 Données utilisateur stockées:', json.user.email, json.user.role);

        renderAuthUI();
        console.log('🎨 UI mise à jour');

        // Rediriger vers le bon dashboard selon le rôle
        const userRole = json.user.role;
        const redirectUrl = userRole === 'patient' ? '/dashboard-patient' : '/dashboard-agent';
        console.log('🔄 Préparation redirection vers:', redirectUrl);

        showToast('Connexion réussie !', 'success');
        console.log('🍞 Toast affiché');

        setTimeout(() => {
          console.log('⚡ Exécution redirection connexion vers:', redirectUrl);
          try {
            window.location.href = redirectUrl;
            console.log('✅ Redirection exécutée');
          } catch (error) {
            console.error('❌ Erreur lors de la redirection:', error);
          }
        }, 500);
      }
      if(api.includes('consultations')) window.location.href = '/consultations';
    }catch(err){
      console.error(err);
      // show helpful message if backend is unreachable
      const msg = (err && (err.message || '')).toString();
      if(msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')){
        showToast('Impossible de contacter le serveur backend (http://localhost:4000). Vérifiez que le backend est démarré.', 'error');
      } else {
        showToast('Erreur: '+(err.message||err), 'error');
      }
      return { ok:false, error: err.message };
    }
  }

  // Expose as global so early inline handlers can delegate to this canonical function
  try{ window.submitFormToApi = submitFormToApi; }catch(e){}

  // --- system settings form handling ---
  const settingsForm = document.getElementById('system-settings-form');
  if(settingsForm){
    const saveBtn = document.getElementById('save-settings');
    const status = document.getElementById('settings-save-status');
    const notifSelect = document.getElementById('notif-select');
    const langSelect = document.getElementById('lang-select');

    // init values from localStorage
    const savedNotif = localStorage.getItem('healid_notif') || 'on';
    const savedLang = localStorage.getItem('healid_lang') || 'fr';
    if(notifSelect) notifSelect.value = savedNotif;
    if(langSelect) langSelect.value = savedLang;

    // save handler
    saveBtn && saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const themeVal = (document.getElementById('theme-select') || {value:savedTheme}).value;
      const notifVal = notifSelect ? notifSelect.value : savedNotif;
      const langVal = langSelect ? langSelect.value : savedLang;

      // store locally and update UI quickly
      localStorage.setItem('healid_theme', themeVal);
      localStorage.setItem('healid_notif', notifVal);
      localStorage.setItem('healid_lang', langVal);
      applyTheme(themeVal);

      // show saved indicator
      if(status){ status.style.display = 'inline'; status.textContent = 'Enregistré'; setTimeout(()=> { status.style.display='none'; }, 1800); }

      // optionally POST to backend if endpoint exists and user is logged in
      try{
        const token = localStorage.getItem(TOKEN_KEY);
        if(token){
          const res = await fetch(`${API_BASE}/api/settings`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ theme: themeVal, notifications: notifVal, lang: langVal }) });
          // not critical if it fails; backend may or may not expose this route
          if(res.ok){
            // silent success
          }
        }
      }catch(e){ /* ignore network errors for now */ }
    });

  }

  // forms with `data-api` are handled above by the generic `submitFormToApi` flow

  // ===========================================
  // HEADER ENHANCED - GESTION RÔLES ET FONCTIONNALITÉS
  // ===========================================

  // Initialiser le header selon le rôle utilisateur
  initializeHeaderByRole();

  // Initialiser les fonctionnalités spécifiques au rôle
  initializeRoleSpecificFeatures();

  // Charger le compteur de notifications et actualiser périodiquement
  try{ loadNotificationCount(); setInterval(loadNotificationCount, 30000); }catch(e){ /* ignore */ }

  // Fonctions QR Code
  initializeQRFeatures();

  // Fonctions Consultations
  initializeConsultationFeatures();

  // Fonctions Urgence
  initializeEmergencyFeatures();

});

// ===========================================
// HEADER ENHANCED - FONCTIONS PRINCIPALES
// ===========================================

function initializeHeaderByRole() {
  console.log('🎯 Initialisation header selon rôle utilisateur');

  const user = getCurrentUser();
  const isLoggedIn = !!user;

  // Éléments du DOM
  const authActions = document.getElementById('auth-actions');
  const userProfile = document.getElementById('user-profile');
  const agentNav = document.getElementById('agent-nav');
  const patientNav = document.getElementById('patient-nav');
  const globalSearch = document.getElementById('global-search');
  const scanQRBtn = document.getElementById('scan-qr-btn');
  const newPatientBtn = document.getElementById('new-patient-btn');
  const emergencyBtn = document.getElementById('emergency-btn');
  const headerLogo = document.querySelector('.header__logo');

  if (isLoggedIn && user.role) {
    // Utilisateur connecté
    console.log('👤 Header pour utilisateur connecté:', user.role);

    // Masquer actions non connecté
    if (authActions) authActions.style.display = 'none';

    // Afficher profil utilisateur
    if (userProfile) {
      userProfile.style.display = 'block';
      updateUserProfile(user);
    }

    // Configurer selon le rôle
    if (user.role === 'agent_de_sante') {
      // Navigation agent
      if (agentNav) agentNav.style.display = 'block';
      if (patientNav) patientNav.style.display = 'none';

      // Fonctionnalités agent
      if (globalSearch) globalSearch.style.display = 'block';
      if (scanQRBtn) scanQRBtn.style.display = 'inline-flex';
      if (newPatientBtn) newPatientBtn.style.display = 'inline-flex';
      if (emergencyBtn) emergencyBtn.style.display = 'inline-flex';

      // Logo vers dashboard agent
      if (headerLogo) {
        headerLogo.href = '/dashboard-agent';
      }

    } else if (user.role === 'patient') {
      // Navigation patient
      if (patientNav) patientNav.style.display = 'block';
      if (agentNav) agentNav.style.display = 'none';

      // Fonctionnalités patient (limitée)
      if (emergencyBtn) emergencyBtn.style.display = 'inline-flex';

      // Logo vers dashboard patient
      if (headerLogo) {
        headerLogo.href = '/dashboard-patient';
      }
    }

    // Initialiser les événements du header
    initializeHeaderEvents();

  } else {
    // Utilisateur non connecté
    console.log('👤 Header pour utilisateur non connecté');

    if (authActions) authActions.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
    if (agentNav) agentNav.style.display = 'none';
    if (patientNav) patientNav.style.display = 'none';
    if (globalSearch) globalSearch.style.display = 'none';
    if (scanQRBtn) scanQRBtn.style.display = 'none';
    if (newPatientBtn) newPatientBtn.style.display = 'none';
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    // Logo vers page d'accueil
    if (headerLogo) {
      headerLogo.href = '/';
    }
  }
}

// --- Validation Errors Modal (accessible) ---
function showValidationErrorsPopup(messages){
  try{
    if(!Array.isArray(messages)) messages = [String(messages)];
    // prevent duplicate modal
    if(document.getElementById('sili-validation-modal')) return;
    const overlay = document.createElement('div'); overlay.id = 'sili-validation-overlay'; overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.45)'; overlay.style.zIndex=10000; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
    const modal = document.createElement('div'); modal.id = 'sili-validation-modal'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.style.background='#fff'; modal.style.padding='18px'; modal.style.maxWidth='520px'; modal.style.width='90%'; modal.style.borderRadius='10px'; modal.style.boxShadow='0 10px 40px rgba(2,6,23,0.25)'; modal.style.color='var(--text)';
    const title = document.createElement('h3'); title.textContent = 'Validation du mot de passe'; title.style.marginTop='0'; title.style.marginBottom='8px';
    const desc = document.createElement('p'); desc.textContent = 'Le mot de passe doit respecter les règles suivantes :'; desc.style.marginTop='0'; desc.style.marginBottom='8px'; desc.style.color='rgba(0,0,0,0.7)';
    const ul = document.createElement('ul'); ul.style.marginTop='6px'; ul.style.paddingLeft='18px'; messages.forEach(m=>{ const li = document.createElement('li'); li.textContent = m; ul.appendChild(li); });
    const btn = document.createElement('button'); btn.textContent = 'Fermer'; btn.className='btn btn--primary'; btn.style.marginTop='12px'; btn.addEventListener('click', ()=>{ overlay.remove(); });
    modal.appendChild(title); modal.appendChild(desc); modal.appendChild(ul); modal.appendChild(btn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    // focus the close button for accessibility
    btn.focus();
  }catch(e){ console.error('showValidationErrorsPopup error', e); alert('Erreurs: '+(Array.isArray(messages)?messages.join('\n') : messages)); }
}

function updateUserProfile(user) {
  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const myProfileLink = document.getElementById('my-profile-link');

  if (userNameEl) {
    // Afficher seulement le prénom pour confidentialité
    const firstName = user.email ? user.email.split('@')[0] : 'Utilisateur';
    userNameEl.textContent = firstName;
    userNameEl.className = 'profile-btn__name';
  }

  if (userRoleEl) {
    const roleText = user.role === 'patient' ? 'Patient' : 'Agent';
    const roleClass = user.role === 'patient' ? 'patient' : 'agent_de_sante';
    userRoleEl.textContent = roleText;
    userRoleEl.className = `profile-btn__role ${roleClass}`;
  }

  if (myProfileLink) {
    // Lien vers le bon profil selon le rôle
    const profileUrl = user.role === 'patient' ? '/profil-patient' : '/profil-agent';
    myProfileLink.href = profileUrl;
  }

  // Avatar handling: prefer uploaded avatar, else default by sex (patient) or neutral
  try{
    const avatarImg = document.getElementById('user-avatar');
    const avatarFallback = document.getElementById('user-avatar-fallback');
    if(avatarImg){
      let src = '';
      const apiBase = (window.API_BASE || 'http://localhost:4000');
      if(user.avatarUrl) src = (String(user.avatarUrl).startsWith('http') ? user.avatarUrl : `${apiBase}${user.avatarUrl}`);
      else if(user.patient && user.patient.sexAtBirth){
        const s = String(user.patient.sexAtBirth).toLowerCase();
        if(s.startsWith('f') || s === 'female' || s === 'femme') src = '/icons/default-female.svg';
        else src = '/icons/default-male.svg';
      } else {
        // default neutral for agents or unknown
        src = '/icons/default-male.svg';
      }
      if(src){ avatarImg.src = src; avatarImg.style.display = 'inline-block'; if(avatarFallback) avatarFallback.style.display = 'none'; }
    }
  }catch(e){ console.warn('avatar update failed', e); }
}

function initializeHeaderEvents() {
  console.log('🎯 Initialisation événements header');

  // Bouton profil
  const profileBtn = document.getElementById('profile-btn');
  const profileMenu = document.getElementById('profile-menu');

  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true';
      profileBtn.setAttribute('aria-expanded', !isExpanded);
      profileMenu.style.display = isExpanded ? 'none' : 'block';
    });

    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileBtn.setAttribute('aria-expanded', 'false');
        profileMenu.style.display = 'none';
      }
    });
  }

  // Bouton déconnexion
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Bouton nouveau patient (agents)
  const newPatientBtn = document.getElementById('new-patient-btn');
  if (newPatientBtn) {
    newPatientBtn.addEventListener('click', () => {
      window.location.href = '/signup?role=patient';
    });
  }

  // Bouton notifications
  const notificationsBtn = document.getElementById('notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', handleNotifications);
  }

  // Bouton urgence
  const emergencyBtn = document.getElementById('emergency-btn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', showEmergencyModal);
  }

  // Bouton scanner QR
  const scanQRBtn = document.getElementById('scan-qr-btn');
  if (scanQRBtn) {
    scanQRBtn.addEventListener('click', showQRWarningModal);
  }

  // Modales urgence
  const emergencyModal = document.getElementById('emergency-modal');
  const emergencyCancel = document.getElementById('emergency-cancel');
  const emergencyConfirm = document.getElementById('emergency-confirm');

  if (emergencyCancel && emergencyModal) {
    emergencyCancel.addEventListener('click', () => {
      emergencyModal.style.display = 'none';
    });
  }

  if (emergencyConfirm && emergencyModal) {
    emergencyConfirm.addEventListener('click', handleEmergencyAccess);
  }

  // Modal QR
  const qrModal = document.getElementById('qr-warning-modal');
  const qrCancel = document.getElementById('qr-cancel');
  const qrConfirm = document.getElementById('qr-confirm');

  if (qrCancel && qrModal) {
    qrCancel.addEventListener('click', () => {
      qrModal.style.display = 'none';
    });
  }

  if (qrConfirm && qrModal) {
    qrConfirm.addEventListener('click', () => {
      qrModal.style.display = 'none';
      window.location.href = '/scan-qr';
    });
  }

  // Recherche globale (agents)
  const patientSearch = document.getElementById('patient-search');
  const searchBtn = document.getElementById('search-btn');

  if (patientSearch) {
    let searchTimeout;

    patientSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performPatientSearch(e.target.value);
      }, 300);
    });

    patientSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performPatientSearch(patientSearch.value);
      }
      if (e.key === 'Escape') {
        hideSearchResults();
        patientSearch.blur();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (patientSearch) {
        performPatientSearch(patientSearch.value);
      }
    });
  }

  // Charger le nombre de notifications
  loadNotificationCount();
}

async function performPatientSearch(query) {
  if (!query || query.length < 2) {
    hideSearchResults();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/patients?search=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });

    const result = await response.json();

    if (result.ok) {
      showSearchResults(result.patients || []);
    } else {
      hideSearchResults();
    }
  } catch (error) {
    console.error('Erreur recherche patients:', error);
    hideSearchResults();
  }
}

function showSearchResults(patients) {
  const resultsContainer = document.getElementById('search-results');

  if (!resultsContainer) return;

  if (!patients || patients.length === 0) {
    resultsContainer.innerHTML = '<div class="search-result-item" style="padding: 16px; text-align: center; color: var(--muted);">Aucun patient trouvé</div>';
    resultsContainer.style.display = 'block';
    return;
  }

  const html = patients.slice(0, 5).map(patient => `
    <div class="search-result-item" onclick="navigateToPatient('${patient.patientId}')" role="option" tabindex="0" onkeydown="if(event.key==='Enter') navigateToPatient('${patient.patientId}')">
      <strong>${patient.firstName} ${patient.lastName}</strong>
      <small>ID: ${patient.patientId}</small>
    </div>
  `).join('');

  resultsContainer.innerHTML = html;
  resultsContainer.style.display = 'block';
}

function hideSearchResults() {
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }
}

function navigateToPatient(patientId) {
  hideSearchResults();
  window.location.href = `/patient-record?patientId=${patientId}`;
}

async function loadNotificationCount() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    // Récupérer depuis l'API backend
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token) return;
    const res = await fetch(`${API_BASE}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(!res.ok) return;
    const json = await res.json();
    const badge = document.getElementById('notification-badge');
    if (badge) {
      const count = (json && json.unreadCount) ? json.unreadCount : 0;
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Erreur chargement notifications:', error);
  }
}

let _notificationsCache = [];
let _notificationsPanelOpen = false;

async function fetchNotifications(){
  const token = localStorage.getItem(TOKEN_KEY);
  if(!token) return { ok:false, notifications: [] };
  try{
    const res = await fetch(`${API_BASE}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(!res.ok) return { ok:false, notifications: [] };
    const json = await res.json();
    _notificationsCache = json.notifications || [];
    return json;
  }catch(e){ console.error('fetchNotifications error', e); return { ok:false, notifications: [] }; }
}

function formatTimeAgo(ts){
  try{
    const d = new Date(ts);
    const diff = Math.floor((Date.now() - d.getTime())/1000);
    if(diff < 60) return `${diff}s`; if(diff < 3600) return `${Math.floor(diff/60)}m`; if(diff < 86400) return `${Math.floor(diff/3600)}h`; return d.toLocaleString();
  }catch(e){ return ts; }
}

function closeNotificationsPanel(){
  const panel = document.getElementById('notifications-panel'); if(panel) panel.style.display='none'; _notificationsPanelOpen=false;
}

async function markNotificationViewed(id){
  const token = localStorage.getItem(TOKEN_KEY); if(!token) return;
  try{
    const res = await fetch(`${API_BASE}/api/notifications/${id}/view`, { method:'PATCH', headers:{ 'Authorization': `Bearer ${token}` } });
    if(!res.ok) return;
    const json = await res.json();
    // update cache
    _notificationsCache = _notificationsCache.map(n => n.id === id ? json.notification : n);
    renderNotificationsPanel();
    // update badge
    const unread = _notificationsCache.filter(n=>!n.isRead).length;
    const badge = document.getElementById('notification-badge'); if(badge){ if(unread>0){ badge.textContent = unread>99?'99+':String(unread); badge.style.display='flex'; } else badge.style.display='none'; }
  }catch(e){ console.error('markNotificationViewed error', e); }
}

function renderNotificationsPanel(){
  let panel = document.getElementById('notifications-panel');
  if(!panel){
    panel = document.createElement('div'); panel.id='notifications-panel'; panel.style.position='absolute'; panel.style.right='12px'; panel.style.top='48px'; panel.style.width='340px'; panel.style.maxHeight='420px'; panel.style.overflow='auto'; panel.style.background='var(--card-bg, #fff)'; panel.style.border='1px solid rgba(0,0,0,0.06)'; panel.style.borderRadius='8px'; panel.style.boxShadow='0 8px 24px rgba(2,6,23,0.12)'; panel.style.zIndex=10000; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Notifications'); document.body.appendChild(panel);
  }
  panel.innerHTML = '';
  const header = document.createElement('div'); header.style.padding='10px 12px'; header.style.borderBottom='1px solid rgba(0,0,0,0.04)'; header.style.fontWeight='600'; header.textContent='Notifications'; panel.appendChild(header);
  if(!_notificationsCache || _notificationsCache.length===0){ const empty = document.createElement('div'); empty.style.padding='12px'; empty.textContent='Aucune notification'; panel.appendChild(empty); return; }
  _notificationsCache.forEach(n=>{
    const item = document.createElement('div'); item.className='notification-item'; item.style.padding='10px 12px'; item.style.borderBottom='1px solid rgba(0,0,0,0.03)'; item.style.cursor='pointer'; if(!n.isRead) item.style.background='rgba(99,102,241,0.04)';
    const msg = document.createElement('div'); msg.textContent = n.message; msg.style.fontSize='13px'; msg.style.marginBottom='6px';
    const meta = document.createElement('div'); meta.style.fontSize='12px'; meta.style.color='rgba(0,0,0,0.5)'; meta.textContent = `${formatTimeAgo(n.createdAt)} • ${n.isRead ? 'lu' : 'non lu'}`;
    item.appendChild(msg); item.appendChild(meta);
    item.addEventListener('click', (e)=>{
      // mark as viewed and optionally navigate
      if(!n.isRead) markNotificationViewed(n.id);
      // if notification contains a link in data, navigate
      if(n.data && n.data.url){ window.location.href = n.data.url; }
    });
    panel.appendChild(item);
  });
}

async function handleNotifications(){
  const user = getCurrentUser(); if(!user){ showToast('Connectez-vous pour voir les notifications','info'); return; }
  // toggle panel
  if(_notificationsPanelOpen){ closeNotificationsPanel(); return; }
  const result = await fetchNotifications();
  _notificationsPanelOpen = true;
  renderNotificationsPanel();
  // click outside to close
  const onDocClick = (ev)=>{ const panel = document.getElementById('notifications-panel'); const btn = document.getElementById('notifications-btn'); if(!panel) return; if(ev.target.closest && (ev.target.closest('#notifications-panel') || ev.target.closest('#notifications-btn'))) return; closeNotificationsPanel(); document.removeEventListener('click', onDocClick); };
  setTimeout(()=> document.addEventListener('click', onDocClick), 100);
}

function showEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Focus sur le textarea
    const textarea = document.getElementById('emergency-reason');
    if (textarea) {
      setTimeout(() => textarea.focus(), 100);
    }
  }
}

function showQRWarningModal() {
  const modal = document.getElementById('qr-warning-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

async function handleEmergencyAccess() {
  const reason = document.getElementById('emergency-reason')?.value;
  const accessCode = document.getElementById('emergency-code')?.value;
  const modal = document.getElementById('emergency-modal');
  const token = localStorage.getItem(TOKEN_KEY);

  if (!reason || reason.trim().length < 10) {
    showToast('Veuillez fournir une raison détaillée (minimum 10 caractères)', 'error');
    return;
  }

  if (!accessCode || !/^\d{6}$/.test(accessCode)) {
    showToast('Code d\'accès d\'urgence invalide (6 chiffres requis)', 'error');
    return;
  }

  // Récupérer le patient ID depuis l'URL ou demander
  const urlParams = new URLSearchParams(window.location.search);
  let patientId = urlParams.get('patientId');
  
  if (!patientId) {
    // Si pas dans l'URL, demander via prompt
    patientId = prompt('Entrez l\'ID du patient pour l\'accès d\'urgence:');
    if (!patientId) {
      showToast('ID patient requis', 'error');
      return;
    }
  }

  try {
    showToast('Accès d\'urgence en cours...', 'warning');

    const response = await fetch(`${API_BASE}/api/emergency/access/${patientId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accessCode,
        accessReason: reason
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (modal) {
        modal.style.display = 'none';
      }

      // Stocker les données d'urgence pour la page d'affichage
      sessionStorage.setItem('emergency_data', JSON.stringify(data.emergency));
      
      showToast('Accès d\'urgence accordé - Redirection...', 'success');
      setTimeout(() => {
        window.location.href = `/emergency-access?patientId=${patientId}`;
      }, 1000);
    } else {
      const error = await response.json();
      showToast('Erreur: ' + (error.message || 'Code d\'accès invalide'), 'error');
    }
  } catch (error) {
    console.error('Erreur accès urgence:', error);
    showToast('Erreur lors de l\'accès d\'urgence', 'error');
  }
}

function handleLogout() {
  // Supprimer les tokens
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Fermer le menu profil
  const profileMenu = document.getElementById('profile-menu');
  if (profileMenu) {
    profileMenu.style.display = 'none';
  }

  // Rediriger vers l'accueil
  showToast('Déconnexion réussie', 'success');
  // Update UI immediately and navigate to homepage
  try{ if(typeof renderAuthUI === 'function') renderAuthUI(); }catch(e){}
  window.location.href = '/';
}

// ===========================================
// FONCTIONS DE SÉPARATION DES RÔLES
// ===========================================

function initializeRoleSpecificFeatures() {
  console.log('🔐 Initialisation fonctionnalités rôle-spécifiques');

  const user = getCurrentUser();
  if (!user) {
    console.log('👤 Aucun utilisateur connecté');
    return;
  }

  const userRole = user.role;
  console.log('👤 Rôle utilisateur:', userRole);

  // Masquer/afficher les éléments selon le rôle
  updateUIVisibilityByRole(userRole);

  // Configurer les redirections automatiques
  setupRoleBasedNavigation(userRole);
}

function updateUIVisibilityByRole(role) {
  // Masquer les éléments réservés aux agents pour les patients
  if (role === 'patient') {
    // Masquer les boutons d'administration
    document.querySelectorAll('[data-role="agent_only"]').forEach(el => {
      el.style.display = 'none';
    });

    // Masquer les sections de gestion patient
    document.querySelectorAll('[data-role="agent_manage"]').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Masquer les éléments réservés aux patients pour les agents
  if (role === 'agent_de_sante') {
    // Masquer les éléments personnels du patient
    document.querySelectorAll('[data-role="patient_only"]').forEach(el => {
      el.style.display = 'none';
    });
  }
}

function setupRoleBasedNavigation(role) {
  // Redirections automatiques selon les pages et rôles
  const currentPath = window.location.pathname;

  // Pages réservées aux agents
  const agentOnlyPages = [
    '/dashboard-agent',
    '/patient-record',
    '/consultations',
    '/generate-qr',
    '/scan-qr',
    '/upload-results'
  ];

  // Pages réservées aux patients
  const patientOnlyPages = [
    '/dashboard-patient',
    '/profil-patient'
  ];

  // Vérifier les accès interdits
  if (role === 'patient' && agentOnlyPages.some(page => currentPath.includes(page))) {
    console.warn('🚫 Patient tente d\'accéder à une page agent');
    showToast('Accès non autorisé', 'error');
    setTimeout(() => window.location.href = '/dashboard-patient', 1000);
    return;
  }

  if (role === 'agent_de_sante' && patientOnlyPages.some(page => currentPath.includes(page))) {
    console.warn('🚫 Agent tente d\'accéder à une page patient');
    showToast('Accès non autorisé', 'error');
    setTimeout(() => window.location.href = '/dashboard-agent', 1000);
    return;
  }
}

// ===========================================
// FONCTIONS QR CODE
// ===========================================

function initializeQRFeatures() {
  console.log('📱 Initialisation fonctionnalités QR');

  // Générer QR code pour un patient
  const generateQRBtn = document.getElementById('generate-qr-btn');
  if (generateQRBtn) {
    generateQRBtn.addEventListener('click', handleGenerateQR);
  }

  // Scanner QR code
  const scanQRBtn = document.getElementById('scan-qr-btn');
  if (scanQRBtn) {
    scanQRBtn.addEventListener('click', handleScanQR);
  }

  // Désactiver QR code
  const deactivateQRBtn = document.getElementById('deactivate-qr-btn');
  if (deactivateQRBtn) {
    deactivateQRBtn.addEventListener('click', handleDeactivateQR);
  }
}

async function handleGenerateQR() {
  const patientId = document.getElementById('patient-select')?.value ||
                   document.getElementById('qr-patient-id')?.value;

  if (!patientId) {
    showToast('Veuillez sélectionner un patient', 'error');
    return;
  }

  try {
    showToast('Génération du QR code...', 'info');

    const response = await fetch(`${API_BASE}/api/qr/generate/${patientId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.ok) {
      showToast('QR code généré avec succès', 'success');

      // Afficher le QR code généré
      displayGeneratedQR(result.qrLink);

      // Recharger la liste des QR codes
      loadPatientQRCodes(patientId);
    } else {
      showToast(result.error || 'Erreur lors de la génération', 'error');
    }
  } catch (error) {
    console.error('Erreur génération QR:', error);
    showToast('Erreur réseau', 'error');
  }
}

function displayGeneratedQR(qrLink) {
  const container = document.getElementById('qr-display-container');
  if (!container) return;

  // Générer l'URL complète du QR
  const qrUrl = `${window.location.origin}/patient/scan/${qrLink.secureToken}`;

  container.innerHTML = `
    <div class="qr-result">
      <h3>QR Code généré</h3>
      <div class="qr-info">
        <p><strong>Patient ID:</strong> ${qrLink.patientId}</p>
        <p><strong>Token sécurisé:</strong> ${qrLink.secureToken}</p>
        <p><strong>Expire le:</strong> ${new Date(qrLink.expiresAt).toLocaleDateString()}</p>
        <p><strong>URL:</strong> <a href="${qrUrl}" target="_blank">${qrUrl}</a></p>
      </div>
      <div class="qr-actions">
        <button onclick="printQRCode('${qrUrl}')" class="btn">Imprimer</button>
        <button onclick="downloadQRCode('${qrUrl}')" class="btn">Télécharger</button>
      </div>
    </div>
  `;
}

async function loadPatientQRCodes(patientId) {
  const container = document.getElementById('qr-list-container');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/api/qr/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });

    const result = await response.json();

    if (result.ok) {
      displayQRCodesList(result.qrCodes);
    }
  } catch (error) {
    console.error('Erreur chargement QR codes:', error);
  }
}

function displayQRCodesList(qrCodes) {
  const container = document.getElementById('qr-list-container');
  if (!container) return;

  if (!qrCodes || qrCodes.length === 0) {
    container.innerHTML = '<p>Aucun QR code trouvé pour ce patient.</p>';
    return;
  }

  const html = qrCodes.map(qr => `
    <div class="qr-item ${qr.isActive ? 'active' : 'inactive'}">
      <div class="qr-details">
        <span class="qr-token">${qr.secureToken}</span>
        <span class="qr-created">${new Date(qr.createdAt).toLocaleDateString()}</span>
        <span class="qr-scans">${qr.scanCount} scan(s)</span>
        ${qr.lastScannedAt ? `<span class="qr-last-scan">Dernier scan: ${new Date(qr.lastScannedAt).toLocaleDateString()}</span>` : ''}
      </div>
      <div class="qr-status">
        <span class="status ${qr.isActive ? 'active' : 'inactive'}">
          ${qr.isActive ? 'Actif' : 'Désactivé'}
        </span>
        ${qr.isActive ? `<button onclick="deactivateQR('${qr.id}')" class="btn-small">Désactiver</button>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = `<div class="qr-list">${html}</div>`;
}

async function handleScanQR() {
  // Pour la démonstration, rediriger vers la page scan
  window.location.href = '/scan-qr';
}

async function deactivateQR(qrLinkId) {
  if (!confirm('Êtes-vous sûr de vouloir désactiver ce QR code ?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/qr/${qrLinkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });

    const result = await response.json();

    if (result.ok) {
      showToast('QR code désactivé', 'success');
      // Recharger la liste
      const patientId = document.getElementById('patient-select')?.value;
      if (patientId) {
        loadPatientQRCodes(patientId);
      }
    } else {
      showToast(result.error || 'Erreur', 'error');
    }
  } catch (error) {
    console.error('Erreur désactivation QR:', error);
    showToast('Erreur réseau', 'error');
  }
}

// ===========================================
// FONCTIONS CONSULTATIONS
// ===========================================

function initializeConsultationFeatures() {
  console.log('📋 Initialisation fonctionnalités consultations');

  // Créer une nouvelle consultation
  const createConsultationBtn = document.getElementById('create-consultation-btn');
  if (createConsultationBtn) {
    createConsultationBtn.addEventListener('click', handleCreateConsultation);
  }

  // Charger les consultations du patient
  loadPatientConsultations();

  // Charger les consultations de l'agent
  loadAgentConsultations();
}

async function handleCreateConsultation() {
  const form = document.getElementById('consultation-form');
  if (!form) return;

  const formData = new FormData(form);
  const consultationData = {
    patientId: formData.get('patientId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    diagnosis: formData.get('diagnosis'),
    recommendations: formData.get('recommendations'),
    followUpDate: formData.get('followUpDate'),
    duration: parseInt(formData.get('duration')) || 30
  };

  try {
    showToast('Création de la consultation...', 'info');

    const response = await fetch(`${API_BASE}/api/consultations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consultationData)
    });

    const result = await response.json();

    if (result.ok) {
      showToast('Consultation créée avec succès', 'success');
      form.reset();

      // Recharger les consultations
      loadAgentConsultations();
      loadPatientConsultations();
    } else {
      showToast(result.error || 'Erreur lors de la création', 'error');
    }
  } catch (error) {
    console.error('Erreur création consultation:', error);
    showToast('Erreur réseau', 'error');
  }
}

async function loadPatientConsultations() {
  const user = getCurrentUser();
  if (!user || user.role !== 'patient') return;

  const container = document.getElementById('patient-consultations');
  if (!container) return;

  try {
    // Récupérer l'ID patient depuis le profil
    const profileResponse = await fetch(`${API_BASE}/api/patients/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });

    const profileResult = await profileResponse.json();
    if (!profileResult.ok) return;

    const patientId = profileResult.patient.patientId;

    const response = await fetch(`${API_BASE}/api/consultations/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });

    const result = await response.json();

    if (result.ok) {
      displayConsultations(result.consultations, 'patient');
    }
  } catch (error) {
    console.error('Erreur chargement consultations patient:', error);
  }
}

async function loadAgentConsultations() {
  const user = getCurrentUser();
  if (!user || user.role !== 'agent_de_sante') return;

  const container = document.getElementById('agent-consultations');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/api/consultations/agent/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });

    const result = await response.json();

    if (result.ok) {
      displayConsultations(result.consultations, 'agent');
    }
  } catch (error) {
    console.error('Erreur chargement consultations agent:', error);
  }
}

function displayConsultations(consultations, viewType) {
  const container = document.getElementById(`${viewType}-consultations`);
  if (!container) return;

  if (!consultations || consultations.length === 0) {
    container.innerHTML = '<p>Aucune consultation trouvée.</p>';
    return;
  }

  const html = consultations.map(consultation => `
    <div class="consultation-item">
      <div class="consultation-header">
        <h4>${consultation.title}</h4>
        <span class="consultation-date">${new Date(consultation.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="consultation-agent">
        <strong>Agent:</strong> ${consultation.agent.user.email}
        ${consultation.agent.specialty ? `(${consultation.agent.specialty})` : ''}
      </div>
      ${consultation.summary ? `<div class="consultation-summary">${consultation.summary}</div>` : ''}
      ${consultation.diagnosis ? `<div class="consultation-diagnosis"><strong>Diagnostic:</strong> ${consultation.diagnosis}</div>` : ''}
      ${consultation.recommendations ? `<div class="consultation-recommendations"><strong>Recommandations:</strong> ${consultation.recommendations}</div>` : ''}
      ${consultation.followUpDate ? `<div class="consultation-followup"><strong>Suivi prévu:</strong> ${new Date(consultation.followUpDate).toLocaleDateString()}</div>` : ''}
      <div class="consultation-status status-${consultation.status}">${consultation.status}</div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// ===========================================
// FONCTIONS URGENCE
// ===========================================

function initializeEmergencyFeatures() {
  console.log('🚨 Initialisation fonctionnalités urgence');

  // Bouton accès urgence
  const emergencyBtn = document.getElementById('emergency-access-btn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', handleEmergencyAccess);
  }

  // Formulaire accès urgence via QR
  const emergencyForm = document.getElementById('emergency-form');
  if (emergencyForm) {
    emergencyForm.addEventListener('submit', handleEmergencyForm);
  }
}

async function handleEmergencyAccess() {
  const patientId = document.getElementById('emergency-patient-id')?.value;
  const accessCode = document.getElementById('emergency-code')?.value;
  const accessReason = document.getElementById('emergency-reason')?.value;

  if (!patientId || !accessCode || !accessReason) {
    showToast('Veuillez remplir tous les champs', 'error');
    return;
  }

  try {
    showToast('Accès d\'urgence en cours...', 'warning');

    const response = await fetch(`${API_BASE}/api/emergency/access/${patientId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accessCode,
        accessReason
      })
    });

    const result = await response.json();

    if (result.ok) {
      showToast('Accès d\'urgence accordé', 'success');
      displayEmergencyInfo(result.emergency);
    } else {
      showToast(result.error || 'Accès refusé', 'error');
    }
  } catch (error) {
    console.error('Erreur accès urgence:', error);
    showToast('Erreur réseau', 'error');
  }
}

async function handleEmergencyForm(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const secureToken = formData.get('secureToken');
  const accessCode = formData.get('accessCode');
  const accessReason = formData.get('accessReason');

  if (!secureToken || !accessCode || !accessReason) {
    showToast('Veuillez remplir tous les champs', 'error');
    return;
  }

  try {
    showToast('Vérification du QR code d\'urgence...', 'warning');

    const response = await fetch(`${API_BASE}/api/qr/emergency/${secureToken}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accessCode,
        accessReason
      })
    });

    const result = await response.json();

    if (result.ok) {
      showToast('Accès d\'urgence accordé via QR', 'success');
      displayEmergencyInfo(result.emergency);
    } else {
      showToast(result.error || 'Accès refusé', 'error');
    }
  } catch (error) {
    console.error('Erreur accès urgence QR:', error);
    showToast('Erreur réseau', 'error');
  }
}

function displayEmergencyInfo(emergency) {
  const container = document.getElementById('emergency-info-container');
  if (!container) return;

  container.innerHTML = `
    <div class="emergency-alert">
      <h3>🚨 ACCÈS D'URGENCE - INFORMATIONS CRITIQUES</h3>
      <div class="emergency-patient">
        <h4>Patient: ${emergency.patient.fullname}</h4>
        <p><strong>ID:</strong> ${emergency.patient.patientId}</p>
        <p><strong>Sexe:</strong> ${emergency.patient.sexAtBirth}</p>
      </div>
      <div class="emergency-critical">
        <h4>Informations Vitales</h4>
        <div class="critical-grid">
          <div class="critical-item">
            <strong>Groupe sanguin:</strong> ${emergency.criticalInfo.bloodType || 'Non spécifié'}
          </div>
          <div class="critical-item">
            <strong>Allergies:</strong> ${formatJsonArray(emergency.criticalInfo.allergies) || 'Aucune'}
          </div>
          <div class="critical-item">
            <strong>Maladies chroniques:</strong> ${formatJsonArray(emergency.criticalInfo.chronicConditions) || 'Aucune'}
          </div>
          <div class="critical-item">
            <strong>Médicaments actuels:</strong> ${formatJsonArray(emergency.criticalInfo.currentMedications) || 'Aucun'}
          </div>
          <div class="critical-item">
            <strong>Contact d'urgence:</strong>
            ${emergency.criticalInfo.emergencyContact?.name || 'Non spécifié'}
            ${emergency.criticalInfo.emergencyContact?.phone ? ` - ${emergency.criticalInfo.emergencyContact.phone}` : ''}
          </div>
          <div class="critical-item">
            <strong>Grossesse en cours:</strong> ${emergency.criticalInfo.pregnantCurrent ? 'Oui' : 'Non'}
          </div>
        </div>
      </div>
      <div class="emergency-access">
        <p><strong>Accès effectué le:</strong> ${new Date(emergency.accessedAt).toLocaleString()}</p>
        <p><strong>Raison:</strong> ${emergency.accessReason}</p>
        <p><strong>Agent:</strong> ${emergency.agent.licenseNumber} (${emergency.agent.specialty})</p>
      </div>
      <div class="emergency-actions">
        <button onclick="printEmergencyReport()" class="btn">Imprimer le rapport</button>
        <button onclick="closeEmergencyAccess()" class="btn">Fermer l'accès</button>
      </div>
    </div>
  `;

  // Afficher le conteneur
  container.style.display = 'block';
}

function formatJsonArray(data) {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  if (Array.isArray(data)) {
    return data.map(item => typeof item === 'object' ? item.name || item.medication || item.condition || JSON.stringify(item) : item).join(', ');
  }
  return data;
}

function printEmergencyReport() {
  window.print();
}

function closeEmergencyAccess() {
  const container = document.getElementById('emergency-info-container');
  if (container) {
    container.style.display = 'none';
  }
}

// ===========================================
// UTILITAIRES
// ===========================================

function getCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);

  if (!token || !user) return null;

  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
}

function printQRCode(url) {
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

function downloadQRCode(url) {
  // Pour la démonstration, ouvrir dans un nouvel onglet
  window.open(url, '_blank');
}
