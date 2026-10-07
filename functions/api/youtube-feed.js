import fallback from '../../content/sermons.json' with { type: 'json' };
import { FEED_URL, CHANNEL_ID, parseFeed } from '../../lib/youtube-feed.mjs';

export async function onRequestGet() {
  let videos = fallback;
  let source = 'saved';
  try {
    const upstream = await fetch(FEED_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: 'application/atom+xml' }
    });
    if (!upstream.ok) throw new Error(`YouTube returned ${upstream.status}`);
    videos = parseFeed(await upstream.text());
    source = 'youtube';
  } catch {
    // The generated selection remains available when YouTube is temporarily unavailable.
  }
  return Response.json({ videos, source, channelId: CHANNEL_ID }, {
    headers: {
      'Cache-Control': `public, max-age=${source === 'youtube' ? 600 : 60}`,
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
