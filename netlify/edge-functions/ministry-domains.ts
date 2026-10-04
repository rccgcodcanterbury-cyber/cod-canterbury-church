import type { Config, Context } from '@netlify/edge-functions';

const ministryForHost = (host: string) => {
  if (host === 'audacious.rccgcodcanterbury.com') return 'audacious';
  if (host === 'youth.rccgcodcanterbury.com') return 'youth';
  return null;
};

const staticAsset = (pathname: string) => pathname.startsWith('/assets/') || /\.(?:css|js|webp|jpg|jpeg|png|svg|ico|xml|txt|json|ics)$/i.test(pathname);

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const ministry = ministryForHost(url.hostname);
  if (!ministry || staticAsset(url.pathname) || url.pathname === `/${ministry}` || url.pathname.startsWith(`/${ministry}/`)) {
    return context.next();
  }
  url.pathname = `/${ministry}${url.pathname === '/' ? '/' : url.pathname}`;
  return context.nextRequest(new Request(url, request));
};

export const config: Config = { path: '/*' };
