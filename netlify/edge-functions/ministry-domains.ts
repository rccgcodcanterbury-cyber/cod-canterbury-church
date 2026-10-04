import type { Config } from '@netlify/edge-functions';

const ministryForHost = (host: string) => {
  if (host === 'audacious.rccgcodcanterbury.com') return 'audacious';
  if (host === 'youth.rccgcodcanterbury.com') return 'youth';
  return null;
};

const staticAsset = (pathname: string) => pathname.startsWith('/assets/') || /\.(?:css|js|webp|jpg|jpeg|png|svg|ico|xml|txt|json|ics)$/i.test(pathname);

export default async (request: Request) => {
  const url = new URL(request.url);
  const requestHost = request.headers.get('host')?.split(':')[0].toLowerCase() || url.hostname;
  const ministry = ministryForHost(requestHost);
  if (!ministry || staticAsset(url.pathname) || url.pathname === `/${ministry}` || url.pathname.startsWith(`/${ministry}/`)) {
    return context.next();
  }
  url.pathname = `/${ministry}${url.pathname === '/' ? '/' : url.pathname}`;
  return url;
};

export const config: Config = { path: '/*' };
