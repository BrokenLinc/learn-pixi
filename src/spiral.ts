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
import { createAudioSwitch } from "./utils/audio";
import { onCycleBeat, withCyclePhase } from "./utils/cycle";

const strokeStyle = { color: 0x44ffdd, pixelLine: true };
const textStyle = { fontFamily: "EditUndo", fontSize: 13.9, fill: 0xff44dd };

const startPixi = async () => {
  const app = new Application();
  await app.init({ background: "black", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  Assets.addBundle("fonts", [
    { alias: "EditUndo", src: "/assets/editundo.woff" },
  ]);
  await Assets.loadBundle("fonts");

  // const scanLine1 = createScanLine({ app });

  // Create concentric triangles
  // const triangles: ReturnType<typeof createPolygon>[] = _.times(
  //   15,
  //   (i: number) => {
  //     const shape = createPolygon({ app });
  //     shape.container.scale = 0.001 * Math.pow(2, i);
  //     return shape;
  //   }
  // );

  // Create concentric triangles
  const circles = _.times(200, (i: number) => {
    // Build object tree
    const container = new Container();
    app.stage.addChild(container);
    const graphics = new Graphics();
    container.addChild(graphics);

    // Setup drawing
    const draw = () => {
      container.x = app.screen.width / 2;
      container.y = app.screen.height / 2;

      graphics.clear();
      graphics.circle(0, i * 2, i * 5);
      graphics.stroke({ ...strokeStyle, width: i / 60, pixelLine: false });
    };
    draw();
    window.addEventListener("resize", draw);

    return {
      container,
      graphics,
    };
  });

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
  const tremolo = new Tone.Tremolo(100, 0.1).toDestination();
  const oscillator = new Tone.FatOscillator("B1", "triangle", 20).connect(
    tremolo
  );

  const audioSwitch = createAudioSwitch({
    start: () => {
      oscillator.start();
    },
    stop: () => {
      oscillator.stop();
    },
  });

  // const audioSwitch = createAudioSwitch();

  // let waveCount = 0;

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

    onCycleBeat({ frequency: 1 / 8, ticker }, () => {
      // if (waveCount < 4) {
      // oscillator.frequency.rampTo("B" + (waveCount + 2), 0.1);
      // }
      oscillator.frequency.rampTo("B1", 0.1);
    });
    onCycleBeat({ frequency: 1 / 8, offset: 0.5, ticker }, () => {
      // if (waveCount < 4) {
      // oscillator.frequency.rampTo("B1", 0.1);
      // }
      oscillator.frequency.rampTo("D2", 0.1);
      // waveCount = (waveCount + 1) % 5;
    });

    withCyclePhase({ frequency: 2 }, p => {
      n1.text = p;
      // n2.text = waveCount;
    });

    circles.forEach((circle, i) => {
      withCyclePhase({ frequency: 1 / 128, offset: i / circles.length }, p => {
        circle.container.rotation = p * Math.PI * 2;
        // circle.graphics.stroke({ color: "white", width: 1 });
      });
    });

    // onCycleBeat({ frequency: 2, ticker }, () => {
    //   n2.text = new Date().toISOString();
    //   triangles[10].graphics.stroke({ color: "white" });
    //   if (audioSwitch.enabled) {
    //     synth.triggerAttackRelease("G2", 0.1);
    //   }
    // });
    // onCycleBeat({ frequency: 2, offset: 0.25, ticker }, () => {
    //   if (audioSwitch.enabled) {
    //     synth.triggerAttackRelease("G3", 0.1);
    //   }
    // });
    // onCycleBeat({ frequency: 2, offset: 0.5, ticker }, () => {
    //   if (audioSwitch.enabled) {
    //     synth.triggerAttackRelease("G4", 0.1);
    //   }
    // });

    // Logs
    // n1.text = m.notes.x4.progress;
    // n2.text = m.notes.x2.progress;
    // n3.text = m.notes.x1.progress;
    // n4.text = m.notes.f2.progress;

    // Scalar animations
    // scanLine1.update.linear();
    // triangles.forEach((triangle, i) => {
    //   // triangle.container.rotation += ticker.deltaMS / (2000 + i * 500);
    //   withCyclePhase({ frequency: 2 / (32 + i) }, p => {
    //     triangle.container.rotation = p * Math.PI * 2;
    //   });
    // });

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
