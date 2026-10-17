'use strict';
const E=require('../game/engine.js');
const degrees=r=>r*180/Math.PI,rad=d=>d*Math.PI/180;
const fire=(id,angle,pull)=>E.predict(E.launch(-pull*Math.cos(rad(angle)),-pull*Math.sin(rad(angle))),id);
const report=[];
for(let id=0;id<E.LAYOUTS.length;id++){
 const p=E.layout(id),direct=degrees(Math.atan2(p.y-900,p.x-330));
 let best={width:0,pull:0,low:0,high:0,duration:0};
 for(const pull of [29,35,45,80]){
  let start=null,last=null,runDur=0;
  for(let j=0;j<=280;j++){
   const angle=direct-35+j*.25,out=fire(id,angle,pull);
   if(out.outcome==='success'){if(start===null)start=angle;last=angle;runDur=out.duration;}
   else if(start!==null){const width=last-start;if(width>best.width)best={width,pull,low:start,high:last,duration:runDur};start=null;}
  }
  if(start!==null&&last-start>best.width)best={width:last-start,pull,low:start,high:last,duration:runDur};
 }
 report.push({id,direct:+direct.toFixed(2),widthDegrees:+best.width.toFixed(2),bestPull:best.pull,angle:[+best.low.toFixed(2),+best.high.toFixed(2)],duration:+best.duration.toFixed(2)});
}
console.log(JSON.stringify(report,null,2));console.log('LAYOUTS_MEETING_3_DEGREES',report.filter(x=>x.widthDegrees>=3).length,'/'+E.LAYOUTS.length);
