export type AudioSwitchParams = {
  enabled?: boolean;
  start?: () => void;
  stop?: () => void;
};

/**
 * Creates a simple synth sound for sonar pulse detection.
 * Uses Web Audio API to generate a short beep sound.
 *
 * IMPORTANT: Always check audioSwitch.enabled before calling playSonarPulse()
 * to respect user audio preferences and web audio autoplay policies.
 */
export const createSynthSound = () => {
  // Create audio context if it doesn't exist
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  const playSonarPulse = (frequency = 800) => {
    // Create oscillator for the beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect oscillator to gain to output
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound with variable frequency
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = "sine";

    // Create envelope for the sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    // Start and stop the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return { playSonarPulse };
};

/**
 * Creates a bass drum sound for rhythmic pulsars.
 * Uses Web Audio API to generate a low-frequency thump sound.
 *
 * IMPORTANT: Always check audioSwitch.enabled before calling playBassDrum()
 * to respect user audio preferences and web audio autoplay policies.
 */
export const createBassDrumSound = () => {
  // Create audio context if it doesn't exist
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  const playBassDrum = () => {
    // Create oscillator for the bass drum sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Connect oscillator to filter to gain to output
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the bass drum sound
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime); // Low frequency
    oscillator.frequency.exponentialRampToValueAtTime(
      20,
      audioContext.currentTime + 0.1
    ); // Drop to very low
    oscillator.type = "sine";

    // Add filter for bass drum character
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      50,
      audioContext.currentTime + 0.1
    );

    // Create envelope for the sound
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    // Start and stop the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return { playBassDrum };
};

/**
 * Creates a state machine for audio management,
 * which requires user interaction to enable, per web standards.
 */
export const createAudioSwitch = ({
  // Typically the audio will begin disabled in a web page.
  enabled = false,
  start,
  stop,
}: AudioSwitchParams = {}) => {
  const state = {
    enabled,
  };

  // Toggle the audio state when the key is pressed.
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "m") {
      state.enabled = !state.enabled;
      // Fire optional callback events, which may start or stop ambient tones
      if (state.enabled) {
        start?.();
      } else {
        stop?.();
      }
    }
  });

  if (enabled) {
    start?.();
  }

  return state;
};
