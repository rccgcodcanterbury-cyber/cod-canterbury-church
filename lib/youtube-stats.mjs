import {CHANNEL_ID} from './youtube-feed.mjs';

export async function youtubeStats(request, key, fetcher=fetch){
  if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:{Allow:'GET'}});
  if(!key)return Response.json({connected:false},{status:503,headers:{'cache-control':'no-store'}});
  const url=new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part','statistics');
  url.searchParams.set('id',CHANNEL_ID);
  url.searchParams.set('key',key);
  try{
    const response=await fetcher(url,{signal:AbortSignal.timeout(6000)});
    if(!response.ok)throw new Error('YouTube unavailable');
    const channel=(await response.json()).items?.[0];
    if(channel?.id!==CHANNEL_ID)throw new Error('Unexpected channel');
    const stats=channel.statistics||{};
    return Response.json({connected:true,views:Number(stats.viewCount)||0,subscribers:stats.hiddenSubscriberCount?null:Number(stats.subscriberCount)||0,videos:Number(stats.videoCount)||0,updatedAt:new Date().toISOString()},{headers:{'cache-control':'public, max-age=900','x-content-type-options':'nosniff'}});
  }catch{return Response.json({connected:false},{status:503,headers:{'cache-control':'no-store'}})}
}
