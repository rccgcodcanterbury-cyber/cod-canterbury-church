import {getEvents} from '../../lib/events.mjs';
export async function onRequest({request}){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 return Response.json(await getEvents(),{headers:{'cache-control':'public, max-age=300'}});
}
