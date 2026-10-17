'use strict';
(()=>{
const G=window.SujiGesture,E=window.SujiEngine,$=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
const KEY='captainSujiV6Updated',FACTS=['Gravity pulls objects toward each other.','A spacecraft can curve around a black hole without touching it.','The event horizon is a boundary that light cannot escape from.','An orbit is a continuous fall around another object.'];
const CARDS=[
 ['gravity','🌍','GRAVITY',"Gravity is an invisible pull. It pulls your ship, just like it pulls a ball back down when you throw it up.",'Launch your ship.'],
 ['slingshot','🚀','SLINGSHOT',"The black hole's pull swung your ship around, like running round a pole while holding on to it!",'Swing past the black hole and land.'],
 ['horizon','⚫','POINT OF NO RETURN','A black hole has an invisible edge. If anything crosses it, it can never come back out. Not even light!','Get too close to the black hole…'],
 ['swallowed','🌌','SWALLOWED!','The closer you fly to a black hole, the harder it pulls. Try passing a little farther away!','Fall into the black hole 3 times.'],
 ['orbit','🌙','ORBIT','An orbit means going round and round something without falling in. The Moon orbits the Earth!','Fly halfway around the black hole without falling in.'],
 ['perfect','🎯','PERFECT GRAVITY',"Green means just right! Your ship's speed and the black hole's pull matched perfectly.",'Let go when the gravity meter is green.'],
 ['captain','🏅','CAPTAIN OF GRAVITY','You used gravity to land on the Planet! Real space scientists use gravity like this to send spaceships far away.','Land on the Planet.'],
 ['pilot','🕹️','PILOT','You steered the Swift Comet yourself! Pilots use small pushes to change direction in space.','Land in Level 2.']
];
let store={cards:[],falls:0};try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&Array.isArray(s.cards)){store={...store,...s};const legacy=['spa','ghetti'].join('');if(store.cards.includes(legacy)&&!store.cards.includes('swallowed'))store.cards.push('swallowed');store.cards=store.cards.filter(x=>x!==legacy&&CARDS.some(c=>c[0]===x));}}catch(_){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(_){}}
let cardsOpen=false,spokenCard=null,toastUntil=0,shipY=900,flightPausedAt=0;
const debugEnabled=new URLSearchParams(location.search).get('debug')==='1';
const debugPanel=$('debugPanel');if(debugEnabled)debugPanel.classList.remove('hidden');
const frameSamples=new Float32Array(240);let sampleCount=0,sampleAt=0,dropped=0,phaseName='idle',debugClock=0;
const sprites={hole:null,planet:null,ship:null};const traceBuffer=new Float32Array(16000);let traceCount=0;const previewBuffer=new Float32Array(240);let previewCount=0;const gravSpring={angle:0,angularVelocity:0,length:40,lengthVelocity:0};
let meterTravel=180,meterTarget=.5,meterValue=.5,meterVelocity=0,meterNeedsPrediction=true,frameSerial=0,launchDeferred=-1;
let launchWasGreen=false,planetGlide=null,planetPulse=0,headingTurn=0,headingPrevAngle=0;
let launchPrediction=null;let flightAge=0;let traceStep=0;let flightDrawX=330,flightDrawY=900,flightDrawVX=0,flightDrawVY=0;
const gravityArrow={};
let gesture=null,slide=null,settle=null,introStart=-1,introPlayed=false;
const TUTORIAL_KEY="captainSujiV7bFingerTutorial";
function unlock(id){if(store.cards.includes(id))return;store.cards.push(id);save();const c=CARDS.find(v=>v[0]===id);if(!c)return;const toast=$('discoveryToast');toast.textContent='⭐ New discovery! '+c[2];toast.classList.remove('hidden');toastUntil=performance.now()+1900;if(!muted)readAloud(c[2]+'. '+c[3]);}
function readAloud(t){try{speechSynthesis.cancel();if(muted)return;const u=new SpeechSynthesisUtterance(t);u.rate=.93;u.pitch=1.06;speechSynthesis.speak(u);}catch(_){}}
function openCards(){if(cardsOpen)return;cardsOpen=true;spokenCard=null;lastTime=0;const list=$('cardList');list.replaceChildren();$('cardsTitle').textContent='⭐ '+store.cards.length+' of '+CARDS.length+' found';for(const [id,emoji,name,desc] of CARDS){const found=store.cards.includes(id),b=document.createElement('button');b.className='discovery'+(found?' found':'');const em=document.createElement('span');em.className='emoji';em.textContent=emoji+(found?' ⭐':'');const title=document.createElement('b');title.textContent=name;const detail=document.createElement('small');detail.textContent=desc;b.append(em,title,detail);if(!found){const hint=document.createElement('small');hint.className='tryHint';hint.textContent='Try it: '+CARDS.find(v=>v[0]===id)[4];b.append(hint);}b.onclick=()=>{if(spokenCard===id){spokenCard=null;try{speechSynthesis.cancel();}catch(_){}}else{spokenCard=id;readAloud(name+'. '+desc);}};list.append(b);}$('cards').classList.remove('hidden');}
function closeCards(){cardsOpen=false;spokenCard=null;lastTime=0;try{speechSynthesis.cancel();}catch(_){}$('cards').classList.add('hidden');}

