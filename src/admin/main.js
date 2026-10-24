import { createClient } from '@supabase/supabase-js';

const config = window.COD_ADMIN_CONFIG || {};
const invited = /type=(invite|recovery)/.test(location.hash);
const $ = selector => document.querySelector(selector);
const loginPanel = $('#login-panel'), passwordPanel = $('#password-panel'), noAccessPanel = $('#no-access-panel'), dashboard = $('#dashboard');
const message = $('#login-message'), list = $('#queue-items'), detail = $('#record-panel'), filter = $('#queue-filter'), search = $('#queue-search'), split = $('#inbox-split');
let supabase, staffRole = null, queue = 'contacts', rows = [], selected = null, rangeDays = 30, metric = 'visitors', report = null, toastTimer, searchTimer;

// "done" statuses are hidden by the default Open view.
const queues = {
  contacts: {table: 'contact_enquiries', label: 'Enquiries', icon: 'mail', color: '#0a84ff', statuses: ['new','in_progress','responded','closed'], done: ['responded','closed'], subject: 'Your message to City of David Canterbury', scope: q => q.neq('topic','prayer')},
  prayer: {table: 'contact_enquiries', label: 'Prayer requests', icon: 'heart', color: '#bf5af2', statuses: ['new','in_progress','responded','closed'], done: ['responded','closed'], subject: 'Your prayer request', scope: q => q.eq('topic','prayer')},
  visitors: {table: 'first_time_visitors', label: 'Visitors', icon: 'home', color: '#30b158', statuses: ['new','contacted','connected','closed'], done: ['connected','closed'], subject: 'Your visit to City of David Canterbury', scope: q => q},
  testimonies: {table: 'testimonies', label: 'Testimonies', icon: 'quote', color: '#c69214', statuses: ['submitted','in_review','changes_requested','approved','declined','scheduled','delivered','shared'], done: ['declined','delivered','shared'], subject: 'Your testimony', scope: q => q}
};
// What each staff role can open. Row-level security enforces the same rules in the database.
const access = {
  admin: {tabs: ['overview','inbox','insights','attendance'], queues: ['contacts','prayer','visitors','testimonies']},
  pastoral_contact: {tabs: ['inbox','attendance'], queues: ['contacts','visitors']},
  testimony_reviewer: {tabs: ['inbox'], queues: ['testimonies']}
};
const tones = {new:'blue',submitted:'blue',in_progress:'orange',in_review:'orange',contacted:'orange',changes_requested:'purple',responded:'green',connected:'green',approved:'green',scheduled:'green',declined:'red'};
const sites = {main: ['Main site','var(--site-main)'], audacious: ['Audacious','var(--site-audacious)'], youth: ['CITIYOUTHS','var(--site-youth)']};
const actions = {visit_clicks:['Plan your visit','home','#30b158'], directions_clicks:['Directions','pin','#32ade6'], sermon_plays:['Sermon plays','play','#ff3b30'], form_submits:['Forms sent','send','#ff9500'], give_page_views:['Give page visits','heart','#ff2d55'], social_clicks:['Social links','share','#5856d6']};
const eventNames = {give_click:'Offering link',visit_click:'Plan your visit',directions_click:'Directions',sermon_play:'Sermon played',form_submit:'Form sent',social_click:'Social link',outbound_click:'Outside link'};
const eventIcons = {give_click:'pound',visit_click:'home',directions_click:'pin',sermon_play:'play',form_submit:'send',social_click:'share',outbound_click:'link'};
const clickLabels = {contact:'Contact form',first_time_visitor:'First-visit form',testimony:'Testimony form',natwest:'NatWest PayIt'};
const sourceNames = {main:'Main website',audacious:'Audacious website',youth:'CITIYOUTHS website'};
const pageName = path => path === '/' ? 'Home page' : path.replace(/^\/|\/$/g, '').split('/').map(part => part.replaceAll('-', ' ').replace(/^./, c => c.toUpperCase())).join(' › ');

