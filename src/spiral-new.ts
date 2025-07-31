import _ from "lodash";
import * as Pixi from "pixi.js";
import * as Tone from "tone";
import * as utils from "./utils";

const { ss } = utils;

(async () => {
  // Create audio elements
  const synth = new Tone.Synth().toDestination();
  const tremolo = new Tone.Tremolo(100, 0.1).toDestination();
  const oscillator = new Tone.FatOscillator("B1", "triangle", 20).connect(
    tremolo
  );

  // Setup app
  const { app, audioSwitch, logs } = await utils.createApp({
    audio: {
      start: () => {
        oscillator.start();
      },
      stop: () => {
        oscillator.stop();
      },
    },
  });

  // Create concentric shapes
  const circles = _.times(200, (i: number) => {
    // Build object tree
    const container = new Pixi.Container();
    app.stage.addChild(container);
    const graphics = new Pixi.Graphics();
    container.addChild(graphics);

    // Setup drawing
    const draw = () => {
      container.x = app.screen.width / 2;
      container.y = app.screen.height / 2;

      graphics.clear();
      graphics.circle(0, i * 2, i * 5);
      graphics.stroke({ ...ss.stroke, width: i / 60, pixelLine: false });
    };
    draw();
    window.addEventListener("resize", draw);

    return {
      container,
      graphics,
    };
  });

  app.ticker.add((ticker: Pixi.Ticker) => {
    // Audio adjustments
    utils.onCycleBeat({ frequency: 1 / 8, ticker }, () => {
      oscillator.frequency.rampTo("B1", 0.1);
    });
    utils.onCycleBeat({ frequency: 1 / 8, offset: 0.5, ticker }, () => {
      oscillator.frequency.rampTo("D2", 0.1);
    });

    // Audio triggers
    // if (audioSwitch.enabled) {
    //   utils.onCycleBeat({ frequency: 2, ticker }, () => {
    //     logs[2](new Date().toISOString());
    //     synth.triggerAttackRelease("G2", 0.1);
    //   });
    // }

    // rotate shapes
    circles.forEach((circle, i) => {
      utils.withCyclePhase(
        { frequency: 1 / 128, offset: i / circles.length },
        p => {
          circle.container.rotation = p * Math.PI * 2;
        }
      );
    });
  });
})();
