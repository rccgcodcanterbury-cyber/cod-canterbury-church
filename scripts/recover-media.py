"""Retry archived download failures, validate images, and build local derivatives."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse, unquote
from io import BytesIO
import json, hashlib, time
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
manifest_path = ROOT / 'archive/asset-manifest.json'
manifest = json.loads(manifest_path.read_text())
media = {m['source_url']: m for m in json.loads((ROOT / 'archive/media-all.json').read_text())}
assets_path = ROOT / 'content/assets.json'
assets = json.loads(assets_path.read_text())
failures = [(i, item) for i, item in enumerate(manifest) if not item.get('id')]
report = {'attempted': len(failures), 'recovered': [], 'unresolved': []}

def recover(pair):
    index, item = pair
    url = item['source']
    record = media.get(url)
    if not record:
        return index, None, {'source': url, 'error': 'No matching archived media record'}
    for attempt in range(3):
        try:
            response = requests.get(url, timeout=(15, 45))
            response.raise_for_status()
            content = response.content
            with Image.open(BytesIO(content)) as check:
                check.verify()
            with Image.open(BytesIO(content)) as source:
                im = ImageOps.exif_transpose(source)
                dimensions = im.size
                im.thumbnail((1800, 1800))
                if im.mode not in ('RGB', 'RGBA'):
                    im = im.convert('RGBA' if 'transparency' in im.info else 'RGB')
                filename = str(record['id']) + '-' + Path(unquote(urlparse(url).path)).name
                original = ROOT / 'public/assets' / filename
                original.write_bytes(content)
                derivative = original.with_suffix('.webp')
                im.save(derivative, quality=85)
                with Image.open(derivative) as check:
                    check.verify()
            entry = {'id': record['id'], 'source': url, 'local': '/assets/' + filename,
                     'alt': record.get('alt_text', ''), 'bytes': len(content)}
            evidence = {'id': record['id'], 'source': url, 'asset': '/assets/' + derivative.name,
                        'bytes': len(content), 'width': dimensions[0], 'height': dimensions[1],
                        'sha256': hashlib.sha256(content).hexdigest()}
            return index, entry, evidence
        except Exception as error:
            last_error = str(error)
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    return index, None, {'source': url, 'error': last_error}

with ThreadPoolExecutor(max_workers=4) as pool:
    jobs = [pool.submit(recover, pair) for pair in failures]
    for done, job in enumerate(as_completed(jobs), 1):
        index, entry, evidence = job.result()
        if entry:
            manifest[index] = entry
            assets[str(entry['id'])] = evidence['asset']
            report['recovered'].append(evidence)
        else:
            report['unresolved'].append(evidence)
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
        assets_path.write_text(json.dumps(assets, indent=2) + '\n')
        (ROOT / 'archive/media-recovery-report.json').write_text(json.dumps(report, indent=2) + '\n')
        if done % 20 == 0 or done == len(failures):
            print(f"Processed {done}/{len(failures)}; recovered {len(report['recovered'])}; unresolved {len(report['unresolved'])}", flush=True)
