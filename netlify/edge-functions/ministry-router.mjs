const ministryHosts = new Map([
  ['audacious.rccgcodcanterbury.com', 'audacious'],
  ['youth.rccgcodcanterbury.com', 'youth']
]);

const tenantDiscoveryFiles = new Set(['/robots.txt', '/sitemap.xml', '/llms.txt']);

export default async (request, context) => {
  const url = new URL(request.url);
  if (url.hostname.toLowerCase() === 'admin.rccgcodcanterbury.com' && ['GET', 'HEAD'].includes(request.method)) {
    if (url.pathname === '/') {
      const destination = new URL(request.url);
      destination.pathname = '/admin/';
      return context.rewrite(destination);
    }
    if (!url.pathname.startsWith('/admin/') && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/.netlify/')) {
      return Response.redirect(`https://rccgcodcanterbury.com${url.pathname}${url.search}`, 302);
    }
    return;
  }
  const ministry = ministryHosts.get(url.hostname.toLowerCase());

  if (!ministry || !['GET', 'HEAD'].includes(request.method)) return;

  const path = url.pathname;
  const isApplicationRoute = path.startsWith('/api/') || path.startsWith('/.netlify/');
  const isPageRoute = path.endsWith('/') || !path.split('/').pop().includes('.');
  const isTenantDiscoveryFile = tenantDiscoveryFiles.has(path);

  if (isApplicationRoute || (!isPageRoute && !isTenantDiscoveryFile)) return;

  const destination = new URL(request.url);
  destination.pathname = `/${ministry}${path === '/' ? '/' : path}`;
  return context.rewrite(destination);
};
