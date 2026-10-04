const ministryMenu = document.querySelector('.ministry-menu-toggle');
const ministryNavigation = document.querySelector('#ministry-navigation');
if (ministryMenu && ministryNavigation) {
  ministryMenu.addEventListener('click', () => {
    const open = ministryNavigation.classList.toggle('open');
    ministryMenu.setAttribute('aria-expanded', String(open));
  });
  ministryNavigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    ministryNavigation.classList.remove('open');
    ministryMenu.setAttribute('aria-expanded', 'false');
  }));
}