let muted=false,playing=false,dragging=false,visible=true,layoutId=-1,hints=3,attempt=0,pullX=0,pullY=0,stage='ready',elapsed=0,acc=0,lastTime=0,previous=null,current=null,flight=null,ghosts=[],trace=[],endTime=0,shipAngle=0,shipSize=1,shipAlpha=1,cam={x:E.W/2,y:E.H/2,vx:0,vy:0,scale:1},cw=1,ch=1,dpr=1,arenaLeft=0,arenaTop=0,stars=null,shipImage=new Image(),frameMetrics=[],lastScreen=null,endingOrigin=null,escapePod=null,previewPath=null,previewDirty=false,previewLast=0,renderWorldLast=null;
shipImage.src='ship.png';
function say(t){$('orbit').textContent=t;if(muted||toastUntil>performance.now())return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.93;u.pitch=1.06;speechSynthesis.speak(u);}catch(_){}}
function mute(){muted=!muted;document.querySelectorAll('.mute').forEach(b=>b.textContent=muted?'🔇 Sound off':'🔊 Sound on');if(muted)try{speechSynthesis.cancel();}catch(_){}}document.querySelectorAll('.mute').forEach(b=>b.onclick=mute);
function updateMeter(){
 const active=stage==='ready'&&gesture&&gesture.mode==='aim';
 const hud=$('gravityHud'),band=$('greenBand');hud.classList.toggle('inactive',!active);
 if(!active){meterTarget=1;band.classList.remove('active');return;}
 const init=E.launch(pullX,pullY,shipY);
 if(init.cancelled){meterTarget=1;band.classList.remove('active');return;}
 const pred=E.predict(init,layoutId);const planet=E.layout(layoutId);
 const miss=pred.miss||0;
 if(pred.outcome==='success')meterTarget=.5;
 else if(pred.outcome==='fall')meterTarget=0;
 else if(pred.closestPlanet<3*E.CFG.planetRadius){
  // Amber strips: 38–46% and 54–62%; preserve signed side of miss.
  const t=Math.tanh(Math.abs(miss)/(E.CFG.planetRadius*1.8));
  meterTarget=miss<0?.455-.055*t:.545+.055*t;
 }else if(pred.outcome==='drift'&&pred.closestPlanet>3*E.CFG.planetRadius)meterTarget=1;
 else meterTarget=E.clamp(.5+.42*Math.tanh(miss/(E.CFG.planetRadius*1.8)),0,1);
 band.classList.toggle('active',pred.outcome==='success');
 hud.classList.toggle('nearMiss',pred.outcome!=='success'&&pred.closestPlanet<3*E.CFG.planetRadius);
}
function starsLayer(){stars=document.createElement('canvas');stars.width=1000;stars.height=600;const c=stars.getContext('2d');c.fillStyle='#07142a';c.fillRect(0,0,1000,600);for(let i=0;i<340;i++){const x=(i*137.31)%1000,y=(i*263.77)%600;c.globalAlpha=.3+(i%6)/10;c.fillStyle='#d8f0ff';c.fillRect(x,y,i%13===0?2:1,i%13===0?2:1);}c.globalAlpha=1;$('arena').style.backgroundImage='url('+stars.toDataURL('image/png')+')';$('arena').style.backgroundSize='100% 100%';}
function makeSprite(size,paint){const c=document.createElement('canvas');c.width=c.height=size;paint(c.getContext('2d'),size);return c;}
function buildSprites(){
 sprites.hole=makeSprite(512,(c,n)=>{const mid=n/2,scale=n/460;c.scale(scale,scale);const g=c.createRadialGradient(230,230,20,230,230,230);g.addColorStop(0,'#000');g.addColorStop(.37,'#03030c');g.addColorStop(.45,'#ffbd6e');g.addColorStop(.65,'#ad4c70aa');g.addColorStop(1,'#ad4c7000');c.fillStyle=g;c.beginPath();c.arc(230,230,230,0,Math.PI*2);c.fill();c.fillStyle='#00010a';c.beginPath();c.arc(230,230,E.HOLE.horizon,0,Math.PI*2);c.fill();c.strokeStyle='#ffcc7d';c.lineWidth=7;c.stroke();});
 sprites.planet=makeSprite(256,(c,n)=>{const m=n/2,r=115,g=c.createRadialGradient(m-r*.4,m-r*.4,3,m,m,r);g.addColorStop(0,'#c6f9ff');g.addColorStop(.65,'#4094d6');g.addColorStop(1,'#123665');c.fillStyle=g;c.beginPath();c.arc(m,m,r,0,Math.PI*2);c.fill();});
 sprites.ship=makeSprite(128,(c)=>{if(shipImage.complete&&shipImage.naturalWidth)c.drawImage(shipImage,16,0,96,128);else{c.fillStyle='#e8b651';c.beginPath();c.moveTo(64,6);c.lineTo(108,118);c.lineTo(20,118);c.fill();}});
}
function updateDebug(t,phase){if(!debugEnabled)return;const ms=t-debugClock;if(ms<450)return;debugClock=t;let sorted=Array.from(frameSamples.subarray(0,Math.min(sampleCount,240))).sort((a,b)=>a-b);const p95=sorted.length?sorted[Math.floor((sorted.length-1)*.95)]:0;const max=sorted.length?sorted[sorted.length-1]:0;const avg=sorted.length?sorted.reduce((a,b)=>a+b,0)/sorted.length:0;debugPanel.textContent='Phase '+phase+' | FPS '+(avg?1000/avg:0).toFixed(1)+' | p95 '+p95.toFixed(1)+'ms | max '+max.toFixed(1)+'ms | dropped '+dropped+' | script '+window.__sujiDiagnostics.maxFrameMs.toFixed(1)+'ms';}
function drawArrowPixels(x,y,angle,len,color,thickness){const dx=Math.cos(angle),dy=Math.sin(angle),ex=x+dx*len,ey=y+dy*len;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.lineTo(ex-dx*14-dy*8,ey-dy*14+dx*8);ctx.moveTo(ex,ey);ctx.lineTo(ex-dx*14+dy*8,ey-dy*14-dx*8);ctx.strokeStyle='#07111f';ctx.lineWidth=thickness+4;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.stroke();}
function springGravity(dt,x,y){const dx=E.HOLE.x-x,dy=E.HOLE.y-y,dist=Math.hypot(dx,dy),target=Math.atan2(dy,dx);let delta=((target-gravSpring.angle+Math.PI*3)%(Math.PI*2))-Math.PI;const omega=12;gravSpring.angularVelocity+=(omega*omega*delta-2*omega*gravSpring.angularVelocity)*dt;gravSpring.angle+=gravSpring.angularVelocity*dt;const targetLen=40+80/(1+Math.pow(dist/380,2));gravSpring.lengthVelocity+=(omega*omega*(targetLen-gravSpring.length)-2*omega*gravSpring.lengthVelocity)*dt;gravSpring.length+=gravSpring.lengthVelocity*dt;return dist;}

