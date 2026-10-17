/* V7b.3 ORBIT route planner, dedicated worker. */
importScripts('level2_engine.js');
const E=self.SujiLevel2,DT=E.DT,MAX=Math.ceil(15/DT);
let last=null;
function evaluate(start,scene,dir,hold,keepPath){let a={...start},b={},path=[],terminal=null,steps=0;
 for(let i=0;i<MAX;i++){terminal=E.terminal(a,scene);if(terminal)break;
 E.advanceInto(a,scene,i*DT<hold?dir:0,b);let t=a;a=b;b=t;steps++;
 if(keepPath&&i%24===0)path.push(a.x,a.y);
 }return {outcome:terminal||'timeout',duration:steps*DT,dir,hold,path};}
self.onmessage=e=>{const {id,state,scene}=e.data;if(!state||!scene)return;
 const choices=[{dir:0,hold:0}];for(let i=1;i<=13;i++)for(const dir of [-1,1])choices.push({dir,hold:Math.min(2,i*.15)});
 let best=null,coast=null,fall=false,found=0;
 for(const c of choices){const v=evaluate(state,scene,c.dir,c.hold,false);if(c.dir===0)coast=v;if(v.outcome==='fall')fall=true;
 if(v.outcome==='success'){found++;if(!best||v.hold<best.hold-1e-8||(Math.abs(v.hold-best.hold)<1e-8&&v.duration<best.duration))best=v;}}
 if(last){const old=evaluate(state,scene,last.dir,last.hold,false);if(old.outcome==='success')best=old;}
 last=best?{dir:best.dir,hold:best.hold}:null;
 const route=best?evaluate(state,scene,best.dir,best.hold,true):null;
 self.postMessage({id,plan:best&&{dir:best.dir,hold:best.hold,duration:best.duration},route:route&&route.path,coastSuccess:coast.outcome==='success',coastDuration:coast.duration,fall,found,total:choices.length});
};
