'use strict';
const assert=require('node:assert/strict');
const E=require('../game/engine.js');
const summary=[];
const sequence=[];let previous=null,cadetCounts={success:0,fall:0,drift:0};
for(let i=0;i<=700;i++){
 const y=150+i,out=E.predict('cadet',E.launch('cadet',y)).outcome;
 cadetCounts[out]++;
 if(out!==previous){sequence.push(out);previous=out;}
}
assert.deepEqual(sequence,['drift','success','fall','success','drift'],'Cadet must be BLUE-GREEN-RED-GREEN-BLUE from top to bottom');
assert.ok(cadetCounts.success/701>=.70,`Cadet coverage ${cadetCounts.success/701}`);
assert.equal(E.LEVELS.cadet.mu,6000000);
assert.equal(E.LEVELS.cadet.planetMu,900000);
assert.equal(E.geom('cadet').hole.horizon,45);
assert.equal(E.geom('cadet').planet.x,1300);
const pilotSequence=[];let pilotPrevious=null,pilotSuccess=0;
for(let i=0;i<=700;i++){const outcome=E.predict('pilot',E.launch('pilot',150+i)).outcome;if(outcome==='success')pilotSuccess++;if(outcome!==pilotPrevious){pilotSequence.push(outcome);pilotPrevious=outcome;}}
assert.deepEqual(pilotSequence,['drift','success','fall','success','drift'],'Pilot must be BLUE-GREEN-RED-GREEN-BLUE');
assert.ok(pilotSuccess/701>=.38&&pilotSuccess/701<=.50,`Pilot lane coverage ${pilotSuccess/701}`);
const pilotBands=E.greenBands('pilot');assert.ok(pilotBands.some(b=>b.max<500)&&pilotBands.some(b=>b.min>500),'Pilot needs upper and lower green bands');
const bands=E.greenBands('cadet');
assert.ok(bands.some(b=>b.max<500),'Missing upper green band');
assert.ok(bands.some(b=>b.min>500),'Missing lower green band');
for(const band of bands){
 for(let y=band.min;y<=band.max+1e-8;y+=.5){
  assert.equal(E.predict('cadet',E.launch('cadet',y)).outcome,'success',`False green stripe at y=${y}`);
 }
}
for(const [level,cfg] of Object.entries(E.LEVELS)){
 assert.ok(cfg.planetMu<.3*cfg.mu,`${level}: planet gravity too strong`);
 const counts={success:0,fall:0,drift:0},above=[],below=[];
 const n=3000;
 for(let i=0;i<n;i++){
  const y=150+700*((i*37)%n)/(n-1);
  const pullLength=level!=='commander'?0:180*((i*73)%n)/(n-1);
  const angle=level==='commander'?((i*113)%n)/(n-1)*.8-.4:0;
  const pullX=level!=='commander'?0:-pullLength*Math.cos(angle);
  const pullY=level==='commander'?-pullLength*Math.sin(angle):0;
  const start=E.launch(level,y,pullX,pullY);
  const predicted=E.predict(level,start),simulated=E.simulate(level,start);
  assert.equal(predicted.outcome,simulated.outcome,`${level}: meter mismatch at ${i}`);
  assert.ok(Number.isFinite(simulated.closest)&&Number.isFinite(simulated.final.x)&&Number.isFinite(simulated.final.y));
  assert.ok(simulated.steps<=E.MAX_STEPS&&simulated.path.length>0);
  for(const q of simulated.path)assert.ok(Number.isFinite(q.x+q.y+q.vx+q.vy+q.gravity),`${level}: nonfinite path`);
  counts[simulated.outcome]++;
  if(simulated.outcome==='success'){
   const planet=E.geom(level).planet;
   const distance=Math.hypot(simulated.final.x-planet.x,simulated.final.y-planet.y);
   assert.ok(distance<=cfg.arrival+1e-6,`${level}: success outside arrival radius ${distance}`);
   (y<500?above:below).push(y);
  }
 }
 for(const outcome of ['success','fall','drift'])assert.ok(counts[outcome]>0,`${level}: lacks ${outcome}`);
 assert.ok(above.length>2&&below.length>2,`${level}: lacks upper/lower success band`);
 summary.push({level,samples:n,counts,above:above.length,below:below.length,coverage:(counts.success/n*100).toFixed(2)+'%'});
}
console.log('Cadet lane (701 equally spaced heights):',cadetCounts,`${(100*cadetCounts.success/701).toFixed(2)}% success`);
console.log('Cadet success stripes:',bands);
console.log(JSON.stringify(summary,null,2));
console.log('PASS: coverage, colour ordering, gravity ratio, stripes, 9000 prediction/flight comparisons, finite paths and landing radii.');
