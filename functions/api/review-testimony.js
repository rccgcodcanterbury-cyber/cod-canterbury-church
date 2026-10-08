import connection from '../../content/connection.json' with {type:'json'};
const json=(status,body)=>Response.json(body,{status,headers:{'cache-control':'no-store'}});
const allowed=new Set(['submitted','in_review','changes_requested','approved','declined','scheduled','delivered','shared']);

export async function onRequest({request,env}){
  const event={httpMethod:request.method,headers:Object.fromEntries(request.headers),body:request.method==='POST'?await request.text():''};
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  const token=(event.headers?.authorization||event.headers?.Authorization||'').replace(/^Bearer\s+/i,'');
  const key=connection.publishableKey;
  const url=connection.url;
  if(!token||!key||!url)return json(401,{error:'Sign in to the church office first.'});
  let input;
  try{input=JSON.parse(event.body||'{}')}catch{return json(400,{error:'Invalid review request.'})}
  if(!/^[0-9a-f-]{36}$/i.test(input.testimony_id||'')||!/^[0-9a-f-]{36}$/i.test(input.review_key||'')||!allowed.has(input.status))return json(400,{error:'Invalid review update.'});
  const apiHeaders={apikey:key,authorization:`Bearer ${token}`,'content-type':'application/json'};
  let reviewer;
  try{
    const response=await fetch(`${url}/auth/v1/user`,{headers:apiHeaders});
    if(!response.ok)return json(401,{error:'Your sign-in has expired. Sign in again.'});
  reviewer=await response.json();
  }catch{return json(503,{error:'Could not verify your church office sign-in.'})}
  const action=input.status==='in_review'?'review_started':input.status==='submitted'?'reopened':input.status;
  try{
    const save=await fetch(`${url}/rest/v1/rpc/record_testimony_review`,{method:'POST',headers:apiHeaders,body:JSON.stringify({p_testimony_id:input.testimony_id,p_review_key:input.review_key,p_status:input.status,p_action:action,p_member_message:String(input.member_message||'').trim().slice(0,3000)||null,p_proposed_wording:String(input.proposed_wording||'').trim().slice(0,8000)||null,p_member_confirmed_wording:input.member_confirmed_wording===true})});
    if(!save.ok)return json(save.status===401?401:403,{error:'Could not save this review. Check your church staff role and try again.'});
  }catch{return json(503,{error:'The review was not saved. Please try again.'})}

  let member;
  try{
    const response=await fetch(`${url}/rest/v1/testimonies?id=eq.${encodeURIComponent(input.testimony_id)}&select=id,email,full_name,online_sharing_consent,name_sharing_consent`,{headers:apiHeaders});
    const rows=await response.json();member=rows?.[0];
  }catch{/* The status has already been saved; email notification may be unavailable. */}
  if(!member)return json(200,{ok:true,notificationSent:false});

  const resendKey=env.RESEND_API_KEY;
  const from=env.RESEND_FROM;
  if(!resendKey||!from)return json(200,{ok:true,notificationSent:false});
  const titles={
    in_review:'Your testimony is being reviewed',
    submitted:'Your testimony review has been reopened',
    changes_requested:'A note about your testimony submission',
    approved:'Your testimony has been approved for sharing at a service',
    declined:'An update on your testimony submission',
    scheduled:'Your testimony has been scheduled',
    delivered:'A testimony update from the church team',
    shared:'An update about your testimony'
  };
  const intro={
    in_review:'The church team has started reviewing your testimony. We will contact you when there is an update.',
    submitted:'The church team has reopened the review of your testimony.',
    changes_requested:'The church team has reviewed your testimony and would like to discuss a change before it can be shared at a service.',
    approved:'The church team has approved your testimony for sharing at a service. This approval does not automatically publish it online.',
    declined:'The church team has reviewed your testimony and is unable to approve it for sharing at a service at this time.',
    scheduled:'The church team has scheduled your testimony for sharing at a service.',
    delivered:'The church team has marked the service testimony process as complete.',
    shared:'The church team has recorded an online sharing update for your testimony.'
  };
  let notificationSent=false;
  try{
    const proposed=String(input.proposed_wording||'').trim().slice(0,8000);
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${resendKey}`,'content-type':'application/json','Idempotency-Key':`cod-review-${input.review_key}`},body:JSON.stringify({from,to:[member.email],subject:titles[input.status]||'An update about your testimony',text:`Hello ${member.full_name},\n\n${intro[input.status]||'The church team has updated the status of your submission.'}${input.member_message?`\n\nA note from the church team:\n${String(input.member_message).trim().slice(0,3000)}`:''}${proposed?`\n\nProposed wording for you to review:\n\n${proposed}\n\nPlease reply to confirm or suggest changes. This wording will not be shared online unless you have also given online sharing permission.`:''}\n\nIf you have a question, reply to this email or contact rccgcodcanterbury@gmail.com.\n\nRCCG City of David Canterbury`})});
    notificationSent=response.ok;
  }catch{/* Status and audit history are already saved. */}
  return json(200,{ok:true,notificationSent});
}
