/**
 * Utility for synthesizing timer audio cues via Web Audio API and managing screen wake locks.
 * Avoids external audio assets, handles browser autoplay restrictions, and ensures background reliability.
 */

let audioCtx = null;
let wakeLock = null;

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
    console.error("AudioContext initialization failed:", error);
    return null;
  }
};

/**
 * Requests a screen wake lock to prevent the device from sleeping during active workouts.
 */
export const requestWakeLock = async () => {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      if (!wakeLock && document.visibilityState === 'visible') {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      }
    } catch (error) {
      console.warn("Wake lock request failed:", error);
    }
  }
};

/**
 * Releases the active screen wake lock.
 */
export const releaseWakeLock = async () => {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (error) {
      console.warn("Wake lock release failed:", error);
    }
  }
};

// Re-acquire wake lock automatically if the app returns to the foreground during a session
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (wakeLock === null && document.visibilityState === 'visible') {
      await requestWakeLock();
    }
  });
}

/**
 * Internal helper to schedule a synthesized tone with an exponential decay envelope.
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
  gain.gain.exponentialRampToValueAtTime(Math.max(peakGain, 0.001), startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

/**
 * Plays a crisp, noticeable double-beep pattern (660Hz).
 * Ideal for 3, 2, 1 countdown cues and interval transitions in noisy gym environments.
 */
export const playPrepBeep = async () => {
  try {
    const ctx = await getAudioContext();
    if (!ctx) return;

    // Add a 30ms safety buffer to ensure startTime is safely in the future
    const now = ctx.currentTime + 0.03;
    const beepDuration = 0.09; // 90ms per beep
    const pauseDuration = 0.07; // 70ms pause between beeps

    // First beep
    scheduleTone(ctx, 660, now, beepDuration, 0.25, 'sine');
    // Second beep
    scheduleTone(ctx, 660, now + beepDuration + pauseDuration, beepDuration, 0.25, 'sine');
  } catch (error) {
    console.error("Error playing prep beep:", error);
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

    const now = ctx.currentTime + 0.03;
    scheduleTone(ctx, 880, now, 0.35, 0.3, 'sine');
  } catch (error) {
    console.error("Error playing go beep:", error);
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

    const now = ctx.currentTime + 0.03;
    // D5 (587Hz), G5 (784Hz), C6 (1046Hz)
    scheduleTone(ctx, 587.33, now, 0.16, 0.25, 'sine');
    scheduleTone(ctx, 783.99, now + 0.16, 0.16, 0.25, 'sine');
    scheduleTone(ctx, 1046.5, now + 0.32, 0.45, 0.3, 'sine');
  } catch (error) {
    console.error("Error playing finish beep:", error);
  }
};
