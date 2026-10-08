const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Shared, progressive enhancements across all three church sites.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const siteHeader = $('.header, .ministry-header');
const updateHeader = () => siteHeader?.classList.toggle('is-scrolled', scrollY > 24);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  $$('.intro > *, .section-heading, .life-item, .sermon-card, .next-generation-card, .ministry-intro > div, .ministry-features > *, .ministry-gathering > *, .contact-section > *, .ministry-contact > *').forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`);
    observer.observe(element);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) { observer.disconnect(); $$('.reveal').forEach(el => el.classList.add('is-revealed')); }
  });
}
const menu = $('.menu-toggle, .ministry-menu-toggle');
const navigation = $('#navigation, #ministry-navigation');
function setMenu(open, restoreFocus = false) {
  if (!menu || !navigation) return;
  navigation.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  menu.innerHTML = open ? 'Close <span aria-hidden="true">✕</span>' : 'Menu <span aria-hidden="true">☰</span>';
  document.body.classList.toggle('navigation-open', open);
  $$('main, footer').forEach(element => { element.inert = open; });
  if (restoreFocus) menu.focus();
}
if (menu && navigation) {
  menu.setAttribute('aria-label', 'Open navigation menu');
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  $$('a', navigation).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => { if (!event.target.closest('header') && navigation.classList.contains('open')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (!navigation.classList.contains('open')) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
    if (event.key === 'Tab') {
      const controls = [menu, ...$$('a', navigation)];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', () => { if (getComputedStyle(menu).display === 'none') setMenu(false); });
}

const heroSlider = $('[data-hero-slider]');
if (heroSlider) {
  const slides = $$('[data-hero-slide]', heroSlider);
  const dots = $$('[data-hero-dot]', heroSlider);
  const progress = $('.hero-progress span', heroSlider);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let pointerStartX = 0;
  let paused = false;
  const videoHost = $('[data-hero-video]', heroSlider);
  const showVideo = () => {
    if (!videoHost || current !== 0 || paused || reduceMotion.matches || window.matchMedia('(max-width: 600px)').matches || document.hidden || videoHost.firstChild) return;
    const clip = document.createElement('video');
    clip.muted = true;
    clip.autoplay = true;
    clip.loop = true;
    clip.playsInline = true;
    clip.preload = 'metadata';
    clip.setAttribute('aria-hidden', 'true');
    clip.addEventListener('playing', () => videoHost.classList.add('is-ready'));
    clip.addEventListener('error', () => hideVideo(), { once: true });
    clip.src = '/assets/canterbury-hero.mp4';
    videoHost.append(clip);
    clip.play().catch(hideVideo);
  };
  const hideVideo = () => { if (videoHost) { videoHost.replaceChildren(); videoHost.classList.remove('is-ready'); } };
  const pauseButton = document.createElement('button');
  pauseButton.className = 'hero-arrow hero-pause';
  pauseButton.textContent = 'Pause';
  pauseButton.setAttribute('aria-label', 'Pause hero motion');
  pauseButton.setAttribute('aria-pressed', 'false');
  $('.hero-slider-controls', heroSlider)?.append(pauseButton);

  const restartProgress = () => {
    if (!progress || reduceMotion.matches) return;
    progress.style.animation = 'none';
    progress.style.animationDuration = current === 0 ? '12s' : '6s';
    void progress.offsetWidth;
    progress.style.animation = '';
  };

  const showSlide = (next, direction = 1) => {
    const target = (next + slides.length) % slides.length;
    if (target === current) return;
    const outgoing = slides[current];
    const incoming = slides[target];
    outgoing.classList.remove('is-active');
    outgoing.classList.add(direction > 0 ? 'is-leaving-left' : 'is-leaving-right');
    outgoing.setAttribute('aria-hidden', 'true');
    incoming.classList.remove('is-leaving-left', 'is-leaving-right');
    incoming.classList.add('is-active');
    incoming.setAttribute('aria-hidden', 'false');
    dots[current]?.classList.remove('is-active');
    dots[current]?.setAttribute('aria-current', 'false');
    dots[target]?.classList.add('is-active');
    dots[target]?.setAttribute('aria-current', 'true');
    window.setTimeout(() => outgoing.classList.remove('is-leaving-left', 'is-leaving-right'), 1100);
    current = target;
    if (current === 0) showVideo(); else hideVideo();
    restartProgress();
  };

  const stop = () => window.clearTimeout(timer);
  const start = () => {
    stop();
    if (!reduceMotion.matches && !paused && !document.hidden) timer = window.setTimeout(() => { showSlide(current + 1, 1); start(); }, current === 0 ? 12000 : 6000);
  };
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play hero motion' : 'Pause hero motion');
    pauseButton.setAttribute('aria-pressed', String(paused));
    heroSlider.classList.toggle('is-paused', paused);
    if (paused) hideVideo(); else showVideo();
    start();
  });

  $('[data-hero-prev]', heroSlider)?.addEventListener('click', () => { showSlide(current - 1, -1); start(); });
  $('[data-hero-next]', heroSlider)?.addEventListener('click', () => { showSlide(current + 1, 1); start(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index, index > current ? 1 : -1); start(); }));
  heroSlider.addEventListener('mouseenter', stop);
  heroSlider.addEventListener('mouseleave', start);
  heroSlider.addEventListener('focusin', stop);
  heroSlider.addEventListener('focusout', start);
  heroSlider.addEventListener('pointerdown', event => { pointerStartX = event.clientX; });
  heroSlider.addEventListener('pointerup', event => {
    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 55) { showSlide(current + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1); start(); }
  });
  heroSlider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { showSlide(current - 1, -1); start(); }
    if (event.key === 'ArrowRight') { showSlide(current + 1, 1); start(); }
  });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) hideVideo(); else showVideo(); start(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); hideVideo(); } else { showVideo(); start(); } });
  restartProgress();
  showVideo();
  start();
}

// A seamless right-to-left message row. Pause reasons remain independent.
const sermonRail = $('[data-sermon-rail]');
if (sermonRail) {
  const toggle = $('[data-rail-pause]', sermonRail);
  let userPaused = false;
  let hovered = false;
  let focused = false;
  let visible = true;
  const updateRail = () => {
    const mediaOpen = $('#media-dialog')?.open;
    sermonRail.classList.toggle('is-paused', userPaused || hovered || focused || document.hidden || !visible || mediaOpen || motionPreference.matches);
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.innerHTML = userPaused ? 'Resume movement <span aria-hidden="true">▶</span>' : 'Pause movement <span aria-hidden="true">Ⅱ</span>';
  };
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    if (!userPaused && sermonRail.classList.contains('is-browsing')) {
      const viewport = $('.sermon-rail-window', sermonRail);
      const track = $('.sermon-rail-track', sermonRail);
      const loopWidth = $('.sermon-rail-group', track).getBoundingClientRect().width;
      const duration = parseFloat(getComputedStyle(track).animationDuration) || 100;
      track.style.animationDelay = `-${(viewport.scrollLeft % loopWidth) / loopWidth * duration}s`;
      sermonRail.classList.remove('is-browsing');
      viewport.scrollLeft = 0;
    }
    updateRail();
  });
  const windowElement = $('.sermon-rail-window', sermonRail);
  // Touch users can take over the moving row and browse it horizontally.
  windowElement.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || sermonRail.classList.contains('is-browsing')) return;
    const track = $('.sermon-rail-track', sermonRail);
    const transform = new DOMMatrixReadOnly(getComputedStyle(track).transform);
    userPaused = true;
    sermonRail.classList.add('is-browsing');
    windowElement.scrollLeft = Math.abs(transform.m41);
    updateRail();
  }, { passive: true });
  windowElement.addEventListener('mouseenter', () => { hovered = true; updateRail(); });
  windowElement.addEventListener('mouseleave', () => { hovered = false; updateRail(); });
  windowElement.addEventListener('focusin', () => { focused = true; updateRail(); });
  windowElement.addEventListener('focusout', () => { focused = false; updateRail(); });
  document.addEventListener('visibilitychange', updateRail);
  motionPreference.addEventListener('change', updateRail);
  $('#media-dialog')?.addEventListener('close', updateRail);
  new MutationObserver(updateRail).observe($('#media-dialog'), { attributes: true, attributeFilter: ['open'] });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateRail(); }).observe(sermonRail);
  updateRail();
}

const dialog = $('#media-dialog');
const content = $('#media-content');
function closeDialog() { if (dialog?.open) dialog.close(); if (content) content.innerHTML = ''; }
if (dialog) {
  dialog.setAttribute('aria-label', 'Church media viewer');
  dialog.addEventListener('close', () => { content.replaceChildren(); });
  $('.dialog-close', dialog)?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-video]');
  if (!button || !dialog || !content) return;
  const id = button.dataset.video;
  if (!/^[\w-]{11}$/.test(id)) return;
  content.innerHTML = `<iframe title="Sermon video" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  dialog.showModal();
});
const galleryItems = $$('[data-gallery]');
let galleryIndex = -1;
function displayGallery(index) {
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const source = galleryItems[galleryIndex];
  const photo = document.createElement('img');
  photo.className = 'gallery-lightbox';
  photo.src = source.dataset.gallery;
  photo.alt = $('img', source)?.alt || 'Church gathering';
  const controls = document.createElement('div');
  controls.className = 'gallery-controls';
  const counter = document.createElement('span');
  counter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
  counter.setAttribute('aria-live', 'polite');
  const previous = document.createElement('button'); previous.textContent = '← Previous'; previous.onclick = () => displayGallery(galleryIndex - 1);
  const next = document.createElement('button'); next.textContent = 'Next →'; next.onclick = () => displayGallery(galleryIndex + 1);
  const focusedLabel = document.activeElement?.textContent;
  controls.append(previous, counter, next);
  content.replaceChildren(photo, controls);
  if (focusedLabel === previous.textContent) previous.focus();
  if (focusedLabel === next.textContent) next.focus();
}
galleryItems.forEach((button, index) => button.addEventListener('click', () => { displayGallery(index); dialog.showModal(); }));
dialog?.addEventListener('keydown', event => {
  if (!$('.gallery-controls', dialog)) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); displayGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
});