/* ---------- Small helpers ---------- */
const paths = {
  mail:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.8 7.2 8.2 5.8 8.2-5.8"/>',
  heart:'<path d="M12 19.5s-7.5-4.4-7.5-9.7A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5c0 5.3-7.5 9.7-7.5 9.7z"/>',
  home:'<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>',
  quote:'<path d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-9.5L6 21v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z"/><path d="M8 10.5h8M8 13.5h5"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  pound:'<path d="M16.5 7A4 4 0 0 0 9 8.5V12c0 3.2-1 5.5-2.5 7h11M6.5 12.5h7"/>',
  bell:'<path d="M12 3.5A5.5 5.5 0 0 0 6.5 9c0 5-2 6.5-2 6.5h15s-2-1.5-2-6.5A5.5 5.5 0 0 0 12 3.5zM10 19a2 2 0 0 0 4 0"/>',
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.6 3-5.5 6-5.5s5.4 1.9 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.4.2 4 1.8 4.5 4.9"/>',
  page:'<path d="M7 3.5h6.5l4 4V20a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M13.5 3.5v4h4"/>',
  pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  play:'<path d="M8 5.5v13l10.5-6.5z"/>',
  send:'<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>',
  phone:'<path d="M5 3.5h3.5L10 8l-2.2 1.4a11 11 0 0 0 4.8 4.8L14 12l4.5 1.5V17a2 2 0 0 1-2 2A15 15 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  reply:'<path d="M9.5 5.5 3.5 11l6 5.5M3.5 11H14a6.5 6.5 0 0 1 6.5 6.5v1"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5z"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  share:'<circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="m8.7 10.8 6.6-3.6M8.7 13.2l6.6 3.6"/>',
  device:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  chart:'<path d="M5 20V12M10 20V6M15 20v-9M20 20V4"/>',
  sparkle:'<path d="M12 3.5 13.8 10.2 20.5 12l-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8z"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
const badge = (name, color) => `<span class="row-icon" style="background:${color}" aria-hidden="true">${icon(name)}</span>`;
const readable = (value='') => String(value).replaceAll('_',' ');
const title = (value='') => readable(value).replace(/^./, c => c.toUpperCase());
const safe = (value='') => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const number = value => Number(value || 0).toLocaleString('en-GB');
const plural = (count, one, many) => `${number(count)} ${count === 1 ? one : many}`;
const londonDate = (value, options) => {const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London', ...options}).format(date)};
const dateLabel = value => londonDate(value, {dateStyle:'medium', timeStyle:'short'});
const dayKey = date => new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/London', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date(date));
const noon = day => `${day}T12:00:00Z`;
const daysSince = value => Math.floor((Date.now() - new Date(value)) / 864e5);
// iOS Mail style: time today, "Yesterday", weekday this week, then the date.
function when(value){
  const days = (new Date(dayKey(new Date())) - new Date(dayKey(value))) / 864e5;
  if(days === 0) return londonDate(value, {hour:'numeric', minute:'2-digit'});
  if(days === 1) return 'Yesterday';
  if(days < 7) return londonDate(value, {weekday:'long'});
  return londonDate(value, {day:'numeric', month:'short'});
}
const waited = value => {const days = daysSince(value); return days < 1 ? 'today' : days === 1 ? '1 day' : `${days} days`};
const pill = status => `<span class="status-pill ${tones[status] || ''}">${safe(readable(status))}</span>`;
const chevron = '<svg class="chevron" viewBox="0 0 8 13" aria-hidden="true"><path d="m1.5 1.5 5 5-5 5"/></svg>';
const palette = ['#ff9f0a','#ff375f','#bf5af2','#5e5ce6','#0a84ff','#30b0c7','#34c759','#ac8e68'];
function avatar(name, size=''){
  const text = String(name || '?').trim();
  const hue = palette[[...text].reduce((sum, character) => sum + character.charCodeAt(0), 0) % palette.length];
  return `<span class="avatar ${size}" style="--avatar:${hue}" aria-hidden="true">${safe(text.split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase())}</span>`;
}
const allowed = (kind, name) => access[staffRole]?.[kind].includes(name);
const skeletonRows = count => Array.from({length: count}, () => '<div class="row skeleton-row" aria-hidden="true"><span class="avatar small"></span><span class="row-main"><i></i><i></i></span></div>').join('');

function toast(text, {bad=false, undo=null}={}){
  const note = $('#dashboard-note'), button = $('#toast-undo');
  $('#toast-text').textContent = text; note.dataset.error = bad ? 'true' : 'false';
  button.hidden = !undo; button.onclick = undo ? async () => {note.classList.remove('is-visible'); await undo()} : null;
  note.classList.add('is-visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => note.classList.remove('is-visible'), undo ? 8000 : bad ? 7000 : 3200);
}
function showMessage(target, text, bad=false){target.textContent = text; target.dataset.error = bad ? 'true' : 'false'}
function change(now, before){
  if(!before) return now ? '<span class="delta up">New</span>' : '<span class="delta flat">—</span>';
  const percent = Math.round((now - before) / before * 100);
  return `<span class="delta ${percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat'}">${percent > 0 ? '↑' : percent < 0 ? '↓' : ''}${Math.abs(percent)}%</span>`;
}
function spark(values, color){
  if(values.length < 2 || !values.some(Boolean)) return '';
  const max = Math.max(...values, 1), step = 100 / (values.length - 1);
  const points = values.map((value, index) => `${(index * step).toFixed(1)},${(26 - value / max * 22).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" style="stroke:${color}"/></svg>`;
}
function tile({label, value, note='', iconName='chart', color='var(--tint)', target='', sparkline=''}){
  const tag = target ? 'button' : 'article';
  return `<${tag} class="tile" ${target ? `type="button" data-go="${target}"` : ''}><span class="tile-label">${badge(iconName, color)}${label}</span><strong>${value}</strong>${sparkline}<small>${note}</small></${tag}>`;
}
function meters(items, empty){
  if(!items.length) return `<p class="list-empty">${empty}</p>`;
  const max = Math.max(...items.map(item => Number(item.value)), 1);
  return items.map(item => `<div><div class="meter-label"><span>${item.label}</span><strong>${number(item.value)}</strong></div><div class="meter-track"><i style="width:${Math.max(2, Number(item.value) / max * 100)}%;${item.color ? `background:${item.color}` : ''}"></i></div></div>`).join('');
}
const emptyState = (iconName, heading, text) => `<div class="empty-state">${badge(iconName, 'var(--fill-strong)')}<h2>${heading}</h2><p>${text}</p></div>`;

/* ---------- Charts ---------- */
// Stacked bars; buckets are [{label, values:{key:number}}], series are [{key, name, color}].
function stackChart(target, buckets, series, {width=640, height=200, unit=''}={}){
  if(!buckets.length){target.innerHTML = '<p class="list-empty">No data yet.</p>'; return}
  const left = 30, bottom = 24, top = 8;
  const totals = buckets.map(bucket => series.reduce((sum, item) => sum + (bucket.values[item.key] || 0), 0));
  const max = Math.max(...totals, 1), slot = (width - left - 4) / buckets.length, bar = Math.max(2, Math.min(28, slot * .64));
  const scale = value => (height - top - bottom) * value / max;
  const bars = buckets.map((bucket, index) => {
    let y = height - bottom;
    const parts = series.map(item => {const h = scale(bucket.values[item.key] || 0); if(!h) return ''; y -= h; return `<rect x="${left + index * slot + (slot - bar) / 2}" y="${y}" width="${bar}" height="${h}" fill="${item.color}"/>`}).join('');
    const tip = `${bucket.label}: ${series.map(item => `${item.name} ${number(bucket.values[item.key])}`).join(', ')}`;
    return `<g class="bar"><title>${safe(tip)}</title>${parts}<rect class="hit" x="${left + index * slot}" y="${top}" width="${slot}" height="${height - top - bottom}"/></g>`;
  }).join('');
  const ticks = [...new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1])];
  const total = totals.reduce((a, b) => a + b, 0);
  target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${number(total)} ${unit} in total from ${safe(buckets[0].label)} to ${safe(buckets.at(-1).label)}">${[0, .5, 1].map(f => `<line class="grid" x1="${left}" x2="${width - 4}" y1="${top + (height - top - bottom) * f}" y2="${top + (height - top - bottom) * f}"/>`).join('')}<text class="axis" x="0" y="${top + 4}">${number(max)}</text><text class="axis" x="0" y="${height - bottom + 4}">0</text>${bars}${ticks.map(index => `<text class="axis" x="${left + index * slot + slot / 2}" y="${height - 4}" text-anchor="${index === 0 && buckets.length > 1 ? 'start' : index === buckets.length - 1 && buckets.length > 1 ? 'end' : 'middle'}">${safe(buckets[index].label)}</text>`).join('')}</svg>`;
}

function renderTrend(points){
  const target = $('#submissions-chart');
  if(!points.length){target.innerHTML = '<p class="list-empty">No activity yet.</p>'; return}
  const width = 640, height = 190, left = 30, bottom = 24, top = 10, max = Math.max(...points.map(point => Number(point.count)), 1);
  const x = index => left + index * (width - left - 8) / Math.max(points.length - 1, 1);
  const y = value => top + (height - top - bottom) * (1 - Number(value) / max);
  const line = points.map((point, index) => `${x(index)},${y(point.count)}`).join(' ');
  const label = index => londonDate(noon(String(points[index].day).slice(0,10)), {day:'numeric', month:'short'});
  const total = points.reduce((sum, point) => sum + Number(point.count), 0);
  $('#trend-sub').textContent = `${plural(total, 'form', 'forms')} sent in the last ${points.length} days`;
  target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${total} forms sent in the last ${points.length} days"><defs><linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0750b5" stop-opacity=".2"/><stop offset="1" stop-color="#0750b5" stop-opacity="0"/></linearGradient></defs>${[0, .5, 1].map(f => `<line class="grid" x1="${left}" x2="${width - 8}" y1="${top + (height - top - bottom) * f}" y2="${top + (height - top - bottom) * f}"/>`).join('')}<text class="axis" x="0" y="${top + 4}">${max}</text><text class="axis" x="0" y="${height - bottom + 4}">0</text><polygon class="area" points="${x(0)},${height - bottom} ${line} ${x(points.length - 1)},${height - bottom}"/><polyline class="line" points="${line}"/>${points.map((point, index) => `<circle class="dot" cx="${x(index)}" cy="${y(point.count)}" r="9"><title>${label(index)}: ${plural(Number(point.count), 'form', 'forms')}</title></circle>`).join('')}${[0, Math.floor((points.length - 1) / 2), points.length - 1].map(index => `<text class="axis" x="${x(index)}" y="${height - 4}" text-anchor="${index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}">${label(index)}</text>`).join('')}</svg>`;
}

/* ---------- Tabs ---------- */
function setupTablist(container, onSelect, attribute='aria-selected'){
  container.addEventListener('keydown', event => {
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const buttons = [...container.querySelectorAll(':scope > button:not([hidden])')];
    const index = buttons.indexOf(document.activeElement);
    if(index < 0) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault(); buttons[next].focus(); buttons[next].click();
  });
  container.addEventListener('click', event => {const button = event.target.closest('button'); if(button && button.parentElement === container) onSelect(button)});
  return button => container.querySelectorAll(':scope > button').forEach(item => {const on = item === button; item.setAttribute(attribute, String(on)); item.tabIndex = on ? 0 : -1});
}
const markTab = setupTablist($('#tab-bar'), button => openTab(button.dataset.tab));
const markQueue = setupTablist($('#queue-tabs'), button => openQueue(button.dataset.queue));
const markRange = setupTablist($('#range-picker'), button => {rangeDays = Number(button.dataset.days); markRange(button); loadInsights()}, 'aria-checked');

async function openTab(name, {focus=true, load=true}={}){
  if(!allowed('tabs', name)) name = access[staffRole].tabs[0];
  markTab($(`#tab-${name}`));
  document.querySelectorAll('.view').forEach(view => view.hidden = view.id !== `view-${name}`);
  history.replaceState(null, '', `${location.pathname}#${name}`);
  if(focus) $(`#view-${name}`).focus({preventScroll:true});
  window.scrollTo(0, 0);
  if(!load) return;
  if(name === 'overview') await loadOverview();
  if(name === 'inbox') await loadQueue();
  if(name === 'insights') await loadInsights();
  if(name === 'attendance') await loadAttendance();
}

/* ---------- Overview ---------- */
// "Waiting" means still at the first status: nobody has picked it up yet.
async function waiting(name){
  const first = queues[name].statuses[0];
  const [{count}, {data}] = await Promise.all([
    queues[name].scope(supabase.from(queues[name].table).select('id', {count:'exact', head:true})).eq('status', first),
    queues[name].scope(supabase.from(queues[name].table).select('id,full_name,created_at')).eq('status', first).order('created_at', {ascending:true}).limit(1)
  ]);
  return {count: count || 0, oldest: data?.[0] || null};
}
async function refreshCounts(){
  const visible = access[staffRole].queues;
  const result = Object.fromEntries(await Promise.all(visible.map(async name => [name, await waiting(name)])));
  Object.keys(queues).forEach(name => {$(`#count-${name}`).textContent = result[name]?.count || ''});
  const total = Object.values(result).reduce((sum, item) => sum + item.count, 0);
  const tabBadge = $('#inbox-badge'); tabBadge.hidden = !total; tabBadge.textContent = total > 99 ? '99+' : total;
  return result;
}

async function loadOverview(){
  if(staffRole !== 'admin') return;
  const hour = Number(londonDate(new Date(), {hour:'numeric', hour12:false}));
  $('#greeting').textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  $('#overview-date').textContent = londonDate(new Date(), {weekday:'long', day:'numeric', month:'long'});
  ['#attention-list','#recent-list'].forEach(id => $(id).innerHTML = skeletonRows(4));
  const [snapshot, traffic, counts, recent] = await Promise.all([
    supabase.rpc('church_dashboard_snapshot'), supabase.rpc('site_traffic_report', {p_days: 7}), refreshCounts(), latestSubmissions()
  ]);
  const data = snapshot.data || {}, week = traffic.error ? null : traffic.data;
  const total = Object.values(counts).reduce((sum, item) => sum + item.count, 0);
  const oldest = Object.entries(counts).filter(([, item]) => item.oldest).sort((a, b) => a[1].oldest.created_at.localeCompare(b[1].oldest.created_at))[0];
  $('#hero-line').innerHTML = total
    ? `<strong>${plural(total, 'person is', 'people are')} waiting for a first response.</strong> ${oldest ? (daysSince(oldest[1].oldest.created_at) < 1 ? 'Everyone arrived today.' : `${safe(oldest[1].oldest.full_name)} has waited longest: ${waited(oldest[1].oldest.created_at)}.`) : ''}`
    : '<strong>You’re all caught up.</strong> No one is waiting for a first response.';
  $('#hero-cta').textContent = total ? `Open inbox (${number(total)})` : 'Open inbox';
  if(oldest){$('#hero-cta').dataset.queueGo = oldest[0]; $('#hero-cta').dataset.status = queues[oldest[0]].statuses[0]} else {delete $('#hero-cta').dataset.queueGo}

  const byDay = field => {const sums = {}; (week?.daily || []).forEach(row => sums[row.day] = (sums[row.day] || 0) + Number(row[field] || 0)); return Object.keys(sums).sort().map(day => sums[day])};
  const sundays = {}; (data.attendance?.recent || []).forEach(row => sundays[row.date] = (sundays[row.date] || 0) + Number(row.total));
  const sundayDates = Object.keys(sundays).sort(), last = sundayDates.at(-1);
  const lastFirstTime = (data.attendance?.recent || []).filter(row => row.date === last).reduce((sum, row) => sum + Number(row.first_time), 0);
  $('#overview-tiles').innerHTML = [
    tile({label:'Website visitors', iconName:'eye', color:'var(--site-main)', target:'insights', value: week ? number(week.totals.visitors) : '—', sparkline: week ? spark(byDay('visitors'), 'var(--site-main)') : '', note: week ? `${change(week.totals.visitors, week.previous.visitors)} on last week` : 'Counting not switched on yet'}),
    tile({label:'Offering clicks', iconName:'pound', color:'var(--gold)', target:'insights', value: week ? number(week.totals.give_clicks) : '—', sparkline: week ? spark(byDay('give_clicks'), 'var(--gold)') : '', note: week ? `${change(week.totals.give_clicks, week.previous.give_clicks)} · ${number(week.totals.give_page_views)} Give page visits` : 'Counting not switched on yet'}),
    tile({label:'Waiting', iconName:'bell', color:'#ff3b30', target:'inbox', value: number(total), note: total ? `Oldest waiting ${oldest ? waited(oldest[1].oldest.created_at) : ''}` : 'Nobody is waiting'}),
    tile({label:'Last Sunday', iconName:'people', color:'var(--site-youth)', target:'attendance', value: last ? number(sundays[last]) : '—', sparkline: spark(sundayDates.map(day => sundays[day]), 'var(--site-youth)'), note: last ? `${londonDate(noon(last), {day:'numeric', month:'short'})} · ${number(lastFirstTime)} first-time` : 'No attendance recorded yet'})
  ].join('');

  const words = {contacts:['new enquiry','new enquiries'], prayer:['prayer request','prayer requests'], visitors:['visitor to welcome','visitors to welcome'], testimonies:['testimony to review','testimonies to review']};
  $('#attention-list').innerHTML = Object.keys(counts).map(name => {const item = counts[name]; return `<button class="row" type="button" data-go="inbox" data-queue-go="${name}" data-status="${queues[name].statuses[0]}">${badge(queues[name].icon, queues[name].color)}<span class="row-main"><strong>${plural(item.count, ...words[name])}</strong><small>${item.oldest ? `Oldest: ${safe(item.oldest.full_name)}, waiting ${waited(item.oldest.created_at)}` : 'Nothing waiting'}</small></span>${item.count && item.oldest && daysSince(item.oldest.created_at) >= 2 ? `<span class="age-badge">${waited(item.oldest.created_at)}</span>` : ''}${chevron}</button>`}).join('');
  $('#recent-list').innerHTML = recent.length ? recent.map(item => `<button class="row" type="button" data-go="inbox" data-queue-go="${item.queue}" data-status="all" data-open="${safe(item.id)}">${avatar(item.full_name, 'small')}<span class="row-main"><strong>${safe(item.full_name)}</strong><small>${queues[item.queue].label} · ${when(item.created_at)}</small></span>${pill(item.status)}${chevron}</button>`).join('') : emptyState('mail', 'No submissions yet', 'Forms sent from the church websites will appear here.');
  if(snapshot.error){$('#submissions-chart').innerHTML = '<p class="list-empty">Activity could not be loaded.</p>'; return}
  renderTrend(data.submissions || []);
  const pipeline = data.pipeline || {};
  $('#pipeline-chart').innerHTML = meters(queues.contacts.statuses.map(status => ({label: title(status), value: pipeline[status] || 0, color: {new:'var(--tint)', in_progress:'var(--site-audacious)', responded:'var(--site-youth)', closed:'var(--tertiary)'}[status]})), 'No enquiries yet.');
  $('#location-insight').innerHTML = meters((data.locations || []).map(item => ({label: safe(item.name), value: item.count})), 'No visitors have added a town or city yet.');
}

async function latestSubmissions(){
  const sources = ['contacts','prayer','visitors','testimonies'].filter(name => allowed('queues', name));
  const results = await Promise.all(sources.map(async name => {
    const {data} = await queues[name].scope(supabase.from(queues[name].table).select('id,full_name,status,created_at')).order('created_at', {ascending:false}).limit(6);
    return (data || []).map(row => ({...row, queue: name}));
  }));
  return results.flat().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
}

/* ---------- Insights ---------- */
const metrics = {visitors:['Visitors','visitors','eye'], pageviews:['Page views','pageviews','page'], give_clicks:['Offering clicks','give_clicks','pound']};

async function loadInsights(){
  if(staffRole !== 'admin') return;
  const body = $('#insights-body');
  body.innerHTML = '<div class="card skeleton" style="height:320px"></div>';
  const {data, error} = await supabase.rpc('site_traffic_report', {p_days: rangeDays});
  report = error ? null : data;
  if(!report){
    body.innerHTML = `<section class="card">${emptyState('chart', 'Website counting isn’t switched on yet', 'Once the visit counter is live on the church websites, visitors, offering clicks, sermon plays and more will appear here. Nothing is counted before then.')}</section>`;
    return;
  }
  const t = report.totals, p = report.previous;
  const siteRows = Object.entries(sites).map(([key, [name, color]]) => ({label: name, value: report.sites?.[key]?.visitors || 0, color}));
  const deviceTotal = Object.values(report.devices || {}).reduce((sum, value) => sum + Number(value), 0);
  const regionName = code => {try{return new Intl.DisplayNames(['en-GB'], {type:'region'}).of(code)}catch{return code}};
  const listOr = (items, empty) => items.length ? items.join('') : `<p class="list-empty">${empty}</p>`;
  body.innerHTML = `
    <section class="card hero-chart">
      <div class="metric-switch" role="tablist" aria-label="Chart" id="metric-switch">${Object.entries(metrics).map(([key, [label, field, iconName]]) => `<button type="button" role="tab" data-metric="${key}"><span class="tile-label">${icon(iconName)}${label}</span><strong>${number(t[field])}</strong><small>${change(Number(t[field]), Number(p[field]))} vs previous ${rangeDays === 365 ? '12 months' : `${rangeDays} days`}</small></button>`).join('')}</div>
      <div class="chart" id="traffic-chart"></div>
      <div class="chart-foot"><div class="legend">${Object.values(sites).map(([name, color]) => `<span><i style="background:${color}"></i>${name}</span>`).join('')}</div><p id="chart-note"></p></div>
    </section>
    <div class="columns">
      <section><h2 class="group-title">What people did</h2><div class="list">${Object.entries(actions).map(([key, [label, iconName, color]]) => `<div class="row">${badge(iconName, color)}<span class="row-main"><strong>${label}</strong></span><span class="row-value strong">${number(t[key])}</span><span class="row-delta">${change(Number(t[key]), Number(p[key]))}</span></div>`).join('')}</div></section>
      <section><h2 class="group-title">Ministries</h2><div class="card meters" style="margin-bottom:22px">${meters(siteRows, '')}</div>
        <h2 class="group-title">Devices</h2><div class="list">${['mobile','desktop','tablet'].map(key => {const share = deviceTotal ? Math.round(Number(report.devices?.[key] || 0) / deviceTotal * 100) : 0; return `<div class="row">${badge('device', 'var(--fill-strong)')}<span class="row-main"><strong>${title(key)}</strong><span class="inline-meter"><i style="width:${share}%"></i></span></span><span class="row-value strong">${share}%</span></div>`}).join('')}</div></section>
    </div>
    <div class="columns">
      <section><h2 class="group-title">Top pages</h2><div class="list">${listOr((report.pages || []).map(page => `<div class="row"><span class="site-dot" style="background:${sites[page.site][1]}" aria-hidden="true"></span><span class="row-main"><strong>${safe(pageName(page.path))}</strong><small>${sites[page.site][0]} · ${safe(page.path)}</small></span><span class="row-value strong">${number(page.pageviews)}</span></div>`), 'No page views yet.')}</div></section>
      <section><h2 class="group-title">Where visitors come from</h2><div class="list">${listOr((report.referrers || []).map(item => `<div class="row">${badge(item.host === 'direct' ? 'link' : 'globe', 'var(--fill-strong)')}<span class="row-main"><strong>${item.host === 'direct' ? 'Direct, WhatsApp or apps' : safe(item.host)}</strong></span><span class="row-value strong">${number(item.visits)}</span></div>`), 'No visits yet.')}</div>
        <h2 class="group-title">Countries</h2><div class="list plain">${listOr((report.countries || []).map(item => `<div class="row"><span class="row-main"><strong>${safe(regionName(item.country))}</strong></span><span class="row-value strong">${number(item.pageviews)}</span></div>`), 'No country data yet.')}</div></section>
    </div>
    <section><h2 class="group-title">Clicks in detail</h2><div class="list">${listOr((report.clicks || []).map(item => `<div class="row">${badge(eventIcons[item.event] || 'link', 'var(--fill-strong)')}<span class="row-main"><strong>${eventNames[item.event] || safe(item.event)}</strong><small>${item.label ? `${safe(clickLabels[item.label] || item.label)} · ` : ''}${sites[item.site][0]}</small></span><span class="row-value strong">${number(item.count)}</span></div>`), 'No clicks yet.')}</div></section>`;
  const markMetric = setupTablist($('#metric-switch'), button => {metric = button.dataset.metric; markMetric(button); renderTraffic()});
  markMetric(document.querySelector(`[data-metric="${metric}"]`));
  renderTraffic();
}

function renderTraffic(){
  if(!report) return;
  const field = metrics[metric][1], byDay = new Map();
  (report.daily || []).forEach(row => {const entry = byDay.get(row.day) || {day: row.day, values: {}}; entry.values[row.site] = Number(row[field]) || 0; byDay.set(row.day, entry)});
  let buckets = [...byDay.values()];
  if(buckets.length > 92){
    const weeks = [];
    buckets.forEach((entry, index) => {if(index % 7 === 0) weeks.push({day: entry.day, values: {}}); const week = weeks.at(-1); Object.keys(sites).forEach(key => week.values[key] = (week.values[key] || 0) + (entry.values[key] || 0))});
    buckets = weeks;
  }
  buckets = buckets.map(entry => ({...entry, label: `${byDay.size > 92 ? 'Week of ' : ''}${londonDate(noon(entry.day), {day:'numeric', month:'short'})}`}));
  stackChart($('#traffic-chart'), buckets, Object.entries(sites).map(([key, [name, color]]) => ({key, name, color: metric === 'give_clicks' ? 'var(--gold)' : color})), {height: 230, unit: metrics[metric][0].toLowerCase()});
  $('#chart-note').textContent = metric === 'give_clicks' ? 'Clicks on the NatWest giving link. Amounts given stay in NatWest PayIt.' : buckets.length < byDay.size ? 'Grouped by week.' : '';
}

/* ---------- Inbox ---------- */
async function openQueue(name, {status='open', openId=null}={}){
  if(!allowed('queues', name)) name = access[staffRole].queues[0];
  queue = name; markQueue(document.querySelector(`[data-queue="${name}"]`));
  setFilterOptions(); filter.value = ['open','all', ...queues[name].statuses].includes(status) ? status : 'open';
  await loadQueue();
  if(openId){const index = rows.findIndex(row => row.id === openId); if(index >= 0) selectRow(index)}
}
function setFilterOptions(){filter.innerHTML = '<option value="open">Open</option><option value="all">All</option>' + queues[queue].statuses.map(status => `<option value="${status}">${title(status)}</option>`).join('')}

function emptyDetail(){detail.innerHTML = emptyState(queues[queue].icon, 'Nothing selected', 'Choose a message from the list to read it and reply.'); split.classList.remove('show-detail')}

async function loadQueue(){
  list.innerHTML = skeletonRows(5); emptyDetail(); selected = null;
  let query = queues[queue].scope(supabase.from(queues[queue].table).select('*')).order('created_at', {ascending:false}).limit(100);
  if(filter.value === 'open') query = query.not('status', 'in', `(${queues[queue].done.join(',')})`);
  else if(filter.value !== 'all') query = query.eq('status', filter.value);
  const term = search.value.replace(/[^\p{L}\p{N}@.\-' ]/gu, '').trim();
  if(term) query = query.or(`full_name.ilike."*${term}*",email.ilike."*${term}*"`);
  const [{data, error}] = await Promise.all([query, refreshCounts()]);
  if(error){list.innerHTML = '<p class="list-empty">This list could not be loaded. Check your access and try again.</p>'; return}
  rows = data;
  if(!rows.length){
    list.innerHTML = term || !['open','all'].includes(filter.value) ? emptyState('sparkle', 'No matches', 'Try another name, email or status.')
      : filter.value === 'open' ? emptyState('check', 'All caught up', `Every ${queues[queue].label.toLowerCase().replace(/s$/, '')} has been answered. Choose “All” to see earlier ones.`)
      : emptyState(queues[queue].icon, `No ${queues[queue].label.toLowerCase()} yet`, 'New submissions from the church websites will appear here.');
    return;
  }
  const preview = row => row.message || row.testimony || [row.visit_date ? `Visiting ${londonDate(noon(row.visit_date), {weekday:'short', day:'numeric', month:'short'})}` : '', row.town_or_city, row.party_size ? plural(row.party_size, 'person', 'people') : ''].filter(Boolean).join(' · ');
  list.innerHTML = rows.map((row, index) => {
    const fresh = row.status === queues[queue].statuses[0], stale = !queues[queue].done.includes(row.status) && daysSince(row.created_at) >= 2;
    return `<button class="row queue-item ${fresh ? 'is-new' : ''}" type="button" data-row="${index}">${avatar(row.full_name)}<span class="row-main"><span class="item-top"><strong>${safe(row.full_name)}</strong><time datetime="${safe(row.created_at)}">${when(row.created_at)}</time></span><small>${safe(preview(row) || row.email)}</small><span class="item-tags">${pill(row.status)}${stale ? `<span class="age-badge">${icon('clock')}Waiting ${waited(row.created_at)}</span>` : ''}</span></span></button>`;
  }).join('') + (rows.length === 100 ? '<p class="list-note">Showing the newest 100. Search to find older ones.</p>' : '');
}
list.addEventListener('click', event => {const button = event.target.closest('[data-row]'); if(button) selectRow(Number(button.dataset.row))});

function selectRow(index){
  list.querySelector('[aria-current="true"]')?.removeAttribute('aria-current');
  list.querySelector(`[data-row="${index}"]`)?.setAttribute('aria-current', 'true');
  selected = rows[index]; renderRecord(selected);
}

async function renderRecord(row){
  const testimony = queue === 'testimonies'; let events = [];
  if(testimony){const {data} = await supabase.from('testimony_review_events').select('*').eq('testimony_id', row.id).order('created_at', {ascending:false}); events = data || []}
  const info = queue === 'visitors'
    ? [['Visiting', row.visit_date ? londonDate(noon(row.visit_date), {weekday:'long', day:'numeric', month:'long'}) : ''], ['Town or city', row.town_or_city], ['Coming as', row.party_size ? plural(row.party_size, 'person', 'people') : ''], ['Contact by', row.preferred_contact && row.preferred_contact !== 'none' ? title(row.preferred_contact) : 'No follow-up requested'], ['Phone', row.phone]]
    : testimony ? [['Phone', row.phone], ['Share online', row.online_sharing_consent ? 'Allowed' : 'Not allowed'], ['Use their name', row.name_sharing_consent ? 'Allowed' : 'Not allowed']]
    : [['Topic', title(row.topic)], ['Sent from', sourceNames[row.source] || row.source]];
  const body = testimony ? row.testimony : queue === 'visitors' ? '' : row.message;
  const mail = `mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent(queues[queue].subject)}`;
  const stale = !queues[queue].done.includes(row.status) && daysSince(row.created_at) >= 2;
  detail.innerHTML = `<button class="back-button" type="button" id="back-to-list"><svg viewBox="0 0 10 17" aria-hidden="true"><path d="M8.5 1.5 1.5 8.5l7 7"/></svg>${queues[queue].label}</button>
    <div class="record-head">${avatar(row.full_name, 'large')}<div><h2>${safe(row.full_name)}</h2><p>${safe(row.email)}</p><p class="record-when">${icon('clock')}Received ${dateLabel(row.created_at)}${stale ? ` · <strong>waiting ${waited(row.created_at)}</strong>` : ''}</p></div></div>
    <div class="action-bar"><a class="action primary-action" href="${safe(mail)}">${icon('reply')}<span>Reply</span></a>${row.phone ? `<a class="action" href="tel:${safe(encodeURIComponent(row.phone.replace(/\s+/g, '')))}">${icon('phone')}<span>Call</span></a>` : ''}<button class="action" type="button" id="copy-email">${icon('mail')}<span>Copy email</span></button></div>
    ${body ? `<div class="record-body">${safe(body)}</div>` : ''}
    <div class="info-list">${info.filter(([, value]) => value !== null && value !== undefined && value !== '').map(([label, value]) => `<div class="row"><span class="row-main">${label}</span><span class="row-value">${safe(value)}</span></div>`).join('')}</div>
    ${testimony ? testimonyForm(row) : `<section class="status-section" aria-labelledby="status-title"><h3 id="status-title">Status</h3><div class="status-steps" role="group" aria-label="Set status">${queues[queue].statuses.map(status => `<button type="button" data-status-set="${status}" aria-pressed="${row.status === status}">${row.status === status ? icon('check') : ''}${title(status)}</button>`).join('')}</div><p class="status-hint">Tap to update. Closed items stay on record; choose “All” to see them.</p></section>`}
    ${events.length ? `<section class="record-history"><h3>Review history</h3>${events.map(event => `<div class="history-item"><strong>${safe(readable(event.action))}</strong> · ${dateLabel(event.created_at)}${event.member_message ? `\n${safe(event.member_message)}` : ''}${event.proposed_wording ? `\n\nSuggested wording:\n${safe(event.proposed_wording)}\nMember confirmed: ${event.member_confirmed_wording ? 'yes' : 'no'}` : ''}</div>`).join('')}</section>` : ''}`;
  if(testimony){const form = $('#record-action-form'); form.addEventListener('submit', saveReview); form.addEventListener('input', () => delete form.dataset.reviewKey)}
  else detail.querySelectorAll('[data-status-set]').forEach(button => button.addEventListener('click', () => setStatus(button.dataset.statusSet)));
  $('#back-to-list').addEventListener('click', () => {split.classList.remove('show-detail'); list.querySelector('[aria-current="true"]')?.focus()});
  $('#copy-email').addEventListener('click', async () => {try{await navigator.clipboard.writeText(row.email); toast('Email address copied.')}catch{toast(row.email)}});
  split.classList.add('show-detail'); detail.focus({preventScroll:true});
  if(matchMedia('(max-width:760px)').matches) window.scrollTo(0, 0);
}
const testimonyForm = row => `<form class="record-actions" id="record-action-form"><label for="next-status">Review status</label><select id="next-status" name="status">${queues.testimonies.statuses.map(status => `<option value="${status}" ${row.status === status ? 'selected' : ''}>${title(status)}</option>`).join('')}</select><label for="proposed-wording">Suggested edited wording <span>Optional. The member must confirm before approval.</span></label><textarea id="proposed-wording" name="proposed_wording" maxlength="8000" placeholder="If you edit their words, put the proposed version here for them to confirm."></textarea><label class="consent-check"><input type="checkbox" name="member_confirmed_wording" value="true"><span>The member has confirmed this wording.</span></label><label for="member-message">Review note <span>Optional</span></label><textarea id="member-message" name="member_message" maxlength="3000" placeholder="What you would like to discuss with the person."></textarea><button class="primary" type="submit">Save review</button></form>`;

// One-tap status for enquiries, prayer and visitors, with Undo in the toast.
async function setStatus(status){
  if(!selected || selected.status === status) return;
  const id = selected.id, name = queue, previous = {status: selected.status, closed_at: selected.closed_at ?? null};
  if(await writeStatus(name, id, {status, closed_at: status === 'closed' ? new Date().toISOString() : null}))
    toast(`Marked as ${readable(status)}.`, {undo: async () => {if(await writeStatus(name, id, previous)) toast('Change undone.')}});
}
async function writeStatus(name, id, values){
  detail.querySelectorAll('[data-status-set]').forEach(button => button.disabled = true);
  const {error} = await supabase.from(queues[name].table).update(values).eq('id', id);
  if(error){detail.querySelectorAll('[data-status-set]').forEach(button => button.disabled = false); toast('Could not save this update. Please try again.', {bad:true}); return false}
  if(queue === name){await loadQueue(); const index = rows.findIndex(row => row.id === id); if(index >= 0) selectRow(index)}
  return true;
}

async function saveReview(event){
  event.preventDefault(); if(!selected) return;
  const form = event.currentTarget, values = new FormData(form), status = String(values.get('status'));
  const button = form.querySelector('button[type="submit"]'); button.disabled = true;
  const session = await supabase.auth.getSession();
  form.dataset.reviewKey ||= crypto.randomUUID();
  const response = await fetch('/api/review-testimony', {method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${session.data.session?.access_token || ''}`}, body: JSON.stringify({testimony_id: selected.id, review_key: form.dataset.reviewKey, status, member_message: String(values.get('member_message') || '').trim(), proposed_wording: String(values.get('proposed_wording') || '').trim() || null, member_confirmed_wording: values.get('member_confirmed_wording') === 'true'})});
  const result = await response.json().catch(() => ({}));
  if(!response.ok){button.disabled = false; toast(result.error || 'Could not save this review. Please try again.', {bad:true}); return}
  toast(result.notificationSent === true ? 'Saved. The member has been emailed.' : 'Saved. No email was sent to the member.');
  const id = selected.id; await loadQueue();
  const index = rows.findIndex(row => row.id === id); if(index >= 0) selectRow(index);
}

/* ---------- Attendance ---------- */
function lastSunday(){const today = new Date(noon(dayKey(new Date()))); today.setUTCDate(today.getUTCDate() - today.getUTCDay()); return today.toISOString().slice(0, 10)}

async function loadAttendance(){
  const form = $('#attendance-form');
  if(!form.service_date.value) form.service_date.value = lastSunday();
  form.service_date.max = dayKey(new Date());
  $('#attendance-recent').innerHTML = skeletonRows(4);
  const {data, error} = await supabase.from('service_attendance').select('service_date,service_time,total_attendance,first_time_attendance').order('service_date', {ascending:false}).order('service_time').limit(104);
  if(error){$('#attendance-recent').innerHTML = '<p class="list-empty">Attendance could not be loaded.</p>'; return}
  const sundays = new Map();
  (data || []).forEach(row => {const day = sundays.get(row.service_date) || {date: row.service_date, '09:00': 0, '11:30': 0, total: 0, first: 0}; day[row.service_time] = row.total_attendance; day.total += row.total_attendance; day.first += row.first_time_attendance; sundays.set(row.service_date, day)});
  const days = [...sundays.values()], latest = days[0], recent = days.slice(0, 12);
  const average = recent.length ? Math.round(recent.reduce((sum, day) => sum + day.total, 0) / recent.length) : 0;
  const firstTimers = recent.reduce((sum, day) => sum + day.first, 0);
  $('#attendance-summary').innerHTML = [
    tile({label:'Last Sunday', iconName:'people', color:'var(--site-youth)', value: latest ? number(latest.total) : '—', note: latest ? `${londonDate(noon(latest.date), {day:'numeric', month:'short'})} · 9:00 ${number(latest['09:00'])} · 11:30 ${number(latest['11:30'])}` : 'Nothing recorded yet'}),
    tile({label:'Average Sunday', iconName:'chart', color:'var(--tint)', value: recent.length ? number(average) : '—', sparkline: spark([...recent].reverse().map(day => day.total), 'var(--tint)'), note: recent.length ? `Across the last ${plural(recent.length, 'Sunday', 'Sundays')}` : 'Nothing recorded yet'}),
    tile({label:'First-time guests', iconName:'sparkle', color:'var(--gold)', value: recent.length ? number(firstTimers) : '—', note: recent.length ? `Over the last ${plural(recent.length, 'Sunday', 'Sundays')}` : 'Nothing recorded yet'})
  ].join('');
  const chart = $('#attendance-chart');
  if(recent.length) stackChart(chart, [...recent].reverse().map(day => ({label: londonDate(noon(day.date), {day:'numeric', month:'short'}), values: {'09:00': day['09:00'], '11:30': day['11:30']}})), [{key:'09:00', name:'9:00 am', color:'var(--tint)'}, {key:'11:30', name:'11:30 am', color:'var(--gold)'}], {height: 210, unit: 'people'});
  else chart.innerHTML = emptyState('people', 'No Sundays recorded yet', 'Record the first service below and the chart will start here.');
  $('#attendance-recent').innerHTML = days.length ? days.slice(0, 8).map(day => `<div class="row">${badge('calendar', 'var(--fill-strong)')}<span class="row-main"><strong>${londonDate(noon(day.date), {weekday:'short', day:'numeric', month:'short', year:'numeric'})}</strong><small>9:00 · ${number(day['09:00'])}  ·  11:30 · ${number(day['11:30'])}  ·  ${number(day.first)} new</small></span><span class="row-value strong">${number(day.total)}</span></div>`).join('') : emptyState('calendar', 'Nothing recorded yet', 'Saved Sundays will be listed here.');
}

async function saveAttendance(event){
  event.preventDefault();
  const form = event.currentTarget, values = new FormData(form), target = $('#attendance-message');
  const service_date = String(values.get('service_date')), service_time = String(values.get('service_time'));
  const total_attendance = Number(values.get('total_attendance')), first_time_attendance = Number(values.get('first_time_attendance'));
  if(!/^\d{4}-\d{2}-\d{2}$/.test(service_date) || service_date > dayKey(new Date()) || !['09:00','11:30'].includes(service_time) || !Number.isInteger(total_attendance) || total_attendance < 0 || !Number.isInteger(first_time_attendance) || first_time_attendance < 0 || first_time_attendance > total_attendance){showMessage(target, 'Check the date and numbers. First-time people cannot be more than the total.', true); return}
  const button = form.querySelector('button[type="submit"]'); button.disabled = true;
  const {data:{user}} = await supabase.auth.getUser();
  const counts = {total_attendance, first_time_attendance, updated_at: new Date().toISOString(), updated_by: user.id};
  let {error} = await supabase.from('service_attendance').insert({service_date, service_time, ...counts});
  if(error?.code === '23505') ({error} = await supabase.from('service_attendance').update(counts).eq('service_date', service_date).eq('service_time', service_time));
  button.disabled = false;
  if(error){showMessage(target, 'Attendance could not be saved. Please check your access and try again.', true); return}
  showMessage(target, '');
  toast(`Saved ${service_time === '09:00' ? '9:00 am' : '11:30 am'} on ${londonDate(noon(service_date), {day:'numeric', month:'short'})}: ${plural(total_attendance, 'person', 'people')}.`);
  form.total_attendance.value = ''; form.first_time_attendance.value = '0';
  form.service_time.value = service_time === '09:00' ? '11:30' : '09:00';
  await loadAttendance();
}

/* ---------- Sign-in ---------- */
function show(panel){[loginPanel, passwordPanel, noAccessPanel, dashboard].forEach(item => item.classList.toggle('hidden', item !== panel))}
function clearPrivate(){list.innerHTML = ''; detail.innerHTML = ''; rows = []; selected = null; report = null; ['#overview-tiles','#attention-list','#recent-list','#submissions-chart','#pipeline-chart','#location-insight','#insights-body','#attendance-summary','#attendance-chart','#attendance-recent','#hero-line','#account-email','#account-role'].forEach(id => $(id).innerHTML = '')}
async function signOut(){await supabase.auth.signOut(); staffRole = null; clearPrivate(); history.replaceState(null, '', location.pathname); show(loginPanel)}

async function initialise(){
  if(!config.url || !config.publishableKey){showMessage(message, 'The church Supabase project is not connected to this build yet.', true); $('#login-form button').disabled = true; return}
  supabase = createClient(config.url, config.publishableKey, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}});
  $('#password-form').addEventListener('submit', async event => {
    event.preventDefault(); const values = new FormData(event.currentTarget), target = $('#password-message');
    if(values.get('password') !== values.get('repeat')){showMessage(target, 'The passwords do not match.', true); return}
    const button = event.currentTarget.querySelector('button'); button.disabled = true;
    const {error} = await supabase.auth.updateUser({password: String(values.get('password'))}); button.disabled = false;
    if(error){showMessage(target, 'Could not set your password. Please reopen your invitation or contact the administrator.', true); return}
    event.currentTarget.reset(); history.replaceState(null, '', location.pathname); await verifyStaff();
  });
  $('#login-form').addEventListener('submit', signIn);
  $('#forgot-password').addEventListener('click', resetPassword);
  document.querySelectorAll('[data-sign-out]').forEach(button => button.addEventListener('click', signOut));
  filter.addEventListener('change', loadQueue);
  search.addEventListener('input', () => {clearTimeout(searchTimer); searchTimer = setTimeout(loadQueue, 300)});
  $('#refresh-queue').addEventListener('click', loadQueue);
  $('#refresh-overview').addEventListener('click', loadOverview);
  $('#attendance-form').addEventListener('submit', saveAttendance);
  dashboard.addEventListener('click', async event => {
    const go = event.target.closest('[data-go]'); if(!go) return;
    if(go.dataset.go === 'inbox' && go.dataset.queueGo){await openTab('inbox', {focus:false, load:false}); await openQueue(go.dataset.queueGo, {status: go.dataset.status, openId: go.dataset.open})}
    else await openTab(go.dataset.go);
  });
  supabase.auth.onAuthStateChange(event => {if(event === 'SIGNED_OUT' && staffRole){staffRole = null; clearPrivate(); show(loginPanel); showMessage(message, 'You have been signed out. Please sign in again.')}});
  const {data:{session}} = await supabase.auth.getSession();
  if(session && invited) show(passwordPanel); else if(session) await verifyStaff();
}

async function signIn(event){
  event.preventDefault(); const values = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('button'); button.disabled = true;
  const {error} = await supabase.auth.signInWithPassword({email: values.get('email'), password: values.get('password')});
  button.disabled = false;
  if(error){showMessage(message, 'Sign-in failed. Check the email and password, or contact the church administrator.', true); return}
  await verifyStaff();
}

async function resetPassword(){
  const email = $('#email');
  if(!email.value || !email.checkValidity()){showMessage(message, 'Enter your email address above, then choose “Forgot your password?” again.', true); email.focus(); return}
  const button = $('#forgot-password'); button.disabled = true;
  const {error} = await supabase.auth.resetPasswordForEmail(email.value, {redirectTo: location.origin + location.pathname}); button.disabled = false;
  if(error){showMessage(message, 'Could not send a reset link. Please try again shortly or contact the church administrator.', true); return}
  showMessage(message, 'If that address has a church office account, a reset link is on its way. Check your inbox.');
}

async function verifyStaff(){
  const {data, error} = await supabase.rpc('current_staff_role');
  if(error || !data){await supabase.auth.signOut(); show(loginPanel); showMessage(message, 'This account has no authorised church office role. Ask an administrator to grant access.', true); return}
  staffRole = data;
  if(!access[data]){show(noAccessPanel); return}
  const {data:{user}} = await supabase.auth.getUser();
  $('#account-email').textContent = user?.email || '';
  $('#account-role').textContent = title(data);
  $('#account-avatar').textContent = (user?.email || '?')[0].toUpperCase();
  document.querySelectorAll('[data-tab]').forEach(tab => tab.hidden = !allowed('tabs', tab.dataset.tab));
  document.querySelectorAll('[data-queue]').forEach(tab => tab.hidden = !allowed('queues', tab.dataset.queue));
  $('#tab-bar').hidden = access[data].tabs.length < 2;
  markRange(document.querySelector(`[data-days="${rangeDays}"]`));
  queue = access[data].queues[0]; markQueue(document.querySelector(`[data-queue="${queue}"]`)); setFilterOptions(); filter.value = 'open';
  show(dashboard);
  const requested = location.hash.slice(1);
  await openTab(allowed('tabs', requested) ? requested : access[data].tabs[0], {focus:false});
}

initialise();
