/* Captain Suji V7c: deterministic two-leg Deep Space Mission. */
(()=> {
  'use strict';
  const ART=SujiRealisticArt,C=SujiDeepCockpit;
  let entryGeneration=0,entering=false;
  let artwork=null,edgeLabels=[],labelBoxes=[],dustStarted=0,dustAge=0,dustOpacity=0,frameBakes=0,bank=0,lastVisualHeading=null;
  let renderedBodies=[];
  const E=SujiLevel3,
  K=SujiCockpitKit,
  $=id=>document.getElementById(id),
  root=$('level3');
  root.innerHTML=`<header><button id="l3Back" data-box>← Back</button><strong>DEEP SPACE MISSION</strong><span id="l3Leg"></span></header><main id="l3Arena"><canvas id="l3Canvas"></canvas><canvas id="l3Frame"></canvas>${C.dashboard()}<div id="l3Message"></div><div id="l3Lesson" class="hidden">See this light, Captain? Green means let go – gravity will carry us to the planet!</div><div id="l3Controls"><button id="l3Left" data-box aria-label="Steer left">◀</button><button id="l3Right" data-box aria-label="Steer right">▶</button></div><div id="l3Result" class="hidden"><div id="l3LandingBadge" class="hidden">Touchdown!</div><h2 id="l3Title"></h2><p id="l3Text"></p><button id="l3Continue">Continue</button></div><div id="l3Card" class="hidden"><h2>GRAVITY TUG-OF-WAR</h2><p>Two black holes pull in different directions. In between, their pulls can almost cancel out!</p><h2>EXPLORER</h2><p>You visited two planets in one trip, just like real space missions!</p><button id="l3Close">Back to flight</button></div></main><div id="l3Preparing" class="hidden"><span>Preparing deep space…</span><span id="l3PrepareProgress">Warming up the stars</span><button id="l3PreparingBack">Back to menu</button></div>`;
  const canvas=$('l3Canvas'),
  ctx=canvas.getContext('2d'),
  frame=$('l3Frame'),
  fc=frame.getContext('2d'),
  mc=$('l3Map').getContext('2d'),
  ship=new Image();
  let shipArtwork=null,shipOpaqueBounds=null;
  ship.onload=()=> {
    const c=document.createElement('canvas');c.width=319;c.height=309;
    const x=c.getContext('2d');x.drawImage(ship,17,22,319,309,0,0,319,309);
    const pixels=x.getImageData(0,0,319,309).data;
    let left=319,top=309,right=0,bottom=0;
    for(let y=0;y<309;y++)for(let i=0;i<319;i++)if(pixels[(y*319+i)*4+3]>200){left=Math.min(left,i);top=Math.min(top,y);right=Math.max(right,i);bottom=Math.max(bottom,y);}
    shipOpaqueBounds={left,top,right,bottom};
    shipArtwork=document.createElement('canvas');shipArtwork.width=right-left+1;shipArtwork.height=bottom-top+1;
    shipArtwork.getContext('2d').drawImage(c,left,top,right-left+1,bottom-top+1,0,0,right-left+1,bottom-top+1);
  };
  ship.src='ship.png';
  const clamp=(v, a, b)=>Math.max(a, Math.min(b, v)),
  diff=(a, b)=>Math.atan2(Math.sin(a-b), Math.cos(a-b)),
  ease=t=>t*t*(3-2*t);
  let active=false,
  loopRunning=false,
  manualFrames=false,
  paused=false,
  phase='aim',
  leg=1,
  layout=-1,
  scene,
  state,
  elapsed=0,
  acc=0,
  last=0,
  w=1,
  h=1,
  dpr=1,
  left=false,
  right=false,
  navOn=true,
  ringsUsed=0,
  worker,
  busy=false,
  queued=null,
  seq=0,
  sentHeading=0,
  navAt=-1,
  routeTime=0,
  coast=null,
  traffic='grey',
  lessonUntil=0,
  landingAt=0,
  pose=null,
  pointer=null,
  pull= {
    x:0,
    y:0
  },
  frames=[],
  searches=[],
  searchStart=0,
  requested=0,
  completed=0,
  flightFrames=0,
  gap=null,
  maxJump=0,
  visibleBodies=0,
  mapCache=null,
  mapKey=null,
  sprites,
  rings=new K.Rings(),
  workerRecoveryCount=0,
  workerErrorMessage='';
  const radarInset=document.createElement('canvas');radarInset.width=224;radarInset.height=112;
  const heading=()=>Math.atan2(state.vy, state.vx),
  stars=Array.from( {
    length:150
  }, (_, i)=>( {
    x:(i*137.31%997)/997,
    y:(i*263.77%991)/991,
    z:1+i%3
  }));
  function resize() {
    radarInset.width=224;radarInset.height=112;
    const r=$('l3Arena').getBoundingClientRect();
    w=Math.max(1, r.width);
    h=Math.max(1, r.height);
    dpr=Math.min(devicePixelRatio||1, 1.5, Math.sqrt(3200000/(w*h)));
    for(const c of [canvas, frame]) {
      c.width=Math.round(w*dpr);
      c.height=Math.round(h*dpr);
    }
    C.paintFrame(fc,w,h,dpr);frameBakes++;
    sprites= {
      hole:artwork.hole.map(frames=>frames[0]),
      blue:artwork.blue,
      green:artwork.green
    };
    for(const [name, color] of [['red', '#ff303080'], ['blueGlow', '#8adfff88']])sprites[name]=K.sprite(256, (c, n)=> {
      const g=c.createRadialGradient(n/2, n/2, name==='red'?n*.2:0, n/2, n/2, n*.7);
      g.addColorStop(0, name==='red'?'#ff000000':color);
      g.addColorStop(1, name==='red'?color:'#8adfff00');
      c.fillStyle=g;
      c.fillRect(0, 0, n, n);
    });
  }
  function dispatch(q) {
    if(!worker) { busy=false; return; }
    busy=true;
    requested++;
    searchStart=performance.now();
    routeTime=q.time;
    sentHeading=Math.atan2(q.state.vy, q.state.vx);
    worker.postMessage( {
      id:++seq,
      ...q
    });
  }
  function queue() {
    if(!worker) { busy=false; return; }
    const q= {
      state: {
        ...state
      },
      scene,
      time:elapsed
    };
    if(busy)queued=q;
    else dispatch(q);
  }
  function workerStart() { if(worker){worker.onerror=event=>event.preventDefault();worker.terminate();} const current=new Worker('nav_worker3.js');worker=current;busy=false;queued=null;seq=0; current.onmessage=( { data:m })=> { if(worker!==current||m.id!==seq)return; if(m.plan&&m.route)rings.set(m.route, routeTime); if(m.complete) { busy=false; completed++; workerErrorMessage=''; searches.push( { ms:performance.now()-searchStart, workerMs:m.elapsedMs, found:!!m.plan }); if(queued) { const q=queued; queued=null; dispatch(q); } } }; current.onerror=(event)=> { event.preventDefault(); if(worker!==current)return; current.onerror=event=>event.preventDefault();current.terminate();worker=null;busy=false;queued=null;workerErrorMessage='ORBIT had a problem. Try again.';if(workerRecoveryCount<1){workerRecoveryCount++;workerStart();if(phase==='flight')queue();} }; } function hud(){ C.update({state,scene,traffic,navOn,ringsUsed,heading:heading(),leg}); if(workerErrorMessage){$('l3Message').textContent=workerErrorMessage;return;} if(phase==='flight')$('l3Message').textContent=state.gapCrossed?'Gap cleared - next stop: '+(leg===1?'BLUE':'GREEN')+' planet!':'Pass BETWEEN BH-1 and BH-2'; } async function prepare(){if(artwork)return artwork;const ticket=entryGeneration;document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));root.classList.remove('hidden');$('l3Preparing').classList.remove('hidden');const built=await ART.prepare((done,total)=>{if(ticket===entryGeneration)$('l3PrepareProgress').textContent='Preparing '+Math.round(done/total*100)+'%';});if(ticket!==entryGeneration||!built)return null;artwork=built;$('l3Preparing').classList.add('hidden');return artwork;}
  function leave(){entryGeneration++;entering=false;active=false;worker?.terminate();worker=null;busy=false;queued=null;rings=new K.Rings();mapCache=null;sprites=null;artwork=null;ART.dispose();canvas.width=canvas.height=frame.width=frame.height=0;radarInset.width=radarInset.height=0;root.classList.add('hidden');$('l3Preparing').classList.add('hidden');document.querySelector('#start').classList.remove('hidden');speechSynthesis.cancel();}
  function beginLeg(n) {
    $('l3Hud').style.visibility='visible';
    leg=n;
    workerRecoveryCount=0;
    workerErrorMessage='';
    scene=E.makeScene(layout, leg);
    state=E.launch(scene);
    elapsed=acc=0;
    left=right=false;
    coast=null;
    rings=new K.Rings();
    navAt=-1;
    navOn=leg===1;
    phase='aim';
    pose=null;
    gap=null;
    pointer=null;
    pull= {
      x:0,
      y:0
    };
    paused=false;
    traffic='grey';
    workerStart();
    $('l3Result').classList.add('hidden');
    $('l3Leg').textContent=`LEG ${leg} / 2 · ${leg===1?'BLUE':'GREEN'} PLANET`;
    $('l3Nav').textContent=navOn?'NAV ON':'NAV OFF';
    $('l3Message').textContent=leg===1?'Pull back from the ship and release to launch!':'Pull back from the surface ship. Aim away from the blue planet!';
    $('l3Controls').style.visibility='hidden';
    frame.style.visibility='hidden';
    hud();
  }
  function start() {
    if(!artwork){const ticket=entryGeneration;return prepare().then(built=>{if(built&&ticket===entryGeneration)start();});}
    localStorage.setItem('sujiL3Started', '1');
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    root.classList.remove('hidden');
    layout=E.choose(layout).id;
    ringsUsed=0;
    searches=[];
    requested=completed=0;
    frames=[];
    active=true;
    resize();
    beginLeg(1);
    last=performance.now();
    if(!loopRunning) {
      loopRunning=true;
      requestAnimationFrame(loop);
    }
  }
  function lesson(replay=false) {
    if(!replay&&localStorage.getItem('sujiOrbitLesson'))return;
    localStorage.setItem('sujiOrbitLesson', '1');
    lessonUntil=performance.now()+5000;
    paused=true;
    $('l3Lesson').classList.remove('hidden');
    $('l3Traffic').classList.add('orbitSpotlight');
    $('l3Bulb').style.background='#61ef92';
    $('l3Label').textContent=K.labels.green;
    K.say('See this light, Captain? Green means let go – gravity will carry us to the planet!', true);
  }
  function launch(angle=null, speed=null) {
    state=E.launch(scene,  {
      angle,
      speed:speed??scene.launchSpeed,
      x:leg===1?state.x:null,
      y:leg===1?state.y:null
    });
    phase='flight';
    elapsed=acc=0;
    navAt=-1;
    frame.style.visibility='visible';
    $('l3Controls').style.visibility='visible';
    $('l3Message').textContent='';
    queue();
    lesson();
  }
  function finish(outcome) {
    $('l3Message').textContent='';
    left=right=false;
    if(outcome==='success') {
      frame.style.visibility='hidden';
      $('l3Controls').style.visibility='hidden';
      $('l3Hud').style.visibility='hidden';
      phase='landing';
      landingAt=0;
      pose= {
        x:w*.5,
        y:h*.6,
        size:Math.min(w*.14, 150)
      };
    }else {
      phase='result';
      $('l3Result').classList.remove('hidden');
      $('l3Title').textContent=outcome==='fall'?'A strong pull!':outcome==='missed-gap'?'Through the gap first, Captain!':outcome==='collision'?'Watch the planet, Captain!':'Off course, Captain!';
      $('l3Text').textContent=`${outcome==='lost'?'Our course is taking too long. Try a new path. ':''}Try leg ${leg} again, Captain. ${leg===2?'Your first landing is saved.':''}`;
      $('l3Continue').textContent='Retry leg '+leg;
    }
  }
  function update(dt) {
    if(phase==='landing') {
      landingAt+=dt;
      if(landingAt>=4) {
        phase='result';
        K.tone('thud');
        K.say('Touchdown! Welcome to the Planet, Captain!', true);
        $('l3Result').classList.remove('hidden');
        $('l3Title').textContent=leg===1?'Welcome to the blue planet!':'Mission Complete!';
        $('l3Text').textContent=leg===1?'Refuelled! Next stop: the green planet!':'EXPLORER — You visited two planets in one trip, just like real space missions!';
        $('l3Continue').textContent=leg===1?'Launch from the blue planet':'New mission';
        localStorage.setItem('sujiL3Planet'+leg, '1');
        if(leg===2)localStorage.setItem('sujiL3Complete', '1');
      }
      return;
    }
    if(phase!=='flight')return;
    acc+=Math.min(dt, .05);
    const steer=Number(right)-Number(left);
    while(acc>=E.DT) {
      const next= {
      };
      E.advanceInto(state, scene, steer, next);
      state=next;
      elapsed+=E.DT;
      acc-=E.DT;
      const end=E.terminal(state, scene);
      if(end) {
        finish(end);
        break;
      }
      if(elapsed>=E.CFG.lostAfterSeconds) {
        finish('lost');
        break;
      }
    }
    if(phase!=='flight')return;
    if(elapsed-navAt>=.5||Math.abs(diff(heading(), sentHeading))>8*Math.PI/180&&elapsed-navAt>.08) {
      navAt=elapsed;
      queue();
    }
    if(++flightFrames%12===1) {
      coast=E.simulate(state, scene,  {
        track:true,
        horizon:25,
        sample:.25
      });
      traffic=K.traffic(coast, E.CFG.planetRadius);
      if(traffic==='red')K.say('Danger! Steer away from the black hole!');
      else if(traffic==='green')K.say('Hold it… and let go!');
      else {
        const n=rings.next(elapsed);
        if(n) {
          const a=diff(Math.atan2(n.y-state.y, n.x-state.x), heading());
          K.say(Math.abs(a)<.06?"Perfect, you're on the path!":a<0?'A little left!':'A little right!');
        }
      }
    }
    hud();
  }
  function project(p) {
    const dx=p.x-state.x,
    dy=p.y-state.y,
    a=heading(),
    forward=dx*Math.cos(a)+dy*Math.sin(a),
    side=-dx*Math.sin(a)+dy*Math.cos(a),
    f=w*.7;
    return  {
      x:w*.5+side*f/Math.max(50, forward),
      y:h*.43+h*.12*f/Math.max(600, forward),
      d:forward,
      f,
      visible:forward>25&&Math.abs(side/forward)<1.7
    };
  }
  function body(p, type, label=null) {
    const q=project(p);
    if(!q.visible) {
      const a=diff(Math.atan2(p.y-state.y, p.x-state.x), heading());
      edgeLabels.push({side:a<0?'left':'right',text:(a<0?'◀ ':'')+(label||(type==='hole'?'BLACK HOLE':type==='blue'?'BLUE PLANET':'GREEN PLANET'))+(a>0?' ▶':'')});
      return;
    }
    visibleBodies++;
    const r=clamp((type==='hole'?105:100)*q.f/Math.max(80, q.d), 9, w*.9),
    img=sprites[type][r<60?0:r<130?1:2];
    ctx.save();
    ctx.globalAlpha=type==='hole'?.94+.06*Math.sin(elapsed*.8):1;
    ART.drawBody(ctx, artwork, type, q.x, q.y, r, elapsed);
    renderedBodies.push({type,x:q.x,y:q.y,r});
    ctx.restore();
  }
  function miniMap() {
    const key=scene.layout+':'+scene.leg;
    if(mapCache&&mapKey===key) {
      mc.clearRect(0, 0, 224, 112);
      mc.drawImage(mapCache, 0, 0);
    }else {
      mc.clearRect(0, 0, 224, 112);
      mc.fillStyle='#071321';
      mc.fillRect(0, 0, 224, 112);
      const sx=224/E.W,
      sy=112/E.H;
      mc.fillStyle='#e7c68530';
      for(let x=1000; x<4200; x+=100)for(let y=200; y<2500; y+=100) {
        const p=scene.holes.map(b=> {
          const dx=b.x-x,
          dy=b.y-y,
          r2=dx*dx+dy*dy+E.CFG.softening**2;
          return  {
            x:dx/Math.pow(r2, 1.5),
            y:dy/Math.pow(r2, 1.5),
            m:1/r2
          };
        });
        if(Math.hypot(p[0].x+p[1].x, p[0].y+p[1].y)<(p[0].m+p[1].m)*.17)mc.fillRect(x*sx, y*sy, 3, 3);
      }
      const gate=scene.gate;
      mc.strokeStyle='#78deff99';
      mc.lineWidth=1;
      mc.setLineDash([2, 2]);
      mc.beginPath();
      mc.moveTo((gate.x+gate.ux*gate.clearance)*sx, (gate.y+gate.uy*gate.clearance)*sy);
      mc.lineTo((gate.x+gate.ux*(gate.length-gate.clearance))*sx, (gate.y+gate.uy*(gate.length-gate.clearance))*sy);
      mc.stroke();
      mc.setLineDash([]);
      scene.holes.forEach(b=> {
        mc.fillStyle='#ffc56c';
        mc.beginPath();
        mc.arc(b.x*sx, b.y*sy, 4, 0, 7);
        mc.fill();
      });
      scene.planets.forEach((p, i)=> {
        mc.fillStyle=i?'#71eaa0':'#72cbff';
        mc.beginPath();
        mc.arc(p.x*sx, p.y*sy, 5, 0, 7);
        mc.fill();
      });
      mapCache=document.createElement('canvas');
      mapCache.width=224;
      mapCache.height=112;
      mapCache.getContext('2d').drawImage(mc.canvas, 0, 0);
      mapKey=key;
    }
    if(rings.current?.points){mc.strokeStyle='#64e4cf';mc.lineWidth=1;mc.beginPath();const p=rings.current.points;for(let i=0;i<p.length;i+=2){const x=p[i]*224/E.W,y=p[i+1]*112/E.H;if(i)mc.lineTo(x,y);else mc.moveTo(x,y);}mc.stroke();}
    for(const [points,color] of [[scene.holes,'#ffd17a'],[[scene.planets[0]],'#9aeaff'],[[scene.planets[1]],'#9affb4']]){mc.fillStyle=color;for(const p of points){mc.beginPath();mc.ellipse(p.x*224/E.W,p.y*112/E.H,17,8.5,0,0,Math.PI*2);mc.fill();}}
    mc.fillStyle='white';
    mc.fillRect(state.x*224/E.W-15, state.y*112/E.H-7.5, 30, 15);
    const rc=radarInset.getContext('2d');rc.clearRect(0,0,224,112);rc.drawImage(mc.canvas,0,0);mc.clearRect(0,0,224,112);mc.drawImage(radarInset,224*.16,112*.16,224*.68,112*.68);
  }
  function drawShip(x, y, size, angle=0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    if(shipArtwork)ctx.drawImage(shipArtwork, -size/2, -size/2, size, size);
    else {
      ctx.fillStyle='#f4cf75';
      ctx.fillRect(-size/4, -size/2, size/2, size);
    }
    ctx.restore();
  }
  function aimScale() {
    return Math.min(w/E.W,Math.max(100,h-$('l3Hud').offsetHeight-60)/E.H);
  }
  function aim() {
    const scale=aimScale(),
    ox=(w-E.W*scale)/2,
    oy=20;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    if(leg===1) {
      ctx.strokeStyle='#69d8ff55';
      ctx.lineWidth=3/scale;
      ctx.beginPath();
      const horizontal=scene.startEdge==='top'||scene.startEdge==='bottom';
      ctx.moveTo(scene.start.x-(horizontal?350:0), scene.start.y-(horizontal?0:350));
      ctx.lineTo(scene.start.x+(horizontal?350:0), scene.start.y+(horizontal?0:350));
      ctx.stroke();
    }
    scene.holes.forEach(p=>ctx.drawImage(sprites.hole[1], p.x-160, p.y-160, 320, 320));
    scene.planets.forEach((p, i)=>ctx.drawImage(sprites[i?'green':'blue'][1], p.x-110, p.y-110, 220, 220));
    ctx.strokeStyle='#84e9ff';
    ctx.lineWidth=4/scale;
    ctx.beginPath();
    ctx.moveTo(state.x, state.y);
    ctx.lineTo(state.x-pull.x/scale, state.y-pull.y/scale);
    ctx.stroke();
    ctx.restore();
    drawShip(ox+state.x*scale, oy+state.y*scale, leg===2?Math.max(20, 120*scale):56, heading()+Math.PI/2);
  }
  function landing() {
    const t=clamp(landingAt/3.2, 0, 1),
    e=ease(t),
    surface=h*.8,
    r=Math.max(w, h)*1.25;
    // Sprite globe radius is .44 of its width: its limb meets surface exactly.
    const approach=.50+.50*ease(clamp(landingAt/2.4,0,1)), globe=r*approach;
    ART.drawLanding(ctx,artwork,leg===1?'blue':'green',w*.5,surface+globe*.88,globe,elapsed+landingAt);
    const size=Math.min(w*.14, 150),
    targetY=surface-size/2-3+3*clamp((landingAt-3.2)/.6, 0, 1),
    wanted=h*.6+(targetY-h*.6)*e,
    ny=pose.y+clamp(wanted-pose.y, -w*.04, w*.04);
    maxJump=Math.max(maxJump, Math.abs(ny-pose.y)/w);
    pose= {
      x:w*.5,
      y:ny,
      size
    };
    if(t<1)ctx.drawImage(sprites.blueGlow, pose.x-size*.5, ny+size*.28, size, size*.6*(.5+.5*Math.sin(landingAt*32)));
    drawShip(pose.x, ny, size);
    gap=surface-(ny+size/2);
    if(landingAt<3.2){dustStarted=0;dustAge=0;dustOpacity=0;}else{
      if(!dustStarted)dustStarted=performance.now();dustAge=(performance.now()-dustStarted)/1000;
      dustOpacity=dustAge<=1.5?1:clamp(1-(dustAge-1.5)/1.5,0,1);
      const spread=140+Math.min(dustAge,2)*75;
      ctx.save();ctx.globalAlpha=dustOpacity;ctx.drawImage(artwork.dust,pose.x-spread,surface-spread*.65,spread*2,spread);ctx.restore();
    }
    ctx.fillStyle='#c8f5ff';
    ctx.font='bold 22px system-ui';
    ctx.textAlign='center';
    if(phase!=='result')ctx.fillText(landingAt<3.2?'APPROACH':'Touchdown!', w*.5, h*.16);
  }
  function draw() {
    renderedBodies=[];edgeLabels=[];labelBoxes=[];
    $('l3LandingBadge').classList.toggle('hidden',!(phase==='result'&&pose));
    visibleBodies=0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle='#030917';
    ctx.fillRect(0, 0, w, h);
    if(!scene||!artwork)return;
    if((paused||manualFrames)&&!lessonUntil)hud();
    const visualHeading=heading();if(lastVisualHeading!==null)bank+=(clamp(diff(visualHeading,lastVisualHeading)*18,-.05,.05)-bank)*.2;lastVisualHeading=visualHeading;
    ctx.save();ctx.translate(w/2,h*.4);ctx.rotate(bank);ctx.translate(-w/2,-h*.4);
    ctx.drawImage(artwork.background,-w*.04,-h*.04,w*1.08,h*1.08);
    ctx.fillStyle='#fff0d4';
    ctx.beginPath();ctx.arc(w*.17,h*.18,2.2,0,Math.PI*2);ctx.fill();
    ctx.drawImage(artwork.sun,w*.17-24,h*.18-24,48,48);
    const a=heading(),
    speed=Math.hypot(state.vx, state.vy);
    for(const s of stars) {
      const x=((s.x*w-a*w*.22/s.z)%w+w)%w,
      y=((s.y*h+elapsed*speed*.025/s.z)%h+h)%h;
      ctx.strokeStyle=['',
      '#e0edffbd',
      '#c7d9f68c',
      '#efbd9477'][s.z];
      ctx.lineWidth=s.z===1?1.5:.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x+Math.sin(a)*speed*.012/s.z, y+speed*.01/s.z);
      ctx.stroke();
    }
    ctx.restore();
    if(phase==='aim')aim();
    else if(phase==='landing'||phase==='result'&&pose)landing();
    else {
      const near=Math.min(...scene.holes.map(b=>Math.hypot(b.x-state.x, b.y-state.y))),
      sway=clamp((650-near)/200, 0, 3);
      ctx.save();
      ctx.translate(Math.sin(elapsed*5)*sway, Math.cos(elapsed*5)*sway);
      const objects=[...scene.holes.map((p, i)=>( {
        p,
        type:'hole',
        label:'BH-'+(i+1)
      })),
      ...scene.planets.map((p, i)=>( {
        p,
        type:i?'green':'blue',
        label:i?'GREEN PLANET':'BLUE PLANET'
      }))];
      objects.sort((a, b)=>Math.hypot(b.p.x-state.x, b.p.y-state.y)-Math.hypot(a.p.x-state.x, a.p.y-state.y));
      objects.forEach(o=>body(o.p, o.type, o.label));
      if(coast?.path) {
        ctx.fillStyle= {
          green:'#62ee9b',
          amber:'#ffd263',
          red:'#ff6678',
          grey:'#8a9baa'
        }
        [traffic];
        for(let i=0; i<coast.path.length; i+=2) {
          const q=project( {
            x:coast.path[i],
            y:coast.path[i+1]
          });
          if(q.visible) {
            ctx.beginPath();
            ctx.arc(q.x, q.y, 2.5, 0, 7);
            ctx.fill();
          }
        }
      }
      rings.draw(ctx, state, elapsed, project, navOn);
      ctx.restore();
      $('l3Gravity').classList.toggle('danger',near<600);if(near<600){ctx.save();ctx.strokeStyle='#ff604dcc';ctx.lineWidth=7;ctx.strokeRect(4,4,w-8,h-$('l3Hud').offsetHeight-8);ctx.restore();}
      if(coast?.outcome==='success'&&coast.duration<8) {
        ctx.drawImage(sprites.blueGlow, 0, h*.1, w, h*.7);
        ctx.fillStyle='#b6eeff';
        ctx.font='bold 21px system-ui';
        ctx.textAlign='center';
        ctx.fillText('APPROACH', w*.5, h*.17);
      }
    }
    ctx.font='bold 16px system-ui';ctx.fillStyle='#dcefff';
    for(const side of ['left','right']){let row=0;for(const label of edgeLabels.filter(l=>l.side===side)){const width=ctx.measureText(label.text).width,x=side==='left'?w*.18:w*.82-width,y=h*.21+row++*30;ctx.textAlign='left';ctx.fillText(label.text,x,y);labelBoxes.push({text:label.text,x,y:y-17,width,height:22,font:16});}}
    miniMap();
  }
  function loop(now) {
    if(!active) {
      loopRunning=false;
      return;
    }
    const t=performance.now(),
    dt=Math.min((now-last)/1000, .05);
    last=now;
    if(manualFrames) {
      requestAnimationFrame(loop);
      return;
    }
    if(lessonUntil&&now>=lessonUntil) {
      lessonUntil=0;
      paused=false;
      $('l3Lesson').classList.add('hidden');
      $('l3Traffic').classList.remove('orbitSpotlight');
    }
    if(!paused)update(dt);
    draw();
    frames.push( {
      phase,
      ms:performance.now()-t
    });
    if(frames.length>20000)frames.shift();
    requestAnimationFrame(loop);
  }
  $('level3Start').onclick=()=>{if(active||entering)return;entering=true;Promise.resolve(start()).finally(()=>entering=false);};
  $('l3PreparingBack').onclick=leave;
  $('l3Back').onclick=leave;
  $('l3Continue').onclick=()=> {
    if(pose&&leg===1) {
      K.say('Refuelled! Next stop: the green planet!', true);
      beginLeg(2);
    }else if(pose)start();
    else beginLeg(leg);
  };
  $('l3Nav').onclick=()=> {
    navOn=!navOn;
    if(navOn&&leg===2)ringsUsed++;
    $('l3Nav').textContent=navOn?'NAV ON':'NAV OFF';
    hud();
  };
  $('l3Ask').onclick=()=>lesson(true);
  $('l3Mute').onclick=()=> {
    const off=$('l3Mute').textContent.includes('Sound on');
    document.querySelectorAll('.mute').forEach(b=>b.textContent=off?'🔇 Sound off':'🔊 Sound on');
    if(off)speechSynthesis.cancel();
  };
  $('l3Facts').onclick=()=> {
    paused=true;
    $('l3Card').classList.remove('hidden');
  };
  $('l3Close').onclick=()=> {
    paused=false;
    $('l3Card').classList.add('hidden');
  };
  for(const [id, set] of [['l3Left', v=>left=v], ['l3Right', v=>right=v]]) {
    const b=$(id);
    b.onpointerdown=e=> {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);b.classList.add('pressed');
      set(true);
    };
    for(const ev of ['pointerup', 'pointercancel', 'lostpointercapture'])b.addEventListener(ev, ()=>set(false));
  }
  addEventListener('keydown', e=> {
    if(!active)return;
    if(e.code==='ArrowLeft') {
      left=true;
      e.preventDefault();
    }
    if(e.code==='ArrowRight') {
      right=true;
      e.preventDefault();
    }
  });
  addEventListener('keyup', e=> {
    if(e.code==='ArrowLeft')left=false;
    if(e.code==='ArrowRight')right=false;
  });
  addEventListener('blur', ()=> {
    left=right=false;
  });
  canvas.onpointerdown=e=> {
    if(phase!=='aim')return;
    const r=canvas.getBoundingClientRect();
    pointer= {
      x:e.clientX-r.left,
      y:e.clientY-r.top,
      sourceY:state.y,
      sourceX:state.x,
      mode:'pending'
    };
    canvas.setPointerCapture(e.pointerId);
  };
  canvas.onpointermove=e=> {
    if(pointer) {
      const r=canvas.getBoundingClientRect();
      const dx=e.clientX-r.left-pointer.x,
      dy=e.clientY-r.top-pointer.y;
      const horizontal=scene.startEdge==='top'||scene.startEdge==='bottom';
      const along=horizontal?dx:dy, across=horizontal?dy:dx;
      if(pointer.mode==='pending'&&Math.hypot(dx, dy)>20)pointer.mode=leg===1&&Math.abs(along)>Math.abs(across)*1.73?'move':'aim';
      if(pointer.mode==='move') {
        const scale=aimScale();
        state.x=horizontal?clamp(pointer.sourceX+dx/scale, Math.max(200,scene.start.x-350),Math.min(E.W-200,scene.start.x+350)):scene.start.x;
        state.y=horizontal?scene.start.y:clamp(pointer.sourceY+dy/scale,Math.max(200,scene.start.y-350),Math.min(E.H-200,scene.start.y+350));
        pull= {
          x:0,
          y:0
        };
      }else pull= {
        x:clamp(dx, -180, 180),
        y:clamp(dy, -180, 180)
      };
    }
  };
  canvas.onpointerup=()=> {
    if(!pointer)return;
    const mode=pointer.mode;
    pointer=null;
    if(mode==='move')return;
    if(Math.hypot(pull.x, pull.y)<12)return;
    const a=Math.atan2(-pull.y, -pull.x);
    if(leg===2&&Math.cos(a-Math.atan2(state.y-scene.planets[0].y, state.x-scene.planets[0].x))<.15) {
      $('l3Message').textContent='Aim away from the blue planet, Captain!';
      return;
    }
    launch(a, clamp(Math.hypot(pull.x, pull.y)*2, scene.launchSpeed*.85, scene.launchSpeed*1.15));
  };
  canvas.onpointercancel=()=>pointer=null;
  addEventListener('resize', ()=> {
    if(active) {
      resize();
      draw();
    }
  });
  for(const id of ['l3Left','l3Right'])for(const event of ['pointerup','pointercancel','lostpointercapture'])$(id).addEventListener(event,()=>$(id).classList.remove('pressed'));
  window.SujiLevel3Debug= {
    prepare,
    setManualFrames(v) {
      manualFrames=v;
    },
    start,
    loadLayout(index, n=1) {
      if(!artwork)return prepare().then(()=>{start();layout=index;beginLeg(n);});
      start();
      layout=index;
      beginLeg(n);
    },
    launch,
    beginLeg,
    step:update,
    draw,
    finish,
    setPaused(v) {
      paused=v;
    },
    setState(s) {
      state= {
        ...s
      };
    },
    get state() {
      return  {
        ...state
      };
    },
    get scene() {
      return scene;
    },
    get stats() {
      return  {
        phase,
        landingAt, pose:pose?{...pose}:null,shipOpaqueBounds,
        leg,
        layout,
        ringsUsed,
        gap,
        maxJump,
        visibleBodies, renderedBodies:[...renderedBodies],labelBoxes:[...labelBoxes],dustAge,dustOpacity,frameBakes,bank,artMetrics:{...ART.metrics},
        requested,
        completed,
        workerRecoveryCount,
        workerErrorMessage,
        searches:[...searches],
        frames:[...frames]
      };
    }
  };
})();