function resize(){const r=$('arena').getBoundingClientRect();cw=Math.max(1,r.width);ch=Math.max(1,r.height);arenaLeft=r.left;arenaTop=r.top;dpr=Math.min(1.5,devicePixelRatio||1,Math.sqrt(3200000/(cw*ch)));canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);buildSprites();meterTravel=$('meterBar').getBoundingClientRect().height||180;if(stage==='ready'){cam.scale=Math.min(cw/E.W,ch/E.H)*.94;cam.x=E.W/2;cam.y=E.H/2;cam.vx=cam.vy=0;}}
function screen(x,y){return {x:(x-cam.x)*cam.scale+cw/2,y:(y-cam.y)*cam.scale+ch/2};}
function pointer(e){return {x:e.clientX-arenaLeft,y:e.clientY-arenaTop};}
function prepare(){gesture=null;slide=null;settle=null;$('gravityHud').classList.remove('moving');const oldLayout=layoutId;layoutId=E.nextLayout(layoutId);shipY=900;
 if(oldLayout>=0){planetGlide={from:E.layout(oldLayout),to:E.layout(layoutId),elapsed:0,duration:.8};planetPulse=1;say('The planet has moved – find it!');}else planetGlide=null;hints=3;dragging=false;pullX=pullY=0;previewPath=null;previewDirty=false;stage='ready';elapsed=acc=0;previous={x:330,y:shipY,vx:0,vy:0};current={x:330,y:shipY,vx:0,vy:0};flight=null;trace=[];traceCount=0;previewCount=0;shipAngle=0;shipAlpha=shipSize=1;lastScreen=null;endingOrigin=null;escapePod=null,previewPath=null,previewDirty=false,previewLast=0,renderWorldLast=null;$('hintsLeft').textContent=hints;$('result').classList.add('hidden');$('status').textContent='Find a path to the Planet. Pull back to aim.';resize();if(oldLayout<0)say('Pull back to aim, Captain!');meterNeedsPrediction=true;if(!introPlayed){try{introPlayed=localStorage.getItem(TUTORIAL_KEY)==='1';}catch(_){}if(!introPlayed){introStart=-1;introPlayed=true;try{localStorage.setItem(TUTORIAL_KEY,'1');}catch(_){}say('Slide me up or down, then pull back to aim!');introStart=0;}}}
