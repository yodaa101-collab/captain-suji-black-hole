'use strict';
const assert=require('node:assert/strict');
const G=require('../game/gesture.js');
let counts={vertical:0,leftAim:0,rightIgnored:0,tinyPending:0,locked:0};
for(let degree=0;degree<=29;degree++)for(const sign of [-1,1]){
 const a=degree*Math.PI/180,dx=21*Math.sin(a),dy=sign*21*Math.cos(a);
 assert.equal(G.classify(dx,dy),'move');counts.vertical++;
}
for(let degree=31;degree<=90;degree++)for(const sign of [-1,1]){
 const a=degree*Math.PI/180,dx=-21*Math.sin(a),dy=sign*21*Math.cos(a);
 assert.equal(G.classify(dx,dy),'aim');counts.leftAim++;
}
for(let degree=31;degree<=90;degree++)for(const sign of [-1,1]){
 const a=degree*Math.PI/180,dx=21*Math.sin(a),dy=sign*21*Math.cos(a);
 assert.equal(G.classify(dx,dy),'ignore');counts.rightIgnored++;
}
for(let d=0;d<20;d++){assert.equal(G.classify(-d,0),'pending');counts.tinyPending++;}
assert.equal(G.classify(0,-20),'move');assert.equal(G.classify(0,20),'move');
assert.equal(G.classify(-20,0),'aim');assert.equal(G.classify(20,0),'ignore');
for(const mode of ['move','aim','ignore'])for(let i=0;i<100;i++){
 assert.equal(G.lock(mode,i%2?-50:50,i%3?-80:80),mode);counts.locked++;
}
assert.equal(G.lock('pending',-21,0),'aim');
console.log('PASS gesture classifier:',JSON.stringify(counts));
