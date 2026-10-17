from playwright.sync_api import sync_playwright
from pathlib import Path
import json
url=Path(__file__).resolve().parents[1].joinpath('game/index.html').as_uri()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security'])
 for w,h in [(1366,1024),(1194,834),(1024,768)]:
  page=browser.new_page(viewport={'width':w,'height':h});errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  page.goto(url);page.wait_for_timeout(900);page.click('#commander');page.wait_for_timeout(300)
  d=page.evaluate('({level:document.querySelector("header strong").textContent, layout:window.__sujiDiagnostics.layout(),frames:window.__sujiDiagnostics.frames})')
  page.screenshot(path=str(Path(__file__).resolve().parents[1]/'evidence'/f'level1_{w}x{h}.png'))
  print(json.dumps({'viewport':f'{w}x{h}','data':d,'errors':errors}));page.close()
 browser.close()
