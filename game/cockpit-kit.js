/* Shared V7c presentation. No physics or Level 2 search policy lives here. */
(() => {
  'use strict';
  const TAU = Math.PI * 2, clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const muted = () => [...document.querySelectorAll('.mute')].some(b => b.textContent.includes('Sound off'));
  let audio, lastVoice = -Infinity;
  function tone(kind='ring',side=0) {
    if(muted()) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      if(kind==='whoosh'){
        const source=audio.createBufferSource(),buffer=audio.createBuffer(1,Math.round(audio.sampleRate*.26),audio.sampleRate),samples=buffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
        source.buffer=buffer;const filter=audio.createBiquadFilter(),gain=audio.createGain(),pan=audio.createStereoPanner();filter.type='lowpass';filter.frequency.value=700;pan.pan.value=side;
        gain.gain.setValueAtTime(.001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.035,audio.currentTime+.06);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);
        source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(audio.destination);source.start();return;
      }
      const o=audio.createOscillator(),g=audio.createGain(),pan=audio.createStereoPanner();
      pan.pan.value=side; o.type=kind==='whoosh'?'triangle':'sine';
      const f=kind==='thud'?85:kind==='whoosh'?180:660;
      o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(kind==='ring'?990:f*.5,audio.currentTime+.18);
      g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);
      o.connect(g);g.connect(pan);pan.connect(audio.destination);o.start();o.stop(audio.currentTime+.26);
    } catch (_) {}
  }
  function say(text,force=false) {
    if(muted() || !window.speechSynthesis || (!force && performance.now()-lastVoice<4000)) return false;
    lastVoice=performance.now();speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.rate=.94;speechSynthesis.speak(u);
    if(/little left/i.test(text))tone('whoosh',-1);
    if(/little right/i.test(text))tone('whoosh',1);
    return true;
  }
  function sprite(n,paint) {const c=document.createElement('canvas');c.width=c.height=n;paint(c.getContext('2d'),n);return c;}
  function planet(n,green=false) {return sprite(n,(c,s)=>{
    const r=s*.46,g=c.createRadialGradient(s*.30,s*.25,1,s*.58,s*.53,r*1.4);
    g.addColorStop(0,green?'#d9ffcd':'#d8faff');g.addColorStop(.43,green?'#54b77d':'#4a9edb');g.addColorStop(1,'#030e23');
    const atm=c.createRadialGradient(s/2,s/2,r*.94,s/2,s/2,s*.5);atm.addColorStop(0,'#7ceaff00');atm.addColorStop(.5,green?'#a4ffbf88':'#7ceaff99');atm.addColorStop(1,'#7ceaff00');
    c.fillStyle=atm;c.fillRect(0,0,s,s);c.beginPath();c.arc(s/2,s/2,r,0,TAU);c.fillStyle=g;c.fill();c.save();c.clip();
    c.strokeStyle='#e2ffff30';c.lineWidth=s*.014;for(let i=-3;i<=3;i++){c.beginPath();c.ellipse(s*.5,s*(.5+i*.095),r*.93,r*.10,i*.035,0,TAU);c.stroke();}c.restore();
  });}
  function hole(n) {return sprite(n,(c,s)=>{
    c.translate(s/2,s/2);c.rotate(-.29);
    const glow=c.createRadialGradient(0,0,s*.12,0,0,s*.48);glow.addColorStop(0,'#ffb85155');glow.addColorStop(1,'#ffb85100');c.fillStyle=glow;c.fillRect(-s/2,-s/2,s,s);
    c.strokeStyle='#df7c30';c.lineWidth=s*.055;c.beginPath();c.ellipse(0,0,s*.43,s*.14,0,Math.PI,TAU);c.stroke();
    c.strokeStyle='#ffe6a3';c.lineWidth=s*.018;c.stroke();
    c.fillStyle='#010208';c.beginPath();c.arc(0,0,s*.245,0,TAU);c.fill();c.strokeStyle='#fff4c8';c.lineWidth=s*.009;c.stroke();
    c.strokeStyle='#ee9e43';c.lineWidth=s*.04;c.beginPath();c.ellipse(0,0,s*.43,s*.14,0,0,Math.PI);c.stroke();c.strokeStyle='#ffd994';c.lineWidth=s*.009;c.stroke();
  });}
  const ringArt=[false,true].map(bright=>sprite(256,c=>{c.strokeStyle=bright?'#d5ffff':'#50e1f8';c.shadowColor='#4ef3ff';c.shadowBlur=bright?16:3;c.lineWidth=bright?4:2;c.beginPath();c.ellipse(128,128,104,83.2,0,0,TAU);c.stroke();}));
  // Routes contain a sample every 0.1 seconds. Anchor rings to the search's
  // simulation time, not the time its asynchronous reply reaches the cockpit.
  class Rings {
    constructor(){this.current=null;this.previous=null;this.swap=0;this.particles=[];this.serial=0;}
    set(points,time,sample=.1){
      if(!points || points.length<4)return;
      const old=this.current;
      if(old){let compared=0,max=0;for(let t=1;t<=6;t++){const j=Math.round(t/sample)*2,k=Math.round((time+t-old.time)/old.sample)*2;if(j+1>=points.length||k<0||k+1>=old.points.length)continue;compared++;max=Math.max(max,Math.hypot(points[j]-old.points[k],points[j+1]-old.points[k+1]));}if(compared>=2&&max<35)return;}
      this.previous=old;this.current={points,time,sample,id:++this.serial,passed:new Set()};this.swap=performance.now();
    }
    next(time){const r=this.current;if(!r)return null;const i=Math.max(1,Math.floor(time-r.time)+1),j=Math.round(i/r.sample);return j*2<r.points.length?{x:r.points[j*2],y:r.points[j*2+1],index:i}:null;}
    draw(ctx,state,time,project,enabled=true){
      if(!enabled)return;
      const now=performance.now(),age=(now-this.swap)/1000;
      for(const [r,alpha] of [[this.previous,1-clamp(age/.3,0,1)],[this.current,this.previous?clamp((age-.3)/.3,0,1):clamp(age/.3,0,1)]]){
        if(!r||alpha<=0)continue;const rings=[],start=Math.max(1,Math.floor(time-r.time)+1);
        for(let k=0;k<6;k++){const index=start+k,j=Math.round(index/r.sample);if(j*2>=r.points.length)break;const point={x:r.points[j*2],y:r.points[j*2+1]},p=project(point);if(!p.visible)continue;const radius=clamp(85*p.f/Math.max(50,p.d),9,110);rings.push({...p,radius});ctx.save();ctx.globalAlpha=alpha*(k===0?.95:.45);ctx.drawImage(ringArt[k===0?1:0],p.x-radius*1.23,p.y-radius*1.23,radius*2.46,radius*2.46);ctx.restore();}
        // Check every unpassed world-space ring, including a ring just behind
        // the ship. Testing only the look-ahead ring can never detect passage.
        if(r===this.current)for(let index=Math.max(1,start-2);index<=start;index++){
          const j=Math.round(index/r.sample);if(j*2>=r.points.length||r.passed.has(index))continue;
          if(Math.hypot(r.points[j*2]-state.x,r.points[j*2+1]-state.y)<=85){r.passed.add(index);if(!this.lastChime||now-this.lastChime>650){tone();this.lastChime=now;const p=project({x:r.points[j*2],y:r.points[j*2+1]});for(let k=0;k<12;k++)this.particles.push({x:p.x,y:p.y,angle:k*TAU/12,born:now});}}
        }
        ctx.save();ctx.globalAlpha=alpha*.65;ctx.fillStyle='#baffff';ctx.font='bold 20px system-ui';const u=(now/900)%1;for(let k=0;k<rings.length-1;k++){const a=rings[k],b=rings[k+1];ctx.fillText('›',a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u);}ctx.restore();
      }
      this.particles=this.particles.filter(p=>now-p.born<450);ctx.save();ctx.fillStyle='#d8ffff';for(const p of this.particles){const t=(now-p.born)/450;ctx.globalAlpha=1-t;ctx.fillRect(p.x+Math.cos(p.angle)*t*65,p.y+Math.sin(p.angle)*t*65,3,3);}ctx.restore();
    }
  }
  function traffic(pred,radius){return pred?.outcome==='success'?'green':pred?.outcome==='fall'&&pred.duration<=6?'red':pred?.closestPlanet<=3*radius?'amber':'grey';}
  const labels={green:'LET GO – GRAVITY WILL CARRY US',amber:'NEARLY',red:'DANGER',grey:'KEEP FLYING'};
  window.SujiCockpitKit={tone,say,muted,sprite,planet,hole,Rings,traffic,labels};
})();
