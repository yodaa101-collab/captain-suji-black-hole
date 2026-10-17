/* V7b: deterministic, DOM-free 2D softened Newtonian educational simulator. */
(function(root){'use strict';
const W=4000,H=1800,DT=1/240,MAX_STEPS=7200,HOLE=Object.freeze({x:1910,y:900,horizon:78,softening:35});
const CFG=Object.freeze({mu:20000000,planetMu:5999999,planetRadius:100,shipRadius:60,minSpeed:150,maxSpeed:380,maxPull:340});
const LAYOUTS=Object.freeze(Array.from({length:20},(_,i)=>Object.freeze({id:i,x:2160+(i%5)*360,y:270+Math.floor(i/5)*420})));
let recentLayouts=[];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function layout(id=0){return LAYOUTS[((id%LAYOUTS.length)+LAYOUTS.length)%LAYOUTS.length];}
function nextLayout(previous=-1,random=Math.random){
 const prev=previous>=0?layout(previous):null;
 const distance=p=>!prev?Infinity:Math.hypot(p.x-prev.x,p.y-prev.y);
 const eligible=LAYOUTS.filter(p=>!recentLayouts.slice(-6).includes(p.id)&&distance(p)>=800);
 let selected;
 if(eligible.length)selected=eligible[Math.floor(clamp(random(),0,.999999999)*eligible.length)];
 else {const fallback=LAYOUTS.filter(p=>!recentLayouts.slice(-3).includes(p.id));
 selected=fallback.reduce((best,p)=>!best||distance(p)>distance(best)?p:best,null);
 if(!selected)selected=LAYOUTS.reduce((best,p)=>distance(p)>distance(best)?p:best,LAYOUTS[0]);}
 recentLayouts.push(selected.id);if(recentLayouts.length>6)recentLayouts.shift();return selected.id;
}
function resetLayoutHistory(){recentLayouts=[];}
function launch(pullX,pullY,shipY=900){const length=Math.hypot(pullX,pullY);if(pullX>=0||length<=28)return {cancelled:true,x:330,y:shipY,vx:0,vy:0};const magnitude=Math.min(length,CFG.maxPull);const speed=CFG.minSpeed+(CFG.maxSpeed-CFG.minSpeed)*magnitude/CFG.maxPull;return {cancelled:false,x:330,y:shipY,vx:-pullX/length*speed,vy:-pullY/length*speed};}
function acceleration(x,y,p){const dx=HOLE.x-x,dy=HOLE.y-y,r2=dx*dx+dy*dy,px=p.x-x,py=p.y-y,pr2=px*px+py*py;const h=CFG.mu/Math.pow(r2+HOLE.softening**2,1.5),g=CFG.planetMu/Math.pow(pr2+40**2,1.5);return {x:dx*h+px*g,y:dy*h+py*g,holeX:dx*h,holeY:dy*h};}
function advance(s,p){const a=acceleration(s.x,s.y,p),vx=s.vx+a.x*DT,vy=s.vy+a.y*DT;return {x:s.x+vx*DT,y:s.y+vy*DT,vx,vy};}
function advanceInto(s,p,out){const dx=HOLE.x-s.x,dy=HOLE.y-s.y,r2=dx*dx+dy*dy,px=p.x-s.x,py=p.y-s.y,pr2=px*px+py*py;const h=CFG.mu/Math.pow(r2+HOLE.softening**2,1.5),g=CFG.planetMu/Math.pow(pr2+40**2,1.5);out.vx=s.vx+(dx*h+px*g)*DT;out.vy=s.vy+(dy*h+py*g)*DT;out.x=s.x+out.vx*DT;out.y=s.y+out.vy*DT;return out;}
function terminal(s,p){if(Math.hypot(s.x-HOLE.x,s.y-HOLE.y)<=HOLE.horizon)return 'fall';if(Math.hypot(s.x-p.x,s.y-p.y)<=CFG.planetRadius+CFG.shipRadius)return 'success';if(s.x< -200||s.x>W+200||s.y< -300||s.y>H+300)return 'drift';return null;}
function simulate(initial,layoutId=0,options={}){const p=layout(layoutId),track=options.track!==false;let s={x:initial.x,y:initial.y,vx:initial.vx,vy:initial.vy};let outcome='drift',steps=0,closest=Infinity,closestPlanet=Infinity,miss=0;const path=track?[{...s,t:0}]:[];if(initial.cancelled)return {outcome:'cancelled',steps:0,duration:0,final:s,path};for(let i=0;i<MAX_STEPS;i++){const end=terminal(s,p);if(end){outcome=end;break;}closest=Math.min(closest,Math.hypot(s.x-HOLE.x,s.y-HOLE.y));
const pd=Math.hypot(s.x-p.x,s.y-p.y);if(pd<closestPlanet){closestPlanet=pd;const speed=Math.hypot(s.vx,s.vy)||1;miss=((p.x-s.x)*s.vy-(p.y-s.y)*s.vx)/speed;}s=advance(s,p);steps++;if(track&&i%4===3)path.push({...s,t:steps*DT});}if(track&&(path[path.length-1].t!==steps*DT))path.push({...s,t:steps*DT});return {outcome,steps,duration:steps*DT,final:s,path,closest,closestPlanet,miss};}
function predict(initial,id=0){return simulate(initial,id,{track:false});}
const API={resetLayoutHistory,W,H,DT,MAX_STEPS,HOLE,CFG,LAYOUTS,clamp,layout,nextLayout,launch,acceleration,advance,advanceInto,terminal,simulate,predict};if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SujiEngine=API;
})(typeof window!=='undefined'?window:globalThis);
