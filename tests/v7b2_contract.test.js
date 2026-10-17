/* Captain Suji V7b.2 — static rendering and release contract (not a browser timing test). */
const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.join(__dirname,'..'),cockpit=fs.readFileSync(path.join(root,'game/cockpit.js'),'utf8'),css=fs.readFileSync(path.join(root,'game/style.css'),'utf8'),html=fs.readFileSync(path.join(root,'game/index.html'),'utf8');
assert(cockpit.includes("phase==='planning'?0"),'planning must have zero cockpit mix');
assert(cockpit.includes("style.opacity=landing?'0':String(mix)"),'frame opacity should be zero during planning');
assert(cockpit.includes('objects.sort((a,b)=>b.distance-a.distance)'),'objects must be depth sorted');
assert(cockpit.includes('transitionSpriteCount++'),'BH draw instrumentation missing');
assert(!cockpit.includes('ctx.globalAlpha=1-cockpitMix'),'old double-render transition remains');
assert(cockpit.includes('cinematicPlanet=sprite('),'cached cinematic planet missing');
assert(cockpit.includes('dustSprite=sprite('),'cached dust missing');
assert(cockpit.includes('touchdownGap=Math.abs('),'touchdown gap check missing');
assert(cockpit.includes('touchdownOverlap='),'panel overlap check missing');
assert(cockpit.includes('spanX=Math.max(1,maxX-minX)'),'map fit missing');
assert(html.includes('CAPTAIN SUJI • V7b'));
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){const src=m[1];if(src.startsWith('data:')||src.startsWith('http'))continue;assert(fs.existsSync(path.join(root,'game',src)),`missing resource ${src}`);}
assert(fs.existsSync(path.join(root,'.nojekyll'))&&fs.existsSync(path.join(root,'index.html')));
console.log('PASS V7b.2 static render, asset, version, map, touchdown contracts (not browser performance).');
