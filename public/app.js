const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const menu = $('.menu-toggle');
const navigation = $('#navigation');
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
    if (!reduceMotion.matches) timer = window.setInterval(() => showSlide(current + 1, 1), 6000);
  };

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

const dialog = $('#media-dialog');
const content = $('#media-content');
function closeDialog() { if (dialog?.open) dialog.close(); if (content) content.innerHTML = ''; }
if (dialog) {
  $('.dialog-close', dialog)?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
}
$$('[data-video]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.video;
  content.innerHTML = `<iframe title="Sermon video" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  dialog.showModal();
}));
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  content.innerHTML = `<img class="gallery-lightbox" src="${button.dataset.gallery}" alt="">`;
  dialog.showModal();
}));

const search = $('#sermon-search');
if (search) {
  const cards = $$('.sermon-card'); const empty = $('#sermon-empty');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase(); let visible = 0;
    cards.forEach(card => { const match = card.dataset.search.includes(query); card.classList.toggle('hidden', !match); if (match) visible++; });
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
