const path = require('path');
const express = require('express');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;

// Enable compression for faster responses
app.use(compression());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Cache EJS templates in production mode (speeds up rendering)
if(process.env.NODE_ENV === 'production') app.set('view cache', true);
else app.set('view cache', false); // disable in dev for instant reload

// Serve static assets (css, js, images) with cache, but exclude HTML files
app.use(express.static(path.join(__dirname), {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Serve project-level public icons (created in /public/icons)
app.use('/icons', express.static(path.join(__dirname, '..', 'public', 'icons'), { maxAge: '1h' }));

// Parse JSON and form data (middleware)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: All APIs proxied to backend at http://localhost:4000
// Frontend only serves static pages + routes to backend APIs via js/main.js

// List of available pages (maps route -> view)
const pages = [
  'index','signup','login','dashboard','dashboard-patient','dashboard-agent','consultations','consultation-new','consultation-detail','upload-results',
  'pregnancy','pregnancy-calculator','tests-history','patient-record','access-history','activity-log','permissions',
  'profile','profil-patient','profil-agent','system-settings','support','blog','article','scan-qr','generate-qr','qr-access'
];

// Serve debug and test pages
app.get('/debug_form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug_form.html'));
});

app.get('/integration_test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../integration_test.html'));
});

app.get('/test_redirect.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test_redirect.html'));
});

app.get('/test_flow.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test_flow.html'));
});

app.get('/diagnostic.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'diagnostic.html'));
});

app.get('/test_connexion.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test_connexion.html'));
});

app.get('/emergency-access.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'emergency-access.html'));
});

app.get('/emergency-access', (req, res) => {
  res.sendFile(path.join(__dirname, 'emergency-access.html'));
});

app.get('/force-reload.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'force-reload.html'));
});

// Serve manifest, service worker and offline page from project public folder
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, '..', 'public', 'sw.js'));
});

app.get('/offline.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'offline.html'));
});

// QR Access route with dynamic patient ID
app.get('/qr-access/:patientId', (req, res) => {
  res.render('qr-access', { 
    title: 'Accès QR Code',
    patientId: req.params.patientId,
    emergency: req.query.emergency === 'true'
  });
});

// Handle POST requests to pages (fallback for failed JS interception)
pages.forEach(page => {
  const route = page === 'index' ? '/' : `/${page}`;
  app.post(route, (req, res) => {
    console.log(`⚠️ POST request to ${route} - JavaScript interception failed, redirecting to GET`);
    res.redirect(route);
  });
});

// Render pages with fast headers (no delay)
pages.forEach(page => {
  const route = page === 'index' ? '/' : `/${page}`;
  app.get(route, (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.render(page, { title: page === 'index' ? 'HealID' : page.charAt(0).toUpperCase() + page.slice(1) });
  });
});

// Gestion des erreurs de démarrage
const server = app.listen(port, () => {
  console.log(`HealID UI dev server running at http://localhost:${port}`);
  console.log(`Available at: http://localhost:${port}`);
});

// Gestion d'erreur pour le port déjà utilisé
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use!`);
    console.error(`💡 Solutions:`);
    console.error(`   1. Kill existing process: pkill -f "node.*server.js"`);
    console.error(`   2. Use different port: PORT=3001 npm run dev`);
    console.error(`   3. Find process using port: lsof -ti:${port}`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HealID UI server...');
  server.close(() => {
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });
});
