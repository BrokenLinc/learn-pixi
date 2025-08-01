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

  // Define pentatonic scale and radius mapping (stable across all pulsars)
  const pentatonicRatios = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // Major pentatonic: C, D, E, G, A
  const minRadius = 50;
  const maxRadius = 300;
  const baseRadius = minRadius;
  const radiusRange = maxRadius - minRadius;
  const pentatonicRadii = pentatonicRatios.map(
    ratio => baseRadius + (ratio - 1) * (radiusRange / 2)
  );

  // Create mapping from radius to pentatonic frequency
  const baseFrequency = 440; // A4 as base note
  const pentatonicFrequencies = pentatonicRatios.map(
    ratio => baseFrequency * ratio
  );

  // Function to get frequency from radius
  const getFrequencyFromRadius = (radius: number) => {
    // Find the closest pentatonic radius and return its corresponding frequency
    const closestIndex = pentatonicRadii.reduce(
      (closestIndex, currentRadius, index) =>
        Math.abs(currentRadius - radius) <
        Math.abs(pentatonicRadii[closestIndex] - radius)
          ? index
          : closestIndex,
      0
    );
    return pentatonicFrequencies[closestIndex];
  };

  // Create multiple pulsars using polar coordinate grid with pentatonic radius selection
  const pulsars = Array.from({ length: 50 }, () => {
    // Random angle that gets snapped to nearest 64th division
    const randomAngle = Math.random() * Math.PI * 2; // Random angle 0 to 2π
    const angleStep = (Math.PI * 2) / 64; // 64 divisions around full circle
    const snappedAngle = Math.round(randomAngle / angleStep) * angleStep; // Snap to nearest division

    // Randomly select from pentatonic radii
    const selectedRadius =
      pentatonicRadii[Math.floor(Math.random() * pentatonicRadii.length)];

    // Convert polar to cartesian coordinates
    const x = Math.cos(snappedAngle) * selectedRadius;
    const y = Math.sin(snappedAngle) * selectedRadius;

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
        // Get frequency from pentatonic scale based on radius
        const distance = pulsar.getDistance();
        const frequency = getFrequencyFromRadius(distance);

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
