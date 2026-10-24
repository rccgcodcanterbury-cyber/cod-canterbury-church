// Cookieless visit and click counting. No cookie, IP address or name is stored.
export const EVENTS=new Set(['pageview','give_click','visit_click','directions_click','sermon_play','form_submit','social_click','outbound_click']);
const SITES=['audacious','youth'];
const OWN_HOSTS=/(^|\.)(rccgcodcanterbury\.com|codcanterburychurch\.org|cod-canterbury-church\.pages\.dev|netlify\.app)$|^(localhost|127\.0\.0\.1)$/;
const BOT=/bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|httpclient|facebookexternalhit/i;
const clean=(value,max)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max);

export function siteFor(hostname,path){
  const host=String(hostname||'').toLowerCase();
  for(const site of SITES){if(host.startsWith(`${site}.`))return site}
  const prefix=SITES.find(site=>path===`/${site}`||path.startsWith(`/${site}/`));
  return prefix||'main';
}

export function deviceFor(userAgent=''){
  if(/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent))return 'tablet';
  if(/Mobi|iPhone|iPod|Android/i.test(userAgent))return 'mobile';
  return 'desktop';
}

export function referrerHost(referrer){
  try{
    const url=new URL(String(referrer||''));
    if(!['http:','https:'].includes(url.protocol))return null;
    const host=url.hostname.toLowerCase().replace(/^(www|m|l|lm)\./,'');
    return OWN_HOSTS.test(host)||!/^[a-z0-9.-]{3,100}$/.test(host)?null:host;
  }catch{return null}
}

// Returns {skip:true} for bots and unknown events, otherwise a row for public.site_events.
export function parseTrack(input,{userAgent='',country=''}={}){
  if(!input||typeof input!=='object'||BOT.test(userAgent)||!userAgent)return {skip:true};
  const event=String(input.event||'');
  if(!EVENTS.has(event))return {skip:true};
  let path=clean(input.path,200).split(/[?#]/)[0]||'/';
  if(!path.startsWith('/'))return {skip:true};
  const site=siteFor(input.host,path);
  if(site!=='main'&&path.startsWith(`/${site}/`))path=path.slice(site.length+1);
  const label=event==='pageview'?null:clean(input.label,120)||null;
  const code=String(country||'').toUpperCase();
  return {record:{site,path,event,label,referrer_host:event==='pageview'?referrerHost(input.referrer):null,device:deviceFor(userAgent),country:/^[A-Z]{2}$/.test(code)&&code!=='XX'?code:null}};
}
