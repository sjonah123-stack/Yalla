/** Tiny synthesized cues — no assets, nothing to load. Callers gate on the sounds setting. */
export type Cue = "good" | "bad" | "chest" | "tick" | "done" | "fever" | "coin" | "page";

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function note(
  c: AudioContext,
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType,
  gain = 0.08,
) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(c.destination);
  o.start(at);
  o.stop(at + dur + 0.02);
}

export function playCue(cue: Cue): void {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  switch (cue) {
    case "good":
      note(c, 660, t, 0.09, "triangle");
      note(c, 990, t + 0.09, 0.14, "triangle");
      break;
    case "bad":
      note(c, 220, t, 0.18, "square", 0.05);
      break;
    case "tick":
      note(c, 880, t, 0.05, "sine", 0.04);
      break;
    case "done":
      [523, 659, 784].forEach((f, i) => note(c, f, t + i * 0.1, 0.16, "triangle"));
      break;
    case "chest":
      [523, 659, 784, 1047].forEach((f, i) => note(c, f, t + i * 0.09, 0.22, "triangle", 0.1));
      break;
    case "fever":
      // A quick rising arpeggio that lands an octave up: the combo caught fire.
      [587, 740, 880, 1175].forEach((f, i) => note(c, f, t + i * 0.055, 0.12, "triangle", 0.09));
      note(c, 1760, t + 0.24, 0.2, "sine", 0.05);
      break;
    case "coin":
      // Two bright pings, the classic coin.
      note(c, 988, t, 0.07, "square", 0.035);
      note(c, 1319, t + 0.07, 0.22, "square", 0.035);
      break;
    case "page":
      // A soft low tap for turning to the next line of a story.
      note(c, 520, t, 0.06, "sine", 0.05);
      break;
  }
}

/** Haptic tap where the platform allows it (Android Chrome; iOS Safari has no API). */
export function buzz(pattern: number | number[] = 12): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
