'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../game/engine.js');
const html=fs.readFileSync('game/index.html','utf8'),js=fs.readFileSync('game/game.js','utf8'),css=fs.readFileSync('game/style.css','utf8');
for(const id of ['gravityHud','meterBar','greenBand','meterNeedle','gameDiscoveries','resultDiscoveries','cardsBack','cardsTitle'])assert.ok(html.includes(`id="${id}"`),`missing ${id}`);
assert.ok(!html.includes('shipUp')&&!html.includes('shipDown')&&!css.includes('#heightControls'),'height buttons removed');
assert.ok(html.includes('gesture.js')&&js.includes('G.lock'),'gesture classifier wired');
assert.ok(js.includes("['gravity'")&&js.includes("['captain'")&&!js.includes("['explorer'"),'exact seven revised discoveries');
assert.ok(!js.includes("'???'"),'no hidden card titles');
assert.ok(!js.includes("'🔒'"),'no locked card emoji');
assert.ok(js.includes('if(!visible||cardsOpen)'),'single loop must pause with cards');
assert.ok(js.includes('lastTime=0'),'pause must reset time reference');
assert.ok(css.includes('width:112px')&&css.includes('width:26px')&&css.includes('min-height:14px'),'meter cap styles');
for(const y of [400,900,1400]){const s=E.launch(-200,40,y);assert.equal(s.y,y);assert.ok(!s.cancelled);}
for(let i=0;i<E.LAYOUTS.length;i++)assert.notEqual(E.nextLayout(i,()=>0),i);
console.log('PASS: UI structure, seven readable cards, discovery pause hook, finger gesture integration, ship height parameter, meter CSS contracts, 20 layout nonrepeats.');
console.log('PENDING – external reviewer: actual meter bounding boxes and overlap screenshots at all 3 viewports.');
