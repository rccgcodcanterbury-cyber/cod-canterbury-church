import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTrack,siteFor,deviceFor,referrerHost} from '../lib/track.mjs';
import {onRequest} from '../functions/api/track.js';
import {handleSiteEvent} from '../supabase/functions/site-events/handler.mjs';

const iphone='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
const mac='Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36';

test('events are tied to the right church site and stripped of query strings',()=>{
 assert.equal(siteFor('youth.rccgcodcanterbury.com','/'),'youth');
 assert.equal(siteFor('audacious.rccgcodcanterbury.com','/gallery/'),'audacious');
 assert.equal(siteFor('cod-canterbury-church.pages.dev','/youth/gallery/'),'youth');
 assert.equal(siteFor('rccgcodcanterbury.com','/give/'),'main');
 const {record}=parseTrack({event:'pageview',host:'cod-canterbury-church.pages.dev',path:'/youth/gallery/?utm=x#top',referrer:'https://www.instagram.com/p/1'},{userAgent:iphone,country:'gb'});
 assert.deepEqual(record,{site:'youth',path:'/gallery/',event:'pageview',label:null,referrer_host:'instagram.com',device:'mobile',country:'GB'});
});

test('bots, unknown events and bad paths are not counted',()=>{
 assert.equal(parseTrack({event:'pageview',path:'/'},{userAgent:'Googlebot/2.1'}).skip,true);
 assert.equal(parseTrack({event:'pageview',path:'/'},{userAgent:''}).skip,true);
 assert.equal(parseTrack({event:'hack',path:'/'},{userAgent:mac}).skip,true);
 assert.equal(parseTrack({event:'pageview',path:'https://evil.test/'},{userAgent:mac}).skip,true);
});

test('own sites are not reported as referrers and devices are recognised',()=>{
 assert.equal(referrerHost('https://audacious.rccgcodcanterbury.com/'),null);
 assert.equal(referrerHost('https://l.facebook.com/l.php'),'facebook.com');
 assert.equal(referrerHost('android-app://com.google'),null);
 assert.equal(deviceFor(mac),'desktop');
 assert.equal(deviceFor('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'),'tablet');
});

test('click labels are kept and page views carry no label',()=>{
 assert.equal(parseTrack({event:'give_click',label:'natwest',path:'/give/'},{userAgent:mac}).record.label,'natwest');
 assert.equal(parseTrack({event:'pageview',label:'ignored',path:'/'},{userAgent:mac}).record.label,null);
});

test('the website collector forwards real events and always answers quickly',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return new Response(null,{status:204})};
 const request=(body,headers={})=>new Request('https://rccgcodcanterbury.com/api/track',{method:'POST',headers:{'user-agent':mac,'x-nf-client-connection-ip':'203.0.113.5','x-country':'GB',...headers},body:JSON.stringify(body)});
 assert.equal((await onRequest({request:request({event:'pageview',path:'/'})},fetcher)).status,204);
 assert.equal(calls.length,1);
 assert.match(calls[0].url,/\/functions\/v1\/site-events$/);
 assert.equal(calls[0].body.ip,'203.0.113.5');
 assert.equal((await onRequest({request:request({event:'pageview',path:'/'},{'user-agent':'bingbot'})},fetcher)).status,204);
 assert.equal(calls.length,1,'bots are dropped before reaching Supabase');
 assert.equal((await onRequest({request:request({event:'pageview',path:'/'},{origin:'https://evil.test'})},fetcher)).status,403);
 const failing=async()=>{throw new Error('offline')};
 assert.equal((await onRequest({request:request({event:'pageview',path:'/'})},failing)).status,204);
});

test('the Supabase function passes a validated event to the database recorder',async()=>{
 let saved;
 const fetcher=async(url,options)=>{saved={url,body:JSON.parse(options.body)};return new Response(null,{status:204})};
 const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'service-key'};
 const request=new Request('https://project.supabase.co/functions/v1/site-events',{method:'POST',body:JSON.stringify({event:{event:'sermon_play',label:'VZtbXlE1h3I',path:'/',host:'rccgcodcanterbury.com'},ip:'203.0.113.5',user_agent:mac,country:'GB'})});
 assert.equal((await handleSiteEvent(request,env,fetcher)).status,204);
 assert.equal(saved.url,'https://project.supabase.co/rest/v1/rpc/record_site_event');
 assert.deepEqual(saved.body.p_event,{site:'main',path:'/',event:'sermon_play',label:'VZtbXlE1h3I',referrer_host:null,device:'desktop',country:'GB'});
 assert.equal(saved.body.p_ip,'203.0.113.5');
 assert.equal((await handleSiteEvent(request,{},fetcher)).status,503);
});