const search = $('#sermon-search');
if (search) {
  const empty = $('#sermon-empty');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase(); let visible = 0;
    $$('.sermon-card').forEach(card => { const match = card.dataset.search.includes(query); card.classList.toggle('hidden', !match); if (match) visible++; });
    empty.hidden = visible !== 0;
  });
}

const eventFilter = $('#event-filter');
const eventDate = $('#event-date');
const londonToday = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function updateEvents() {
  for (const list of $$('[data-event-list]')) {
    let visible = 0;
    const minimum = eventDate?.value || londonToday();
    const limit = list.dataset.upcoming === 'true' ? Number(list.dataset.limit) : Infinity;
    for (const row of $$('.event-row',list)) {
      const title = $('h3',row).textContent.toLowerCase();
      const kind = eventFilter?.value || 'all';
      const typeOk = kind === 'all' || (kind === 'sunday' && title.includes('sunday')) || (kind === 'friday' && title.includes('friday'));
      const matches = typeOk && row.dataset.eventDate >= minimum && visible < limit;
      row.classList.toggle('hidden',!matches);
      if(matches) visible++;
    }
    const empty = $('#event-empty');
    if(empty) empty.hidden = visible > 0;
  }
}
if(eventDate) eventDate.value = londonToday();
eventFilter?.addEventListener('change',updateEvents);
eventDate?.addEventListener('change',updateEvents);
updateEvents();
setInterval(updateEvents,60000);

