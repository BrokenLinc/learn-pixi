import * as Pixi from "pixi.js";
import * as utils from "./utils";

(async () => {
  // Create audio instruments for plucking tones

  // Create ambient audio tones

  // Setup global app & utilities
  const { app, audioSwitch, logs } = await utils.createApp();

  // Create audio sounds for different pulsar types
  // Note: Always check audioSwitch.enabled before playing sounds
  const synth = utils.createSynthSound();
  const bassDrum = utils.createBassDrumSound();
  const hiHat = utils.createHiHatSound();

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

  // Define pentatonic scale across multiple octaves for broader placement
  const pentatonicRatios = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // Major pentatonic: C, D, E, G, A
  const octaves = 3; // Cover 3 octaves for richer musical range

  // Create extended pentatonic scale across multiple octaves
  const extendedPentatonicRatios: number[] = [];
  for (let octave = 0; octave < octaves; octave++) {
    pentatonicRatios.forEach(ratio => {
      extendedPentatonicRatios.push(ratio * Math.pow(2, octave));
    });
  }

  const minRadius = 80;
  const maxRadius = 600; // Much larger radius range
  const baseRadius = minRadius;
  const radiusRange = maxRadius - minRadius;
  const pentatonicRadii = extendedPentatonicRatios.map(
    ratio =>
      baseRadius + (ratio - 1) * (radiusRange / (Math.pow(2, octaves) - 1))
  );

  // Create mapping from radius to pentatonic frequency across multiple octaves
  const baseFrequency = 440; // A4 as base note
  const pentatonicFrequencies = extendedPentatonicRatios.map(
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

  // Define pulsar configurations for different types
  const pulsarConfigs = [
    {
      name: "melody",
      count: 50,
      color: 0xff4444,
      radius: 4,
      angleDivisions: 64, // 1/64th divisions
      soundType: "synth",
      zIndex: 2, // Draw on top
      placement: "random" as const, // Random placement
    },
    {
      name: "bass",
      color: 0x4444ff,
      radius: 8,
      angleDivisions: 16, // 1/16th divisions
      soundType: "bass",
      zIndex: 0, // Draw underneath
      placement: "grid", // Grid-based placement
    },
    {
      name: "hihat",
      color: 0x44ff44,
      radius: 6,
      angleDivisions: 32, // 1/32nd divisions for more frequent hits
      soundType: "hihat",
      zIndex: 1, // Draw in middle
      placement: "grid", // Grid-based placement
    },
  ];

  // Create pulsars for all configurations
  const allPulsars: Array<{ pulsar: any; config: any }> = [];

  pulsarConfigs.forEach(config => {
    let pulsars: any[] = [];

    if (config.placement === "random" && config.count) {
      // Random placement for melody pulsars
      pulsars = Array.from({ length: config.count }, () => {
        // Random angle that gets snapped to nearest division
        const randomAngle = Math.random() * Math.PI * 2;
        const angleStep = (Math.PI * 2) / config.angleDivisions;
        const snappedAngle = Math.round(randomAngle / angleStep) * angleStep;

        // Randomly select from pentatonic radii
        const selectedRadius =
          pentatonicRadii[Math.floor(Math.random() * pentatonicRadii.length)];

        // Convert polar to cartesian coordinates
        const x = Math.cos(snappedAngle) * selectedRadius;
        const y = Math.sin(snappedAngle) * selectedRadius;

        return utils.createPulsar({
          app,
          color: config.color,
          radius: config.radius,
          x,
          y,
        });
      });
    } else if (config.placement === "grid") {
      // Grid-based placement for rhythmic pulsars with weighted randomness
      const angleStep = (Math.PI * 2) / config.angleDivisions;

      // For each 1/16th division, decide based on beat strength and pulsar type
      for (let index = 0; index < config.angleDivisions; index++) {
        let chance = 0.5; // default for weak beats

        if (config.soundType === "bass") {
          // Bass drum pattern - emphasis on beats 1, 3, 5, 7 (strong beats)
          if (index % 16 === 0) {
            chance = 1; // beat 1 (downbeat) - always hit
          } else if (index % 8 === 0) {
            chance = 0.98; // beats 3, 5, 7 (half notes) - very high chance
          } else if (index % 4 === 0) {
            chance = 0.5; // other quarter notes - lower chance
          } else if (index % 2 === 0) {
            chance = 0.1; // eighth notes - very low chance
          }
        } else if (config.soundType === "hihat") {
          // Hi-hat pattern - avoid beats 1, 3, 5, 7, emphasize off-beats
          // Now working with 32 divisions instead of 16
          if (index % 32 === 0) {
            chance = 0.01; // beat 1 (downbeat) - almost never hit
          } else if (index % 16 === 0) {
            chance = 0.02; // beats 3, 5, 7 (half notes) - very low chance
          } else if (index % 8 === 0) {
            chance = 0.05; // beats 2, 4, 6, 8 (quarter notes) - very high chance
          } else if (index % 4 === 0) {
            chance = 0.1; // eighth notes - high chance for texture
          } else if (index % 2 === 0) {
            chance = 0.2; // sixteenth notes - moderate chance for detail
          } else {
            chance = 0.4; // thirty-second notes - some chance for extra detail
          }
        }

        if (Math.random() < chance) {
          const angle = index * angleStep;
          // Randomly select from pentatonic radii
          const selectedRadius =
            pentatonicRadii[Math.floor(Math.random() * pentatonicRadii.length)];
          // Convert polar to cartesian coordinates
          const x = Math.cos(angle) * selectedRadius;
          const y = Math.sin(angle) * selectedRadius;
          pulsars.push(
            utils.createPulsar({
              app,
              color: config.color,
              radius: config.radius,
              x,
              y,
            })
          );
        }
      }
    }

    // Add to all pulsars with their config
    pulsars.forEach(pulsar => {
      allPulsars.push({ pulsar, config });
    });
  });

  // Sort by zIndex to ensure proper layering
  allPulsars.sort((a, b) => a.config.zIndex - b.config.zIndex);

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
    allPulsars.forEach(({ pulsar, config }, index) => {
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
        // Only play sound if audio is enabled
        if (audioSwitch.enabled) {
          if (config.soundType === "synth") {
            // Get frequency from pentatonic scale based on radius
            const distance = pulsar.getDistance();
            const frequency = getFrequencyFromRadius(distance);
            synth.playSonarPulse(frequency);
          } else if (config.soundType === "bass") {
            // Get frequency from pentatonic scale based on radius
            const distance = pulsar.getDistance();
            const frequency = getFrequencyFromRadius(distance);
            bassDrum.playBassDrum(frequency);
          } else if (config.soundType === "hihat") {
            // Get frequency from pentatonic scale based on radius
            const distance = pulsar.getDistance();
            const frequency = getFrequencyFromRadius(distance);
            hiHat.playHiHat(frequency);
          }
        }

        detectedCount++;
        console.log(
          `${config.name} pulsar ${index} detected! Distance: ${pulsar.getDistance().toFixed(0)}px, Previous: ${normalizedPrevious.toFixed(3)}, Current: ${normalizedCurrent.toFixed(3)}, Pulsar: ${normalizedPulsar.toFixed(3)}`
        );
      }
    });

    if (detectedCount > 0) {
      console.log(`Total pulsars detected this frame: ${detectedCount}`);
    }

    lastRadarRotation = currentRotation;
  });
})();
