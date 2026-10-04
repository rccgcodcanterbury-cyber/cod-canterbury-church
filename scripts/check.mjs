import fs from 'node:fs';
const mustHave = ['dist/index.html','dist/style.css','dist/app.js','dist/events.ics','dist/sitemap.xml','dist/audacious/index.html','dist/audacious/gatherings/index.html','dist/audacious/gallery/index.html','dist/audacious/contact/index.html','dist/youth/index.html','dist/youth/gatherings/index.html','dist/youth/gallery/index.html','dist/youth/contact/index.html'];
const missing = mustHave.filter(file => !fs.existsSync(file));
if (missing.length) throw new Error(`Missing build files: ${missing.join(', ')}`);
const home = fs.readFileSync('dist/index.html','utf8');
for (const text of ['A place to belong.','Join us this Sunday','Watch a sermon','City of David Canterbury']) {
  if (!home.includes(text)) throw new Error(`Home page missing expected content: ${text}`);
}
if (!fs.readdirSync('dist/assets').some(name => name.endsWith('.webp'))) throw new Error('No optimized media in build output');
for (const [file, text] of [['dist/audacious/index.html','Faith with your whole life.'],['dist/youth/index.html','Find your people. Grow your faith.']]) {
  if (!fs.readFileSync(file,'utf8').includes(text)) throw new Error(`${file} is missing expected ministry content.`);
}
console.log('Build check passed.');
