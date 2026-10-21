/* Shared browser-input safety. No simulation or flight controls are changed. */
(()=>{
 'use strict';
 document.addEventListener('contextmenu',event=>event.preventDefault());
 document.addEventListener('selectstart',event=>event.preventDefault());
 for(const type of ['gesturestart','gesturechange','gestureend']){
  document.addEventListener(type,event=>event.preventDefault(),{passive:false});
 }
 document.addEventListener('touchmove',event=>{
  if(event.touches.length>1)event.preventDefault();
 },{passive:false});
})();
