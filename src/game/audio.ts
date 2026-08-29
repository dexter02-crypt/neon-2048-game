/* Warm WebAudio chip-synth for NEON 2048 — pitch rises with tile value. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let noiseBuf: AudioBuffer | null = null;

export function setAudioMuted(m: boolean) {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.02);
}

export function unlockAudio() {
  try {
    const a = ensure();
    if (a && a.state === "suspended") void a.resume();
  } catch {
    /* ignore */
  }
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function getNoise(a: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  vol = 0.06,
  delay = 0,
  slideTo = 0
) {
  if (muted) return;
  const a = ensure();
  if (!a || !master) return;
  try {
    const t0 = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  } catch {
    /* ignore */
  }
}

function whoosh(dur: number, fromFreq: number, toFreq: number, vol: number, delay = 0) {
  if (muted) return;
  const a = ensure();
  if (!a || !master) return;
  try {
    const t0 = a.currentTime + delay;
    const src = a.createBufferSource();
    src.buffer = getNoise(a);
    const bp = a.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(fromFreq, t0);
    bp.frequency.exponentialRampToValueAtTime(Math.max(60, toFreq), t0 + dur);
    bp.Q.value = 1.1;
    const gain = a.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp).connect(gain).connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  slide() {
    whoosh(0.09, 1100, 350, 0.035);
  },
  bump() {
    tone(120, 0.06, "sine", 0.05, 0, 70);
  },
  merge(value: number) {
    /* pitch climbs with the tile's power of two */
    const power = Math.log2(Math.max(2, value)); // 1..12+
    const base = 190 + power * 52;
    tone(base, 0.07, "square", 0.05);
    tone(base * 1.5, 0.09, "square", 0.045, 0.06);
    tone(base * 2, 0.1, "triangle", 0.05, 0.12);
    if (value >= 128) {
      tone(82, 0.22, "sine", 0.1, 0, 44);
      whoosh(0.25, 2600, 200, 0.05);
    }
    if (value >= 512) tone(base * 3, 0.14, "triangle", 0.04, 0.18);
  },
  spawn() {
    tone(540, 0.045, "sine", 0.022, 0.1);
  },
  undo() {
    tone(620, 0.06, "triangle", 0.05);
    tone(420, 0.08, "triangle", 0.05, 0.06);
  },
  start() {
    tone(392, 0.08, "square", 0.05);
    tone(523, 0.08, "square", 0.05, 0.09);
    tone(784, 0.13, "square", 0.05, 0.18);
  },
  win() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.13, "square", 0.055, i * 0.09));
    whoosh(0.8, 3200, 300, 0.04, 0.2);
  },
  over() {
    [392, 311, 262, 196].forEach((f, i) => tone(f, 0.18, "square", 0.05, i * 0.15));
    whoosh(0.6, 900, 80, 0.045, 0.1);
  },
  select() {
    tone(700, 0.04, "square", 0.03);
  },
};
