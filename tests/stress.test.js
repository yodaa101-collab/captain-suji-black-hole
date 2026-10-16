'use strict';
// Captain Suji V6 – stress test: 12,000 seeded random launches per level (36,000 total)
// plus edge cases. Run: node tests/stress.test.js
const assert=require('node:assert/strict');
const E=require('../game/engine.js');
const PER_LEVEL=Number(process.env.SUJI_RUNS||12000), MAX_PULL=180;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rand=rng(Number(process.env.SUJI_SEED||20261016));
function inputs(level){
 // Mirrors game.js: Cadet and Pilot = height only, fixed speed;
 // Commander = height + pull in any direction, length capped at 180.
 const y=150+700*rand();
 if(level==='cadet'||level==='pilot')return {y,pullX:0,pullY:0};
 let len=MAX_PULL*rand();
 
 const a=2*Math.PI*rand();return {y,pullX:len*Math.cos(a),pullY:len*Math.sin(a)};
}
const report={};const t0=Date.now();
for(const level of Object.keys(E.LEVELS)){
 const cfg=E.LEVELS[level],g=E.geom(level);
 const r={cancelled:0,runs:0,success:0,fall:0,drift:0,timeLimitDrifts:0,orbitingAtTimeout:0,maxFlightSeconds:0,minHorizonGap:Infinity,predictMsMax:0,predictMsAvg:0};
 let predictMsTotal=0;
 const cases=[];
 for(let i=0;i<PER_LEVEL;i++)cases.push(inputs(level));
 // Edge cases: lane ends, centre line, exact stripe edges, zero/tiny/max/over-max pulls, all 8 directions.
 for(const y of [150,150.0001,499.999,500,500.001,849.9999,850])
  for(const len of [0,1,27,28,29,179.999,180,250])
   for(let k=0;k<8;k++){const a=k*Math.PI/4;cases.push({y,pullX:level==='commander'?len*Math.cos(a):0,pullY:level==='commander'?len*Math.sin(a):0});}
 if(level==='cadet')for(const b of E.greenBands('cadet'))for(const y of [b.min-1,b.min,b.min+1,b.max-1,b.max,b.max+1])cases.push({y,pullX:0,pullY:0});
 let idx=0,randSuccess=0,randValid=0;
 for(const c of cases){const isRandom=idx++<PER_LEVEL;
  const start=E.launch(level,c.y,c.pullX,c.pullY);
  if(level==='commander'){
   const shouldCancel=c.pullX>=0||Math.hypot(c.pullX,c.pullY)<=28;
   assert.equal(start.cancelled,shouldCancel,`Commander cancel mismatch at ${JSON.stringify(c)}`);
   if(!start.cancelled)assert.ok(Math.abs(Math.atan2(start.vy,start.vx))<=Math.PI/6+1e-10,'Commander aim exceeds 60 degrees');
  }
  if(start.cancelled){r.cancelled++;continue;}
  if(isRandom)randValid++;
  assert.ok(Number.isFinite(start.x+start.y+start.vx+start.vy),`${level}: bad launch`);
  assert.ok(start.y>=150&&start.y<=850,`${level}: launch outside lane`);
  const sp=Math.hypot(start.vx,start.vy);assert.ok(sp>=cfg.minSpeed-1e-9&&sp<=cfg.maxSpeed+1e-9,`${level}: speed out of range ${sp}`);
  const ta=process.hrtime.bigint();const p=E.predict(level,start);const ms=Number(process.hrtime.bigint()-ta)/1e6;
  predictMsTotal+=ms;r.predictMsMax=Math.max(r.predictMsMax,ms);
  const s=E.simulate(level,start),s2=E.simulate(level,start);
  // 1. Meter never lies; 2. deterministic.
  assert.equal(p.outcome,s.outcome,`${level}: meter/flight mismatch y=${c.y}`);
  assert.equal(s.outcome,s2.outcome);assert.equal(s.final.x,s2.final.x);assert.equal(s.final.y,s2.final.y);
  // 3. Always finite and terminating.
  assert.ok(s.steps<=E.MAX_STEPS);for(const q of s.path)assert.ok(Number.isFinite(q.x+q.y+q.vx+q.vy));
  // 4. Outcome matches what she sees.
  const endHole=Math.hypot(s.final.x-g.hole.x,s.final.y-g.hole.y),endPlanet=Math.hypot(s.final.x-g.planet.x,s.final.y-g.planet.y);
  if(s.outcome==='fall')assert.ok(endHole<=g.hole.horizon+1e-6,`${level}: fall outside horizon`);
  else assert.ok(s.closest>g.hole.horizon,`${level}: ${s.outcome} path entered the horizon`);
  if(s.outcome==='success')assert.ok(endPlanet<=cfg.arrival+1e-6,`${level}: success outside landing zone`);
  if(s.outcome==='drift'){
   const out=s.final.x< -180||s.final.x>1780||s.final.y< -220||s.final.y>1220;
   if(!out){r.timeLimitDrifts++;if(endHole<400)r.orbitingAtTimeout++;}
  }
  if(s.outcome!=='fall')r.minHorizonGap=Math.min(r.minHorizonGap,s.closest-g.hole.horizon);
  r.maxFlightSeconds=Math.max(r.maxFlightSeconds,s.duration);
  r[s.outcome]++;r.runs++;if(isRandom&&s.outcome==='success')randSuccess++;
 }
 r.predictMsAvg=+(predictMsTotal/r.runs).toFixed(3);r.predictMsMax=+r.predictMsMax.toFixed(2);
 r.randomSuccessPct=+(100*randSuccess/PER_LEVEL).toFixed(1);r.randomValid=randValid;r.validLaunchSuccessPct=+(100*randSuccess/randValid).toFixed(1);r.maxFlightSeconds=+r.maxFlightSeconds.toFixed(1);r.minHorizonGap=+r.minHorizonGap.toFixed(2);
 for(const o of ['success','fall','drift'])assert.ok(r[o]>0,`${level}: ${o} unreachable`);
 report[level]=r;
}
for(const [name,cfg] of Object.entries(E.LEVELS))assert.ok(cfg.arrival<=3.5*cfg.planetRadius,`${name}: arrival radius exceeds 3.5 times planet radius`);
for(const p of [{x:20,y:0},{x:100,y:70},{x:0,y:180},{x:-1,y:0},{x:-28,y:0}])assert.equal(E.launch('commander',500,p.x,p.y).cancelled,true,'forward/short Commander pull must cancel');
for(const p of [{x:-100,y:300},{x:-100,y:-300},{x:-180,y:0}]){const a=E.launch('commander',500,p.x,p.y);assert.equal(a.cancelled,false);assert.ok(Math.abs(Math.atan2(a.vy,a.vx))<=Math.PI/6+1e-10);}
// Aimed preview and the visible clamped pull must point along the same launch velocity.
for(const [x,y] of [[-180,0],[-100,120],[-100,-120],[-50,200],[-50,-200]]){
 const corrected=E.commanderPull(x,y),ship=E.launch('commander',500,x,y);
 assert.equal(corrected.cancelled,false);
 const shownAngle=Math.atan2(-corrected.y,-corrected.x);
 const flightAngle=Math.atan2(ship.vy,ship.vx);
 assert.ok(Math.abs(shownAngle-flightAngle)<1e-10,'Commander dotted arrow differs from launch direction');
}
console.table(report);
assert.ok(report.commander.validLaunchSuccessPct>=18&&report.commander.validLaunchSuccessPct<=24,`Commander valid-launch success outside 18–24%: ${report.commander.validLaunchSuccessPct}%`);
assert.ok(report.pilot.randomSuccessPct>=38&&report.pilot.randomSuccessPct<=50,`Pilot outside 38–50%: ${report.pilot.randomSuccessPct}%`);
assert.ok(report.cadet.randomSuccessPct>report.pilot.randomSuccessPct&&report.pilot.randomSuccessPct>report.commander.validLaunchSuccessPct,'Difficulty order incorrect');
for(const [name,cfg] of Object.entries(E.LEVELS))assert.ok(cfg.planetMu<.3*cfg.mu,`${name}: planet gravity too strong`);
assert.ok(report.cadet.randomSuccessPct>=70,"Cadet below 70%: "+report.cadet.randomSuccessPct);
console.table(report);
const total=Object.values(report).reduce((a,r)=>a+r.runs,0);
console.log(`PASS: ${total} launches (${PER_LEVEL} random per level + edge cases) in ${((Date.now()-t0)/1000).toFixed(1)} s. Meter = flight in every case, deterministic, finite, terminating, outcomes match the picture.`);
