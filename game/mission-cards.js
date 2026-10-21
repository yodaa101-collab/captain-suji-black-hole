/* Extend discoveries without changing the accepted Level 1 game or storage. */
(()=>{'use strict';
 const cards=[['sujiL3Started','⚖️','GRAVITY TUG-OF-WAR','Two black holes pull in different directions. In between, their pulls can almost cancel out!'],['sujiL3Complete','🪐','EXPLORER','You visited two planets in one trip, just like real space missions!']];
 document.getElementById('discoveries').addEventListener('click',()=>{
  const list=document.getElementById('cardList');
  for(const [key,emoji,name,text] of cards){if(list.querySelector(`[data-mission-card="${key}"]`))continue;const found=localStorage.getItem(key)==='1',b=document.createElement('button');b.className='discovery'+(found?' found':'');b.dataset.missionCard=key;const em=document.createElement('span'),title=document.createElement('b'),detail=document.createElement('small');em.className='emoji';em.textContent=emoji+(found?' ⭐':'');title.textContent=name;detail.textContent=text;b.append(em,title,detail);if(!found){const hint=document.createElement('small');hint.className='tryHint';hint.textContent=key==='sujiL3Started'?'Try it: start Deep Space Mission':'Try it: land on both planets in one mission';b.append(hint);}b.onclick=()=>SujiCockpitKit.say(text,true);list.appendChild(b);}
 });
})();
