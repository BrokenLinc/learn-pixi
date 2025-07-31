export type AudioSwitchParams = {
  enabled?: boolean;
  start?: () => void;
  stop?: () => void;
};

export const createAudioSwitch = ({
  enabled = false,
  start,
  stop,
}: AudioSwitchParams = {}) => {
  const state = {
    enabled,
  };

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "m") {
      state.enabled = !state.enabled;
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
