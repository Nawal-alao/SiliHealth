(async ()=>{
  const API = 'http://localhost:4000';
  const rand = Math.floor(Date.now()/1000);
  const email = `e2e_node_${rand}@example.com`;
  const pass = 'E2Epass123!';
  console.log('E2E client test — signing up', email);
  const signup = await (await fetch(`${API}/api/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fullname:'E2E Node', email, password: pass, role:'patient'}) })).json();
  console.log('signup ->', signup.ok ? 'OK' : 'FAILED', signup);
  if(!signup.ok) { process.exit(2); }
  const login = await (await fetch(`${API}/api/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pass}) })).json();
  console.log('login ->', login.ok ? 'OK' : 'FAILED');
  if(!login.ok || !login.token){ console.error('login failed', login); process.exit(3); }
  const token = login.token;
  const me = await (await fetch(`${API}/api/me`, { headers:{ 'Authorization': `Bearer ${token}` } })).json();
  console.log('/api/me ->', me);
  const qr = await (await fetch(`${API}/api/qr-verify`, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify({ format: 'HEALID_1'}) })).json();
  console.log('/api/qr-verify ->', qr);
  console.log('E2E client tests finished');
})();
