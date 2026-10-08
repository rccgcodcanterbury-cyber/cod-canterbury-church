import fallback from '../content/events.json' with {type:'json'};
export function londonDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=name=>parts.find(p=>p.type===name).value;
 return `${part('year')}-${part('month')}-${part('day')}`;
}
export async function getEvents(fetcher=fetch,now=new Date()){
 const today=londonDate(now);
 let events=fallback,source='saved';
 try{
  const response=await fetcher(`https://codcanterburychurch.org/wp-json/tribe/events/v1/events?per_page=50&start_date=${today}`,{signal:AbortSignal.timeout(8000),headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Calendar unavailable');
  const data=await response.json();
  if(!Array.isArray(data.events))throw new Error('Invalid calendar');
  const valid=data.events.filter(x=>/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(x.start_date)&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(x.end_date)&&typeof x.title==='string'&&Number.isInteger(x.id)&&x.id>0&&x.timezone==='Europe/London').map(x=>({id:x.id,title:x.title.slice(0,300),start_date:x.start_date,end_date:x.end_date,url:`https://codcanterburychurch.org/events/`}));
  if(valid.length){events=valid;source='live'}
 }catch{}
 return {events:events.filter(x=>x.start_date.slice(0,10)>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date)),source};
}
export function calendar(events){
 const esc=value=>String(value).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;').replaceAll('\r','');
 const date=value=>value.replaceAll('-','').replaceAll(':','').replace(' ','T');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//City of David Canterbury//Church Calendar//EN','CALSCALE:GREGORIAN',...events.flatMap(event=>['BEGIN:VEVENT',`UID:cod-${event.id}@codcanterburychurch.org`,`DTSTART;TZID=Europe/London:${date(event.start_date)}`,`DTEND;TZID=Europe/London:${date(event.end_date)}`,`SUMMARY:${esc(event.title)}`,'LOCATION:St. John’s Church of England Primary School\\, Canterbury','END:VEVENT']),'END:VCALENDAR'].join('\r\n')+'\r\n';
}
