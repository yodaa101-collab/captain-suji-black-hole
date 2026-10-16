'use strict';
const E=require('../game/engine.js');
let seed=20261016;function rand(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const N=10000,WARM=100;
for(const level of ['cadet','pilot','commander']){
 const launches=[];
 while(launches.length<N+WARM){let y=150+700*rand(),x=0,py=0;if(level==='commander'){let len=180*rand(),a=2*Math.PI*rand();x=len*Math.cos(a);py=len*Math.sin(a);}const v=E.launch(level,y,x,py);if(!v.cancelled)launches.push(v);}
 for(let i=0;i<WARM;i++)E.predict(level,launches[i]);
 const times=[];for(let i=WARM;i<launches.length;i++){const t=process.hrtime.bigint();E.predict(level,launches[i]);times.push(Number(process.hrtime.bigint()-t)/1e6);}
 times.sort((a,b)=>a-b);const avg=times.reduce((a,b)=>a+b,0)/times.length,p99=times[Math.ceil(.99*times.length)-1],max=times.at(-1),under=times.filter(x=>x<8).length/times.length*100;
 console.log(`${level}: warmup=${WARM}, measured=${N}, average=${avg.toFixed(4)} ms, p99=${p99.toFixed(4)} ms, maximum=${max.toFixed(4)} ms, under8ms=${under.toFixed(3)}%, PASS=${avg<1&&under>=99}`);
 if(!(avg<1&&under>=99))process.exitCode=1;
}
