import test from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_ID, parseFeed } from '../lib/youtube-feed.mjs';
import handler from '../netlify/functions/youtube-feed.mjs';
const entry = (id, title, published, channel = CHANNEL_ID) => `<entry><yt:videoId>${id}</yt:videoId><yt:channelId>${channel}</yt:channelId><title>${title}</title><published>${published}</published></entry>`;
const xml = `<feed>${entry('VZtbXlE1h3I','Faith &amp; prayer &#8217;','2026-10-04T12:00:00Z')}${entry('KLf976yU2nE','Second service','2026-10-05T00:00:00Z')}${entry('KLf976yU2nE','Duplicate','2026-10-05T00:00:00Z')}${entry('coB8luVK36c','Other channel','2026-10-06T00:00:00Z','another-channel')}${entry('bad-id','Invalid ID','2026-10-06T00:00:00Z')}${entry('DKq6mqeMgfU','Invalid date','not-a-date')}</feed>`;
test('Feed preserves channel ownership, removes duplicates, decodes titles and orders by publication', () => {
  const videos = parseFeed(xml);
  assert.equal(videos.length, 2);
  assert.equal(videos[0].id, 'KLf976yU2nE');
  assert.equal(videos[1].title, 'Faith & prayer ’');
  assert.throws(() => parseFeed('<html>Unavailable</html>'));
  assert.throws(() => parseFeed('<feed></feed>'));
});
test('Endpoint caches successful feed, falls back on upstream errors, rejects writes', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(xml);
    let response = await handler(new Request('https://example.test/.netlify/functions/youtube-feed'));
    assert.match(response.headers.get('Netlify-CDN-Cache-Control'), /s-maxage=600/);
    assert.equal((await response.json()).source, 'youtube');
    for (const upstream of [async () => new Response('Unavailable', { status: 503 }), async () => new Response('<html>Sign in</html>'), async () => { throw new Error('Timeout'); }]) {
      globalThis.fetch = upstream;
      response = await handler(new Request('https://example.test/.netlify/functions/youtube-feed'));
      const data = await response.json();
      assert.equal(data.source, 'saved');
      assert.equal(data.videos.length, 6);
      assert.match(response.headers.get('Netlify-CDN-Cache-Control'), /s-maxage=60/);
    }
    response = await handler(new Request('https://example.test/.netlify/functions/youtube-feed', { method: 'POST' }));
    assert.equal(response.status, 405);
  } finally { globalThis.fetch = original; }
});
