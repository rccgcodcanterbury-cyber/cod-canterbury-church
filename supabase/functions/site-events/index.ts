import {handleSiteEvent} from './handler.mjs';
Deno.serve((request:Request)=>handleSiteEvent(request,{
  SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
}));
