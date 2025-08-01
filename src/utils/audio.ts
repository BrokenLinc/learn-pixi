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
