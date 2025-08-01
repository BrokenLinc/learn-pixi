import * as Pixi from "pixi.js";
import * as Tone from "tone";
import * as utils from "./utils";

/**
 * This example file can be used as a project resource showing common concepts.
 */
(async () => {
  // Create audio instruments for plucking tones
  const synth = new Tone.Synth().toDestination();

  // Create ambient audio tones
  const oscillator = new Tone.Oscillator("B1", "triangle").toDestination();

  // Setup global app & utilities
  // Control ambient audio when user enables/disables sound
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

  // Create a root container that remains centered on the screen
  const root = new Pixi.Container();
  app.stage.addChild(root);
  const position = () => {
    root.x = app.screen.width / 2;
    root.y = app.screen.height / 2;
  };
  window.addEventListener("resize", position);
  position();

  // Build out the tree of visual objects
  const myStar = utils.createStar({ points: 5, radius: 100 });
  root.addChild(myStar);

  // Manipulate elements according to the high-performance timestamp each frame
  app.ticker.add((ticker: Pixi.Ticker) => {
    const ms = performance.now();
    // ex: rotate smoothly
    myStar.rotation = ms / 1000;
    // ex: play a sound on a beat
    utils.onCycleBeat({ frequency: 2, offset: 0.25, ticker }, () => {
      // For pluckable instruments, check audio state before playing
      if (audioSwitch.enabled) {
        synth.triggerAttackRelease("G3", 0.1);
      }
    });
    // ex: modulate an ambient tone
    oscillator.frequency.value = Math.abs(Math.sin(ms / 40)) * 80 + 20;
    // ex: updating an on-screen log message
    logs[1](`Timestamp: ${Math.round(ms)}`);
  });
})();
