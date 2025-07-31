import { Ticker } from "pixi.js";

export const getCycle = ({
  frequency,
  // phaseOffset,
  ticker,
}: {
  frequency: number;
  phaseOffset?: number;
  ticker?: Ticker;
}) => {
  let beat = false;
  let phase = 0;

  const ms = new Date().getTime();
  phase = ((ms / 1000 / 60) * frequency) % 1;
  if (ticker) {
    const prevMs = ms - ticker.deltaMS;
    const previousPhase = ((prevMs / 1000 / 60) * frequency) % 1;
    beat = previousPhase > phase;
  }

  return { beat, phase };
};

export const onCycleBeat = (
  callback: () => any,
  frequency: number,
  phaseOffset?: number
) => {
  const cycle = getCycle({
    frequency,
    phaseOffset,
  });
  if (cycle.beat) {
    callback();
  }
};

export const onCyclePhase = (
  callback: (phase: number) => any,
  frequency: number,
  phaseOffset?: number
) => {
  const cycle = getCycle({
    frequency,
    phaseOffset,
  });
  callback(cycle.phase);
};
