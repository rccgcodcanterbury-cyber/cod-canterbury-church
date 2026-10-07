import fs from 'node:fs';
import {build} from 'esbuild';

const config = {
  url: process.env.SUPABASE_URL || '',
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || ''
};
const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || '';
const intakeEnabled = process.env.INTAKE_ENABLED === 'true'
  && process.env.PRIVACY_NOTICE_APPROVED === 'true'
  && process.env.INTAKE_ABUSE_CONTROL_APPROVED === 'true'
  && Boolean(turnstileSiteKey)
  && Boolean(process.env.TURNSTILE_SECRET_KEY)
  && Boolean(process.env.PRIVACY_RETENTION_TEXT)
  && Boolean(process.env.INTAKE_NOTIFICATION_EMAIL)
  && Boolean(process.env.RESEND_API_KEY)
  && Boolean(process.env.RESEND_FROM)
  && Boolean(process.env.SUPABASE_URL)
  && Boolean(process.env.SUPABASE_PUBLISHABLE_KEY);
fs.mkdirSync('dist/admin',{recursive:true});
fs.writeFileSync('dist/admin/config.js',`window.COD_ADMIN_CONFIG=${JSON.stringify(config)};`);
fs.writeFileSync('dist/intake-config.js',`window.COD_INTAKE_CONFIG=${JSON.stringify({enabled:intakeEnabled,turnstileSiteKey:intakeEnabled?turnstileSiteKey:''})};`);
await build({
  entryPoints:['src/admin/main.js'],
  bundle:true,
  format:'iife',
  target:['es2020'],
  minify:true,
  outfile:'dist/admin/admin.bundle.js'
});
console.log('Admin dashboard bundle created.');
