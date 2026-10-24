import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest,sendIntakeAlert} from '../functions/api/intake.js';

const prayer={kind:'contact',topic:'prayer',submission_key:'123e4567-e89b-42d3-a456-426614174000',full_name:'Private Person',email:'private@example.org',message:'Something personal',contact_consent:true};
const env={RESEND_API_KEY:'test-key',RESEND_FROM:'City of David <office@rccgcodcanterbury.com>'};
const post=body=>new Request('https://rccgcodcanterbury.com/api/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});

function provider(status){
 const emails=[];
 const fetcher=async(url,options)=>{
  if(String(url).includes('/functions/v1/church-intake'))return Response.json(status===201?{ok:true}:{error:'x'},{status});
  if(String(url)==='https://api.resend.com/emails'){emails.push({headers:options.headers,body:JSON.parse(options.body)});return Response.json({id:'email'})}
  throw new Error(`Unexpected request ${url}`);
 };
 return {fetcher,emails};
}

test('a newly saved submission alerts the church office without personal details',async()=>{
 const {fetcher,emails}=provider(201);
 const response=await onRequest({request:post(prayer),env},fetcher);
 assert.equal(response.status,201);
 assert.equal(emails.length,1);
 const [email]=emails;
 assert.deepEqual(email.body.to,['rccgcodcanterbury@gmail.com']);
 assert.match(email.body.subject,/^New prayer request/);
 assert.match(email.body.text,/admin\.rccgcodcanterbury\.com/);
 for(const secret of ['Private Person','private@example.org','Something personal'])assert.ok(!JSON.stringify(email.body).includes(secret));
 assert.equal(email.headers['Idempotency-Key'],`cod-alert-${prayer.submission_key}`);
});

test('spam, failures and missing email settings send no alert',async()=>{
 for(const status of [202,429,503]){
  const {fetcher,emails}=provider(status);
  await onRequest({request:post(prayer),env},fetcher);
  assert.equal(emails.length,0,`status ${status} must not alert`);
 }
 const {fetcher,emails}=provider(201);
 assert.equal((await onRequest({request:post(prayer),env:{}},fetcher)).status,201);
 assert.equal(emails.length,0);
});

test('each form type has its own subject and recipients can be changed',async()=>{
 const {fetcher,emails}=provider(201);
 const custom={...env,ALERT_EMAIL:'pastor@example.org, office@example.org'};
 for(const kind of ['contact','first_time_visitor','testimony'])await sendIntakeAlert({kind,topic:'general'},custom,fetcher);
 assert.deepEqual(emails.map(email=>email.body.subject.split(' – ')[0]),['New enquiry','New first-visit form','New testimony']);
 assert.deepEqual(emails[0].body.to,['pastor@example.org','office@example.org']);
 assert.equal(await sendIntakeAlert({kind:'unknown'},env,fetcher),false);
});
