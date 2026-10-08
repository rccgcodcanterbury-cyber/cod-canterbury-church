export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const field=(v,max)=>typeof v==='string'&&v.trim().length<=max?v.trim():'';
const yes=v=>v===true||v==='true';
export function validateIntake(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Please check the form and try again.');
  if(input.website)return {spam:true};
  const full_name=field(input.full_name,120),email=field(input.email,254).toLowerCase();
  if(!UUID.test(input.submission_key||''))throw new Error('Please refresh the page and try again.');
  if(!full_name||!/^\S+@\S+\.\S+$/.test(email))throw new Error('Please provide your name and a valid email address.');
  const record={submission_key:input.submission_key,full_name,email};
  if(input.kind==='contact'){
    const topic=['general','visit','prayer','ministry','building'].includes(input.topic)?input.topic:null;
    const message=field(input.message,5000);
    if(!topic||message.length<5)throw new Error('Please choose a topic and include your message.');
    if(!yes(input.contact_consent))throw new Error('Please agree that the church team may use these details to respond.');
    Object.assign(record,{topic,message,contact_consent:true,source:field(input.source,80)||'main'});
    return {table:'contact_enquiries',record};
  }
  record.phone=field(input.phone,40)||null;
  if(input.kind==='testimony'){
    const testimony=field(input.testimony,8000);
    if(testimony.length<20)throw new Error('Please include a little more detail in your testimony.');
    Object.assign(record,{testimony,online_sharing_consent:yes(input.online_sharing_consent),name_sharing_consent:yes(input.name_sharing_consent)});
    return {table:'testimonies',record};
  }
  if(input.kind==='first_time_visitor'){
    const party=Number(input.party_size||1),preferred=input.preferred_contact;
    const date=field(input.visit_date,10),contact_consent=yes(input.contact_consent);
    if(!['email','phone','none'].includes(preferred)||!Number.isInteger(party)||party<1||party>30)throw new Error('Please check your group size and contact preference.');
    if(preferred!=='none'&&!contact_consent)throw new Error('Please give permission for the church team to follow up.');
    if(preferred==='phone'&&!record.phone)throw new Error('Please include a phone number or choose email.');
    if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date))throw new Error('Please check the visit date.');
    Object.assign(record,{visit_date:date||null,party_size:party,preferred_contact:preferred,contact_consent:preferred==='none'?false:contact_consent});
    return {table:'first_time_visitors',record};
  }
  throw new Error('This submission type is not supported.');
}
