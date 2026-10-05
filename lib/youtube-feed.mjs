export const CHANNEL_ID = 'UCOBJendA58WmfmZADo_Ey1w';
export const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const value = (xml, tag) => xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] || '';
function decode(value) {
  return value.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code) => {
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (!code.startsWith('#')) return named[code.toLowerCase()] || entity;
    const number = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff) ? String.fromCodePoint(number) : '';
  }).trim();
}
export function parseFeed(xml) {
  if (typeof xml !== 'string' || xml.length > 500000 || !xml.includes('<feed')) throw new Error('Invalid YouTube feed');
  const seen = new Set();
  const videos = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].flatMap(([, entry]) => {
    const id = value(entry, 'yt:videoId');
    const channel = value(entry, 'yt:channelId');
    const title = decode(value(entry, 'title')).slice(0, 300);
    const published = value(entry, 'published');
    if (!/^[\w-]{11}$/.test(id) || channel !== CHANNEL_ID || !title || !Number.isFinite(Date.parse(published)) || seen.has(id)) return [];
    seen.add(id);
    return [{ id, title, published: new Date(published).toISOString() }];
  });
  if (!videos.length) throw new Error('No valid channel videos');
  return videos.sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 12);
}
