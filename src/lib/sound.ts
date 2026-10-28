import type { SoundTone } from "./types";

let audioContext: AudioContext | null = null;

const TONES: Record<SoundTone, number[]> = {
  chime: [523.25, 659.25],
  bell: [440, 880],
  soft: [392, 523.25],
};

function getContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playChime(tone: SoundTone = "chime", volume = 60) {
  if (volume <= 0) return;

  try {
    const context = getContext();
    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const notes = TONES[tone] ?? TONES.chime;
    const peak = Math.max(0, Math.min(1, volume / 100)) * 0.09;

    notes.forEach((frequency, index) => {
      const start = now + index * 0.14;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.6);
    });
  } catch {
    // Audio is optional. A blocked audio context must not break the reminder.
  }
}
