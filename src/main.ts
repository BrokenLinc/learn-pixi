import * as Pixi from "pixi.js";
import * as utils from "./utils";

(async () => {
  // Create audio instruments for plucking tones

  // Create ambient audio tones

  // Setup global app & utilities
  const { app, audioSwitch, logs } = await utils.createApp();

  // Create synth sound for sonar pulses
  // Note: Always check audioSwitch.enabled before playing sounds
  const synth = utils.createSynthSound();

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
  const radarSweep = utils.createRadarSweep({
    app,
    color: 0x44ffdd,
    lineWidth: 2,
    rotationSpeed: 0.5, // Rotate at 0.5 radians per second
  });

  // Create multiple pulsars using polar coordinate grid with random snapping
  const pulsars = Array.from({ length: 50 }, () => {
    // Random angle that gets snapped to nearest 64th division
    const randomAngle = Math.random() * Math.PI * 2; // Random angle 0 to 2π
    const angleStep = (Math.PI * 2) / 64; // 64 divisions around full circle
    const snappedAngle = Math.round(randomAngle / angleStep) * angleStep; // Snap to nearest division

    // Random radius between 50 and 300 pixels
    const radius = 50 + Math.random() * 250;

    // Convert polar to cartesian coordinates
    const x = Math.cos(snappedAngle) * radius;
    const y = Math.sin(snappedAngle) * radius;

    return utils.createPulsar({
      app,
      color: 0xff4444,
      radius: 4,
      x,
      y,
    });
  });

  // Track radar rotation for delta-based detection
  let lastRadarRotation = 0;

  // Manipulate elements according to the high-performance timestamp each frame
  app.ticker.add((ticker: Pixi.Ticker) => {
    const ms = performance.now();

    // Update radar sweep rotation
    radarSweep.update({ ms });

    // Calculate current and previous radar rotations using delta time
    const currentRotation = (ms / 1000) * 0.5; // Match the rotation speed
    const previousRotation = lastRadarRotation;

    // Normalize all angles to 0-2π range for consistent comparison
    const normalizeAngle = (angle: number) => {
      let normalized = angle % (Math.PI * 2);
      if (normalized < 0) normalized += Math.PI * 2;
      return normalized;
    };

    const normalizedPrevious = normalizeAngle(previousRotation);
    const normalizedCurrent = normalizeAngle(currentRotation);

    // Check all pulsars for radar detection
    let detectedCount = 0;
    pulsars.forEach((pulsar, index) => {
      const pulsarAngle = pulsar.getAngle();
      const normalizedPulsar = normalizeAngle(pulsarAngle);

      // Check if radar sweep passed over the pulsar between frames
      let isPulsarBetween = false;

      if (normalizedCurrent >= normalizedPrevious) {
        // Normal case: radar moved forward
        isPulsarBetween =
          normalizedPulsar >= normalizedPrevious &&
          normalizedPulsar <= normalizedCurrent;
      } else {
        // Wraparound case: radar crossed from 2π back to 0
        isPulsarBetween =
          normalizedPulsar >= normalizedPrevious ||
          normalizedPulsar <= normalizedCurrent;
      }

      // Play sound if radar passed over the pulsar
      if (isPulsarBetween) {
        // Calculate frequency based on distance (closer = higher frequency)
        const distance = pulsar.getDistance();
        const maxDistance = Math.sqrt(
          Math.pow(app.screen.width / 2, 2) + Math.pow(app.screen.height / 2, 2)
        );
        // Map distance to frequency: 50px = 1200Hz, maxDistance = 200Hz
        const frequency = 1200 - (distance / maxDistance) * 1000;

        // Only play sound if audio is enabled
        if (audioSwitch.enabled) {
          synth.playSonarPulse(frequency);
        }

        detectedCount++;
        console.log(
          `Pulsar ${index} detected! Distance: ${distance.toFixed(0)}px, Frequency: ${frequency.toFixed(0)}Hz, Previous: ${normalizedPrevious.toFixed(3)}, Current: ${normalizedCurrent.toFixed(3)}, Pulsar: ${normalizedPulsar.toFixed(3)}`
        );
      }
    });

    if (detectedCount > 0) {
      console.log(`Total pulsars detected this frame: ${detectedCount}`);
    }

    lastRadarRotation = currentRotation;
  });
})();
