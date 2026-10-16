/* Captain Suji – Black Hole Challenge V6 updated.
   Deterministic 2D softened Newtonian gravity; educational, not general relativity.
   World units are arbitrary screen-distance units; dt fixed at 1/240 simulated seconds. */
(function(root){'use strict';
const W=1600,H=1000,DT=1/240,MAX_STEPS=4800;
const HOLE={x:830,y:500,horizon:65,softening:25};
const PLANET={x:1370,y:500,softening:40};
const LEVELS={
 cadet:{name:'Space Cadet',mu:6000000,planetMu:900000,arrival:230,planetRadius:80,baseSpeed:450,minSpeed:450,maxSpeed:450,horizon:45,planetX:1300},
 pilot:{name:'Space Pilot',mu:6000000,planetMu:300000,arrival:156,planetRadius:60,baseSpeed:550,minSpeed:550,maxSpeed:550,horizon:65,planetX:1300},
 commander:{name:'Space Commander',mu:50000000,planetMu:300000,arrival:150,planetRadius:45,baseSpeed:700,minSpeed:420,maxSpeed:1020}
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Commander precision steering: broad finger motions map to fine ship angles.
// The physical gravity integrator is unchanged. Forward/short pulls still cancel.
const COMMANDER_AIM_SENSITIVITY=0.5;
function commanderPull(x,y){
 const length=Math.min(180,Math.hypot(x,y));
 if(x>=0||length<=28)return {x:0,y:0,cancelled:true};
 const rawAngle=clamp(Math.atan2(y,-x),-Math.PI/3,Math.PI/3);
 const a=rawAngle*COMMANDER_AIM_SENSITIVITY;
 return {x:-length*Math.cos(a),y:length*Math.sin(a),cancelled:false};
}
function launch(level='cadet',y=500,pullX=0,pullY=0){
 const cfg=LEVELS[level]||LEVELS.cadet;
 const speed=(level==='cadet'||level==='pilot')?cfg.baseSpeed:cfg.minSpeed+(cfg.maxSpeed-cfg.minSpeed)*clamp(Math.hypot(pullX,pullY)/180,0,1);
 const corrected=level==='commander'?commanderPull(pullX,pullY):null;
 const cancelled=corrected?corrected.cancelled:false;
 const angle=corrected&&!cancelled?Math.atan2(-corrected.y,-corrected.x):0;
 return {x:170,y:clamp(y,150,850),vx:speed*Math.cos(angle),vy:speed*Math.sin(angle),cancelled};
}
function geom(level){const c=LEVELS[level]||LEVELS.cadet;return {hole:{...HOLE,horizon:c.horizon||HOLE.horizon},planet:{...PLANET,x:c.planetX||PLANET.x}};}
function simulate(level,initial,options={}){
 const cfg=LEVELS[level]||LEVELS.cadet,track=options.track!==false;
 const HZ=cfg.horizon||HOLE.horizon,PX=cfg.planetX||PLANET.x;
 let x=initial.x,y=initial.y,vx=initial.vx,vy=initial.vy;
 let closest=Infinity,planetClosest=Infinity,outcome='drift',steps=0,peakGravity=0;
 const path=track?[{x,y,vx,vy,gravity:0,t:0}]:[];
 for(let i=1;i<=MAX_STEPS;i++){
  const dx=HOLE.x-x,dy=HOLE.y-y,r2=dx*dx+dy*dy,r=Math.sqrt(r2);
  const px=PX-x,py=PLANET.y-y,pr2=px*px+py*py,pr=Math.sqrt(pr2);
  closest=Math.min(closest,r);planetClosest=Math.min(planetClosest,pr);
  if(r<=HZ){outcome='fall';steps=i-1;break;}
  if(pr<=cfg.arrival){outcome='success';steps=i-1;break;}
  if(x< -180||x>1780||y< -220||y>1220){outcome='drift';steps=i-1;break;}
  const holeF=cfg.mu/Math.pow(r2+HOLE.softening**2,1.5);
  const planetF=cfg.planetMu/Math.pow(pr2+PLANET.softening**2,1.5);
  const ax=dx*holeF+px*planetF,ay=dy*holeF+py*planetF;
  const gravity=Math.hypot(dx*holeF,dy*holeF);
  peakGravity=Math.max(peakGravity,gravity);
  // Fixed-timestep symplectic (semi-implicit) Euler: identical in preview and flight.
  vx+=ax*DT;vy+=ay*DT;x+=vx*DT;y+=vy*DT;
  if(!Number.isFinite(x+y+vx+vy))throw Error('Non-finite trajectory');
  steps=i;
  if(track && (i%4===0))path.push({x,y,vx,vy,gravity,t:i*DT});
 }
 if(track){const p=path[path.length-1];if(!p||p.x!==x||p.y!==y)path.push({x,y,vx,vy,gravity:peakGravity,t:steps*DT});}
 return {outcome,path,closest,planetClosest,peakGravity,steps,final:{x,y,vx,vy},duration:steps*DT};
}
function predict(level,initial){return simulate(level,initial,{track:false});}
function greenBands(level='cadet',steps=350){
 const bands=[];let start=null;
 for(let i=0;i<=steps;i++){
  const y=150+700*i/steps,green=predict(level,launch(level,y)).outcome==='success';
  if(green&&start===null)start=y;
  if(!green&&start!==null){bands.push({min:start,max:150+700*(i-1)/steps});start=null;}
 }
 if(start!==null)bands.push({min:start,max:850});
 return bands;
}
function pullAt(level,position){const dx=HOLE.x-position.x,dy=HOLE.y-position.y,r2=dx*dx+dy*dy,cfg=LEVELS[level]||LEVELS.cadet;return {x:cfg.mu*dx/Math.pow(r2+HOLE.softening**2,1.5),y:cfg.mu*dy/Math.pow(r2+HOLE.softening**2,1.5)};}
const API={W,H,DT,MAX_STEPS,HOLE,PLANET,LEVELS,clamp,launch,simulate,predict,pullAt,geom,greenBands,commanderPull};
if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SujiEngine=API;
})(typeof window!=='undefined'?window:globalThis);
