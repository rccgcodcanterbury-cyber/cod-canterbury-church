import fallback from '../../content/sermons.json' with { type: 'json' };
import { FEED_URL, CHANNEL_ID, parseFeed } from '../../lib/youtube-feed.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
  let videos = fallback;
  let source = 'saved';
  try {
    const upstream = await fetch(FEED_URL, { signal: AbortSignal.timeout(6000), headers: { Accept: 'application/atom+xml' } });
    if (!upstream.ok) throw new Error(`YouTube returned ${upstream.status}`);
    videos = parseFeed(await upstream.text());
    source = 'youtube';
  } catch {
    // Keep the working selection visible, and retry sooner on the next request.
  }
  return Response.json({ videos, source, channelId: CHANNEL_ID }, { headers: {
    'Cache-Control': 'public, max-age=60',
    'Netlify-CDN-Cache-Control': `public, durable, s-maxage=${source === 'youtube' ? 600 : 60}`,
    'X-Content-Type-Options': 'nosniff'
  } });
}
