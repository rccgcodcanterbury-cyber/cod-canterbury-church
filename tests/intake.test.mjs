import test from 'node:test';
import assert from 'node:assert/strict';
import {validateIntake} from '../lib/intake.mjs';
import {handleIntake} from '../supabase/functions/church-intake/handler.mjs';
const payload={kind:'contact',submission_key:'123e4567-e89b-42d3-a456-426614174000',full_name:'Test person',email:'person@example.org',topic:'prayer',message:'Please pray for our family.',contact_consent:true};
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key'};
const request=data=>new Request('https://example.test/intake',{method:'POST',headers:{'content-type':'application/json','origin':'https://cod-canterbury-church.pages.dev'},body:JSON.stringify(data)});
test('Invalid or unconsented enquiries never reach storage',async()=>{
 for(const input of [{...payload,contact_consent:false},{...payload,email:'bad'},{...payload,topic:'admin'},{...payload,submission_key:'bad'},{...payload,message:'a'.repeat(5001)}]){
  const response=await handleIntake(request(input),env,()=>{throw new Error('Provider must not be called')});assert.equal(response.status,400);
 }
});
test('Validated records only contain allowed public fields',()=>{
 const {record}=validateIntake({...payload,status:'closed',id:'injected',staff_role:'admin'});
 assert.equal(record.topic,'prayer');assert.equal(record.status,undefined);assert.equal(record.staff_role,undefined);
 assert.throws(()=>validateIntake({...payload,kind:'first_time_visitor',preferred_contact:'phone',contact_consent:true,visit_date:'2026-02-31'}));
});
test('Rate limits and database errors never show success',async()=>{
 let writes=0;
 const limited=await handleIntake(request(payload),env,async()=>new Response('false'));assert.equal(limited.status,429);
 const failed=await handleIntake(request(payload),env,async url=>String(url).includes('/rpc/')?new Response('true'):(writes++,new Response('{}',{status:503})));
 assert.equal(failed.status,503);assert.equal(writes,1);
});
test('Successful saves are idempotent and disclose no private record',async()=>{
 let body;
 const response=await handleIntake(request(payload),env,async(url,options)=>{
  if(String(url).includes('/rpc/'))return new Response('true');
  assert.match(options.headers.prefer,/ignore-duplicates/);body=JSON.parse(options.body);return new Response(null,{status:201});
 });
 assert.equal(response.status,201);assert.deepEqual(await response.json(),{ok:true});assert.equal(body.message,payload.message);
});
test('Foreign origins and oversized bodies are rejected',async()=>{
 const foreign=new Request('https://example.test/intake',{method:'POST',headers:{origin:'https://unrelated.test','content-type':'application/json'},body:'{}'});
 assert.equal((await handleIntake(foreign,env)).status,403);
 assert.equal((await handleIntake(request({...payload,message:'a'.repeat(25000)}),env)).status,413);
});
