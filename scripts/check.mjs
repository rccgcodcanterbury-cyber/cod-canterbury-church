import fs from 'node:fs';
const mustHave = ['dist/index.html','dist/style.css','dist/app.js','dist/events.ics','dist/sitemap.xml'];
const missing = mustHave.filter(file => !fs.existsSync(file));
if (missing.length) throw new Error(`Missing build files: ${missing.join(', ')}`);
const home = fs.readFileSync('dist/index.html','utf8');
for (const text of ['A place to belong.','Join us this Sunday','Watch a sermon','City of David Canterbury']) {
  if (!home.includes(text)) throw new Error(`Home page missing expected content: ${text}`);
}
if (!fs.readdirSync('dist/assets').some(name => name.endsWith('.webp'))) throw new Error('No optimized media in build output');
console.log('Build check passed.');
