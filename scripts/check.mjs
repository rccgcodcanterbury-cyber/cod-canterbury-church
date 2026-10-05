import fs from 'node:fs';
const mustHave = ['dist/index.html','dist/style.css','dist/app.js','dist/events.ics','dist/robots.txt','dist/sitemap.xml','dist/llms.txt','dist/audacious/index.html','dist/audacious/robots.txt','dist/audacious/sitemap.xml','dist/audacious/llms.txt','dist/audacious/gatherings/index.html','dist/audacious/gallery/index.html','dist/audacious/contact/index.html','dist/youth/index.html','dist/youth/robots.txt','dist/youth/sitemap.xml','dist/youth/llms.txt','dist/youth/gatherings/index.html','dist/youth/gallery/index.html','dist/youth/contact/index.html'];
const missing = mustHave.filter(file => !fs.existsSync(file));
if (missing.length) throw new Error(`Missing build files: ${missing.join(', ')}`);
const home = fs.readFileSync('dist/index.html','utf8');
for (const text of ['A place to belong.','Join us this Sunday','Watch a sermon','City of David Canterbury']) {
  if (!home.includes(text)) throw new Error(`Home page missing expected content: ${text}`);
}
if (!fs.readdirSync('dist/assets').some(name => name.endsWith('.webp'))) throw new Error('No optimized media in build output');
for (const [file, text] of [['dist/llms.txt','RCCG City of David Canterbury'],['dist/audacious/llms.txt','AUDACIOUS'],['dist/youth/llms.txt','CITIYOUTHS']]) {
  if (!fs.readFileSync(file,'utf8').includes(text)) throw new Error(`${file} is missing its machine-readable site description.`);
}
for (const [file, text] of [['dist/audacious/index.html','Faith with your whole life.'],['dist/youth/index.html','Find your people. Grow your faith.']]) {
  if (!fs.readFileSync(file,'utf8').includes(text)) throw new Error(`${file} is missing expected ministry content.`);
}
for (const file of ['dist/404.html','dist/thank-you/index.html','dist/audacious/thank-you/index.html','dist/youth/thank-you/index.html']) {
  if (!fs.readFileSync(file,'utf8').includes('content="noindex,nofollow"')) throw new Error(`${file} should not be indexed.`);
}
const eventPage = fs.readFileSync(`dist/events/${JSON.parse(fs.readFileSync('content/events.json','utf8'))[0].id}/index.html`,'utf8');
if (!eventPage.includes('"@type":"Event"')) throw new Error('Event page is missing Event structured data.');
console.log('Build check passed.');
