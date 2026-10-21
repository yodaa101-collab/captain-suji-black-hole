/* Captain Suji V7c: shared, deterministic Level 3 route search. */
(function exposePlanner(root) {
  'use strict';

  const engine = root.SujiLevel3 || (
    typeof require === 'function' ? require('./level3_engine.js') : null
  );
  const preferred = new Map();
  const TAU = Math.PI * 2;

  function angleDifference(first, second) {
    let difference = (first - second) % TAU;
    if (difference > Math.PI) difference -= TAU;
    if (difference < -Math.PI) difference += TAU;
    return difference;
  }

  function appendCommand(segments, steer, seconds) {
    const previous = segments[segments.length - 1];
    if (previous && previous.dir === steer) previous.hold += seconds;
    else segments.push({ dir: steer, hold: seconds });
  }

  function countInputs(segments) {
    let inputs = 0;
    let previousDirection = 0;
    let coast = Infinity;
    for (const segment of segments) {
      if (!segment.dir) {
        coast += segment.hold;
      } else {
        if (segment.hold >= 0.1 && (segment.dir !== previousDirection || coast >= 0.2)) inputs++;
        previousDirection = segment.dir;
        coast = 0;
      }
    }
    return inputs;
  }

  function followWaypoints(initial, scene, strategy) {
    const gate = scene.gate;
    const direction = scene.leg === 1 ? 1 : -1;
    const along = gate.clearance + gate.width * strategy.fraction;
    const passage = { x: gate.x + gate.ux * along, y: gate.y + gate.uy * along };
    const entry = {
      x: passage.x - gate.nx * direction * strategy.lead,
      y: passage.y - gate.ny * direction * strategy.lead
    };
    let state = { ...initial };
    let next = {};
    let steer = 0;
    let phase = state.gapCrossed ? 'target' : 'entry';
    let nextCoastCheck = 0.5;
    let coastLocked = false;
    let closestPlanet = Infinity;
    const segments = [];
    const path = [];
    const limit = Math.round(35 / engine.DT);

    for (let step = 0; step <= limit; step++) {
      const time = step * engine.DT;
      if (step % 24 === 0) path.push(state.x, state.y);
      closestPlanet = Math.min(closestPlanet,
        Math.hypot(state.x - scene.planet.x, state.y - scene.planet.y));
      const outcome = engine.terminal(state, scene);
      if (outcome || step === limit) {
        return {
          outcome: outcome || 'drift',
          duration: time,
          path,
          segments,
          closestPlanet,
          inputs: countInputs(segments),
          crossedGap: Boolean(state.gapCrossed),
          minGreenDistance: state.minGreenDistance,
          strategy
        };
      }

      if (state.gapCrossed) phase = 'target';
      const entryProgress = (state.x - entry.x) * gate.nx * direction +
        (state.y - entry.y) * gate.ny * direction;
      if (phase === 'entry' && (entryProgress >= 0 || Math.hypot(state.x - entry.x, state.y - entry.y) < strategy.turnLead)) {
        phase = 'passage';
      }

      if (!coastLocked && time >= nextCoastCheck) {
        nextCoastCheck = time + 0.75;
        const coast = engine.simulate(state, scene, { horizon: 25 });
        if (coast.outcome === 'success') coastLocked = true;
      }

      if (coastLocked) {
        steer = 0;
      } else {
        let goal = scene.planet;
        if (phase === 'entry') goal = entry;
        if (phase === 'passage') {
          goal = {
            x: passage.x + gate.nx * direction * 500,
            y: passage.y + gate.ny * direction * 500
          };
        }
        const desired = Math.atan2(goal.y - state.y, goal.x - state.x);
        const current = Math.atan2(state.vy, state.vx);
        const error = angleDifference(desired, current);
        if (Math.abs(error) < 0.025) steer = 0;
        else if (Math.abs(error) > 0.10 || steer && Math.sign(error) !== steer) steer = Math.sign(error);
      }

      appendCommand(segments, steer, engine.DT);
      engine.advanceInto(state, scene, steer, next);
      [state, next] = [next, state];
    }
    throw new Error('Unreachable route state');
  }

  function evaluateSchedule(initial, scene, segments) {
    let segmentIndex = 0;
    let nextBoundary = segments.length ? segments[0].hold : Infinity;
    const result = engine.simulate(initial, scene, {
      horizon: 35,
      track: true,
      schedule(step) {
        const time = step * engine.DT;
        while (time >= nextBoundary && segmentIndex < segments.length) {
          segmentIndex++;
          nextBoundary += segments[segmentIndex]?.hold || Infinity;
        }
        return segments[segmentIndex]?.dir || 0;
      }
    });
    return { ...result, segments, inputs: countInputs(segments), strategy: { kind: 'schedule', segments } };
  }

  function strategies(scene, includeSchedules = true) {
    const result = [];
    const key = scene.layout + ':' + scene.leg;
    const cached = preferred.get(key);
    if (cached) result.push(cached);
    for (const fraction of [0.18, 0.30, 0.42, 0.55, 0.70]) {
      for (const lead of [400, 750, 1100]) {
        result.push({ kind: 'waypoints', fraction, lead, turnLead: 200 });
      }
    }
    if (includeSchedules) {
      result.push({ kind: 'schedule', segments: [] });
      for (const dir of [-1, 1]) {
        for (const delay of [0, 0.75, 1.5]) {
          for (const hold of [0.15, 0.3, 0.5, 0.8, 1.2, 1.8, 2.5, 3.5, 5]) {
            const segments = delay ? [{ dir: 0, hold: delay }] : [];
            segments.push({ dir, hold });
            result.push({ kind: 'schedule', segments });
          }
        }
      }
    }
    return result;
  }

  function evaluate(initial, scene, strategy) {
    if (strategy.kind === 'schedule') return evaluateSchedule(initial, scene, strategy.segments);
    return followWaypoints(initial, scene, strategy);
  }

  function better(first, second) {
    if (!second) return true;
    if (Math.abs(first.duration - second.duration) > 0.05) return first.duration < second.duration;
    const firstSteer = first.segments.reduce((sum, segment) => sum + (segment.dir ? segment.hold : 0), 0);
    const secondSteer = second.segments.reduce((sum, segment) => sum + (segment.dir ? segment.hold : 0), 0);
    return firstSteer < secondSteer;
  }

  function search(initial, scene, options = {}) {
    let best = null;
    let attempts = 0;
    for (const strategy of strategies(scene, options.includeSchedules !== false)) {
      const result = evaluate(initial, scene, strategy);
      attempts++;
      if (result.outcome === 'success' && better(result, best)) {
        best = result;
        if (options.firstSuccess) break;
      }
    }
    if (best) preferred.set(scene.layout + ':' + scene.leg, best.strategy);
    return { best, attempts };
  }

  function remember(scene, result) {
    if (result) preferred.set(scene.layout + ':' + scene.leg, result.strategy);
  }

  const API = { search, strategies, evaluate, better, countInputs, angleDifference, remember };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.SujiLevel3Planner = API;
})(typeof self !== 'undefined' ? self : globalThis);
