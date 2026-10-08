import fs from 'node:fs';
import {build} from 'esbuild';

const connection=JSON.parse(fs.readFileSync('content/connection.json','utf8'));
const config={url:connection.url,publishableKey:connection.publishableKey};
const intakeEnabled=true;
fs.mkdirSync('dist/admin',{recursive:true});
fs.writeFileSync('dist/admin/config.js',`window.COD_ADMIN_CONFIG=${JSON.stringify(config)};`);
fs.writeFileSync('dist/intake-config.js',`window.COD_INTAKE_CONFIG=${JSON.stringify({enabled:intakeEnabled})};`);
await build({
  entryPoints:['src/admin/main.js'],
  bundle:true,
  format:'iife',
  target:['es2020'],
  minify:true,
  outfile:'dist/admin/admin.bundle.js'
});
console.log('Admin dashboard bundle created.');
