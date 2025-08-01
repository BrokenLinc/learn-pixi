import { Ticker } from "pixi.js";

type FrequencyUnit = "hz" | "bpm";

interface CycleParams {
  frequency: number;
  unit?: FrequencyUnit; // default is 'hz'
  offset?: number; // default is 0
}

function toHz(frequency: number, unit: FrequencyUnit = "hz") {
  return unit === "bpm" ? frequency / 60 : frequency;
}

/**
 * Helper method that takes desired frequency information and a Pixi Ticker
 * and determines if a beat has occurred since the last ticker event.
 * If so, fires a callback that could be used to play a tone.
 */
export function onCycleBeat(
  {
    frequency,
    unit = "hz",
    offset = 0,
    ticker,
  }: CycleParams & { ticker: Ticker },
  callback: () => void
) {
  const hz = toHz(frequency, unit);

  const now = performance.now() / 1000;
  const phase = (((now * hz + offset) % 1) + 1) % 1;

  const last = (performance.now() - ticker.deltaMS) / 1000;
  const lastPhase = (((last * hz + offset) % 1) + 1) % 1;

  if (lastPhase > phase) {
    // Wrapped from near 1.0 back to 0 — start of new cycle
    callback();
  }
}
