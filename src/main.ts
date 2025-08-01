import * as Pixi from "pixi.js";
import * as Tone from "tone";
import * as utils from "./utils";

(async () => {
  // Setup global app & utilities
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
  const star = utils.createStar({ points: 5, radius: 100 });
  root.addChild(star);

  // Add child elements to the star - positioned at exact radii
  const starChild1 = utils.createPoly({ points: 3, radius: 30 });
  star.addChild(starChild1);
  const starChild2 = utils.createPoly({ points: 4, radius: 50 });
  star.addChild(starChild2);

  const circle = utils.createCircle({ radius: 200 });
  root.addChild(circle);

  // Add child elements to the circle - positioned at exact radii
  const circleChild1 = utils.createStar({ points: 3, radius: 30 });
  circle.addChild(circleChild1);
  const circleChild2 = utils.createPoly({ points: 6, radius: 60 });
  circle.addChild(circleChild2);

  const hexagon = utils.createPoly({ points: 6, radius: 300 });
  root.addChild(hexagon);

  // Add child elements to the hexagon - positioned at exact radii
  const hexChild1 = utils.createCircle({ radius: 40 });
  hexagon.addChild(hexChild1);
  const hexChild2 = utils.createStar({ points: 4, radius: 70 });
  hexagon.addChild(hexChild2);

  // Create audio elements
  const synth = new Tone.Synth().toDestination();
  const oscillator = new Tone.Oscillator("B1", "triangle").toDestination();

  // Create drum-like sounds with smoother settings
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.8,
    octaves: 1,
    oscillator: { type: "sine" },
    envelope: { decay: 0.4, sustain: 0.1, release: 0.8 },
  }).toDestination();

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { decay: 0.2, sustain: 0.1, release: 0.4 },
  }).toDestination();

  const hihat = new Tone.MetalSynth({
    envelope: { attack: 0.01, decay: 0.1, release: 0.2 },
  }).toDestination();

  // Set very low volumes
  kick.volume.value = -30;
  snare.volume.value = -35;
  hihat.volume.value = -40;
  oscillator.volume.value = -25;

  // Manipulate elements according to the high-performance timestamp each frame
  app.ticker.add((ticker: Pixi.Ticker) => {
    const ms = performance.now();

    // Rotate the star smoothly with dramatic scaling
    star.rotation = ms / 1000;
    star.scale.set(Math.sin(ms / 2000) * 0.5 + 1);

    // Animate star children
    starChild1.rotation = -ms / 1500;
    starChild2.rotation = ms / 2500;
    starChild1.scale.set(Math.sin(ms / 1200) * 0.3 + 1);

    // Rotate the circle at a different speed with dramatic opacity pulsing
    circle.rotation = -ms / 2000;
    circle.alpha = Math.sin(ms / 1500) * 0.6 + 0.4;

    // Animate circle children
    circleChild1.rotation = ms / 1800;
    circleChild2.rotation = -ms / 2200;
    circleChild1.scale.set(Math.cos(ms / 1000) * 0.4 + 1);

    // Rotate the hexagon at a third speed
    hexagon.rotation = ms / 3000;

    // Animate hexagon children
    hexChild1.rotation = -ms / 1600;
    hexChild2.rotation = ms / 2800;
    hexChild1.scale.set(Math.sin(ms / 900) * 0.2 + 1);

    // Deep beats and low hums only
    if (audioSwitch.enabled) {
      // Deep kick on star scale peaks
      if (Math.sin(ms / 2000) > 0.95) {
        kick.triggerAttackRelease("C0", 0.3);
      }

      // Low hum that follows the overall movement
      oscillator.frequency.value = Math.abs(Math.sin(ms / 4000)) * 40 + 30;
    }

    // Play a sound on beat
    utils.onCycleBeat({ frequency: 2, offset: 0.25, ticker }, () => {
      if (audioSwitch.enabled) {
        // synth.triggerAttackRelease("G3", 0.1);
      }
    });
  });
})();