async function refreshEvents(){
 if(!document.querySelector('[data-event-list]'))return;
 try{
  const response=await fetch('/api/events',{signal:AbortSignal.timeout(12000)});
  if(!response.ok)return;
  const data=await response.json();
  if(!Array.isArray(data.events)||!data.events.length)return;
  const known=new Map($$('.event-row').map(row=>[row.getAttribute('href').split('/').filter(Boolean).pop(),row.getAttribute('href')]));
  const decode=value=>{const text=document.createElement('textarea');text.innerHTML=value;return text.value};
  for(const list of $$('[data-event-list]')){
   const rows=data.events.map(event=>{
    const row=document.createElement('a');row.className='event-row';row.dataset.eventDate=event.start_date.slice(0,10);
    row.href=known.get(String(event.id))||'https://codcanterburychurch.org/events/';
    const time=document.createElement('time');time.dateTime=event.start_date.replace(' ','T');
    time.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(new Date(event.start_date.replace(' ','T')+'Z'));
    const small=document.createElement('small');small.textContent=event.start_date.slice(11,16);time.append(small);
    const title=document.createElement('h3');title.textContent=decode(event.title);
    const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');row.append(time,title,arrow);return row;
   });
   list.replaceChildren(...rows);
  }
  updateEvents();
 }catch{/* The saved upcoming calendar remains available. */}
}
refreshEvents();

