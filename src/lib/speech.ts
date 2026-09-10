let voice: SpeechSynthesisVoice | null = null;
let ready: Promise<boolean> | null = null;

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const he = voices.filter(
    (v) => v.lang.toLowerCase().startsWith("he") || v.lang.toLowerCase().startsWith("iw"),
  );
  if (!he.length) return null;
  // Prefer local (on-device) voices; they respond instantly and work offline.
  return he.find((v) => v.localService) ?? he[0];
}

/** Resolve a Hebrew voice once. Resolves false when none exists — never speak Hebrew with another voice. */
export function initSpeech(): Promise<boolean> {
  if (ready) return ready;
  ready = new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve(false);
    const synth = window.speechSynthesis;
    const tryNow = () => {
      voice = pickVoice(synth.getVoices());
      return !!voice;
    };
    if (tryNow()) return resolve(true);
    // Chrome loads voices asynchronously.
    const timer = setTimeout(() => resolve(tryNow()), 1500);
    synth.addEventListener(
      "voiceschanged",
      () => {
        if (tryNow()) {
          clearTimeout(timer);
          resolve(true);
        }
      },
      { once: true },
    );
  });
  return ready;
}

export const speechAvailable = (): boolean => !!voice;

/**
 * Speak vocalized Hebrew. The nikud is kept: unpointed Hebrew is ambiguous and the system
 * voices (Apple's Carmit, Google's) read the vowel points when present. Cantillation marks
 * would only confuse them, so those are dropped.
 */
const CANTILLATION = /[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C6]/g;
export function speak(text: string, rate = 0.85): void {
  if (!voice) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(CANTILLATION, ""));
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = rate;
  synth.speak(u);
}
