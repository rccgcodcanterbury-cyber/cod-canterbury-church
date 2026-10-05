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
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const expanded = $('[aria-controls][aria-expanded="true"]');
  if (expanded) { document.getElementById(expanded.getAttribute('aria-controls'))?.classList.remove('open'); expanded.setAttribute('aria-expanded', 'false'); expanded.focus(); }
});
document.addEventListener('click', event => {
  if (event.target.closest('header')) return;
  $$('header [aria-expanded="true"]').forEach(button => { document.getElementById(button.getAttribute('aria-controls'))?.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); });
});

const menu = $('.menu-toggle, .ministry-menu-toggle');
const navigation = $('#navigation, #ministry-navigation');
if (menu && navigation) {
  menu.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('a', navigation).forEach(link => link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));
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
  const pauseButton = document.createElement('button');
  pauseButton.className = 'hero-arrow hero-pause';
  pauseButton.textContent = 'Pause';
  pauseButton.setAttribute('aria-label', 'Pause slideshow');
  pauseButton.setAttribute('aria-pressed', 'false');
  $('.hero-slider-controls', heroSlider)?.append(pauseButton);

  const restartProgress = () => {
    if (!progress || reduceMotion.matches) return;
    progress.style.animation = 'none';
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
    restartProgress();
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reduceMotion.matches && !paused && !document.hidden) timer = window.setInterval(() => showSlide(current + 1, 1), 6000);
  };
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    pauseButton.setAttribute('aria-pressed', String(paused));
    heroSlider.classList.toggle('is-paused', paused);
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
  reduceMotion.addEventListener('change', start);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  restartProgress();
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
  toggle.addEventListener('click', () => { userPaused = !userPaused; updateRail(); });
  const windowElement = $('.sermon-rail-window', sermonRail);
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
if (eventFilter && eventDate) {
  const rows = $$('.event-row');
  const update = () => rows.forEach(row => {
    const title = $('h3', row).textContent.toLowerCase();
    const date = $('time', row).textContent;
    const kind = eventFilter.value;
    const typeOk = kind === 'all' || (kind === 'sunday' && title.includes('sunday')) || (kind === 'friday' && title.includes('friday'));
    const parsed = new Date(date.split('\n')[0]);
    const dateOk = !eventDate.value || (!Number.isNaN(parsed) && parsed >= new Date(`${eventDate.value}T00:00:00`));
    row.classList.toggle('hidden', !(typeOk && dateOk));
  });
  eventFilter.addEventListener('change', update); eventDate.addEventListener('change', update);
}


// Fetch recent public uploads through the site's cached endpoint; static cards remain usable.
async function refreshYouTube() {
  const track = $('.sermon-rail-track');
  const grid = $('[data-youtube-grid]');
  if (!track && !grid) return;
  try {
    const response = await fetch('/.netlify/functions/youtube-feed', { signal: AbortSignal.timeout(9000) });
    if (!response.ok) return;
    const data = await response.json();
    if (data.source !== 'youtube' || !Array.isArray(data.videos)) return;
    const videos = data.videos.filter(video => /^[\w-]{11}$/.test(video.id) && typeof video.title === 'string').slice(0, 12);
    if (!videos.length || dialog?.open || track?.contains(document.activeElement)) return;
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
