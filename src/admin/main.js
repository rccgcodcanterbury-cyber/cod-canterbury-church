import { createClient } from '@supabase/supabase-js';

const config = window.COD_ADMIN_CONFIG || {};
const invited=/type=(invite|recovery)/.test(location.hash);
const passwordPanel=document.querySelector('#password-panel');
const loginPanel = document.querySelector('#login-panel');
const dashboard = document.querySelector('#dashboard');
const message = document.querySelector('#login-message');
const note = document.querySelector('#dashboard-note');
const list = document.querySelector('#queue-items');
const detail = document.querySelector('#record-panel');
const filter = document.querySelector('#queue-filter');
let supabase;
let queue = 'contacts';
const queues={contacts:{table:'contact_enquiries',count:'#contact-count'},visitors:{table:'first_time_visitors',count:'#visitor-count'},testimonies:{table:'testimonies',count:'#testimony-count'}};
let selected = null;
let staffRole = null;
const statuses = {
  contacts: ['new','in_progress','responded','closed'],
  testimonies: ['submitted','in_review','changes_requested','approved','declined','scheduled','delivered','shared'],
  visitors: ['new','contacted','connected','closed']
};

const metricLabels={contacts:['Enquiries','People asking for help'],visitors:['First visits','Visit plans submitted'],testimonies:['Testimonies','Stories shared with the team'],open:['Needs follow-up','Still needing care']};
function metricCard(key,value){const [label,detail]=metricLabels[key];return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon" aria-hidden="true">${key==='contacts'?'↗':key==='visitors'?'⌂':key==='testimonies'?'✦':'○'}</span></div><strong>${value}</strong><small>${detail}</small></article>`}
function dayKey(date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date))}
function renderTrend(rows){const end=new Date();const points=[];for(let i=29;i>=0;i--){const date=new Date(end);date.setDate(end.getDate()-i);const key=dayKey(date);points.push({key,label:new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'Europe/London'}).format(date),value:rows.filter(row=>dayKey(row.created_at)===key).length})}const max=Math.max(...points.map(point=>point.value),1);const width=720,height=220,pad=24;const coords=points.map((point,index)=>`${pad+(index*(width-pad*2)/(points.length-1))},${height-pad-(point.value/max)*(height-pad*2)}`).join(' ');document.querySelector('#submissions-chart').innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="New submissions over the last 30 days"><defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b69a64" stop-opacity=".28"/><stop offset="1" stop-color="#b69a64" stop-opacity="0"/></linearGradient></defs><polyline class="chart-area" points="${pad},${height-pad} ${coords} ${width-pad},${height-pad}"/><polyline class="chart-line" points="${coords}"/>${points.map((point,index)=>point.value?`<circle cx="${pad+(index*(width-pad*2)/(points.length-1))}" cy="${height-pad-(point.value/max)*(height-pad*2)}" r="4"><title>${point.label}: ${point.value}</title></circle>`:'').join('')}</svg><div class="chart-labels"><span>${points[0].label}</span><span>${points[14].label}</span><span>${points[29].label}</span></div>`}
function renderPipeline(rows){const counts=rows.reduce((all,row)=>(all[row.status]=(all[row.status]||0)+1,all),{});const labels=[['new','New'],['in_progress','In progress'],['responded','Responded'],['closed','Closed']];document.querySelector('#pipeline-chart').innerHTML=labels.map(([key,label])=>`<div class="pipeline-row"><div><span>${label}</span><strong>${counts[key]||0}</strong></div><div class="pipeline-track"><i style="width:${rows.length?Math.max(4,(counts[key]||0)/rows.length*100):0}%"></i></div></div>`).join('')||'<p class="record-meta">No enquiry data yet.</p>'}
async function loadOverview(){if(!supabase)return;const [contacts,visitors,testimonies]=await Promise.all([supabase.from('contact_enquiries').select('created_at,status').order('created_at',{ascending:false}).limit(500),supabase.from('first_time_visitors').select('created_at,status').order('created_at',{ascending:false}).limit(500),supabase.from('testimonies').select('created_at,status').order('created_at',{ascending:false}).limit(500)]);if(contacts.error||visitors.error||testimonies.error){document.querySelector('#metric-grid').innerHTML='<p class="form-message" data-error="true">Analytics could not be loaded. Your queues remain available.</p>';return}const all=[...contacts.data,...visitors.data,...testimonies.data];const open=[...contacts.data,...visitors.data].filter(row=>!['closed','responded','connected'].includes(row.status));document.querySelector('#metric-grid').innerHTML=metricCard('contacts',contacts.data.length)+metricCard('visitors',visitors.data.length)+metricCard('testimonies',testimonies.data.length)+metricCard('open',open.length);renderTrend(all);renderPipeline(contacts.data);try{const response=await fetch('/api/youtube-feed');const feed=await response.json();const videos=Array.isArray(feed.videos)?feed.videos:[];document.querySelector('#youtube-insight').innerHTML=`<div class="youtube-summary"><strong>${videos.length}</strong><span>recent videos in the live feed</span></div><div class="video-list">${videos.slice(0,3).map(video=>`<a href="https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}" target="_blank" rel="noreferrer"><span>${safe(video.title)}</span><small>${dateLabel(video.published)}</small></a>`).join('')}</div>`}catch{document.querySelector('#youtube-insight').innerHTML='<p class="record-meta">The channel feed is temporarily unavailable.</p>'}}

