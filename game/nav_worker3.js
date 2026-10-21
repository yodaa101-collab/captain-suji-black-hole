/* Captain Suji V7c: Level 3 ORBIT worker. Level 2's worker is frozen. */
'use strict';

importScripts('level2_engine.js', 'level3_engine.js', 'level3_planner.js');

const planner = self.SujiLevel3Planner;
let active = null;
let queued = null;

function sendResult(job, complete) {
  const result = job.best;
  self.postMessage({
    id: job.id,
    complete,
    elapsedMs: performance.now() - job.started,
    evaluated: job.index,
    total: job.strategies.length,
    route: result ? result.path : null,
    plan: result ? {
      segments: result.segments,
      duration: result.duration,
      inputs: result.inputs,
      crossedGap: result.crossedGap
    } : null
  });
}

function startJob(request) {
  active = {
    ...request,
    started: performance.now(),
    index: 0,
    firstSent: false,
    best: null,
    strategies: planner.strategies(request.scene)
  };
  setTimeout(work, 0);
}

function work() {
  const job = active;
  if (!job) return;
  const sliceStarted = performance.now();
  while (job.index < job.strategies.length) {
    const strategy = job.strategies[job.index++];
    const result = planner.evaluate(job.state, job.scene, strategy);
    if (result.outcome === 'success' && planner.better(result, job.best)) {
      job.best = result;
      if (!job.firstSent) {
        job.firstSent = true;
        sendResult(job, false);
      }
    }
    if (performance.now() - sliceStarted >= 8) break;
  }
  if (job.index < job.strategies.length) {
    setTimeout(work, 0);
    return;
  }
  planner.remember(job.scene, job.best);
  sendResult(job, true);
  active = null;
  if (queued) {
    const request = queued;
    queued = null;
    startJob(request);
  }
}

self.onmessage = function receiveState(event) {
  const request = event.data;
  if (!request.state || !request.scene) return;
  if (active) queued = request;
  else startJob(request);
};
