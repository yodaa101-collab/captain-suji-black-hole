'use strict';
const E=require('../game/engine.js');
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const errors=[[-10,-.2],[-8,.2],[-6,-.15],[-4,.15],[-2,-.1],[2,.1],[4,-.15],[6,.15],[8,-.2],[10,.2]];
const records=[];
for(let id=0;id<E.LAYOUTS.length;id++){
 const planet=E.layout(id),direct=deg(Math.atan2(planet.y-900,planet.x-330));
 for(const [angleError,pullError] of errors){let angle=direct+angleError,pull=204*(1+pullError),step=8,landed=false;
  for(let attempt=1;attempt<=12;attempt++){
   const initial=E.launch(-pull*Math.cos(rad(angle)),-pull*Math.sin(rad(angle)));
   const result=E.simulate(initial,id);
   if(result.outcome==='success'){records.push({id,attempt,landed:true,duration:result.duration});landed=true;break;}
   if(result.outcome==='fall'){angle+=(angle<0?-step:step);}
   else{
    let near=result.path[0],dist=Infinity;
    for(const q of result.path){const d=Math.hypot(q.x-planet.x,q.y-planet.y);if(d<dist){dist=d;near=q;}}
    const side=near.y-planet.y;
    angle+=(side>0?-step:step);
    if(dist>300)pull*=.9;
   }
   step=Math.max(.25,step/2);
  }
  if(!landed)records.push({id,attempt:13,landed:false});
 }
}
const landed=records.filter(x=>x.landed),attempts=landed.map(x=>x.attempt).sort((a,b)=>a-b),quant=q=>attempts[Math.min(attempts.length-1,Math.floor(q*(attempts.length-1)))];
const output={trials:records.length,landed:landed.length,failed:records.length-landed.length,median:quant(.5),p90:quant(.9),max:Math.max(...attempts),layoutsAllLandable:E.LAYOUTS.length-new Set(records.filter(x=>!x.landed).map(x=>x.id)).size,flightDurationMin:Math.min(...landed.map(x=>x.duration)),flightDurationMax:Math.max(...landed.map(x=>x.duration))};
console.log(JSON.stringify(output,null,2));
if(output.failed||output.median>4||output.p90>8||output.flightDurationMin<8||output.flightDurationMax>12)process.exitCode=1;
