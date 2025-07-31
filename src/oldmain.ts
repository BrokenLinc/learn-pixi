import _ from "lodash";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Text,
  Ticker,
} from "pixi.js";
import * as Tone from "tone";
import { onCycleBeat, withCyclePhase } from "./utils/cycle";

const strokeStyle = { color: 0x44ffdd, pixelLine: true };
const textStyle = { fontFamily: "EditUndo", fontSize: 13.9, fill: 0xff44dd };

const createAudioSwitch = ({
  enabled = false,
  start,
  stop,
}: {
  enabled?: boolean;
  start?: () => void;
  stop?: () => void;
} = {}) => {
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

const createScanLine = ({
  app,
  container: parentContainer,
}: {
  app: Application;
  container?: Container;
}) => {
  // Build object tree
  const container = new Container();
  (parentContainer || app.stage).addChild(container);
  const graphics = new Graphics();
  container.addChild(graphics);
  const basicText = new Text({
    style: textStyle,
  });
  graphics.addChild(basicText);

  // Setup drawing
  const draw = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    graphics.x = -app.screen.width / 2;
    graphics.clear();
    graphics.moveTo(0, 0).lineTo(app.screen.width, 0).stroke(strokeStyle);

    basicText.text = app.screen.width;
  };
  draw();
  window.addEventListener("resize", draw);

  // Time-based drawing
  const linear = ({ ms = new Date().getTime() }: { ms?: number } = {}) => {
    const y = ((ms / 4) % app.screen.height) - app.screen.height / 2;
    graphics.y = y;
    basicText.text = Math.round(y + app.screen.height / 2);
  };
  const sine = ({ ms = new Date().getTime() }: { ms?: number } = {}) => {
    graphics.y = (Math.sin(ms / 1000) * (app.screen.height - 2)) / 2 + 1;
  };

  return {
    container,
    update: {
      linear,
      sine,
    },
  };
};

const createCircle = ({
  app,
  container: parentContainer,
  radius = 100,
}: {
  app: Application;
  container?: Container;
  points?: number;
  radius?: number;
}) => {
  // Build object tree
  const container = new Container();
  (parentContainer || app.stage).addChild(container);
  const graphics = new Graphics();
  container.addChild(graphics);

  // Setup drawing
  const draw = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    graphics.clear();
    graphics.circle(0, 0, radius);
    graphics.stroke(strokeStyle);
  };
  draw();
  window.addEventListener("resize", draw);

  return {
    container,
  };
};

