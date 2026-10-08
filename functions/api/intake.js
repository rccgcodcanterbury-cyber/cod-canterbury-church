import connection from '../../content/connection.json' with {type:'json'};
export async function onRequest({request}){
 const headers={'content-type':'application/json','cache-control':'no-store'};
 if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers});
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Please use the church website form.'},{status:403,headers});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Please use the church website form.'},{status:415,headers});
 if(Number(request.headers.get('content-length'))>20000)return Response.json({error:'Your message is too long.'},{status:413,headers});
 const body=await request.text();
 if(new TextEncoder().encode(body).length>20000)return Response.json({error:'Your message is too long.'},{status:413,headers});
 try{
  const upstream=await fetch(`${connection.url}/functions/v1/church-intake`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${connection.anonKey}`,apikey:connection.anonKey},body,signal:AbortSignal.timeout(12000)});
  const data=await upstream.json();
  return Response.json(data,{status:upstream.status,headers});
 }catch{return Response.json({error:'Your message was not saved. Please try again or email the church office.'},{status:503,headers})}
}