const readable = (value='') => value.replaceAll('_',' ');
const safe = (value='') => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const dateLabel = value => new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
function showMessage(target,text,bad=false){target.textContent=text;target.dataset.error=bad?'true':'false'}
function setSignedIn(user){loginPanel.classList.toggle('hidden',Boolean(user));dashboard.classList.toggle('hidden',!user)}

function setFilterOptions(){const previous=filter.value;filter.innerHTML='<option value="all">All statuses</option>'+statuses[queue].map(status=>`<option value="${status}">${readable(status)}</option>`).join('');filter.value=statuses[queue].includes(previous)?previous:'all'}

async function loadQueue(){
  list.innerHTML='<p class="record-meta" style="padding:1rem">Loading submissions…</p>';
  detail.innerHTML='<div class="empty-state"><span aria-hidden="true">✳</span><h2>Choose a submission.</h2><p>Private details appear here for authorised staff.</p></div>';
  selected=null;setFilterOptions();
  const table=queues[queue].table;
  let query=supabase.from(table).select('*').order('created_at',{ascending:false}).limit(100);
  if(filter.value!=='all')query=query.eq('status',filter.value);
  const {data,error}=await query;
  if(error){showMessage(note,'Could not load the private queue. Check your staff role and project policies.',true);list.innerHTML='';return}
  document.querySelector(queues[queue].count).textContent=data.length;
  if(!data.length){list.innerHTML='<p class="record-meta" style="padding:1rem">No submissions in this view.</p>';return}
  list.innerHTML=data.map((row,index)=>`<button class="queue-item" type="button" data-row="${index}"><span class="status-pill">${safe(readable(row.status))}</span><strong>${safe(row.full_name)}</strong><small>${safe(row.email)} · ${dateLabel(row.created_at)}</small></button>`).join('');
  list.querySelectorAll('[data-row]').forEach(button=>button.addEventListener('click',()=>{
    list.querySelector('[aria-current="true"]')?.removeAttribute('aria-current');button.setAttribute('aria-current','true');selected=data[Number(button.dataset.row)];renderRecord(selected);
  }));
}

async function renderRecord(row){
  const testimony=queue==='testimonies';let events=[];
  if(testimony){const {data}=await supabase.from('testimony_review_events').select('*').eq('testimony_id',row.id).order('created_at',{ascending:false});events=data||[]}
  const body=testimony?row.testimony:queue==='contacts'?`Topic: ${readable(row.topic)}\nSource: ${row.source}\n\n${row.message}`:[row.visit_date?`Visit date: ${row.visit_date}`:'',row.party_size?`People in party: ${row.party_size}`:'',row.preferred_contact&&row.preferred_contact!=='none'?`Preferred contact: ${row.preferred_contact}`:'No follow-up requested'].filter(Boolean).join('\n');
  detail.innerHTML=`<div class="record-head"><div><span class="status-pill">${safe(readable(row.status))}</span><h2>${safe(row.full_name)}</h2><p class="record-meta">${safe(row.email)}${row.phone?` · ${safe(row.phone)}`:''}<br>Received ${dateLabel(row.created_at)}</p></div></div><div class="record-body">${safe(body)}</div>${testimony?`<p class="record-meta">Online sharing permission: ${row.online_sharing_consent?'given':'not given'} · Name permission: ${row.name_sharing_consent?'given':'not given'}</p>`:''}<form class="record-actions" id="record-action-form"><label for="next-status">Update status</label><select id="next-status" name="status">${statuses[queue].map(status=>`<option value="${status}" ${row.status===status?'selected':''}>${readable(status)}</option>`).join('')}</select>${testimony?`<label for="proposed-wording">Suggested edited wording <span class="record-meta">(optional; the member must confirm before approval)</span></label><textarea id="proposed-wording" name="proposed_wording" maxlength="8000" placeholder="If you edit their words, put the proposed version here for them to confirm."></textarea><label class="consent-check"><input type="checkbox" name="member_confirmed_wording" value="true"><span>The member has confirmed this wording.</span></label>`:''}${testimony?'<label for="member-message">Review note <span class="record-meta">(optional)</span></label><textarea id="member-message" name="member_message" maxlength="3000" placeholder="Record what you would like to discuss with the person. Contact them separately if email notifications are not configured."></textarea>':''}<button class="primary" type="submit">Save status <span aria-hidden="true">→</span></button></form>${events.length?`<section class="record-history"><h3>Review history</h3>${events.map(event=>`<div class="history-item"><strong>${safe(readable(event.action))}</strong> · ${dateLabel(event.created_at)}${event.member_message?`<br>${safe(event.member_message)}`:''}${event.proposed_wording?`<br><br><strong>Suggested wording:</strong><br>${safe(event.proposed_wording)}<br>Member confirmed: ${event.member_confirmed_wording?'yes':'no'}`:''}</div>`).join('')}</section>`:''}`;
  document.querySelector('#record-action-form').addEventListener('submit',saveReview);
}

