import requests,json,re,hashlib
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse,urljoin
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parents[1]; arc=root/'archive'; base='https://codcanterburychurch.org/'
s=requests.Session()
pages=json.loads((arc/'wp-json_wp_v2_pages').read_text()); media=json.loads((arc/'wp-json_wp_v2_media').read_text())
for n in range(2,12):
 r=s.get(base+f'wp-json/wp/v2/media?per_page=100&page={n}',timeout=60)
 if r.status_code!=200: break
 batch=r.json();media.extend(batch)
 if len(batch)<100:break
(arc/'media-all.json').write_text(json.dumps(media,indent=2))
print('Total media',len(media),flush=True)
slugs=['about-us','join-our-services','give','build','contact-us','gallery','sermons','join-us','event-list']
def fetch(slug):
 u=base+'index.php/'+slug+'/'
 r=requests.get(u,timeout=60);(arc/f'{slug}.html').write_text(r.text)
 soup=BeautifulSoup(r.text,'html.parser'); content=soup.select_one('#qodef-page-content') or soup
 (arc/f'{slug}-live.txt').write_text(content.get_text('\n',strip=True))
 return {'slug':slug,'url':u,'status':r.status_code,'images':[x.get('src') for x in soup.select('img[src]')],'links':[{'text':x.get_text(' ',strip=True),'url':x.get('href')} for x in content.select('a[href]')]}
results=list(ThreadPoolExecutor(5).map(fetch,slugs));(arc/'page-inventory.json').write_text(json.dumps(results,indent=2))
# Church-owned uploads are dated in 2025+, imported theme samples in older years stay in archive metadata.
assets=[x for x in media if re.search('/202[5-9]/',x['source_url'])]
def download(x):
 u=x['source_url'];name=str(x['id'])+'-'+u.split('/')[-1]; dest=root/'public/assets'/name
 try:
  r=requests.get(u,timeout=60);r.raise_for_status();dest.write_bytes(r.content)
  return {'id':x['id'],'source':u,'local':'/assets/'+name,'alt':x.get('alt_text',''),'bytes':len(r.content)}
 except Exception as e:return {'source':u,'error':str(e)}
manifest=list(ThreadPoolExecutor(8).map(download,assets));(arc/'asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print('Downloaded',len(manifest),'assets',sum(x.get('bytes',0) for x in manifest),flush=True)
