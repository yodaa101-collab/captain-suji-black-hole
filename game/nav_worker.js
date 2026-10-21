/* Captain Suji V7b.5 — deterministic ORBIT search, off the UI thread. */
importScripts('level2_engine.js');
const E=self.SujiLevel2,DT=E.DT,MAX=Math.ceil(25/DT);
let job=null,last=null,queued=null;
const holds=[];for(let t=.15;t<=2.001;t+=.15)holds.push(+t.toFixed(2));holds.push(2.4,3,4,5,6,8);
const candidates=[[]];
for(const dir of [-1,1])for(const t of holds)candidates.push([{dir,hold:t}]);
for(const a of [-1,1])for(const t of [.5,1,1.5,2,3,4])for(const coast of [1,2,3])for(const b of [-1,1])for(const u of [.5,1,2])candidates.push([{dir:a,hold:t},{dir:0,hold:coast},{dir:b,hold:u}]);
function evaluate(start,scene,segments,pathWanted=false){let s={...start},out={},path=[],n=0,elapsed=0,segment=0,segEnd=segments.length?segments[0].hold:Infinity;
 for(;n<MAX;n++){const end=E.terminal(s,scene);if(end)return {outcome:end,duration:n*DT,path};
 const time=n*DT;while(segment<segments.length-1&&time>=segEnd-1e-9){segment++;segEnd+=segments[segment].hold;}
 const dir=segment<segments.length&&time<segEnd?segments[segment].dir:0;
 E.advanceInto(s,scene,dir,out);const tmp=s;s=out;out=tmp;
 if(pathWanted&&n%24===0)path.push(s.x,s.y);
 }return {outcome:'timeout',duration:25,path};}
function steering(plan){return plan.reduce((n,s)=>n+(s.dir? s.hold:0),0);}
function emit(j,finished){if(job!==j)return;const best=j.best;const route=best?evaluate(j.state,j.scene,best.segments,true).path:null;
 self.postMessage({id:j.id,plan:best&&{segments:best.segments,duration:best.duration},route,fall:j.coastFall,found:j.found,total:j.index,complete:finished,coastSuccess:j.coastSuccess});}
function step(){const j=job;if(!j)return;const started=performance.now();
 while(j.index<candidates.length&&performance.now()-started<9){const segments=candidates[j.index++];
 // A route requiring more steering cannot beat the existing successful route.
 // Keep equal-cost candidates: their flight duration can still break a tie.
 if(j.best&&steering(segments)>steering(j.best.segments)+1e-7)continue;
 const v=evaluate(j.state,j.scene,segments);
 if(j.index===1){j.coastFall=v.outcome==='fall';j.coastSuccess=v.outcome==='success';}
 if(v.outcome==='success'){j.found++;const option={segments,duration:v.duration},score=steering(segments);
 if(!j.best||score<steering(j.best.segments)-1e-7||(Math.abs(score-steering(j.best.segments))<1e-7&&v.duration<j.best.duration))j.best=option;
 if(!j.firstSent){j.firstSent=true;emit(j,false);}
 }}
 if(job!==j)return;
 if(j.index===candidates.length){last=j.best?j.best.segments:null;emit(j,true);job=null;if(queued){const data=queued;queued=null;self.onmessage({data});}}
 else setTimeout(step,0);
}
self.onmessage=e=>{if(e.data.reset){job=null;last=null;queued=null;return;}const {id,state,scene}=e.data;if(!state||!scene)return;
 if(job){queued=e.data;return;}
 const j={id,state,scene,index:0,best:null,found:0,coastFall:false,coastSuccess:false,firstSent:false};
 // Retain the previous plan only when it still lands from the current state.
 if(last){const v=evaluate(state,scene,last);if(v.outcome==='success'){j.best={segments:last,duration:v.duration};j.firstSent=true;job=j;emit(j,false);}}
 job=j;setTimeout(step,0);
};
