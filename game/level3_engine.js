/* Captain Suji V7c: deterministic two-leg gravity and inter-hole passage. */
(function exposeLevelThree(root) {
  'use strict';

  const levelTwo = root.SujiLevel2 || (
    typeof require === 'function' ? require('./level2_engine.js') : null
  );
  const W = 6400;
  const H = 5400;
  const DT = levelTwo.DT;
  const STEER_RATE = levelTwo.STEER_RATE;
  const CFG = Object.freeze({
    ...levelTwo.CFG,
    dangerRadius: 350,
    cruiseSpeed: 210,
    missionSeconds: 45,
    lostAfterSeconds: 30,
    planetSoftening: 40
  });

  /* Explicit audited coordinates. Starts use all four edges; each scene has
   * its own gate orientation, centre, masses and planet positions. The offline
   * exploration scripts are test tooling, not a runtime layout generator. */
  const layouts = [
  {
    "id": 0,
    "name": "Northwest Passage",
    "edge": "top",
    "start": {
      "x": 2050.667933281511,
      "y": 330
    },
    "launchSpeeds": [
      197.50416308431886,
      324.9556877091527
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 3248.8395105508357,
        "y": 1865.5723972794622,
        "mu": 11556782
      },
      {
        "id": "BH-2",
        "x": 1167.141421915548,
        "y": 2436.4474237051427,
        "mu": 18626640
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 2167.3717210729114,
        "y": 4692.274032158699,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 4174.741338061474,
        "y": 1237.4983340337599,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-161"
  },
  {
    "id": 1,
    "name": "Southern Compass",
    "edge": "bottom",
    "start": {
      "x": 2619.2851060070097,
      "y": 5070
    },
    "launchSpeeds": [
      211.08976564137265,
      312.81655080616474
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 1438.344855240931,
        "y": 2932.341512440166,
        "mu": 21353554
      },
      {
        "id": "BH-2",
        "x": 3550.522957821823,
        "y": 2702.4063761754337,
        "mu": 10754502
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 2635.7214614771074,
        "y": 438.03238748806916,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 1486.93506469873,
        "y": 4536.855331076212,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-599"
  },
  {
    "id": 2,
    "name": "Sunrise Crossing",
    "edge": "top",
    "start": {
      "x": 2970.6005664542317,
      "y": 330
    },
    "launchSpeeds": [
      214.29219158599153,
      323.1282460875809
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 4380.420693875662,
        "y": 1918.0317506716578,
        "mu": 20496664
      },
      {
        "id": "BH-2",
        "x": 2455.6240965231054,
        "y": 1702.844598014041,
        "mu": 14902667
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 4241.455141188103,
        "y": 4172.317639571709,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 1559.3697856395916,
        "y": 1382.6228340136545,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-721"
  },
  {
    "id": 3,
    "name": "Westbound Arc",
    "edge": "right",
    "start": {
      "x": 6070,
      "y": 4405.470698536374
    },
    "launchSpeeds": [
      227.90394350793213,
      322.38728410564363
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 4147.434670899271,
        "y": 4524.99287354986,
        "mu": 16479256
      },
      {
        "id": "BH-2",
        "x": 4809.667609434551,
        "y": 2538.390135467869,
        "mu": 14560568
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 2083.81152771214,
        "y": 2884.8324115357686,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5456.48728526351,
        "y": 1880.8934495935596,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-982"
  },
  {
    "id": 4,
    "name": "Copper Diagonal",
    "edge": "right",
    "start": {
      "x": 6070,
      "y": 3644.724226766266
    },
    "launchSpeeds": [
      226.36066891252995,
      301.540792575106
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 3283.7030747366593,
        "y": 4745.741014629562,
        "mu": 21658844
      },
      {
        "id": "BH-2",
        "x": 4443.935486981169,
        "y": 2693.5745775696414,
        "mu": 17878347
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 1114.837958444058,
        "y": 3764.956220151497,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5383.078901092813,
        "y": 4823.997752715996,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-986"
  },
  {
    "id": 5,
    "name": "Western Narrows",
    "edge": "right",
    "start": {
      "x": 6070,
      "y": 1714.8214286426082
    },
    "launchSpeeds": [
      215.5271321721375,
      305.687763011083
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 4477.051668434468,
        "y": 2703.6294940164557,
        "mu": 11947253
      },
      {
        "id": "BH-2",
        "x": 4147.394785573212,
        "y": 974.4237816723416,
        "mu": 17247760
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 1765.4084884117306,
        "y": 2407.9403538398537,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5449.329962092712,
        "y": 3442.2871728366017,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-2122"
  },
  {
    "id": 6,
    "name": "Southern Lantern",
    "edge": "bottom",
    "start": {
      "x": 4217.250878922641,
      "y": 5070
    },
    "launchSpeeds": [
      260.2466670819558,
      290.74248606339097
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 2306.280480656353,
        "y": 3681.1383962980876,
        "mu": 21990753
      },
      {
        "id": "BH-2",
        "x": 4100.6316581190495,
        "y": 3325.4021557083474,
        "mu": 9266489
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 1880.0311242804771,
        "y": 1219.4870655521179,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5195.189964370888,
        "y": 3461.2687373758736,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-2439"
  },
  {
    "id": 7,
    "name": "Blue Horizon",
    "edge": "right",
    "start": {
      "x": 6070,
      "y": 3123.981075338088
    },
    "launchSpeeds": [
      210.95431255642325,
      315.6472791451961
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 4099.845418934297,
        "y": 3790.300709952249,
        "mu": 18469811
      },
      {
        "id": "BH-2",
        "x": 4658.212621866322,
        "y": 2077.879163980639,
        "mu": 7154655
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 1675.8140157999983,
        "y": 3265.4383731625812,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5019.298275230753,
        "y": 1153.0569075765925,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-3086"
  },
  {
    "id": 8,
    "name": "Northeast Turn",
    "edge": "top",
    "start": {
      "x": 4498.985781520605,
      "y": 330
    },
    "launchSpeeds": [
      214.013191529084,
      310.23126093670726
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 5205.203812084274,
        "y": 3019.2227684127556,
        "mu": 18610398
      },
      {
        "id": "BH-2",
        "x": 3500.1379370640657,
        "y": 1607.0795961650738,
        "mu": 19074767
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 2915.278840974045,
        "y": 4779.668441534482,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5892.640396251256,
        "y": 1675.0157369176923,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-4493"
  },
  {
    "id": 9,
    "name": "Dawn Bridge",
    "edge": "top",
    "start": {
      "x": 1937.6819097436965,
      "y": 330
    },
    "launchSpeeds": [
      263.89932608930394,
      303.44774670898914
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 3062.892469449323,
        "y": 2817.3143644471,
        "mu": 21819239
      },
      {
        "id": "BH-2",
        "x": 961.9475520997717,
        "y": 1809.0115640617269,
        "mu": 14922076
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 1586.0734691257558,
        "y": 4922.474732845023,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 3229.240087283024,
        "y": 1052.7448541316198,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-4649"
  },
  {
    "id": 10,
    "name": "Eastern Reach",
    "edge": "left",
    "start": {
      "x": 330,
      "y": 1942.8032436175272
    },
    "launchSpeeds": [
      257.79894651379436,
      323.84036094881594
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 2133.6813014991003,
        "y": 1384.6993012180426,
        "mu": 11069328
      },
      {
        "id": "BH-2",
        "x": 2592.472806540979,
        "y": 3464.824417304566,
        "mu": 18762504
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 4957.29076953026,
        "y": 2781.820715383985,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 1847.0025281820838,
        "y": 497.5762565843329,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-4856"
  },
  {
    "id": 11,
    "name": "Long Westward",
    "edge": "right",
    "start": {
      "x": 6070,
      "y": 3854.9137791851535
    },
    "launchSpeeds": [
      273.6120782978833,
      297.0877384301275
    ],
    "holes": [
      {
        "id": "BH-1",
        "x": 3231.2035500750594,
        "y": 4305.574075402855,
        "mu": 20883951
      },
      {
        "id": "BH-2",
        "x": 4656.233164626274,
        "y": 2350.930737079052,
        "mu": 9097019
      }
    ],
    "planets": [
      {
        "id": "blue",
        "x": 1394.753008949448,
        "y": 2755.359187418995,
        "mu": 5999999
      },
      {
        "id": "green",
        "x": 5347.029860420494,
        "y": 4905.048396057127,
        "mu": 4000000
      }
    ],
    "explorationId": "redesign-5270"
  }
];

  function makeGate(holes, blue) {
    const [upper, lower] = holes;
    const dx = lower.x - upper.x;
    const dy = lower.y - upper.y;
    const length = Math.hypot(dx, dy);
    let nx = dy / length;
    let ny = -dx / length;
    if ((blue.x - upper.x) * nx + (blue.y - upper.y) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    return {
      x: upper.x,
      y: upper.y,
      ux: dx / length,
      uy: dy / length,
      nx,
      ny,
      length,
      clearance: CFG.dangerRadius,
      width: length - 2 * CFG.dangerRadius,
      center: { x: (upper.x + lower.x) / 2, y: (upper.y + lower.y) / 2 }
    };
  }

  function makeScene(index = 0, leg = 1) {
    const normalized = ((index % layouts.length) + layouts.length) % layouts.length;
    const layout = layouts[normalized];
    const holes = layout.holes.map(hole => ({ ...hole }));
    const planets = layout.planets.map(planet => ({ ...planet }));
    return {
      layout: layout.id,
      name: layout.name,
      leg,
      target: leg - 1,
      start: { ...layout.start },
      startEdge: layout.edge || 'left',
      launchSpeed: layout.launchSpeeds[leg - 1],
      holes,
      planets,
      planet: planets[leg - 1],
      gate: makeGate(holes, planets[0])
    };
  }

  function launch(scene, options = {}) {
    let x = options.x ?? scene.start.x;
    let y = options.y ?? scene.start.y;
    if (scene.leg === 2) {
      const blue = scene.planets[0];
      const normal = Math.atan2(scene.gate.center.y - blue.y, scene.gate.center.x - blue.x);
      const radius = CFG.planetRadius + CFG.shipRadius + 3;
      x = blue.x + Math.cos(normal) * radius;
      y = blue.y + Math.sin(normal) * radius;
    }
    const angle = options.angle ?? Math.atan2(scene.planet.y - y, scene.planet.x - x);
    const speed = options.speed ?? scene.launchSpeed;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gapCrossed: false,
      time: 0,
      awaySeconds: 0,
      totalAwaySeconds: 0,
      bestTargetDistance: Math.hypot(x - scene.planet.x, y - scene.planet.y),
      noProgressSeconds: 0,
      minGreenDistance: Math.hypot(x - scene.planets[1].x, y - scene.planets[1].y)
    };
  }

  function crossesGap(before, after, scene) {
    const gate = scene.gate;
    const first = (before.x - gate.x) * gate.nx + (before.y - gate.y) * gate.ny;
    const second = (after.x - gate.x) * gate.nx + (after.y - gate.y) * gate.ny;
    const correctDirection = scene.leg === 1
      ? first <= 0 && second > 0
      : first >= 0 && second < 0;
    if (!correctDirection) return false;
    const fraction = first / (first - second);
    const x = before.x + (after.x - before.x) * fraction - gate.x;
    const y = before.y + (after.y - before.y) * fraction - gate.y;
    const along = x * gate.ux + y * gate.uy;
    return along >= gate.clearance && along <= gate.length - gate.clearance;
  }

  function advanceInto(state, scene, steer, out) {
    let ax = 0;
    let ay = 0;
    for (const hole of scene.holes) {
      const dx = hole.x - state.x;
      const dy = hole.y - state.y;
      const squared = dx * dx + dy * dy + CFG.softening * CFG.softening;
      const gravity = hole.mu / (squared * Math.sqrt(squared));
      ax += dx * gravity;
      ay += dy * gravity;
    }
    for (const planet of scene.planets) {
      const dx = planet.x - state.x;
      const dy = planet.y - state.y;
      const squared = dx * dx + dy * dy + CFG.planetSoftening * CFG.planetSoftening;
      const gravity = planet.mu / (squared * Math.sqrt(squared));
      ax += dx * gravity;
      ay += dy * gravity;
    }
    const vx = state.vx + ax * DT;
    const vy = state.vy + ay * DT;
    const turn = steer * STEER_RATE * DT;
    const cosine = Math.cos(turn);
    const sine = Math.sin(turn);
    out.vx = vx * cosine - vy * sine;
    out.vy = vx * sine + vy * cosine;
    out.x = state.x + out.vx * DT;
    out.y = state.y + out.vy * DT;
    out.gapCrossed = Boolean(state.gapCrossed) || crossesGap(state, out, scene);
    out.time = (state.time || 0) + DT;
    const targetX = scene.planet.x - out.x;
    const targetY = scene.planet.y - out.y;
    const headingAway = targetX * out.vx + targetY * out.vy < 0;
    out.awaySeconds = headingAway ? (state.awaySeconds || 0) + DT : 0;
    out.totalAwaySeconds = (state.totalAwaySeconds || 0) + (headingAway ? DT : 0);
    out.minGreenDistance = Math.min(state.minGreenDistance ?? Infinity, Math.hypot(out.x - scene.planets[1].x, out.y - scene.planets[1].y));
    const distance = Math.hypot(targetX, targetY);
    const bestDistance = state.bestTargetDistance ?? distance;
    const madeProgress = distance < bestDistance - 100;
    out.bestTargetDistance = madeProgress ? distance : bestDistance;
    out.noProgressSeconds = madeProgress ? 0 : (state.noProgressSeconds || 0) + DT;
    return out;
  }

  function terminal(state, scene) {
    for (const hole of scene.holes) {
      if (Math.hypot(state.x - hole.x, state.y - hole.y) <= CFG.horizon) return 'fall';
    }
    for (let index = 0; index < scene.planets.length; index++) {
      const planet = scene.planets[index];
      if (Math.hypot(state.x - planet.x, state.y - planet.y) > CFG.planetRadius + CFG.shipRadius) continue;
      if (index !== scene.target) return 'collision';
      return state.gapCrossed ? 'success' : 'missed-gap';
    }
    const dx = scene.planet.x - scene.gate.center.x;
    const dy = scene.planet.y - scene.gate.center.y;
    const pastTarget = ((state.x - scene.planet.x) * dx + (state.y - scene.planet.y) * dy) / Math.hypot(dx, dy);
    const targetDistance = Math.hypot(state.x - scene.planet.x, state.y - scene.planet.y);
    // A generous course window beyond the 10–25s design target prevents slow
    // near-escapes from leaving a child waiting until the simulation's 45s cap.
    if ((state.time || 0) >= CFG.lostAfterSeconds - DT / 2) return 'lost';
    if (pastTarget > 1500 || state.noProgressSeconds >= 8 || state.totalAwaySeconds >= 10 || (state.awaySeconds >= 5 && targetDistance > 600)) return 'lost';
    if (state.x < -1500 || state.x > W + 1500 || state.y < -1500 || state.y > H + 1500) return 'lost';
    return null;
  }

  function simulate(initial, scene, options = {}) {
    const horizon = options.horizon ?? CFG.missionSeconds;
    const sample = options.sample ?? 0.1;
    const sampleSteps = Math.max(1, Math.round(sample / DT));
    const steps = Math.round(horizon / DT);
    const path = options.track ? [] : null;
    let state = { ...initial };
    let next = {};
    let closestPlanet = Infinity;
    for (let step = 0; step <= steps; step++) {
      closestPlanet = Math.min(closestPlanet, Math.hypot(state.x - scene.planet.x, state.y - scene.planet.y));
      if (path && step % sampleSteps === 0) path.push(state.x, state.y);
      const outcome = terminal(state, scene);
      if (outcome || step === steps) {
        return {
          outcome: outcome || 'drift',
          duration: step * DT,
          final: { ...state },
          closestPlanet,
          path,
          crossedGap: Boolean(state.gapCrossed)
        };
      }
      const steer = options.schedule ? options.schedule(step, state, scene) : options.steer || 0;
      advanceInto(state, scene, steer, next);
      [state, next] = [next, state];
    }
    throw new Error('Unreachable simulation state');
  }

  let history = [];

  function choose(previous = -1, random = Math.random) {
    const old = layouts[previous];
    let pool = layouts.filter(layout => {
      if (history.slice(-4).includes(layout.id)) return false;
      return !old || layout.planets.every((planet, index) =>
        Math.hypot(planet.x - old.planets[index].x, planet.y - old.planets[index].y) >= 300);
    });
    if (!pool.length) pool = layouts.filter(layout => layout.id !== previous && !history.slice(-4).includes(layout.id));
    const selected = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
    history.push(selected.id);
    history = history.slice(-4);
    return selected;
  }

  const API = {
    W, H, DT, STEER_RATE, CFG, layouts, makeScene, choose,
    launch, crossesGap, advanceInto, terminal, simulate
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.SujiLevel3 = API;
})(typeof self !== 'undefined' ? self : globalThis);
