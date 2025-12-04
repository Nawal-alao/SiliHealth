;(function(root, factory){
  if(typeof module === 'object' && module.exports){ module.exports = factory(); }
  else { root.ValidationUtils = factory(); }
})(typeof window !== 'undefined' ? window : this, function(){
  function requiredFields(form){
    const required = Array.from(form.querySelectorAll('[required]'));
    const errors = [];
    required.forEach(inp=>{
      if(!inp.value || String(inp.value).trim() === ''){
        errors.push({ name: inp.name || inp.id || null, message: 'Ce champ est requis', element: inp });
      }
    });
    return errors;
  }

  function passwordMatch(form, passName='password', confirmName='confirm_password'){
    const pw = form.querySelector(`[name="${passName}"]`);
    const cpw = form.querySelector(`[name="${confirmName}"]`);
    if(pw && cpw && pw.value !== cpw.value) return { name: confirmName, message: 'Les mots de passe ne correspondent pas', element: cpw };
    return null;
  }

  return { requiredFields, passwordMatch };
});
