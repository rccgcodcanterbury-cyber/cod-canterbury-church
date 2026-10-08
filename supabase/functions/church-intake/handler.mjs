import {validateIntake} from '../../../lib/intake.mjs';
const origins=new Set(['https://cod-canterbury-church.pages.dev','https://rccgcodcanterbury.com','https://audacious.rccgcodcanterbury.com','https://youth.rccgcodcanterbury.com','http://localhost:8766','http://localhost:8788']);
export async function handleIntake(request,env,fetcher=fetch){
  const origin=request.headers.get('origin');
  const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','vary':'Origin'};
  if(origins.has(origin)){headers['access-control-allow-origin']=origin;headers['access-control-allow-headers']='authorization,apikey,content-type';headers['access-control-allow-methods']='POST,OPTIONS'}
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&!origins.has(origin))return reply(403,{error:'Please send your message from the church website.'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'Method not allowed'});
  if(!request.headers.get('content-type')?.includes('application/json'))return reply(415,{error:'Please use the church website form.'});
  if(Number(request.headers.get('content-length'))>20000)return reply(413,{error:'Your message is too long.'});
  const url=env.SUPABASE_URL,key=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return reply(503,{error:'The church submission system is unavailable. Please email the church office.'});
  let parsed;
  try{
    const raw=await request.text();
    if(new TextEncoder().encode(raw).length>20000)return reply(413,{error:'Your message is too long.'});
    parsed=validateIntake(JSON.parse(raw));
  }catch(error){return reply(400,{error:error instanceof SyntaxError?'Please check the form and try again.':error.message})}
  if(parsed.spam)return reply(202,{ok:true});
  const apiHeaders={apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'};
  try{
    // Only a salted email fingerprint is kept for abuse limits; no message text is logged.
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key+parsed.record.email));
    const fingerprint=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    const rate=await fetcher(`${url}/rest/v1/rpc/check_intake_rate`,{method:'POST',headers:apiHeaders,body:JSON.stringify({p_fingerprint:fingerprint})});
    if(!rate.ok)return reply(503,{error:'We could not save your message just now. Please try again later.'});
    if(await rate.json()!==true)return reply(429,{error:'Too many messages were sent recently. Please try again in an hour or contact the church office.'});
    const saved=await fetcher(`${url}/rest/v1/${parsed.table}?on_conflict=submission_key`,{method:'POST',headers:{...apiHeaders,prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(parsed.record)});
    if(!saved.ok)return reply(503,{error:'Your message was not saved. Please try again or email the church office.'});
    return reply(201,{ok:true});
  }catch{return reply(503,{error:'Your message was not saved. Please try again or email the church office.'})}
}
