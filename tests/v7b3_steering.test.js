'use strict';
const assert=require('node:assert/strict'),E=require('../game/level2_engine');
const scene={hole:{x:1e9,y:1e9},planet:{x:1e9,y:1e9}};
for(const speed of [150,260,380]){let a={x:0,y:0,vx:speed,vy:0},b={};for(let i=0;i<240;i++){E.advanceInto(a,scene,1,b);[a,b]=[b,a];}const degrees=Math.atan2(a.vy,a.vx)*180/Math.PI;assert.ok(degrees>=38&&degrees<=42,`speed ${speed}: ${degrees}`);assert.ok(Math.abs(Math.hypot(a.vx,a.vy)-speed)<.01);console.log(`PASS speed ${speed}: ${degrees.toFixed(4)} degrees / 1s`);}
assert.equal(E.PAIRS.length,123);console.log('PASS: 123 pairs, deterministic rate steering');
