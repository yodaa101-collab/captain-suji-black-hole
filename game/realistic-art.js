/* Level 3 presentation only. All noise and light scattering are baked once. */
(()=>{'use strict';
const TAU=Math.PI*2,cache=new Map(),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const canvases=[],metrics={started:false,ready:false,bakeMs:0,cpuMs:0,canvasBytes:0,canvases:0};
function canvas(n,paint){const c=document.createElement('canvas');c.width=c.height=n;paint(c.getContext('2d'),n);canvases.push(c);return c;}
function hash(x,y){let a=Math.imul(x,374761393)+Math.imul(y,668265263);a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;}
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b,s=u*u*(3-2*u),t=v*v*(3-2*v);return (hash(a,b)*(1-s)+hash(a+1,b)*s)*(1-t)+(hash(a,b+1)*(1-s)+hash(a+1,b+1)*s)*t;}
function fbm(x,y){return noise(x,y)*.55+noise(x*2,y*2)*.27+noise(x*4,y*4)*.12+noise(x*8,y*8)*.06;}
function planet(n,green=false){return canvas(n,(c)=>{
  const image=c.createImageData(n,n),p=image.data,r=n*.44;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const nx=(x-n/2)/r,ny=(y-n/2)/r,d=nx*nx+ny*ny,i=(y*n+x)*4;
    if(d>1){const edge=Math.sqrt(d)-1,alpha=Math.exp(-edge*65)*.48;if(edge<.13){p[i]=green?132:95;p[i+1]=green?226:177;p[i+2]=255;p[i+3]=alpha*255;}continue;}
    const z=Math.sqrt(1-d),lon=Math.atan2(nx,z),lat=Math.asin(ny),f=fbm(lon*4+23,lat*6+19);
    let rgb;
    if(green){const bands=.5+.5*Math.sin(lat*37+f*6),storm=Math.exp(-((lon-.42)**2*32+(lat-.12)**2*160));rgb=[50+bands*56+storm*75,103+bands*51+storm*52,76+bands*35+storm*35];}
    else if(f>.53){const mountain=clamp((f-.53)*6);rgb=[38+mountain*86,87+mountain*45,58+mountain*38];}
    else {const coast=clamp((f-.44)*9);rgb=[12+coast*14,47+coast*42,81+coast*47];}
    // Common sun vector: upper left, toward the viewer. Soft terminator.
    const sun=-nx*.64-ny*.52+z*.56,light=.035+.965*clamp((sun+.09)/.95),limb=(1-z)**4;
    for(let k=0;k<3;k++)p[i+k]=clamp((rgb[k]*light+limb*[35,90,150][k]*Math.max(.15,sun))/255)*255;
    p[i+3]=255;
  }c.putImageData(image,0,0);
});}
function clouds(n){return canvas(n,c=>{const im=c.createImageData(n,n),p=im.data,r=n*.44;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const nx=(x-n/2)/r,ny=(y-n/2)/r,d=nx*nx+ny*ny;if(d>=1)continue;const z=Math.sqrt(1-d),v=fbm(Math.atan2(nx,z)*7+90,Math.asin(ny)*11+42),a=clamp((v-.49)*4)*.63,light=.1+.9*clamp(-nx*.64-ny*.52+z*.56+.1);const i=(y*n+x)*4;p[i]=220*light;p[i+1]=237*light;p[i+2]=245*light;p[i+3]=a*255;}c.putImageData(im,0,0);});}
function hole(n,phase=0){return canvas(n,c=>{
  c.translate(n/2,n/2);c.rotate(-.23);
  const glow=c.createRadialGradient(0,0,n*.14,0,0,n*.49);glow.addColorStop(0,'#ffc48638');glow.addColorStop(.6,'#c6511822');glow.addColorStop(1,'#12050000');c.fillStyle=glow;c.fillRect(-n/2,-n/2,n,n);
  // Lensed far disk arches above the black shadow.
  for(let k=18;k>=0;k--){const t=k/18;c.strokeStyle=`rgba(255,${Math.round(232-t*135)},${Math.round(160-t*125)},${.32+(1-t)*.65})`;c.lineWidth=n*(.006+t*.003);c.beginPath();c.ellipse(0,-n*.012,n*(.241+t*.035),n*(.274+t*.047),0,Math.PI,TAU);c.stroke();}
  function disk(front){for(let j=36;j>=0;j--){const t=j/36,rx=n*(.238+t*.14),ry=n*(.028+t*.054),shimmer=.94+.06*Math.sin(j*.7+phase*TAU),g=c.createLinearGradient(-rx,0,rx,0);g.addColorStop(0,`rgba(255,${Math.round(248-t*140)},${Math.round(207-t*179)},${(.85-t*.53)*shimmer})`);g.addColorStop(.35,`rgba(255,${Math.round(234-t*139)},${Math.round(167-t*139)},${(.72-t*.46)*shimmer})`);g.addColorStop(1,`rgba(210,${Math.round(99-t*50)},${Math.round(34-t*24)},${(.13-t*.08)*shimmer})`);c.strokeStyle=g;c.lineWidth=Math.max(.7,n*.007);c.beginPath();c.ellipse(0,0,rx,ry,0,front?0:Math.PI,front?Math.PI:TAU);c.stroke();}}
  disk(false);c.fillStyle='#000';c.beginPath();c.arc(0,0,n*.235,0,TAU);c.fill();
  c.strokeStyle='#fff1cb';c.lineWidth=n*.004;c.stroke();c.strokeStyle='#ffad6380';c.lineWidth=n*.012;c.stroke();disk(true);
  // Sparse streaks advect along the disk, rather than rotating its tilt.
  c.save();c.beginPath();c.rect(-n,-n,2*n,2*n);c.arc(0,0,n*.240,0,TAU);c.clip('evenodd');
  for(let k=0;k<9;k++){const a=phase*TAU+k*2.399;c.strokeStyle=k%2?'#ffcd7c66':'#ffebba99';c.lineWidth=n*.002;c.beginPath();c.ellipse(0,0,n*(.27+(k%3)*.055),n*(.056+(k%3)*.017),0,a,a+.18);c.stroke();}c.restore();
});}
function background(n){return canvas(n,c=>{c.fillStyle='#02050b';c.fillRect(0,0,n,n);c.save();c.translate(n*.5,n*.35);c.rotate(-.38);for(let k=0;k<8;k++){const g=c.createRadialGradient((k-4)*n*.2,0,0,(k-4)*n*.2,0,n*.35);g.addColorStop(0,k%2?'#45617b13':'#74556710');g.addColorStop(.3,'#45617b09');g.addColorStop(1,'#00000000');c.scale(1,.35);c.fillStyle=g;c.fillRect(-n*2,-n*2,n*4,n*4);c.scale(1,1/.35);}c.restore();for(let k=0;k<2100;k++){const x=hash(k,1)*n,y=hash(k,2)*n,band=Math.abs(y/n-(.58-x/n*.35));if(band>.13)continue;c.fillStyle=`rgba(163,183,208,${.03+hash(k,3)*.14})`;c.fillRect(x,y,.6,.6);}});}
function dust(n){return canvas(n,c=>{c.save();c.translate(n*.5,n*.65);c.scale(1,.28);for(let k=0;k<24;k++){const x=(hash(k,17)-.5)*n*.75,y=(hash(k,18)-.5)*n*.3,r=n*(.10+hash(k,19)*.13),g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#e0d3ad99');g.addColorStop(.45,'#c9b88655');g.addColorStop(1,'#c0aa7d00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}c.restore();});}
let preparing=null,bakeEpoch=0;
function assets(){if(!cache.has('all'))throw Error('Level 3 artwork not prepared');return cache.get('all');}
async function prepare(progress=()=>{}){if(preparing)return preparing;const epoch=bakeEpoch;preparing=(async()=>{
 metrics.started=true;const start=performance.now(),art={hole:[],blue:[],green:[],cloud:[],landing:{}};const tasks=[];
 for(const [i,n] of [128,256,512].entries()){art.hole[i]=[];for(let phase=0;phase<12;phase++)tasks.push(()=>art.hole[i][phase]=hole(n,phase/12));}
 for(const [i,n] of [256,512,1024].entries()){tasks.push(()=>art.blue[i]=planet(n));tasks.push(()=>art.green[i]=planet(n,true));tasks.push(()=>art.cloud[i]=clouds(n));}
 tasks.push(()=>art.landing.blue=planet(2048));tasks.push(()=>art.landing.green=planet(2048,true));
 tasks.push(()=>art.background=background(1024));tasks.push(()=>art.dust=dust(256));tasks.push(()=>art.sun=canvas(128,c=>{const g=c.createRadialGradient(64,64,1,64,64,62);g.addColorStop(0,'#fff6dbff');g.addColorStop(.06,'#ffe8a8cc');g.addColorStop(.24,'#ffdd8c22');g.addColorStop(1,'#ffdd8c00');c.fillStyle=g;c.fillRect(0,0,128,128);}));
 for(let i=0;i<tasks.length;i++){progress(i,tasks.length);await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));if(epoch!==bakeEpoch)return null;const t=performance.now();tasks[i]();metrics.cpuMs+=performance.now()-t;}
 cache.set('all',art);metrics.ready=true;metrics.bakeMs=performance.now()-start;metrics.canvasBytes=canvases.reduce((sum,c)=>sum+c.width*c.height*4,0);metrics.canvases=canvases.length;progress(tasks.length,tasks.length);return art;
})();return preparing;}
function drawLanding(c,art,type,x,y,r,time){c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(art.landing[type],x-r,y-r,r*2,r*2);c.save();c.beginPath();c.arc(x,y,r*.88,0,TAU);c.clip();c.translate(x,y);c.rotate(Math.sin(time*.018)*.055);c.globalAlpha=.5;c.drawImage(art.cloud[2],-r,-r,r*2,r*2);c.restore();c.strokeStyle='#9edbf766';c.lineWidth=1.5;c.beginPath();c.arc(x,y,r*.88,0,TAU);c.stroke();c.restore();}
function beamMeasurement(n=512,phase=0){const art=assets(),image=art.hole[[128,256,512].indexOf(n)][phase],c=image.getContext('2d'),p=c.getImageData(0,0,n,n).data;let sums=[0,0],counts=[0,0];for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=(x-n/2)/n,dy=(y-n/2)/n,xx=dx*Math.cos(.23)-dy*Math.sin(.23),yy=dx*Math.sin(.23)+dy*Math.cos(.23);if(Math.abs(xx)<.255||Math.abs(xx)>.355||Math.abs(yy)>.034)continue;const i=(y*n+x)*4,side=xx<0?0:1,lum=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)*p[i+3]/255;sums[side]+=lum;counts[side]++;}const means=sums.map((s,i)=>s/counts[i]);return {size:n,phase,means,pixels:counts,ratio:Math.max(...means)/Math.min(...means),roi:'Untilited disk coordinates |x| .255-.355, |y| <.034; same area per side; alpha-weighted Rec.709 luminance'};}
function dispose(){bakeEpoch++;const released=canvases.reduce((n,c)=>n+c.width*c.height*4,0);for(const c of canvases)c.width=c.height=0;canvases.length=0;cache.clear();preparing=null;Object.assign(metrics,{started:false,ready:false,bakeMs:0,cpuMs:0,canvasBytes:0,canvases:0,releasedBytes:released});}
function drawBody(c,art,type,x,y,r,time){const k=r<60?0:r<130?1:2,img=type==='hole'?art.hole[k][Math.floor(time*.75)%12]:art[type][k];c.drawImage(img,x-r,y-r,r*2,r*2);if(type!=='hole'){c.save();c.translate(x,y);c.rotate(Math.sin(time*.018)*.055);c.globalAlpha=.7;c.drawImage(art.cloud[k],-r,-r,r*2,r*2);c.restore();}else{c.save();c.translate(x,y);c.rotate(-.23);c.strokeStyle='#a9c3df55';c.lineWidth=.8;for(let i=0;i<8;i++){c.beginPath();c.ellipse(0,0,r*(.46+i*.033),r*(.47+i*.034),0,i*.79+time*.006,i*.79+.11+time*.006);c.stroke();}c.restore();}}
window.SujiRealisticArt={assets,prepare,metrics,dispose,drawBody,drawLanding,beamMeasurement};
})();
