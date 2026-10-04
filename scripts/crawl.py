import requests,json,re,time
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urljoin,urlparse
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
base='https://codcanterburychurch.org/'
s=requests.Session()
def get(u):
 try:
  r=s.get(u,timeout=45); return r
 except Exception as e: print(str(e)); return None
home=get(base); (ROOT/'archive/home.html').write_text(home.text)
soup=BeautifulSoup(home.text,'html.parser')
links=sorted(set(urljoin(base,a.get('href','')).split('#')[0] for a in soup.select('a[href]')))
print('LINKS',json.dumps(links,indent=2))
for ep in ['wp-json/wp/v2/pages?per_page=100','wp-json/wp/v2/posts?per_page=100','wp-json/wp/v2/media?per_page=100','wp-json/tribe/events/v1/events?per_page=50','wp-sitemap.xml']:
 r=get(base+ep)
 if r is not None:
  name=ep.split('?')[0].replace('/','_'); (ROOT/'archive'/name).write_text(r.text); print(ep,r.status_code,len(r.content))
assets=set()
for t in soup.select('[src]'):
 u=urljoin(base,t.get('src',''))
 if '/uploads/' in u: assets.add(u)
assets.update(re.findall(r'https?[^\s"\'<>]+/uploads/[^\s"\'<>]+',home.text))
(ROOT/'archive/links.json').write_text(json.dumps(links,indent=2))
(ROOT/'archive/home-assets.json').write_text(json.dumps(sorted(assets),indent=2))
print('ASSETS',json.dumps(sorted(assets),indent=2))
