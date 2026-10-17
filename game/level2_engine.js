/* Captain Suji V7b — deterministic, DOM-free cockpit physics. */
(function(root){'use strict';
const W=4000,H=1800,DT=1/240,STEPS=9600,STEER_ACCEL=70;
const CFG=Object.freeze({mu:20000000,planetMu:5999999,horizon:78,softening:35,planetRadius:100,shipRadius:60});
const HOLES=Object.freeze([{x:1550,y:300},{x:1550,y:900},{x:1550,y:1500},{x:1950,y:300},{x:1950,y:900},{x:1950,y:1500},{x:2350,y:300},{x:2350,y:900},{x:2350,y:1500}]);
const PLANETS=Object.freeze([2700,3100,3500,3900].flatMap(x=>[260,650,1050,1490].map(y=>({x,y}))));
const PAIRS=Object.freeze(HOLES.flatMap((hole,hi)=>PLANETS.filter(p=>Math.hypot(p.x-hole.x,p.y-hole.y)>=900&&hole.x-330>=1000).map((planet,pi)=>Object.freeze({id:hi*100+pi,hole,planet}))));
let history=[];
function choose(previous=null,random=Math.random){const old=previous&&previous.planet;const eligible=PAIRS.filter(p=>!history.slice(-4).includes(p.id)&&(!old||Math.hypot(p.planet.x-old.x,p.planet.y-old.y)>=800));const pool=eligible.length?eligible:PAIRS.filter(p=>!history.slice(-4).includes(p.id));const selected=pool[Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length))];history.push(selected.id);if(history.length>4)history.shift();return selected;}
function resetHistory(){history=[];}
function launch(pullX,pullY,y=900){const d=Math.hypot(pullX,pullY);if(pullX>=0||d<=28)return {cancelled:true,x:330,y,vx:0,vy:0};const speed=150+230*Math.min(d,340)/340;return {x:330,y,vx:-pullX/d*speed,vy:-pullY/d*speed};}
function advanceInto(s,scene,steer,out){const h=scene.hole,p=scene.planet,dx=h.x-s.x,dy=h.y-s.y,px=p.x-s.x,py=p.y-s.y;const hg=CFG.mu/Math.pow(dx*dx+dy*dy+CFG.softening**2,1.5),pg=CFG.planetMu/Math.pow(px*px+py*py+40**2,1.5);const speed=Math.hypot(s.vx,s.vy)||1;const a=steer*STEER_ACCEL/speed;let vx=s.vx+(dx*hg+px*pg-s.vy*a)*DT,vy=s.vy+(dy*hg+py*pg+s.vx*a)*DT;
// Sideways steering rotates the velocity vector without increasing kinetic speed from thrust.
if(steer){const unsteeredX=s.vx+(dx*hg+px*pg)*DT,unsteeredY=s.vy+(dy*hg+py*pg)*DT;const target=Math.hypot(unsteeredX,unsteeredY),actual=Math.hypot(vx,vy)||1;vx*=target/actual;vy*=target/actual;}
out.x=s.x+vx*DT;out.y=s.y+vy*DT;out.vx=vx;out.vy=vy;return out;}
function advance(s,scene,steer=0){return advanceInto(s,scene,steer,{});}
function terminal(s,scene){const h=scene.hole,p=scene.planet;if(Math.hypot(s.x-h.x,s.y-h.y)<=CFG.horizon)return 'fall';if(Math.hypot(s.x-p.x,s.y-p.y)<=CFG.planetRadius+CFG.shipRadius)return 'success';if(s.x< -200||s.x>W+200||s.y< -300||s.y>H+300)return 'drift';return null;}
function simulate(initial,scene,options={}){let a={...initial},b={x:0,y:0,vx:0,vy:0},steps=0,outcome='drift',closestPlanet=Infinity,miss=0,headingTurn=0,prevHeading=Math.atan2(a.vy,a.vx);const schedule=options.schedule||null,record=options.record===true?new Int8Array(STEPS):null,track=options.track?[]:null;let steer=options.steer||0;for(let i=0;i<STEPS;i++){const end=terminal(a,scene);if(end){outcome=end;break;}const d=Math.hypot(a.x-scene.planet.x,a.y-scene.planet.y);if(d<closestPlanet){closestPlanet=d;miss=((scene.planet.x-a.x)*a.vy-(scene.planet.y-a.y)*a.vx)/(Math.hypot(a.vx,a.vy)||1);}steer=schedule?(typeof schedule==='function'?schedule(i,a,scene):schedule[i]||0):steer;if(record)record[i]=steer;if(track&&i%4===0)track.push(a.x,a.y);advanceInto(a,scene,steer,b);const heading=Math.atan2(b.vy,b.vx);headingTurn+=Math.atan2(Math.sin(heading-prevHeading),Math.cos(heading-prevHeading));prevHeading=heading;const tmp=a;a=b;b=tmp;steps++;}return {outcome,steps,duration:steps*DT,final:a,closestPlanet,miss,headingTurn,inputs:record?record.slice(0,steps):null,path:track};}
function predict(s,scene,steer=0){return simulate(s,scene,{steer});}
const API={W,H,DT,STEPS,CFG,STEER_ACCEL,HOLES,PLANETS,PAIRS,choose,resetHistory,launch,advance,advanceInto,terminal,simulate,predict};if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SujiLevel2=API;
})(typeof window!=='undefined'?window:globalThis);
