import connection from '../../content/connection.json' with {type:'json'};
const alertTitles={prayer:'New prayer request',contact:'New enquiry',first_time_visitor:'New first-visit form',testimony:'New testimony'};

// Tells the church office something new has arrived. Only the type is sent, never the person's details.
export async function sendIntakeAlert(submission,env,fetcher=fetch){
 const key=env?.RESEND_API_KEY,from=env?.RESEND_FROM;
 if(!key||!from||!alertTitles[submission?.kind])return false;
 const title=submission.kind==='contact'&&submission.topic==='prayer'?alertTitles.prayer:alertTitles[submission.kind];
 const to=String(env.ALERT_EMAIL||'rccgcodcanterbury@gmail.com').split(',').map(address=>address.trim()).filter(Boolean);
 const link='https://admin.rccgcodcanterbury.com/#inbox';
 try{
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json',...(/^[0-9a-f-]{36}$/i.test(submission.submission_key||'')?{'Idempotency-Key':`cod-alert-${submission.submission_key}`}:{})},body:JSON.stringify({from,to,subject:`${title} – City of David church office`,text:`${title} has arrived in the church office.\n\nOpen the inbox to read it and respond:\n${link}\n\nFor privacy, details are only shown inside the church office.`}),signal:AbortSignal.timeout(4000)});
  return response.ok;
 }catch{return false}
}

export async function onRequest({request,env},fetcher=fetch){
 const headers={'content-type':'application/json','cache-control':'no-store'};
 if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers});
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Please use the church website form.'},{status:403,headers});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Please use the church website form.'},{status:415,headers});
 if(Number(request.headers.get('content-length'))>20000)return Response.json({error:'Your message is too long.'},{status:413,headers});
 const body=await request.text();
 if(new TextEncoder().encode(body).length>20000)return Response.json({error:'Your message is too long.'},{status:413,headers});
 try{
  const upstream=await fetcher(`${connection.url}/functions/v1/church-intake`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${connection.anonKey}`,apikey:connection.anonKey},body,signal:AbortSignal.timeout(12000)});
  const data=await upstream.json();
  // 201 means a real, newly saved submission (spam gets 202 and errors never alert).
  if(upstream.status===201){let submission={};try{submission=JSON.parse(body)}catch{}await sendIntakeAlert(submission,env,fetcher)}
  return Response.json(data,{status:upstream.status,headers});
 }catch{return Response.json({error:'Your message was not saved. Please try again or email the church office.'},{status:503,headers})}
}
