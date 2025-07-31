import { Ticker } from "pixi.js";

export const getTickerMetronome = ({
  ticker,
  bpm = 120,
}: {
  ticker: Ticker;
  bpm?: number;
}) => {
  const ms = new Date().getTime();
  const s = ms / 1000;
  return {
    s,
    ms,
    notes: {
      x128: getNote({ ticker, bpm: bpm / 128 }),
      x64: getNote({ ticker, bpm: bpm / 64 }),
      x32: getNote({ ticker, bpm: bpm / 32 }),
      x16: getNote({ ticker, bpm: bpm / 16 }),
      x8: getNote({ ticker, bpm: bpm / 8 }),
      x4: getNote({ ticker, bpm: bpm / 4 }),
      x2: getNote({ ticker, bpm: bpm / 2 }),
      x1: getNote({ ticker, bpm: bpm * 1 }),
      f2: getNote({ ticker, bpm: bpm * 2 }),
      f4: getNote({ ticker, bpm: bpm * 4 }),
      f8: getNote({ ticker, bpm: bpm * 8 }),
    },
  };
};

const getNote = ({ ticker, bpm }: { ticker: Ticker; bpm: number }) => {
  const ms = new Date().getTime();
  const progress = ((ms / 1000 / 60) * bpm) % 1;
  const prevMs = ms - ticker.deltaMS;
  const previousProgress = ((prevMs / 1000 / 60) * bpm) % 1;
  return {
    hit: previousProgress > progress,
    progress,
  };
};
