// ─── TINTAXIS — SOUND DESIGN ─────────────────────────────────────────
// Web Audio API only. No external files. No loading states.
// All sounds synthesized in real-time — they feel like the platform itself.
//
// Sound vocabulary:
//   inkScratch()     — applying any ink (scratch + glow-chime)
//   inkGlow()        — hover over an annotation
//   signalSend()     — question enters the archive (low bell + fade)
//   archiveMode()    — chapter complete (one long resonant tone)
//   pageIris()       — chapter transition (mechanical iris wipe)
//   whisperReveal()  — author whisper materializes

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

// ─── INK SCRATCH + GLOW-CHIME ────────────────────────────────────────────────
// The sound of ink being applied to parchment.
// A brief noise burst (the scratch) followed by a soft bell overtone (the glow).

export function playInkScratch(inkColor: "ember" | "copper" | "ghost" | "archive" | "signal" | "memory" = "ghost") {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;

  // Scratch — short filtered noise
  const bufferSize = c.sampleRate * 0.08;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const noise = c.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 3000;
  noiseFilter.Q.value = 0.8;

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.06, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(c.destination);
  noise.start(now);
  noise.stop(now + 0.08);

  // Glow-chime — frequency depends on ink type
  const chimeFreqs: Record<string, number> = {
    ghost:   880,
    ember:   660,
    copper:  740,
    archive: 830,
    signal:  1100,
    memory:  550,
  };

  const freq = chimeFreqs[inkColor] || 880;
  const chime = c.createOscillator();
  chime.type = "sine";
  chime.frequency.setValueAtTime(freq, now + 0.04);
  chime.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.4);

  const chimeGain = c.createGain();
  chimeGain.gain.setValueAtTime(0, now + 0.04);
  chimeGain.gain.linearRampToValueAtTime(0.07, now + 0.07);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  // Slight reverb via second oscillator (harmonic)
  const harmonic = c.createOscillator();
  harmonic.type = "sine";
  harmonic.frequency.value = freq * 2;
  const harmonicGain = c.createGain();
  harmonicGain.gain.setValueAtTime(0, now + 0.04);
  harmonicGain.gain.linearRampToValueAtTime(0.025, now + 0.08);
  harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  chime.connect(chimeGain);
  chimeGain.connect(c.destination);
  harmonic.connect(harmonicGain);
  harmonicGain.connect(c.destination);

  chime.start(now + 0.04);
  chime.stop(now + 0.6);
  harmonic.start(now + 0.04);
  harmonic.stop(now + 0.5);
}

// ─── SIGNAL SEND — QUESTION ENTERS THE ARCHIVE ───────────────────────────────
// A low bell with a long, slow fade. Like a message disappearing into distance.

export function playSignalSend() {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;

  // Low bell
  const bell = c.createOscillator();
  bell.type = "sine";
  bell.frequency.setValueAtTime(220, now);
  bell.frequency.exponentialRampToValueAtTime(210, now + 2);

  const bellGain = c.createGain();
  bellGain.gain.setValueAtTime(0, now);
  bellGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

  // Upper partial
  const partial = c.createOscillator();
  partial.type = "sine";
  partial.frequency.value = 440;
  const partialGain = c.createGain();
  partialGain.gain.setValueAtTime(0, now);
  partialGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
  partialGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  // Bioluminescent shimmer — high sine at signal frequency
  const shimmer = c.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(1760, now + 0.1);
  shimmer.frequency.exponentialRampToValueAtTime(880, now + 0.8);
  const shimmerGain = c.createGain();
  shimmerGain.gain.setValueAtTime(0, now + 0.1);
  shimmerGain.gain.linearRampToValueAtTime(0.03, now + 0.15);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  bell.connect(bellGain);
  bellGain.connect(c.destination);
  partial.connect(partialGain);
  partialGain.connect(c.destination);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(c.destination);

  bell.start(now);
  bell.stop(now + 3);
  partial.start(now);
  partial.stop(now + 2);
  shimmer.start(now + 0.1);
  shimmer.stop(now + 1);
}

// ─── ARCHIVE MODE — CHAPTER COMPLETE ─────────────────────────────────────────
// One long resonant tone. Solemn. The chapter is sealed.

export function playArchiveMode() {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;

  const notes = [130.81, 164.81, 196.00]; // C3 chord — deep, resonant

  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.1);
    gain.gain.setValueAtTime(0.08, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + 5);
  });

  // Metallic overtone — the brass resonance
  const metal = c.createOscillator();
  metal.type = "triangle";
  metal.frequency.value = 523.25; // C5
  const metalGain = c.createGain();
  metalGain.gain.setValueAtTime(0, now + 0.2);
  metalGain.gain.linearRampToValueAtTime(0.04, now + 0.35);
  metalGain.gain.exponentialRampToValueAtTime(0.001, now + 3);

  metal.connect(metalGain);
  metalGain.connect(c.destination);
  metal.start(now + 0.2);
  metal.stop(now + 3.5);
}

// ─── WHISPER REVEAL — AUTHOR MATERIALIZES ────────────────────────────────────
// Soft ascending tones, like light assembling into presence.

export function playWhisperReveal() {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;
  const freqs = [440, 554, 659]; // A4, C#5, E5 — A major

  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.05, now + i * 0.12 + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.7);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.8);
  });
}

// ─── HOVER TONE — ANNOTATION HOVER ──────────────────────────────────────────
// Very subtle — almost imperceptible. Just enough to feel alive.

export function playInkHover() {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1200;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.015, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}
