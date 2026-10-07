const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';

function readBody(event){
  const body=event.isBase64Encoded?Buffer.from(event.body||'','base64').toString('utf8'):(event.body||'');
  const type=event.headers?.['content-type']||event.headers?.['Content-Type']||'';
  if(type.includes('application/json'))return JSON.parse(body||'{}');
  return Object.fromEntries(new URLSearchParams(body));
}

export default async function handler(event){
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  if(process.env.INTAKE_ENABLED!=='true'||process.env.PRIVACY_NOTICE_APPROVED!=='true'||process.env.INTAKE_ABUSE_CONTROL_APPROVED!=='true'||!process.env.PRIVACY_RETENTION_TEXT)return json(503,{error:'Secure submissions are not available yet. Please email the church office.'});
  let input;
  try{input=readBody(event)}catch{return json(400,{error:'Please check the form and try again.'})}
  if(text(input.website,200))return json(202,{ok:true});
  const kind=input.kind==='testimony'?'testimony':input.kind==='first_time_visitor'?'first_time_visitor':null;
  const submissionKey=text(input.submission_key,36);
  if(!kind||!/^[0-9a-f-]{36}$/i.test(submissionKey))return json(400,{error:'The form could not be validated. Please refresh the page and try again.'});
  const fullName=text(input.full_name,120);
  const email=text(input.email,254).toLowerCase();
  const phone=text(input.phone,40)||null;
  if(fullName.length<1||!/^\S+@\S+\.\S+$/.test(email))return json(400,{error:'Please provide your name and a valid email address.'});
  const record={submission_key:submissionKey,full_name:fullName,email,phone};
  let table;
  if(kind==='testimony'){
    const testimony=text(input.testimony,8000);
    if(testimony.length<20)return json(400,{error:'Please include a little more detail in your testimony.'});
    record.testimony=testimony;
    record.online_sharing_consent=input.online_sharing_consent===true||input.online_sharing_consent==='true';
    record.name_sharing_consent=input.name_sharing_consent===true||input.name_sharing_consent==='true';
    table='testimonies';
  }else{
    const date=text(input.visit_date,10);
    const party=Number(input.party_size||1);
    const preferred=['email','phone','none'].includes(input.preferred_contact)?input.preferred_contact:'email';
    const contactConsent=input.contact_consent===true||input.contact_consent==='true';
    if(!Number.isInteger(party)||party<1||party>30||preferred!=='none'&&!contactConsent)return json(400,{error:'Please check the party size and contact permission.'});
    if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))return json(400,{error:'Please check the visit date.'});
    record.visit_date=date||null;record.party_size=party;record.preferred_contact=preferred;record.contact_consent=contactConsent;
    table='first_time_visitors';
  }
  const supabaseUrl=process.env.SUPABASE_URL;
  const publishableKey=process.env.SUPABASE_PUBLISHABLE_KEY;
  const resendKey=process.env.RESEND_API_KEY;
  const notificationEmail=process.env.INTAKE_NOTIFICATION_EMAIL;
  const resendFrom=process.env.RESEND_FROM;
  if(!supabaseUrl||!publishableKey||!resendKey||!notificationEmail||!resendFrom)return json(503,{error:'Secure submissions are not available yet. Please email the church office.'});

  let saved;
  try{
    const response=await fetch(`${supabaseUrl}/rest/v1/${table}?select=id`,{method:'POST',headers:{apikey:publishableKey,authorization:`Bearer ${publishableKey}`,'content-type':'application/json',prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(record)});
    if(!response.ok)return json(503,{error:'We could not save your submission just now. Please try again or email the church office.'});
    saved=await response.json();
  }catch{return json(503,{error:'We could not reach the church submission system. Please try again later.'})}
  if(!saved.length)return json(200,{ok:true,duplicate:true});

  const label=kind==='testimony'?'testimony review':'first-time visit follow-up';
  let alertSent=false;
  try{
    const emailResponse=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${resendKey}`,'content-type':'application/json','Idempotency-Key':`cod-intake-${submissionKey}`},body:JSON.stringify({from:resendFrom,to:[notificationEmail],subject:`New ${label} submission`,text:`A new ${label} submission is ready for the church office. Sign in to the private dashboard to review it: https://rccgcodcanterbury.com/admin/\n\nReference: ${saved[0].id}\n\nThe submission text and contact details are intentionally not included in this notification.`})});
    alertSent=emailResponse.ok;
  }catch{/* The database record remains safely available in the dashboard. */}
  return json(201,{ok:true,alertSent});
}
