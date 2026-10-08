import fallback from '../../content/sermons.json' with {type:'json'};
import {FEED_URL,CHANNEL_ID,parseFeed} from '../../lib/youtube-feed.mjs';
export async function onRequest({request}){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:{Allow:'GET'}});
 let videos=fallback,source='saved';
 try{
  const upstream=await fetch(FEED_URL,{headers:{Accept:'application/atom+xml'},signal:AbortSignal.timeout(6000)});
  if(!upstream.ok)throw new Error('Feed unavailable');
  videos=parseFeed(await upstream.text());source='youtube';
 }catch{}
 return Response.json({videos,source,channelId:CHANNEL_ID},{headers:{'cache-control':`public, max-age=${source==='youtube'?300:60}`,'x-content-type-options':'nosniff'}});
}
