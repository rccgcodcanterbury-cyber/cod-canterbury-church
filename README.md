# RCCG City of David Canterbury - website rebuild

The rebuilt public website is live at [cod-canterbury-church.pages.dev](https://cod-canterbury-church.pages.dev/). It is a static, responsive replacement built from the church's public pages and media.

Source: https://codcanterburychurch.org/ - captured 4 October 2026.

## Live deployment

- Public site: [https://cod-canterbury-church.pages.dev/](https://cod-canterbury-church.pages.dev/)
- Source repository: [rccgcodcanterbury-cyber/cod-canterbury-church](https://github.com/rccgcodcanterbury-cyber/cod-canterbury-church)
- Build command: `npm run build`
- Verification command: `npm run check`

Contact and prayer forms store submissions in Supabase through Cloudflare Pages and a protected Supabase Edge Function. See ADMIN-SETUP.md for the private dashboard, staff roles and deployment details.

## Contents

- `archive/`: captured public WordPress pages, API exports and migration inventory.
- `content/`: structured sermon, event, gallery and image data.
- `public/assets/`: original church media and optimized WebP derivatives.
- `scripts/`: reproducible extraction and static-site build tools.
- `design/`: generated visual references. Generated people are design placeholders only; the website uses the church's own photographs.

## Development

Use Node 22+, run `npm install`, then `npm run build` and `npm run dev`.

## Content notes

Sunday service starts are confirmed by the church as 9am and 11:30am. General giving and the building project use separate accounts. Imported music-theme demo posts remain archived. The calendar refreshes from the original church events feed, with a saved-data fallback, and hides past dates using Europe/London time. The current-pastor reference is Pastor Akin Kunlipe; the site does not invent a biography or project milestones.

The current church domain has not been changed.

### Automatic YouTube updates

The homepage video row and sermons page request `/api/youtube-feed` when opened. The function reads the public Atom feed for the verified `@CODCanterbury` channel (`UCOBJendA58WmfmZADo_Ey1w`), validates the entries and returns up to 12 recent uploads. No API key is required. Cloudflare caches a successful response for five minutes; new videos appear after YouTube publishes them in its feed and that cache refreshes. The feed does not provide video durations, so refreshed cards omit them.

If YouTube times out, returns an error or provides an invalid feed, the six saved videos remain available. Run `node --test tests/youtube-feed.test.mjs` to check parsing, sorting, duplicate removal and error fallbacks. Use `npm run dev` to test the function locally; a plain static server displays the saved selection.

The building payment link is intentionally pending the church-verified URL; set BUILDING_DONATION_URL when it is ready. Visitor address verified against the official school register: https://www.get-information-schools.service.gov.uk/Establishments/Establishment/Details/137071.
