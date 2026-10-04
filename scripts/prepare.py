from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image,ImageOps
import json,re,requests
p=Path(__file__).resolve().parents[1];s=BeautifulSoup((p/'archive/home.html').read_text(),'html.parser')
sermons=[]
for el in s.select('[data-settings]'):
 try:d=json.loads(el['data-settings'])
 except:continue
 if d.get('playlist_title')=='Sermons':
  for t in d['tabs']:
   i=t['youtube_url'].split('youtu.be/')[1].split('?')[0];sermons.append({'id':i,'title':t['title'],'duration':t['duration']})
(p/'content').mkdir(exist_ok=True)
(p/'content/sermons.json').write_text(json.dumps(sermons,indent=2))
d=json.loads((p/'archive/wp-json_tribe_events_v1_events').read_text())
events=[{k:x.get(k) for k in ['id','title','description','start_date','end_date','timezone','url','venue']} for x in d['events']]
(p/'content/events.json').write_text(json.dumps(events,indent=2))
# Optimized derivatives; originals remain unchanged.
for file in list((p/'public/assets').iterdir()):
 if file.suffix.lower() not in ['.jpg','.jpeg','.png']:continue
 try:
  im=ImageOps.exif_transpose(Image.open(file));im.thumbnail((1800,1800));im.save(file.with_suffix('.webp'),quality=85)
 except:pass
assets={str(int(f.name.split('-')[0])):'/assets/'+f.name for f in (p/'public/assets').glob('*.webp')}
(p/'content/assets.json').write_text(json.dumps(assets,indent=2))
# Images actually referenced by the gallery page, in their original order.
g=BeautifulSoup((p/'archive/gallery.html').read_text(),'html.parser');ids=[]
for el in g.select('[data-settings]'):
 try:
  d=json.loads(el['data-settings'])
  for item in d.get('gallery',[]):
   if str(item.get('id')) in assets:ids.append(str(item['id']))
 except:pass
if not ids:
 for im in g.select('img'):
  for c in im.get('class',[]):
   if c.startswith('wp-image-') and c[9:] in assets:ids.append(c[9:])
(p/'content/gallery.json').write_text(json.dumps(list(dict.fromkeys(ids)),indent=2))
print('Prepared',len(assets),'images;',len(ids),'gallery entries;',len(events),'events;',len(sermons),'sermons')
