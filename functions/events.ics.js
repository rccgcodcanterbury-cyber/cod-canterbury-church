import {getEvents,calendar} from '../lib/events.mjs';
export async function onRequest({request}){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 return new Response(calendar((await getEvents()).events),{headers:{'content-type':'text/calendar; charset=utf-8','content-disposition':'attachment; filename="canterbury-events.ics"','cache-control':'public, max-age=300'}});
}
