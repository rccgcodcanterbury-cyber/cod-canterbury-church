# RCCG City of David Canterbury — website rebuild

Work in progress. Content extraction and page templates are saved; styling, browser verification and Netlify deployment are still in progress.

Source: https://codcanterburychurch.org/ — captured 4 October 2026.

## Contents

- `archive/`: captured public WordPress pages, API exports and migration inventory.
- `content/`: structured sermon, event, gallery and image data.
- `public/assets/`: original church media and optimized WebP derivatives.
- `scripts/`: reproducible extraction and static-site build tools.
- `design/`: generated visual references. Generated people are design placeholders only; the website uses the church's own photographs.

## Development

Use Node 22+, run `npm install`, then `npm run build` and `npm run dev`.

## Content notes

The original services page and events calendar disagree on Sunday service times. The rebuild reports the calendar times and asks visitors to confirm with the church. General giving and the building project use separate accounts; preserve that distinction. Imported music-theme demo posts are archived, not presented as church content. Event data is a snapshot, not a live calendar integration.

The current church domain has not been changed.
