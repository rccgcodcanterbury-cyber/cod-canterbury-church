import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../netlify/functions/review-testimony.mjs';

const id='11111111-1111-4111-8111-111111111111';
const key='22222222-2222-4222-8222-222222222222';
const event=()=>({httpMethod:'POST',rawUrl:'https://admin.rccgcodcanterbury.com/api/review-testimony',headers:{authorization:'Bearer staff-token','content-type':'application/json'},body:JSON.stringify({testimony_id:id,review_key:key,status:'approved',member_message:'Thank you'})});
const read=response=>JSON.parse(Buffer.from(response.body,'base64').toString());

function stubFetch(calls){
 return async(url,options={})=>{
  calls.push(String(url));
  if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'staff'});
  if(String(url).includes('/rpc/record_testimony_review'))return Response.json(null);
  if(String(url).includes('/rest/v1/testimonies'))return Response.json([{id,email:'member@example.test',full_name:'Member'}]);
  if(String(url)==='https://api.resend.com/emails'){assert.equal(options.headers['Idempotency-Key'],`cod-review-${key}`);assert.equal(JSON.parse(options.body).reply_to,'rccgcodcanterbury@gmail.com');return Response.json({id:'email'})}
  throw new Error(`Unexpected request ${url}`);
 };
}

test('Netlify testimony review saves and emails the member when Resend is configured',async t=>{
 const calls=[];t.mock.method(globalThis,'fetch',stubFetch(calls));
 process.env.RESEND_API_KEY='test-key';process.env.RESEND_FROM='Church <office@example.test>';
 t.after(()=>{delete process.env.RESEND_API_KEY;delete process.env.RESEND_FROM});
 const response=await handler(event());
 assert.equal(response.statusCode,200);
 assert.deepEqual(read(response),{ok:true,notificationSent:true});
 assert.ok(calls.includes('https://api.resend.com/emails'));
});

test('Netlify testimony review still succeeds without email settings',async t=>{
 const calls=[];t.mock.method(globalThis,'fetch',stubFetch(calls));
 const response=await handler(event());
 assert.equal(response.statusCode,200);
 assert.deepEqual(read(response),{ok:true,notificationSent:false});
 assert.ok(!calls.includes('https://api.resend.com/emails'));
});
