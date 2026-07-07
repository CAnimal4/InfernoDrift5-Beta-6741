// InfernoDrift5 procedural audio engine.
// Everything is synthesized with WebAudio at runtime: no asset downloads,
// fully offline, and safe to import in node (no AudioContext until unlock()).

import { ID5_AUDIO_EVENTS } from "./id5-systems.js";

const NOTE = {
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
  E6: 1318.5,
};

export function createId5Audio() {
  let ctx = null;
  let unlocked = false;
  let enabled = true;
  let running = false;
  const volumes = { master: 0.8, engine: 0.6, sfx: 0.9 };
  const lastEvents = [];
  let eventCount = 0;

  let masterGain = null;
  let engineBus = null;
  let sfxBus = null;
  let engineOscA = null;
  let engineOscB = null;
  let engineFilter = null;
  let engineGain = null;
  let driftSource = null;
  let driftFilter = null;
  let driftGain = null;
  let noiseBuffer = null;
  let lavaLoopUntil = 0;

  const supported =
    typeof window !== "undefined" &&
    Boolean(window.AudioContext || window.webkitAudioContext);

  function recordEvent(name) {
    eventCount += 1;
    lastEvents.push(name);
    if (lastEvents.length > 16) lastEvents.shift();
  }

  function applyVolumeNodes() {
    if (!ctx) return;
    const now = ctx.currentTime;
    if (masterGain) {
      masterGain.gain.setTargetAtTime(
        enabled ? volumes.master : 0,
        now,
        0.04,
      );
    }
    if (engineBus) engineBus.gain.setTargetAtTime(volumes.engine, now, 0.04);
    if (sfxBus) sfxBus.gain.setTargetAtTime(volumes.sfx, now, 0.04);
  }

  function makeNoiseBuffer() {
    const length = Math.floor(ctx.sampleRate * 1.2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function buildGraph() {
    masterGain = ctx.createGain();
    masterGain.gain.value = enabled ? volumes.master : 0;
    masterGain.connect(ctx.destination);

    engineBus = ctx.createGain();
    engineBus.gain.value = volumes.engine;
    engineBus.connect(masterGain);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = volumes.sfx;
    sfxBus.connect(masterGain);

    noiseBuffer = makeNoiseBuffer();

    engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    engineFilter = ctx.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.frequency.value = 720;
    engineFilter.Q.value = 0.8;
    engineOscA = ctx.createOscillator();
    engineOscA.type = "sawtooth";
    engineOscA.frequency.value = 56;
    engineOscB = ctx.createOscillator();
    engineOscB.type = "sawtooth";
    engineOscB.frequency.value = 56 * 1.006;
    engineOscA.connect(engineFilter);
    engineOscB.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(engineBus);
    engineOscA.start();
    engineOscB.start();

    driftGain = ctx.createGain();
    driftGain.gain.value = 0;
    driftFilter = ctx.createBiquadFilter();
    driftFilter.type = "bandpass";
    driftFilter.frequency.value = 1750;
    driftFilter.Q.value = 1.4;
    driftSource = ctx.createBufferSource();
    driftSource.buffer = noiseBuffer;
    driftSource.loop = true;
    driftSource.connect(driftFilter);
    driftFilter.connect(driftGain);
    driftGain.connect(engineBus);
    driftSource.start();
  }

  function unlock() {
    if (!supported || unlocked) {
      if (ctx?.state === "suspended") ctx.resume().catch(() => {});
      return unlocked;
    }
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctor();
      buildGraph();
      unlocked = true;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    } catch {
      ctx = null;
      unlocked = false;
    }
    return unlocked;
  }

  function tone({
    freq = 440,
    endFreq = null,
    type = "sine",
    duration = 0.14,
    gain = 0.28,
    delay = 0,
    curve = 0.012,
  }) {
    if (!ctx || !enabled) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq && endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, endFreq),
        start + duration,
      );
    }
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), start + curve);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp);
    amp.connect(sfxBus);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function noiseBurst({
    duration = 0.2,
    gain = 0.3,
    delay = 0,
    filterType = "lowpass",
    freq = 900,
    endFreq = null,
    q = 0.8,
  }) {
    if (!ctx || !enabled || !noiseBuffer) return;
    const start = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, start);
    if (endFreq) {
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(40, endFreq),
        start + duration,
      );
    }
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(amp);
    amp.connect(sfxBus);
    source.start(start);
    source.stop(start + duration + 0.05);
  }

  function arpeggio(freqs, { step = 0.09, duration = 0.16, gain = 0.24, type = "triangle" } = {}) {
    freqs.forEach((freq, index) => {
      tone({ freq, type, duration, gain, delay: index * step });
    });
  }

  const ONE_SHOTS = {
    "ui-click": () => tone({ freq: 1500, type: "triangle", duration: 0.05, gain: 0.12 }),
    "ui-tab": () => {
      tone({ freq: 980, type: "triangle", duration: 0.05, gain: 0.1 });
      tone({ freq: 1470, type: "triangle", duration: 0.06, gain: 0.1, delay: 0.05 });
    },
    countdown: () => tone({ freq: NOTE.A4 * 2, type: "square", duration: 0.09, gain: 0.16 }),
    go: () => {
      tone({ freq: NOTE.E6, type: "square", duration: 0.2, gain: 0.2 });
      noiseBurst({ duration: 0.18, gain: 0.12, filterType: "highpass", freq: 2400 });
    },
    "boost-start": () => {
      tone({ freq: 220, endFreq: 660, type: "sawtooth", duration: 0.3, gain: 0.16 });
      noiseBurst({ duration: 0.32, gain: 0.14, filterType: "bandpass", freq: 900, endFreq: 3200, q: 1.1 });
    },
    "boost-pad": () => tone({ freq: 520, endFreq: 1240, type: "triangle", duration: 0.18, gain: 0.18 }),
    jump: () => tone({ freq: 320, endFreq: 640, type: "sine", duration: 0.14, gain: 0.16 }),
    land: () => {
      tone({ freq: 110, endFreq: 62, type: "sine", duration: 0.16, gain: 0.22 });
      noiseBurst({ duration: 0.1, gain: 0.1, freq: 500 });
    },
    "land-hard": () => {
      tone({ freq: 130, endFreq: 48, type: "sine", duration: 0.26, gain: 0.34 });
      noiseBurst({ duration: 0.2, gain: 0.22, freq: 420 });
    },
    collision: (params = {}) => {
      const strength = Math.min(1, Math.max(0.25, Number(params.strength) || 0.6));
      tone({ freq: 90, endFreq: 44, type: "sine", duration: 0.2 + strength * 0.12, gain: 0.22 + strength * 0.2 });
      noiseBurst({ duration: 0.14 + strength * 0.12, gain: 0.14 + strength * 0.18, freq: 700 });
    },
    checkpoint: () => arpeggio([NOTE.E5, NOTE.A5], { step: 0.07, gain: 0.2 }),
    ring: () => arpeggio([NOTE.C5, NOTE.E5, NOTE.G5], { step: 0.05, duration: 0.12, gain: 0.16 }),
    goal: () => arpeggio([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], { step: 0.09, duration: 0.22, gain: 0.24, type: "square" }),
    "flag-pickup": () => arpeggio([NOTE.G4, NOTE.C5], { step: 0.06, gain: 0.18 }),
    "flag-score": () => arpeggio([NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5], { step: 0.07, gain: 0.2 }),
    "zone-hold": () => tone({ freq: NOTE.A4, type: "triangle", duration: 0.1, gain: 0.1 }),
    "bowling-strike": () => {
      noiseBurst({ duration: 0.4, gain: 0.3, freq: 1400, endFreq: 300 });
      tone({ freq: 90, endFreq: 50, type: "sine", duration: 0.3, gain: 0.26 });
    },
    "lava-warning": () => {
      tone({ freq: 160, type: "square", duration: 0.12, gain: 0.14 });
      tone({ freq: 120, type: "square", duration: 0.14, gain: 0.14, delay: 0.14 });
    },
    "hunter-danger": () => {
      tone({ freq: 311, type: "sawtooth", duration: 0.12, gain: 0.13 });
      tone({ freq: 220, type: "sawtooth", duration: 0.14, gain: 0.13, delay: 0.1 });
    },
    "stuck-warning": () => {
      tone({ freq: 240, type: "square", duration: 0.1, gain: 0.14 });
      tone({ freq: 240, type: "square", duration: 0.1, gain: 0.14, delay: 0.16 });
    },
    medal: () => arpeggio([NOTE.C5, NOTE.G5], { step: 0.08, gain: 0.2 }),
    reward: () => arpeggio([NOTE.E5, NOTE.G5, NOTE.C6], { step: 0.07, gain: 0.2 }),
    "level-up": () =>
      arpeggio([NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.E5], {
        step: 0.09,
        duration: 0.24,
        gain: 0.24,
      }),
    "run-complete": () =>
      arpeggio([NOTE.G4, NOTE.C5, NOTE.E5, NOTE.G5], { step: 0.1, duration: 0.26, gain: 0.24 }),
    "run-failed": () =>
      arpeggio([NOTE.E5, NOTE.C5, NOTE.A4, NOTE.E4], { step: 0.11, duration: 0.24, gain: 0.2 }),
  };

  function event(name, params = {}) {
    if (!ID5_AUDIO_EVENTS.includes(name)) return false;
    recordEvent(name);
    if (!ctx || !enabled) return true;
    if (name === "lava-warning") {
      const nowMs = Date.now();
      if (nowMs < lavaLoopUntil) return true;
      lavaLoopUntil = nowMs + 900;
    }
    const handler = ONE_SHOTS[name];
    if (handler) {
      try {
        handler(params);
      } catch {
        // Audio failures must never break gameplay.
      }
    }
    return true;
  }

  function updateEngine({ speedRatio = 0, boostActive = false, driftActive = false, airborne = false } = {}) {
    if (!ctx || !engineGain) return;
    const now = ctx.currentTime;
    const ratio = Math.min(1, Math.max(0, speedRatio));
    const active = running && enabled;
    const idleFloor = active ? 0.05 : 0;
    const targetGain = active
      ? idleFloor + ratio * 0.24 + (boostActive ? 0.1 : 0)
      : 0;
    engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    const baseFreq = 52 + ratio * 148 + (boostActive ? 26 : 0);
    const airDrop = airborne ? 0.88 : 1;
    engineOscA.frequency.setTargetAtTime(baseFreq * airDrop, now, 0.06);
    engineOscB.frequency.setTargetAtTime(baseFreq * airDrop * 1.007, now, 0.06);
    engineFilter.frequency.setTargetAtTime(560 + ratio * 2100 + (boostActive ? 500 : 0), now, 0.08);
    const driftTarget = active && driftActive && !airborne ? 0.1 + ratio * 0.1 : 0;
    driftGain.gain.setTargetAtTime(driftTarget, now, 0.05);
  }

  return {
    supported,
    unlock,
    event,
    updateEngine,
    setRunning(value) {
      running = Boolean(value);
      if (!running) updateEngine({ speedRatio: 0 });
    },
    setEnabled(value) {
      enabled = Boolean(value);
      applyVolumeNodes();
      if (!enabled) updateEngine({ speedRatio: 0 });
    },
    setVolumes(next = {}) {
      if (Number.isFinite(Number(next.master)))
        volumes.master = Math.min(1, Math.max(0, Number(next.master)));
      if (Number.isFinite(Number(next.engine)))
        volumes.engine = Math.min(1, Math.max(0, Number(next.engine)));
      if (Number.isFinite(Number(next.sfx)))
        volumes.sfx = Math.min(1, Math.max(0, Number(next.sfx)));
      applyVolumeNodes();
    },
    getDiagnostics() {
      return {
        supported,
        unlocked,
        enabled,
        running,
        contextState: ctx?.state ?? "none",
        volumes: { ...volumes },
        eventCount,
        lastEvents: [...lastEvents],
      };
    },
  };
}
