export type AudioSwitchParams = {
  enabled?: boolean;
  start?: () => void;
  stop?: () => void;
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
