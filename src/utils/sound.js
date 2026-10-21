/**
 * Utility for synthesizing timer audio cues via Web Audio API.
 * Avoids external audio assets and handles browser autoplay restrictions gracefully.
 */

let audioCtx = null;

/**
 * Safely initializes or resumes the shared AudioContext instance.
 * Must be triggered or resumed after user interaction (e.g., clicking "Start Workout").
 */
export const getAudioContext = async () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    return audioCtx;
  } catch (error) {
    // Autoplay restrictions or browser unsupported
    return null;
  }
};

/**
 * Internal helper to schedule a synthesized tone with an exponential decay envelope.
 *
 * @param {AudioContext} ctx
 * @param {number} freq - Frequency in Hz
 * @param {number} startTime - Start time in AudioContext timeline
 * @param {number} duration - Duration in seconds
 * @param {number} peakGain - Peak volume level (0.0 to 1.0)
 * @param {OscillatorType} type - Oscillator waveform
 */
const scheduleTone = (
  ctx,
  freq,
  startTime,
  duration,
  peakGain = 0.25,
  type = 'sine'
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Attack & exponential release to prevent audio clicking
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

/**
 * Plays a short, crisp mid-pitch beep (660Hz, 120ms).
 * Ideal for 3, 2, 1 countdown cues.
 */
export const playPrepBeep = async () => {
  try {
    const ctx = await getAudioContext();
    if (!ctx) return;

    scheduleTone(ctx, 660, ctx.currentTime, 0.12, 0.2, 'sine');
  } catch (error) {
    // Fail silently on playback blocks
  }
};

/**
 * Plays a vibrant, high-pitch tone (880Hz, 350ms).
 * Ideal for "GO!" / set start cues.
 */
export const playGoBeep = async () => {
  try {
    const ctx = await getAudioContext();
    if (!ctx) return;

    scheduleTone(ctx, 880, ctx.currentTime, 0.35, 0.3, 'sine');
  } catch (error) {
    // Fail silently on playback blocks
  }
};

/**
 * Plays an ascending triple chime (587Hz -> 784Hz -> 1046Hz).
 * Ideal for workout/interval completion (00:00).
 */
export const playFinishBeep = async () => {
  try {
    const ctx = await getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // D5 (587Hz), G5 (784Hz), C6 (1046Hz)
    scheduleTone(ctx, 587.33, now, 0.16, 0.25, 'sine');
    scheduleTone(ctx, 783.99, now + 0.16, 0.16, 0.25, 'sine');
    scheduleTone(ctx, 1046.5, now + 0.32, 0.45, 0.3, 'sine');
  } catch (error) {
    // Fail silently on playback blocks
  }
};