function start(){playing=true;$('start').classList.add('hidden');$('game').classList.remove('hidden');prepare();}
function menu(){playing=false;dragging=false;stage='ready';$('game').classList.add('hidden');$('result').classList.add('hidden');$('cards').classList.add('hidden');cardsOpen=false;$('start').classList.remove('hidden');try{speechSynthesis.cancel();}catch(_){}}
function validPull(){return !E.launch(pullX,pullY,shipY).cancelled;}
function setShipHeight(y){shipY=E.clamp(y,400,1400);previous={x:330,y:shipY,vx:0,vy:0};current={x:330,y:shipY,vx:0,vy:0};}
function cancelGesture(){gesture=null;dragging=false;pullX=pullY=0;previewPath=null;previewDirty=false;$('gravityHud').classList.remove('moving');}
function beginSlide(y){slide={from:shipY,to:E.clamp(y,400,1400),elapsed:0,duration:.25};}
function pointerPosition(e){const q=pointer(e);return {x:q.x,y:q.y,worldY:cam.y+(q.y-ch/2)/cam.scale};}
canvas.addEventListener('pointerdown',e=>{
 if(!playing||cardsOpen||stage!=='ready'||gesture)return;
 const q=pointerPosition(e),p=screen(330,shipY),laneX=p.x;
 const nearShip=Math.hypot(q.x-p.x,q.y-p.y)<=90;
 // Track taps can begin anywhere along the vertical launch lane, not only on the ship.
 const onLane=Math.abs(q.x-laneX)<=Math.max(24,25*cam.scale)&&q.worldY>=400&&q.worldY<=1400;
 if(!nearShip&&!onLane)return;
 gesture={id:e.pointerId,startX:q.x,startY:q.y,lastY:q.y,originY:shipY,mode:nearShip?'pending':'move',laneTap:!nearShip};
 dragging=true;pullX=pullY=0;previewPath=null;previewDirty=false;
 if(!nearShip){beginSlide(q.worldY);$('gravityHud').classList.add('moving');}
 try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
 if(!gesture||gesture.id!==e.pointerId||cardsOpen)return;
 const q=pointerPosition(e),g=gesture,dx=q.x-g.startX,dy=q.y-g.startY;
 if(g.mode==='pending'){
  g.mode=G.lock(g.mode,dx,dy);
  if(g.mode==='move'){$('gravityHud').classList.add('moving');previewPath=null;previewDirty=false;}
 }
 if(g.mode==='move'){
  // The initial movement uses a fixed origin: no cumulative delta or touch jitter.
  // After a lane tap, a 0.25-second eased catch-up begins before following the finger.
  if(g.laneTap&&slide){slide.to=E.clamp(q.worldY,400,1400);}
  else {g.laneTap=false;slide=null;setShipHeight(g.originY+(q.y-g.startY)/cam.scale);}
  pullX=pullY=0;
 }else if(g.mode==='aim'){
  const len=Math.hypot(dx,dy),max=Math.min(Math.max(cw,ch)*.42,370),f=len?Math.min(len,max)/len:0;
  pullX=dx*f/max*E.CFG.maxPull;pullY=dy*f/max*E.CFG.maxPull;
  previewDirty=true;meterNeedsPrediction=true;
 }
 g.lastY=q.y;
 e.preventDefault();
});
function release(e){
 if(!gesture||(e&&e.pointerId!==gesture.id))return;
 const mode=gesture.mode;
 gesture=null;dragging=false;previewPath=null;previewDirty=false;
 $('gravityHud').classList.remove('moving');
 if(mode==='move'){
  // A small frame-driven settle, without changing the selected final height.
  if(slide){settle=null;}else settle={from:shipY,to:shipY,elapsed:0,duration:.12};
  pullX=pullY=0;meterNeedsPrediction=true;return;
 }
 if(mode!=='aim'){pullX=pullY=0;meterNeedsPrediction=true;return;}
 const initial=E.launch(pullX,pullY,shipY);
 if(initial.cancelled){say('Pull back to aim, Captain!');return;}
 launchWasGreen=$('greenBand').classList.contains('active');headingTurn=0;headingPrevAngle=Math.atan2(initial.vy,initial.vx);flight={outcome:'drift'};launchPrediction={initial,layoutId};previous={x:initial.x,y:initial.y,vx:initial.vx,vy:initial.vy};current={x:initial.x,y:initial.y,vx:initial.vx,vy:initial.vy};traceStep=0;traceCount=1;traceBuffer[0]=initial.x;traceBuffer[1]=initial.y;acc=elapsed=flightAge=0;stage='flight';attempt++;gravSpring.angle=Math.atan2(E.HOLE.y-initial.y,E.HOLE.x-initial.x);gravSpring.angularVelocity=0;gravSpring.length=40;gravSpring.lengthVelocity=0;launchDeferred=frameSerial+2;
}
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',e=>{if(gesture&&e.pointerId===gesture.id)cancelGesture();});
function beginEnding(){stage='ending';elapsed=0;endingOrigin={x:flightDrawX,y:flightDrawY,vx:flightDrawVX,vy:flightDrawVY};const ghost=new Path2D();for(let i=0;i<traceCount;i+=Math.max(1,Math.ceil(traceCount/300))){const j=i*2;if(i===0)ghost.moveTo(traceBuffer[j],traceBuffer[j+1]);else ghost.lineTo(traceBuffer[j],traceBuffer[j+1]);}ghosts.push(ghost);if(ghosts.length>3)ghosts.shift();if(flight.outcome==='fall'){store.falls++;save();unlock('horizon');if(store.falls>=3)unlock('swallowed');escapePod={x:previous.x,y:previous.y};}if(flight.outcome==='success'){if(Math.abs(headingTurn)>=Math.PI/6)unlock('slingshot');if(launchWasGreen)unlock('perfect');unlock('captain');}if(Math.abs(headingTurn)>=Math.PI&&flight.outcome!=='fall')unlock('orbit'); }
function endDuration(){return flight.outcome==='fall'?3.0:flight.outcome==='success'?1.3:1.5;}
function showResult(){stage='resultDelay';elapsed=0;}
function result(){stage='result';const out=flight.outcome,titles={fall:'WHOOSH! The black hole swallowed the Swift Comet!',success:'🎉 Mission Complete!',drift:'Lost in space!'},reasons={fall:'Phew! Escape pod launched. Let’s try again, Captain!',success:'The Swift Comet touched the Planet! Gravity curved our flight path.',drift:'The Swift Comet drifted into the stars. Try a different aim or pull.'};$('resultTitle').textContent=titles[out];$('resultReason').textContent=reasons[out];$('resultFact').textContent='ORBIT fun fact: '+FACTS[(attempt-1)%FACTS.length];$('result').classList.remove('hidden');say(reasons[out]);}
function advance(dt){if(stage==='flight'){flightAge+=dt;acc+=dt;let steps=0;while(acc>=E.DT&&steps<30){const tmp=previous;previous=current;current=tmp;E.advanceInto(previous,E.layout(layoutId),current);acc-=E.DT;steps++;if((++traceStep&3)===0&&traceCount<8000){traceBuffer[traceCount*2]=current.x;traceBuffer[traceCount*2+1]=current.y;traceCount++;}const angle=Math.atan2(current.vy,current.vx);const delta=Math.atan2(Math.sin(angle-headingPrevAngle),Math.cos(angle-headingPrevAngle));headingTurn+=delta;headingPrevAngle=angle;
 const end=E.terminal(current,E.layout(layoutId));if(end){flight.outcome=end;beginEnding();break;}}}else if(stage==='ending'){elapsed+=dt;if(elapsed>=endDuration())showResult();}else if(stage==='resultDelay'){elapsed+=dt;if(elapsed>=1)result();}}