const createPolygon = ({
  app,
  container: parentContainer,
  points = 3,
  radius = 100,
}: {
  app: Application;
  container?: Container;
  points?: number;
  radius?: number;
}) => {
  // Build object tree
  const container = new Container();
  (parentContainer || app.stage).addChild(container);
  const graphics = new Graphics();
  container.addChild(graphics);

  // Setup drawing
  const draw = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    graphics.clear();
    for (let i = 0; i <= points; i++) {
      const degree = (i / points) * Math.PI * 2;
      const x = Math.cos(degree) * radius;
      const y = Math.sin(degree) * radius;
      if (i == 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.stroke(strokeStyle);
  };
  draw();
  window.addEventListener("resize", draw);

  return {
    container,
    graphics,
  };
};

// const getTickerMetronome = ({
//   ticker,
//   bpm = 120,
// }: {
//   ticker: Ticker;
//   bpm?: number;
// }) => {
//   const ms = new Date().getTime();
//   const s = ms / 1000;
//   return {
//     s,
//     ms,
//     notes: {
//       x128: getNote({ ticker, bpm: bpm / 128 }),
//       x64: getNote({ ticker, bpm: bpm / 64 }),
//       x32: getNote({ ticker, bpm: bpm / 32 }),
//       x16: getNote({ ticker, bpm: bpm / 16 }),
//       x8: getNote({ ticker, bpm: bpm / 8 }),
//       x4: getNote({ ticker, bpm: bpm / 4 }),
//       x2: getNote({ ticker, bpm: bpm / 2 }),
//       x1: getNote({ ticker, bpm: bpm * 1 }),
//       f2: getNote({ ticker, bpm: bpm * 2 }),
//       f4: getNote({ ticker, bpm: bpm * 4 }),
//       f8: getNote({ ticker, bpm: bpm * 8 }),
//     },
//   };
// };

// const getNote = ({ ticker, bpm }: { ticker: Ticker; bpm: number }) => {
//   const ms = new Date().getTime();
//   const progress = ((ms / 1000 / 60) * bpm) % 1;
//   const prevMs = ms - ticker.deltaMS;
//   const previousProgress = ((prevMs / 1000 / 60) * bpm) % 1;
//   return {
//     hit: previousProgress > progress,
//     progress,
//   };
// };

// callback: (phase: number, beat: boolean) => void;

// const getCycle = ({
//   frequency,
//   phaseOffset,
//   ticker,
// }: {
//   frequency: number;
//   phaseOffset?: number;
//   ticker?: Ticker;
// }) => {
//   let beat = false;
//   let phase = 0;

//   const ms = new Date().getTime();
//   phase = ((ms / 1000 / 60) * frequency) % 1;
//   if (ticker) {
//     const prevMs = ms - ticker.deltaMS;
//     const previousPhase = ((prevMs / 1000 / 60) * frequency) % 1;
//     beat = previousPhase > phase;
//   }

//   return { beat, phase };
// };

// const onCycleBeat = (
//   callback: () => any,
//   frequency: number,
//   phaseOffset?: number
// ) => {
//   const cycle = getCycle({
//     frequency,
//     phaseOffset,
//   });
//   if (cycle.beat) {
//     callback();
//   }
// };

// const onCyclePhase = (
//   callback: (phase: number) => any,
//   frequency: number,
//   phaseOffset?: number
// ) => {
//   const cycle = getCycle({
//     frequency,
//     phaseOffset,
//   });
//   callback(cycle.phase);
// };

const startPixi = async () => {
  const app = new Application();
  await app.init({ background: "black", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  Assets.addBundle("fonts", [
    { alias: "EditUndo", src: "/assets/editundo.woff" },
  ]);
  await Assets.loadBundle("fonts");

  const scanLine1 = createScanLine({ app });

  // Create concentric triangles
  const triangles: ReturnType<typeof createPolygon>[] = _.times(
    15,
    (i: number) => {
      const shape = createPolygon({ app });
      shape.container.scale = 0.001 * Math.pow(2, i);
      return shape;
    }
  );

  // Create concentric triangles
  const circles: ReturnType<typeof createCircle>[] = _.times(
    15,
    (i: number) => {
      const shape = createCircle({ app });
      shape.container.scale = 0.001 * Math.pow(2, i);
      return shape;
    }
  );

  // Create text logs
  const n = new Container();
  app.stage.addChild(n);
  const n1 = new Text({ style: textStyle });
  n.addChild(n1);
  const n2 = new Text({ style: textStyle, y: 20 });
  n.addChild(n2);
  const n3 = new Text({ style: textStyle, y: 40 });
  n.addChild(n3);
  const n4 = new Text({ style: textStyle, y: 60 });
  n.addChild(n4);

  // Create audio elements
  const synth = new Tone.Synth().toDestination();
  // const tremolo = new Tone.Tremolo(100, 0.1).toDestination();
  // const oscillator = new Tone.FatOscillator("B1", "triangle", 20).connect(
  //   tremolo
  // );

  // const audioSwitch = createAudioSwitch({
  //   enabled: false, // Some contexts will require user interaction
  //   start: () => {
  //     oscillator.start();
  //   },
  //   stop: () => {
  //     oscillator.stop();
  //   },
  // });

  const audioSwitch = createAudioSwitch();

  app.ticker.add((ticker: Ticker) => {
    // const ms = new Date().getTime();
    // const s = ms / 1000;
    // const m = getTickerMetronome({ ticker, bpm: 1000 });

    // onCyclePhase(p => {
    //   n1.text = p;
    // }, 1000);

    // const cm = new cycleManager({ ticker });
    // cm.withCyclePhase({ frequency: 2 }, p => {
    //   n1.text = p;
    // });
    // cm.onCycleBeat({ frequency: 2 }, () => {
    //   n2.text = new Date().toISOString();
    //   synth.triggerAttackRelease("G2", 0.1);
    // });

    withCyclePhase({ frequency: 2 }, p => {
      n1.text = p;
    });
    onCycleBeat({ frequency: 2, ticker }, () => {
      n2.text = new Date().toISOString();
      triangles[10].graphics.stroke({ color: "white" });
      if (audioSwitch.enabled) {
        synth.triggerAttackRelease("G2", 0.1);
      }
    });
    onCycleBeat({ frequency: 2, offset: 0.25, ticker }, () => {
      if (audioSwitch.enabled) {
        synth.triggerAttackRelease("G3", 0.1);
      }
    });
    onCycleBeat({ frequency: 2, offset: 0.5, ticker }, () => {
      if (audioSwitch.enabled) {
        synth.triggerAttackRelease("G4", 0.1);
      }
    });

    // Logs
    // n1.text = m.notes.x4.progress;
    // n2.text = m.notes.x2.progress;
    // n3.text = m.notes.x1.progress;
    // n4.text = m.notes.f2.progress;

    // Scalar animations
    scanLine1.update.linear();
    triangles.forEach((triangle, i) => {
      // triangle.container.rotation += ticker.deltaMS / (2000 + i * 500);
      withCyclePhase({ frequency: 2 / (32 + i) }, p => {
        triangle.container.rotation = p * Math.PI * 2;
      });
    });

    // todo
    // onCycle(({ phase, beat }) => {}, 240, 1 / 4);
    // onCycleBeat(() => {}, 240, 1 / 4);
    // onCyclePhase((phase) => {}, 240, 1 / 4);

    // if (audioSwitch.enabled) {
    //   if (m.notes.x32.hit) {
    //     // synth.triggerAttackRelease("G2", 0.1);
    //     // oscillator.frequency.rampTo("B1", 3);
    //   } else if (m.notes.x16.hit) {
    //     // synth.triggerAttackRelease("G2", 0.1);
    //     // oscillator.frequency.rampTo("C2", 3);
    //   } else if (m.notes.x8.hit) {
    //     // synth.triggerAttackRelease("G2", 0.1);
    //     // oscillator.frequency.rampTo("G2", 3);
    //   } else if (m.notes.x1.hit) {
    //     // synth.triggerAttackRelease("G2", 0.1);
    //     // oscillator.frequency.rampTo("G2", 3);
    //   } else if (m.notes.f8.hit) {
    //     // synth.triggerAttackRelease("G3", 0.1)
    //     // oscillator.frequency.rampTo("G2", 3);
    //   }
    // }
  });
};

startPixi();