// Fetch recent public uploads through the site's cached endpoint; static cards remain usable.
async function refreshYouTube() {
  const track = $('.sermon-rail-track');
  const grid = $('[data-youtube-grid]');
  if (!track && !grid) return;
  try {
    const response = await fetch('/api/youtube-feed', { signal: AbortSignal.timeout(9000) });
    if (!response.ok) return;
    const data = await response.json();
    if (data.source !== 'youtube' || !Array.isArray(data.videos)) return;
    const videos = data.videos.filter(video => /^[\w-]{11}$/.test(video.id) && typeof video.title === 'string').slice(0, 12);
    if (!videos.length || dialog?.open || track?.contains(document.activeElement) || sermonRail?.classList.contains('is-browsing')) return;
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    function videoButton(video) {
      const button = element('button', 'video');
      button.type = 'button'; button.dataset.video = video.id; button.setAttribute('aria-label', `Watch ${video.title}`);
      const image = element('img'); image.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`; image.alt = video.title; image.loading = 'lazy'; image.width = 480; image.height = 270;
      const play = element('span', 'play', '▶'); play.setAttribute('aria-hidden', 'true');
      button.append(image, play);
      return button;
    }
    const titleParts = video => video.title.split(/\s*\|+\s*/).filter(Boolean);
    function caption(video) {
      const parts = titleParts(video);
      const description = parts.slice(1).filter(part => !/^RCCG/i.test(part)).join(' / ');
      const block = element('div'); block.append(element('h3', '', parts[0]), element('p', '', description));
      return block;
    }
    if (track) {
      const group = element('div', 'sermon-rail-group');
      videos.forEach((video, index) => {
        const card = element('article', 'sermon-rail-card');
        const details = element('div', 'sermon-rail-caption'); details.append(element('span', 'sermon-number', String(index + 1).padStart(2, '0')), caption(video));
        card.append(videoButton(video), details); group.append(card);
      });
      const copy = group.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); $$('button', copy).forEach(button => button.tabIndex = -1);
      track.replaceChildren(group, copy);
      track.style.animationDuration = `${Math.max(100, videos.length * 16)}s`;
    }
    if (grid) {
      const cards = videos.map(video => {
        const card = element('article', 'sermon-card'); card.dataset.search = video.title.toLowerCase();
        const text = caption(video); const heading = text.querySelector('h3'); const h2 = element('h2', '', heading.textContent); heading.replaceWith(h2);
        const link = element('a', 'text-link', 'Watch on YouTube'); link.href = `https://www.youtube.com/watch?v=${video.id}`;
        card.append(videoButton(video), ...text.childNodes, link); return card;
      });
      grid.replaceChildren(...cards);
      search?.dispatchEvent(new Event('input'));
      const note = $('[data-youtube-note]'); if (note) note.textContent = 'Recent uploads from our official YouTube channel. Visit the channel for the full archive and live services.';
    }
  } catch { /* The generated selection is the fallback, including on local static previews. */ }
}
refreshYouTube();
