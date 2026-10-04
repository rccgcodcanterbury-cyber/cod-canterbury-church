import type { Context, Config } from '@netlify/edge-functions';

const ministryForHost = (host: string) => {
  const normalized = host.split(':')[0].toLowerCase();
  if (normalized === 'audacious.rccgcodcanterbury.com') return 'audacious';
  if (normalized === 'youth.rccgcodcanterbury.com') return 'youth';
  return null;
};

const staticAsset = (pathname: string) => pathname.startsWith('/assets/') || /\.(?:css|js|webp|jpg|jpeg|png|svg|ico|xml|txt|json|ics)$/i.test(pathname);

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const hosts = [request.headers.get('x-forwarded-host'), request.headers.get('host'), url.hostname]
    .filter((host): host is string => Boolean(host));
  const ministry = hosts.map(ministryForHost).find(Boolean);

  if (!ministry || staticAsset(url.pathname) || url.pathname === `/${ministry}` || url.pathname.startsWith(`/${ministry}/`)) {
    return context.next();
  }

  url.pathname = `/${ministry}${url.pathname === '/' ? '/' : url.pathname}`;
  return context.nextRequest(new Request(url, request));
};

export const config: Config = { path: '/*' };
