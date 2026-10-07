import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/intake.mjs';

const envKeys=['INTAKE_ENABLED','PRIVACY_NOTICE_APPROVED','INTAKE_ABUSE_CONTROL_APPROVED','PRIVACY_RETENTION_TEXT','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','RESEND_API_KEY','INTAKE_NOTIFICATION_EMAIL','RESEND_FROM'];
const originalEnv=Object.fromEntries(envKeys.map(key=>[key,process.env[key]]));
const originalFetch=globalThis.fetch;
function enableIntake(){
  Object.assign(process.env,{INTAKE_ENABLED:'true',PRIVACY_NOTICE_APPROVED:'true',INTAKE_ABUSE_CONTROL_APPROVED:'true',PRIVACY_RETENTION_TEXT:'1 month after a case is closed',SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'publishable-test-key',RESEND_API_KEY:'server-test-key',INTAKE_NOTIFICATION_EMAIL:'office@example.org',RESEND_FROM:'Church <office@example.org>'});
}
function event(payload){return {httpMethod:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}}
test.afterEach(()=>{
  for(const key of envKeys){if(originalEnv[key]===undefined)delete process.env[key];else process.env[key]=originalEnv[key]}
  globalThis.fetch=originalFetch;
});

test('intake stays unavailable until all church launch gates are enabled',async()=>{
  for(const key of envKeys)delete process.env[key];
  const result=await handler(event({kind:'testimony'}));
  assert.equal(result.statusCode,503);
});

test('intake remains closed when anti-spam protection is not approved',async()=>{
  enableIntake();
  delete process.env.INTAKE_ABUSE_CONTROL_APPROVED;
  const result=await handler(event({kind:'testimony'}));
  assert.equal(result.statusCode,503);
});

test('first visit requires explicit permission before follow-up',async()=>{
  enableIntake();
  let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('should not call providers')};
  const result=await handler(event({kind:'first_time_visitor',submission_key:'123e4567-e89b-12d3-a456-426614174000',full_name:'Visitor',email:'person@example.org',preferred_contact:'email',contact_consent:false}));
  assert.equal(result.statusCode,400);
  assert.equal(requests,0);
});

test('intake alert omits submission text and a retry does not send a duplicate alert',async()=>{
  enableIntake();let insertCount=0;const sent=[];
  globalThis.fetch=async(url,options)=>{
    if(String(url).includes('/rest/v1/')){
      insertCount++;
      return new Response(JSON.stringify(insertCount===1?[{id:'private-row-id'}]:[]),{status:201,headers:{'content-type':'application/json'}});
    }
    sent.push(JSON.parse(options.body));
    return new Response('{}',{status:200,headers:{'content-type':'application/json'}});
  };
  const payload={kind:'testimony',submission_key:'123e4567-e89b-12d3-a456-426614174000',full_name:'Person Name',email:'person@example.org',testimony:'A private account of what happened to me and my family.',online_sharing_consent:false,name_sharing_consent:false};
  const first=await handler(event(payload));const retry=await handler(event(payload));
  assert.equal(first.statusCode,201);assert.equal(retry.statusCode,200);
  assert.equal(sent.length,1);
  assert.doesNotMatch(sent[0].text,/Person Name|person@example.org|private account/);
});
