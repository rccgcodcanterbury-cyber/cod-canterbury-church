import test from 'node:test';
import assert from 'node:assert/strict';
import route from '../netlify/edge-functions/ministry-router.mjs';

test('admin hostname opens the office while leaving its assets and API paths intact',async()=>{
 const rewrites=[];
 const context={rewrite:url=>{rewrites.push(url.pathname);return new Response('rewritten')}};
 await route(new Request('https://admin.rccgcodcanterbury.com/'),context);
 assert.deepEqual(rewrites,['/admin/']);
 assert.equal(await route(new Request('https://admin.rccgcodcanterbury.com/admin/admin.bundle.js'),context),undefined);
 assert.equal(await route(new Request('https://admin.rccgcodcanterbury.com/api/youtube-feed'),context),undefined);
 const redirect=await route(new Request('https://admin.rccgcodcanterbury.com/visit/'),context);
 assert.equal(redirect.headers.get('location'),'https://rccgcodcanterbury.com/visit/');
});
