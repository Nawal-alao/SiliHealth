const { chromium } = require('playwright');
const axeSource = require('axe-core').source;
const fs = require('fs');

const PAGES = [
  '/', '/signup', '/login', '/dashboard', '/consultations', '/consultation-new', '/consultation-detail', '/upload-results', '/pregnancy', '/pregnancy-calculator', '/tests-history', '/patient-record', '/access-history', '/activity-log', '/permissions', '/profile', '/system-settings', '/support', '/blog', '/article', '/scan-qr', '/generate-qr'
];

(async ()=>{
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];
  for(const route of PAGES){
    try{
      await page.goto('http://localhost:3000' + route, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => { return await axe.run(); });
      results.push({ route, violations: res.violations });
      console.log(route + ' → ' + (res.violations.length || 0) + ' violation(s)');
    }catch(e){
      console.error('ERROR loading', route, e.message);
      results.push({ route, error: e.message });
    }
  }
  const out = { timestamp: new Date().toISOString(), results };
  fs.writeFileSync('e2e/axe-report.json', JSON.stringify(out, null, 2));
  await browser.close();
  console.log('\nSaved e2e/axe-report.json');
})();
