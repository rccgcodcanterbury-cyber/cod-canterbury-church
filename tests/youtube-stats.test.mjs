import test from 'node:test';
import assert from 'node:assert/strict';
import {youtubeStats} from '../lib/youtube-stats.mjs';
import {CHANNEL_ID} from '../lib/youtube-feed.mjs';

test('channel statistics require server configuration and stay tied to the church channel',async()=>{
 const request=new Request('https://example.test/api/youtube-stats');
 assert.equal((await youtubeStats(request,undefined)).status,503);
 const success=await youtubeStats(request,'private-test-key',async url=>{
  assert.equal(url.searchParams.get('id'),CHANNEL_ID);
  assert.equal(url.searchParams.get('key'),'private-test-key');
  return Response.json({items:[{id:CHANNEL_ID,statistics:{viewCount:'1234',subscriberCount:'321',videoCount:'42'}}]});
 });
 const {views,subscribers,videos,connected}=await success.json();
 assert.deepEqual({views,subscribers,videos,connected},{views:1234,subscribers:321,videos:42,connected:true});
 const wrong=await youtubeStats(request,'private-test-key',async()=>Response.json({items:[{id:'wrong',statistics:{viewCount:'999'}}]}));
 assert.equal(wrong.status,503);
});
