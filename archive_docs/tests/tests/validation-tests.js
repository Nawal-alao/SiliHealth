const V = require('../frontend/js/validation-utils');
const assert = require('assert');

console.log('Running validation-utils tests...');

// Mock an HTML form environment: use JSDOM-like lightweight
function makeEl(tag, attrs={}, text=''){ const el = { tagName: tag.toUpperCase(), attributes: {...attrs}, value: attrs.value || '', nextSibling:null, parentNode: { insertBefore: ()=>{}, appendChild: ()=>{} } }; return el; }

// Simple DOM like tests for exported functions only
(function(){
  // For requiredFields: create a fake form with querySelectorAll
  const form = { querySelectorAll: (sel)=>{
    if(sel === '[required]'){
      return [ { value:'' , name:'a' }, { value:'ok', name:'b' } ];
    }
    return [];
  } };
  const errors = V.requiredFields(form);
  assert.strictEqual(Array.isArray(errors), true);
  assert.strictEqual(errors.length, 1);
  assert.strictEqual(errors[0].name, 'a');
  console.log('requiredFields -> OK');
})();

(function(){
  // Password match
  const form = { querySelector: (sel)=>{
    if(sel.includes('password') && !sel.includes('confirm')) return { value:'123' };
    if(sel.includes('confirm')) return { value:'123' };
    return null;
  } };
  const noErr = V.passwordMatch(form);
  assert.strictEqual(noErr, null);

  const form2 = { querySelector: (sel)=>{
    if(sel.includes('password') && !sel.includes('confirm')) return { value:'123' };
    if(sel.includes('confirm')) return { value:'999' };
    return null;
  } };
  const e = V.passwordMatch(form2);
  assert.strictEqual(typeof e, 'object');
  assert.strictEqual(e.name, 'confirm_password');
  console.log('passwordMatch -> OK');
})();

console.log('All validation-utils tests passed.');
