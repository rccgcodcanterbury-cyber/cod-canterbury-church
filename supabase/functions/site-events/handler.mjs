import {parseTrack} from '../../../lib/track.mjs';
// Receives one event from the website's /api/track proxy. The database turns the IP address into a daily code
// with a random key that is deleted after two days; the address itself is never stored.
export async function handleSiteEvent(request,env,fetcher=fetch){
  const reply=status=>new Response(null,{status,headers:{'cache-control':'no-store'}});
  if(request.method!=='POST')return reply(405);
  if(Number(request.headers.get('content-length'))>4000)return reply(413);
  const url=env.SUPABASE_URL,key=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return reply(503);
  let input;
  try{const raw=await request.text();if(new TextEncoder().encode(raw).length>4000)return reply(413);input=JSON.parse(raw)}catch{return reply(400)}
  const userAgent=String(input?.user_agent||'').slice(0,400);
  const parsed=parseTrack(input?.event,{userAgent,country:input?.country});
  if(parsed.skip)return reply(204);
  try{
    const saved=await fetcher(`${url}/rest/v1/rpc/record_site_event`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({p_event:parsed.record,p_ip:String(input?.ip||'').slice(0,64),p_user_agent:userAgent})});
    return reply(saved.ok?204:503);
  }catch{return reply(503)}
}
