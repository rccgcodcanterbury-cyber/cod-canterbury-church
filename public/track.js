// Cookieless visit and click counting for the church office dashboard. Nothing is stored in the browser.
(()=>{
  if(navigator.globalPrivacyControl||navigator.doNotTrack==='1'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return;
  const send=(event,label='')=>{
    const body=JSON.stringify({event,label,path:location.pathname,host:location.hostname,referrer:document.referrer});
    try{if(navigator.sendBeacon&&navigator.sendBeacon('/api/track',body))return}catch{}
    fetch('/api/track',{method:'POST',body,keepalive:true}).catch(()=>{});
  };
  const social=/(^|\.)(facebook|instagram|youtube|twitter|x|tiktok|linkedin)\.com$|^youtu\.be$/;
  function clickKind(link){
    if(link.dataset.track)return [link.dataset.track,link.dataset.trackLabel||''];
    let url;try{url=new URL(link.href,location.href)}catch{return null}
    const host=url.hostname.replace(/^www\./,'');
    if(/(^|\.)natwestpayit\.com$/.test(host))return ['give_click','natwest'];
    if((/(^|\.)google\.[a-z.]+$/.test(host)&&url.pathname.startsWith('/maps'))||/(^|\.)goo\.gl$|^maps\.app\.goo\.gl$/.test(host))return ['directions_click','Google Maps'];
    if(url.origin===location.origin&&/^\/(visit|first-visit)\/?$/.test(url.pathname))return ['visit_click',link.textContent.trim().slice(0,60)];
    if(social.test(host))return ['social_click',host];
    if(url.origin!==location.origin&&/^https?:$/.test(url.protocol)&&!/(^|\.)rccgcodcanterbury\.com$/.test(host))return ['outbound_click',host];
    return null;
  }
  send('pageview');
  document.addEventListener('click',event=>{
    const video=event.target.closest?.('[data-video]');
    if(video){send('sermon_play',(video.getAttribute('aria-label')||'').replace(/^Watch\s+/,'').replace(/\s*\|\s*RCCG City of David Canterbury/,'')||video.dataset.video);return}
    const link=event.target.closest?.('a[href]');
    const kind=link&&clickKind(link);
    if(kind)send(...kind);
  },true);
  document.addEventListener('submit',event=>{
    const form=event.target.closest?.('[data-intake-form]');
    if(form)send('form_submit',form.querySelector('[name="kind"]')?.value||'form');
  },true);
})();
