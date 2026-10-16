from playwright.sync_api import sync_playwright
from pathlib import Path
import json,math
base=Path(__file__).resolve().parents[1]; shots=base/'test-screenshots'; shots.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--allow-file-access-from-files'])
 for width,height in [(1366,1024),(1194,834),(1024,768)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.goto('http://127.0.0.1:8765/index.html');page.wait_for_timeout(400)
  page.screenshot(path=str(shots/f'start_{width}.png'))
  for level in ['cadet','pilot','commander']:
   page.locator(f'[data-level="{level}"]').click();page.wait_for_timeout(200)
   page.screenshot(path=str(shots/f'{level}_start_{width}.png'))
   if level!='commander':
    # Tap launch lane at screen-space projection of (170,300).
    pos=page.evaluate('''() => {const a=document.querySelector('#arena').getBoundingClientRect();const s=Math.min(a.width/1600,a.height/1000);return {x:a.x+(a.width-1600*s)/2+170*s,y:a.y+(a.height-1000*s)/2+300*s}}''')
    page.mouse.click(pos['x'],pos['y']);page.wait_for_timeout(100)
    assert not page.locator('#launch').evaluate('(e)=>e.disabled'),f'{level} launch disabled'
   else:
    assert page.locator('#launch').evaluate('(e)=>e.classList.contains("hidden")')
   page.screenshot(path=str(shots/f'{level}_aim_{width}.png'))
   # verify exact meter/flight and draw paths using browser's engine directly
   stats=page.evaluate('''(level)=>{const E=window.SujiEngine;let o={};for(const y of [150,300,500,700,850]){const q=E.launch(level,y,level==='commander'?-120:0,0);o[y]=E.predict(level,q).outcome;}return o;}''',level)
   assert stats
   page.locator('#back').click();page.wait_for_timeout(80)
  page.locator('#discoveries').click();assert page.locator('#cards').is_visible();page.locator('#cardsBack').click()
  page.locator('.mute').first.click();page.locator('.mute').first.click()
  print(width,height,'browser smoke OK', 'errors',errors)
  assert not errors,errors
  page.close()
 browser.close()
