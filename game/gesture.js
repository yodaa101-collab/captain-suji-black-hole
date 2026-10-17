/* Pure gesture classifier: classify exactly once after the first 20 CSS px. */
(function(root){'use strict';
const THRESHOLD=20,VERTICAL_DEGREES=30;
function classify(dx,dy){
 const distance=Math.hypot(dx,dy);
 if(distance<THRESHOLD)return 'pending';
 const fromVertical=Math.atan2(Math.abs(dx),Math.abs(dy))*180/Math.PI;
 if(fromVertical<=VERTICAL_DEGREES)return 'move';
 if(dx<0)return 'aim';
 return 'ignore';
}
function lock(mode,dx,dy){return mode==='pending'?classify(dx,dy):mode;}
const API={THRESHOLD,VERTICAL_DEGREES,classify,lock};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
root.SujiGesture=API;
})(typeof window!=='undefined'?window:globalThis);