function cameraStep(dt,x,y,vx,vy){const desiredScale=stage==='ready'?Math.min(cw/E.W,ch/E.H)*.94:Math.min(cw/1850,ch/1150);const z=1-Math.exp(-dt/0.75);cam.scale+=(desiredScale-cam.scale)*z;const follow=stage==='flight'||stage==='ending'&&flight.outcome!=='drift';const tx=follow?E.clamp(x+vx*.25,cw/(2*cam.scale),E.W-cw/(2*cam.scale)):E.W/2,ty=follow?E.clamp(y+vy*.2,ch/(2*cam.scale),E.H-ch/(2*cam.scale)):E.H/2;const w=5.5,ax=w*w*(tx-cam.x)-2*w*cam.vx,ay=w*w*(ty-cam.y)-2*w*cam.vy;cam.vx+=ax*dt;cam.vy+=ay*dt;const nx=cam.x+cam.vx*dt,ny=cam.y+cam.vy*dt;if((tx-cam.x)*(tx-nx)<0){cam.x=tx;cam.vx=0;}else cam.x=nx;if((ty-cam.y)*(ty-ny)<0){cam.y=ty;cam.vy=0;}else cam.y=ny;}
function render(dt){if(!playing)return;if(meterNeedsPrediction||stage!=='ready'){meterNeedsPrediction=false;updateMeter();}const mdt=Math.min(.05,dt),mw=13;meterVelocity+=(mw*mw*(meterTarget-meterValue)-2*mw*meterVelocity)*mdt;meterValue+=meterVelocity*mdt;$('meterNeedle').style.transform='translateY('+((meterValue-.5)*meterTravel)+'px)';if(introStart>=0){introStart+=dt;if(introStart>3.2)introStart=-1;}if(slide&&stage==='ready'&&!cardsOpen){slide.elapsed=Math.min(slide.duration,slide.elapsed+dt);const u=slide.elapsed/slide.duration,e=u*u*(3-2*u);setShipHeight(slide.from+(slide.to-slide.from)*e);if(u>=1){slide=null;if(gesture&&gesture.laneTap){gesture.laneTap=false;gesture.originY=shipY;gesture.startY=gesture.lastY;}}}if(previewDirty){previewDirty=false;const a=E.launch(pullX,pullY,shipY);if(a.cancelled)previewPath=null;else{previewCount=0;let state=a;for(let i=0;i<480;i++){if(E.terminal(state,E.layout(layoutId)))break;if(i%8===0&&previewCount<120){previewBuffer[previewCount*2]=state.x;previewBuffer[previewCount*2+1]=state.y;previewCount++;}state=E.advance(state,E.layout(layoutId));}previewPath=previewBuffer;}}const alpha=E.clamp(acc/E.DT,0,1);let x=current.x,y=current.y,vx=current.vx,vy=current.vy;if(stage==='flight'){x=previous.x+(current.x-previous.x)*alpha;y=previous.y+(current.y-previous.y)*alpha;vx=previous.vx+(current.vx-previous.vx)*alpha;vy=previous.vy+(current.vy-previous.vy)*alpha;}shipAlpha=shipSize=1;let stretch=1,spin=0,flash=0;
if(stage==='ending'){const t=elapsed,out=flight.outcome;if(out==='success'){const u=Math.min(t/.7,1),e=1-Math.pow(1-u,3),p=E.layout(layoutId),dx=endingOrigin.x-p.x,dy=endingOrigin.y-p.y,d=Math.hypot(dx,dy)||1;x=endingOrigin.x+(p.x+dx/d*(E.CFG.planetRadius+E.CFG.shipRadius)-endingOrigin.x)*e;y=endingOrigin.y+(p.y+dy/d*(E.CFG.planetRadius+E.CFG.shipRadius)-endingOrigin.y)*e;vx*=1-e;vy*=1-e;}else if(out==='fall'){const u=Math.min(t/1.8,1),r=Math.max(4,Math.hypot(endingOrigin.x-E.HOLE.x,endingOrigin.y-E.HOLE.y)*(1-u)),a=Math.atan2(endingOrigin.y-E.HOLE.y,endingOrigin.x-E.HOLE.x)+u*Math.PI*3;x=E.HOLE.x+Math.cos(a)*r;y=E.HOLE.y+Math.sin(a)*r;stretch=1+u*2.4;spin=u*Math.PI*5;shipAlpha=1-u;flash=t>1.8&&t<2?.75:0;}else{const u=Math.min(t/1.5,1);x=endingOrigin.x+endingOrigin.vx*t;y=endingOrigin.y+endingOrigin.vy*t;shipSize=1-u*.8;shipAlpha=1-u;}}
if(stage==='flight'){flightDrawX=x;flightDrawY=y;flightDrawVX=vx;flightDrawVY=vy;}cameraStep(dt,x,y,vx,vy);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cw,ch);ctx.save();ctx.translate(cw/2-cam.x*cam.scale,ch/2-cam.y*cam.scale);ctx.scale(cam.scale,cam.scale);
const h=E.HOLE,targetPlanet=E.layout(layoutId);
 if(planetGlide){planetGlide.elapsed=Math.min(.8,planetGlide.elapsed+dt);if(planetGlide.elapsed>=.8)planetGlide=null;}
 const u=planetGlide?planetGlide.elapsed/.8:1, ease=u*u*(3-2*u);
 const p=planetGlide?{x:planetGlide.from.x+(targetPlanet.x-planetGlide.from.x)*ease,y:planetGlide.from.y+(targetPlanet.y-planetGlide.from.y)*ease}:targetPlanet;ctx.drawImage(sprites.hole,h.x-230,h.y-230,460,460);ctx.font=`bold ${Math.max(50,16/cam.scale)}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#ffdb9a';ctx.fillText('BLACK HOLE',h.x,h.y-150);
// Soft dotted launch track; grip mark drawn directly on the ship in the same canvas.
ctx.save();ctx.strokeStyle='rgba(119,207,250,.35)';ctx.lineWidth=Math.max(5,2/cam.scale);ctx.setLineDash([5/cam.scale,14/cam.scale]);ctx.beginPath();ctx.moveTo(330,400);ctx.lineTo(330,1400);ctx.stroke();ctx.setLineDash([]);ctx.restore();
const planetDrawRadius=Math.max(E.CFG.planetRadius,22/cam.scale);ctx.drawImage(sprites.planet,p.x-planetDrawRadius,p.y-planetDrawRadius,planetDrawRadius*2,planetDrawRadius*2);ctx.fillStyle='#b9edff';ctx.font=`bold ${Math.max(45,16/cam.scale)}px system-ui`;ctx.fillText('PLANET',p.x,p.y+planetDrawRadius+Math.max(40,19/cam.scale));
 if(planetPulse>0){planetPulse=Math.max(0,planetPulse-dt);ctx.beginPath();ctx.arc(p.x,p.y,planetDrawRadius+(1-planetPulse)*110,0,Math.PI*2);ctx.strokeStyle='rgba(150,245,255,'+(planetPulse*.7)+')';ctx.lineWidth=8;ctx.stroke();}
for(let g=0;g<ghosts.length;g++){ctx.strokeStyle=g===2?'rgba(158,190,230,.23)':g===1?'rgba(158,190,230,.17)':'rgba(158,190,230,.11)';ctx.lineWidth=8;ctx.stroke(ghosts[g]);}
if(traceCount>1){ctx.beginPath();ctx.moveTo(traceBuffer[0],traceBuffer[1]);for(let i=1;i<traceCount;i++)ctx.lineTo(traceBuffer[i*2],traceBuffer[i*2+1]);ctx.strokeStyle='#55e5ffb5';ctx.lineWidth=7;ctx.stroke();}
if(gesture&&gesture.mode==='aim'&&previewPath){ctx.fillStyle='#8ff9e5';for(let i=0;i<previewCount;i++){ctx.globalAlpha=.45+.4*i/Math.max(1,previewCount);ctx.beginPath();ctx.arc(previewBuffer[i*2],previewBuffer[i*2+1],Math.max(4,2/cam.scale),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
if(gesture&&gesture.mode==='aim'){const a=E.launch(pullX,pullY,shipY),origin={x:330,y:shipY};ctx.strokeStyle='#ffbd74';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(origin.x+pullX,origin.y+pullY);ctx.stroke();if(!a.cancelled){const mag=230;ctx.strokeStyle='#7cf6b6';ctx.lineWidth=9;ctx.setLineDash([15,17]);ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(origin.x+a.vx/Math.hypot(a.vx,a.vy)*mag,origin.y+a.vy/Math.hypot(a.vx,a.vy)*mag);ctx.stroke();ctx.setLineDash([]);}}

const targetAngle=Math.atan2(vy,vx);if(stage==='flight'||stage==='ending'){let d=((targetAngle-shipAngle+Math.PI*3)%(2*Math.PI))-Math.PI;shipAngle+=E.clamp(d,-Math.PI*2*dt,Math.PI*2*dt);}else shipAngle=0;
ctx.save();ctx.translate(x,y);ctx.rotate(shipAngle+Math.PI/2+spin);const shipDrawScale=Math.max(1,80/(86*cam.scale));ctx.scale(shipSize*shipDrawScale,shipSize*stretch*shipDrawScale);ctx.globalAlpha=shipAlpha;ctx.drawImage(sprites.ship,-32,-43,64,86);
ctx.restore();
if(stage==='ready'){ctx.strokeStyle='#e9f7ff';ctx.lineWidth=5/cam.scale;for(let i=-1;i<=1;i++){const gy=shipY+i*12/cam.scale;ctx.beginPath();ctx.moveTo(330-72/cam.scale,gy);ctx.lineTo(330-54/cam.scale,gy);ctx.stroke();}}
if(stage==='ending'&&flight.outcome==='success'&&elapsed<.6){for(let i=0;i<12;i++){const a=i*Math.PI/6+elapsed*2;ctx.fillStyle=i%2?'#fff3b0':'#75e6ff';ctx.beginPath();ctx.arc(p.x+Math.cos(a)*(65+elapsed*80),p.y+Math.sin(a)*(65+elapsed*80),7,0,Math.PI*2);ctx.fill();}}
if(stage==='ending'&&flight.outcome==='fall'&&elapsed>=0&&escapePod){const u=Math.min(elapsed/1.1,1);ctx.fillStyle='#c9faff';ctx.beginPath();ctx.ellipse(escapePod.x+u*200,escapePod.y-u*130,22,13,-.5,0,Math.PI*2);ctx.fill();}
ctx.restore();
if(stage==='flight'){const dist=springGravity(dt,x,y);const power=1/(1+Math.pow(dist/380,2));const color=power>.7?'#ff5353':power>.35?'#ff9b42':'#ffe075';const sx=(x-cam.x)*cam.scale+cw/2,sy=(y-cam.y)*cam.scale+ch/2;const shipEdge=Math.max(25,40);const ax=sx+Math.cos(gravSpring.angle)*shipEdge,ay=sy+Math.sin(gravSpring.angle)*shipEdge;
 drawArrowPixels(ax,ay,gravSpring.angle,gravSpring.length,color,5);if(flightAge<2){ctx.globalAlpha=Math.min(1,(2-flightAge)*3);ctx.font='bold 14px system-ui';ctx.fillStyle='#fff5ba';ctx.fillText('GRAVITY',ax+Math.cos(gravSpring.angle)*gravSpring.length+Math.cos(gravSpring.angle+1.57)*19,ay+Math.sin(gravSpring.angle)*gravSpring.length+Math.sin(gravSpring.angle+1.57)*19);ctx.globalAlpha=1;}}
if(introStart>=0&&stage==='ready'&&!gesture){
 const t=introStart,phase=Math.min(t/3.2,1),base=screen(330,shipY);
 if(phase<1){const u=phase<.33?phase/.33:phase<.66?1-(phase-.33)/.33:(phase-.66)/.34;
 const fx=base.x-(phase>.66?u*110:0),fy=base.y-(phase<.66?u*65:0);
 ctx.save();ctx.font='40px system-ui';ctx.fillStyle='#fff3cc';ctx.shadowColor='#fff';ctx.shadowBlur=8;ctx.fillText('☝',fx,fy);ctx.restore();}
}
if(gesture&&gesture.mode==='aim'){const aim=E.launch(pullX,pullY,shipY);if(!aim.cancelled){const m=Math.hypot(aim.vx,aim.vy),sx=(330-cam.x)*cam.scale+cw/2,sy=(shipY-cam.y)*cam.scale+ch/2;drawArrowPixels(sx,sy,Math.atan2(aim.vy,aim.vx),Math.min(160,Math.max(70,cam.scale*230)),'#6dffc1',5);}}
if(flash){ctx.fillStyle=`rgba(255,255,255,${flash})`;ctx.fillRect(0,0,cw,ch);}if(renderWorldLast&&stage==='flight'){const distance=Math.hypot(x-renderWorldLast.x,y-renderWorldLast.y),expected=Math.hypot(vx,vy)*dt;window.__sujiDiagnostics.maxRatio=Math.max(window.__sujiDiagnostics.maxRatio,distance/Math.max(expected,1e-5));}if(stage==='flight'){if(!renderWorldLast)renderWorldLast={x:0,y:0};renderWorldLast.x=x;renderWorldLast.y=y;}else renderWorldLast=null;
}
window.addEventListener('sujiPilotLanding',()=>unlock('pilot'));window.addEventListener('sujiPilotOrbit',()=>unlock('orbit'));
window.__sujiDiagnostics={frames:0,maxFrameMs:0,maxRatio:0,stage:()=>stage,layout:()=>layoutId};
function loop(t){requestAnimationFrame(loop);frameSerial++;if(launchDeferred>=0&&frameSerial>=launchDeferred){launchDeferred=-1;if(launchPrediction){flight=E.simulate(launchPrediction.initial,launchPrediction.layoutId,{track:false});launchPrediction=null;}unlock('gravity');$('status').textContent='Watch gravity bend our path!';say('Here we go! Watch the gravity arrow.');}if(toastUntil&&t>toastUntil){$('discoveryToast').classList.add('hidden');toastUntil=0;}if(!visible||cardsOpen){lastTime=0;return;}if(!lastTime){lastTime=t;return;}const rawFrameMs=Math.max(0,t-lastTime);const dt=Math.min(.1,rawFrameMs/1000);lastTime=t;const start=performance.now();if(playing){advance(dt);render(dt);}const cost=performance.now()-start;const frameMs=rawFrameMs;if(phaseName!==stage){phaseName=stage;sampleCount=sampleAt=dropped=0;}if(frameMs>33)dropped++;frameSamples[sampleAt]=frameMs;sampleAt=(sampleAt+1)%240;sampleCount++;updateDebug(t,stage);const d=window.__sujiDiagnostics;d.frames++;d.maxFrameMs=Math.max(d.maxFrameMs,cost);}
document.addEventListener('visibilitychange',()=>{visible=!document.hidden;lastTime=0;});
$('commander').onclick=start;$('back').onclick=menu;$('resultBack').onclick=menu;$('restart').onclick=prepare;$('tryAgain').onclick=prepare;

$('askOrbit').onclick=()=>{if(stage!=='ready'||hints<=0)return;hints--;$('hintsLeft').textContent=hints;const messages=['Gravity pulls the ship toward the black hole.','A stronger pull makes the ship launch faster.','Try changing your direction and compare the fading trails.'];say(messages[2-hints]);};
$('discoveries').onclick=openCards;$('gameDiscoveries').onclick=openCards;$('resultDiscoveries').onclick=openCards;$('cardsBack').onclick=closeCards;window.addEventListener('resize',resize);starsLayer();Promise.resolve(shipImage.decode()).catch(()=>{}).finally(()=>{resize();requestAnimationFrame(loop);});
})();
