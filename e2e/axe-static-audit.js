const { JSDOM } = require('jsdom');
const axe = require('axe-core');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const VIEWS_DIR = path.resolve(__dirname, '../frontend/views');
const PARTIALS_DIR = VIEWS_DIR + '/partials';

const PAGES = [
  'index','signup','login','dashboard','consultations','consultation-new','consultation-detail','upload-results',
  'pregnancy','pregnancy-calculator','tests-history','patient-record','access-history','activity-log','permissions',
  'profile','system-settings','support','blog','article','scan-qr','generate-qr'
];

(async ()=>{
  const results = [];
  for(const page of PAGES){
    const filePath = path.join(VIEWS_DIR, page + '.ejs');
    if(!fs.existsSync(filePath)){
      results.push({ page, error: 'view-not-found' });
      continue;
    }
    try{
      // render ejs with minimal data
      const html = await ejs.renderFile(filePath, { title: page === 'index' ? 'HealID' : page }, { root: VIEWS_DIR });
      const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
      // jsdom does not implement canvas by default. axe-core / some page scripts
      // may call canvas.getContext(); that throws unless we provide a minimal stub.
      try {
        if (dom.window && dom.window.HTMLCanvasElement) {
          dom.window.HTMLCanvasElement.prototype.getContext = function () {
            // Minimal 2D context stub used for static audits — only methods axe-core might call
            return {
              fillRect: () => {},
              clearRect: () => {},
              getImageData: () => ({ data: [] }),
              putImageData: () => {},
              createImageData: () => [],
              setTransform: () => {},
              drawImage: () => {},
              save: () => {},
              restore: () => {},
              beginPath: () => {},
              moveTo: () => {},
              lineTo: () => {},
              bezierCurveTo: () => {},
              stroke: () => {},
              fill: () => {},
              measureText: () => ({ width: 0 }),
            };
          };
        }
        // Some jsdom versions don't support getComputedStyle with a pseudoElement
        // axe-core may call getComputedStyle(elem, '::before') — wrap the method
        if (dom.window && dom.window.getComputedStyle) {
          const _orig = dom.window.getComputedStyle.bind(dom.window);
          dom.window.getComputedStyle = (elt, pseudoElt) => {
            // Return element's computed style as a fallback when pseudoElt is requested
            if (pseudoElt) {
              try { return _orig(elt); } catch (_) { return _orig(elt); }
            }
            return _orig(elt);
          };
        }
      } catch (stErr) {
        // if stubbing fails, continue and let the audit collect the error per page
      }
      // inject axe-core
      dom.window.eval(axe.source);
      const res = await dom.window.axe.run(dom.window.document);
      results.push({ page, violations: res.violations });
      console.log(`${page} → ${res.violations.length} violations`);
    }catch(err){
      results.push({ page, error: err.message });
      console.error('ERROR for', page, err.message);
    }
  }
  const out = { timestamp:new Date().toISOString(), results };
  fs.writeFileSync(path.resolve(__dirname, 'axe-static-report.json'), JSON.stringify(out, null, 2));
  console.log('\nSaved e2e/axe-static-report.json');
})();
