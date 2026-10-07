const intakeConfig=window.COD_INTAKE_CONFIG||{};
let turnstileLoader;
function loadTurnstile(){
  if(window.turnstile)return Promise.resolve(window.turnstile);
  if(turnstileLoader)return turnstileLoader;
  turnstileLoader=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;
    script.addEventListener('load',()=>window.turnstile?resolve(window.turnstile):reject(new Error('Security check did not load.')));
    script.addEventListener('error',()=>reject(new Error('Security check did not load.')));
    document.head.append(script);
  });
  return turnstileLoader;
}
for(const form of document.querySelectorAll('[data-intake-form]')){
  const status=form.querySelector('.intake-status');
  const button=form.querySelector('button[type="submit"]');
  if(!intakeConfig.enabled){
    const notice=document.createElement('p');notice.className='intake-unavailable';notice.setAttribute('role','status');notice.textContent='This secure form is being prepared and is not accepting submissions yet. Please contact office@codcanterburychurch.org.';
    form.prepend(notice);button.disabled=true;continue;
  }
  const challenge=document.createElement('div');challenge.className='turnstile-challenge';challenge.setAttribute('aria-label','Security check');
  form.insertBefore(challenge,button);
  loadTurnstile().then(turnstile=>turnstile.render(challenge,{sitekey:intakeConfig.turnstileSiteKey,theme:'light'})).catch(error=>{status.textContent=error.message;button.disabled=true;});
  form.elements.submission_key.value=crypto.randomUUID();
  form.addEventListener('submit',async event=>{
    event.preventDefault();button.disabled=true;status.textContent='Sending securely…';
    const values=Object.fromEntries(new FormData(form).entries());
    if(!values['cf-turnstile-response']){status.textContent='Please complete the security check before submitting.';button.disabled=false;return;}
    values.online_sharing_consent=values.online_sharing_consent==='true';
    values.name_sharing_consent=values.name_sharing_consent==='true';
    values.contact_consent=values.contact_consent==='true';
    if(values.visit_date==='')values.visit_date=null;
    if(values.phone==='')values.phone=null;
    if(values.preferred_contact==='none')values.contact_consent=false;
    try{
      const response=await fetch('/api/intake',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':values.submission_key},body:JSON.stringify(values)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'We could not send this form. Please try again or email the church office.');
      form.reset();status.textContent='Thank you. Your submission has been received by the church team.';
      form.querySelector('[name="submission_key"]').value=crypto.randomUUID();
    }catch(error){status.textContent=error.message||'We could not send this form. Please contact the church office.';button.disabled=false;}
  });
}
