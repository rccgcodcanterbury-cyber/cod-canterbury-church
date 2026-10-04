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