async function saveReview(event){
  event.preventDefault();if(!selected)return;
  const values=new FormData(event.currentTarget);const status=String(values.get('status'));const memberMessage=String(values.get('member_message')||'').trim();
  let notificationSent=false;
  if(queue==='testimonies'){
    const action=status==='in_review'?'review_started':status==='submitted'?'reopened':status;
    const session=await supabase.auth.getSession();
    const values=new FormData(event.currentTarget);
    const response=await fetch('/api/review-testimony',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${session.data.session?.access_token||''}`},body:JSON.stringify({testimony_id:selected.id,review_key:crypto.randomUUID(),status,member_message:memberMessage,proposed_wording:String(values.get('proposed_wording')||'').trim()||null,member_confirmed_wording:values.get('member_confirmed_wording')==='true'})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){showMessage(note,result.error||'Could not save this review update. Check the church project policy setup.',true);return}
    notificationSent=result.notificationSent===true;
  }else{
    const {error}=await supabase.from(queues[queue].table).update({status,closed_at:status==='closed'?new Date().toISOString():null}).eq('id',selected.id);
    if(error){showMessage(note,'Could not save this follow-up update.',true);return}
  }
  showMessage(note,queue==='testimonies'?(notificationSent?'Review saved and email notification sent.':'Review saved. Email notification was not sent; check Resend setup.'):'Status saved.');await loadQueue();
}

async function initialise(){
  if(!config.url||!config.publishableKey){showMessage(message,'The church Supabase project is not connected to this build yet.',true);document.querySelector('#login-form button').disabled=true;return}
  supabase=createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data:{session}}=await supabase.auth.getSession();
  if(session&&invited){loginPanel.classList.add('hidden');passwordPanel.classList.remove('hidden')}else if(session)await verifyStaff();
  document.querySelector('#password-form').addEventListener('submit',async event=>{
    event.preventDefault();const values=new FormData(event.currentTarget);const target=document.querySelector('#password-message');
    if(values.get('password')!==values.get('repeat')){showMessage(target,'The passwords do not match.',true);return}
    const button=event.currentTarget.querySelector('button');button.disabled=true;
    const {error}=await supabase.auth.updateUser({password:String(values.get('password'))});button.disabled=false;
    if(error){showMessage(target,'Could not set your password. Please reopen your invitation or contact the administrator.',true);return}
    event.currentTarget.reset();passwordPanel.classList.add('hidden');history.replaceState(null,'',location.pathname);await verifyStaff();
  });
  document.querySelector('#login-form').addEventListener('submit',signIn);
  document.querySelector('#sign-out').addEventListener('click',async()=>{await supabase.auth.signOut();staffRole=null;setSignedIn(null)});
  document.querySelectorAll('[data-queue]').forEach(button=>button.addEventListener('click',async()=>{queue=queues[button.dataset.queue]?button.dataset.queue:'contacts';filter.value='all';document.querySelectorAll('[data-queue]').forEach(tab=>tab.classList.toggle('is-active',tab===button));await loadQueue()}));
  filter.addEventListener('change',loadQueue);document.querySelector('#refresh-queue').addEventListener('click',loadQueue);document.querySelector('#refresh-overview').addEventListener('click',loadOverview);
}

async function signIn(event){
  event.preventDefault();const values=new FormData(event.currentTarget);
  const {error}=await supabase.auth.signInWithPassword({email:values.get('email'),password:values.get('password')});
  if(error){showMessage(message,'Sign-in failed. Check the email and password, or contact the church administrator.',true);return}await verifyStaff();
}

async function verifyStaff(){
  const {data,error}=await supabase.rpc('current_staff_role');
  if(error||!data){await supabase.auth.signOut();setSignedIn(null);showMessage(message,'This account has no authorised church office role. Ask an administrator to grant access.',true);return}
  staffRole=data;document.querySelectorAll('[data-queue]').forEach(tab=>{tab.hidden=tab.dataset.queue==='testimonies'?!['admin','testimony_reviewer'].includes(data):!['admin','pastoral_contact'].includes(data)});if(data==='testimony_reviewer')queue='testimonies';document.querySelectorAll('[data-queue]').forEach(tab=>tab.classList.toggle('is-active',tab.dataset.queue===queue));setSignedIn({});showMessage(note,`Signed in with ${readable(staffRole)} access. Row-level security protects private records.`);await loadOverview();await loadQueue();
}

initialise();
