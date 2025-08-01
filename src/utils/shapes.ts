import { Application, Container, Graphics, Text } from "pixi.js";

const strokeStyle = { color: 0x44ffdd, pixelLine: true };
const textStyle = { fontFamily: "EditUndo", fontSize: 13.9, fill: 0xff44dd };

/**
 * Creates a pixel line that moves down the screen. over time, the restarts at the top.
 * This is a top-level utility shape that has it's own build, re-position, and draw routines.
 */
export const createScanLine = ({
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

/**
 * Creates a circle of a specific radius.
 * This is a simple shape that can be appended to any other node by the caller.
 */
export const createCircle = ({
  radius = 100,
}: {
  radius?: number;
} = {}) => {
  const graphics = new Graphics();

  const draw = () => {
    graphics.clear();
    graphics.circle(0, 0, radius);
    graphics.stroke(strokeStyle);
  };
  draw();

  return graphics;
};

/**
 * Creates a polygon of a specific radius.
 * The points will connect in a convex way, creating shapes like a triangle or hexagon.
 * This is a simple shape that can be appended to any other node by the caller.
 */
export const createPoly = ({
  points = 3,
  radius = 100,
}: {
  points?: number;
  radius?: number;
} = {}) => {
  const graphics = new Graphics();

  const draw = () => {
    graphics.clear();
    for (let i = 0; i <= points; i++) {
      // This math positions the "poly" points in the correct sequence.
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

  return graphics;
};

/**
 * Creates a star of a specific radius.
 * The points will connect in a concave way, creating pointy stars with overlapping lines.
 * This is a utility shape that has it's own build and re-position draw routines.
 */
export const createStar = ({
  points = 5,
  radius = 100,
  color = 0x44ffdd,
}: {
  points?: number;
  radius?: number;
  color?: number;
} = {}) => {
  const graphics = new Graphics();

  const draw = () => {
    graphics.clear();
    for (let i = 0; i <= points; i++) {
      // This math positions the "star" points in the correct sequence.
      const degree = (i / points) * Math.PI * (points - 1);
      const x = Math.cos(degree) * radius;
      const y = Math.sin(degree) * radius;
      if (i == 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.stroke({ color, pixelLine: true });
  };
  draw();

  return graphics;
};

/**
 * Creates a wreath of a specific radius.
 * The points will connect in an braided way, creating shapes that look like a wreath.
 * This is a utility shape that has it's own build and re-position draw routines.
 */
export const createWreath = ({
  points = 5,
  radius = 100,
}: {
  points?: number;
  radius?: number;
} = {}) => {
  const graphics = new Graphics();

  const draw = () => {
    graphics.clear();
    for (let i = 0; i <= points; i++) {
      // This math positions the "wreath" points in the correct sequence.
      const degree = (i / points) * Math.PI * 4;
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

  return graphics;
};

/**
 * Creates a radar sweep animation with a rotating line from the center.
 * The line extends beyond the screen bounds and rotates clockwise.
 * This is a utility shape that has it's own build and update routines.
 */
export const createRadarSweep = ({
  app,
  container: parentContainer,
  color = 0x44ffdd,
  lineWidth = 2,
  rotationSpeed = 0.5, // radians per second
}: {
  app: Application;
  container?: Container;
  color?: number;
  lineWidth?: number;
  rotationSpeed?: number;
}) => {
  // Build object tree
  const container = new Container();
  (parentContainer || app.stage).addChild(container);
  const graphics = new Graphics();
  container.addChild(graphics);

  // Calculate the maximum distance the line needs to extend
  const maxDistance = Math.sqrt(
    Math.pow(app.screen.width / 2, 2) + Math.pow(app.screen.height / 2, 2)
  );

  // Setup drawing
  const draw = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    graphics.clear();
    // Draw a line from center (0,0) to the maximum distance
    graphics.moveTo(0, 0).lineTo(maxDistance, 0).stroke({
      color,
      width: lineWidth,
      pixelLine: true,
    });
  };
  draw();
  window.addEventListener("resize", draw);

  // Time-based rotation
  const update = ({ ms = performance.now() }: { ms?: number } = {}) => {
    // Convert milliseconds to seconds and apply rotation speed
    const rotation = (ms / 1000) * rotationSpeed;
    graphics.rotation = rotation;
  };

  return {
    container,
    graphics,
    update,
  };
};

/**
 * Creates a pulsar object - a simple dot at a random location on the screen.
 * This is a utility shape that can be detected by radar sweeps.
 */
export const createPulsar = ({
  app,
  container: parentContainer,
  color = 0xff4444,
  radius = 4,
  x,
  y,
}: {
  app: Application;
  container?: Container;
  color?: number;
  radius?: number;
  x?: number;
  y?: number;
}) => {
  // Build object tree
  const container = new Container();
  (parentContainer || app.stage).addChild(container);
  const graphics = new Graphics();
  container.addChild(graphics);

  // Generate random position within screen bounds if not provided
  const generateRandomPosition = () => {
    const x = (Math.random() - 0.5) * app.screen.width;
    const y = (Math.random() - 0.5) * app.screen.height;
    return { x, y };
  };

  // Setup drawing
  const draw = () => {
    const position =
      x !== undefined && y !== undefined ? { x, y } : generateRandomPosition();

    container.x = app.screen.width / 2 + position.x;
    container.y = app.screen.height / 2 + position.y;

    graphics.clear();
    graphics.circle(0, 0, radius).fill({ color });
  };
  draw();

  // Get the angle of this pulsar relative to center
  const getAngle = () => {
    const dx = container.x - app.screen.width / 2;
    const dy = container.y - app.screen.height / 2;
    return Math.atan2(dy, dx);
  };

  // Get the distance of this pulsar from center
  const getDistance = () => {
    const dx = container.x - app.screen.width / 2;
    const dy = container.y - app.screen.height / 2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Check if radar sweep is passing over this pulsar
  const isDetectedByRadar = (radarRotation: number, tolerance = 0.1) => {
    const pulsarAngle = getAngle();
    const angleDiff = Math.abs(radarRotation - pulsarAngle);
    // Normalize angle difference to handle wraparound
    const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
    return normalizedDiff < tolerance;
  };

  return {
    container,
    graphics,
    getAngle,
    getDistance,
    isDetectedByRadar,
    regeneratePosition: draw,
  };
};
