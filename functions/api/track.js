import connection from '../../content/connection.json' with {type:'json'};
import {parseTrack} from '../../lib/track.mjs';
// Same-origin collector for public/track.js. Bots and malformed events stop here; the visitor always gets 204.
export async function onRequest({request},fetcher=fetch){
 const done=status=>new Response(null,{status,headers:{'cache-control':'no-store'}});
 if(request.method!=='POST')return done(405);
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return done(403);
 if(Number(request.headers.get('content-length'))>2000)return done(413);
 const body=await request.text();
 if(new TextEncoder().encode(body).length>2000)return done(413);
 let event;try{event=JSON.parse(body)}catch{return done(400)}
 const userAgent=request.headers.get('user-agent')||'';
 const country=request.headers.get('x-country')||request.headers.get('cf-ipcountry')||'';
 if(parseTrack(event,{userAgent,country}).skip)return done(204);
 const ip=request.headers.get('x-nf-client-connection-ip')||request.headers.get('cf-connecting-ip')||(request.headers.get('x-forwarded-for')||'').split(',')[0].trim();
 try{
  await fetcher(`${connection.url}/functions/v1/site-events`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${connection.anonKey}`,apikey:connection.anonKey},body:JSON.stringify({event,ip,user_agent:userAgent,country}),signal:AbortSignal.timeout(5000)});
 }catch{/* Counting is best effort; never slow or break the visitor's page. */}
 return done(204);
}
