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
 * This is a top-level utility shape that has it's own build and re-position draw routines.
 */
export const createCircle = ({
  app,
  container: parentContainer,
  radius = 100,
}: {
  app: Application;
  container?: Container;
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

/**
 * Creates a polygon of a specific radius.
 * The points will connect in a convex way, creating shapes like a triangle or hexagon.
 * This is a top-level utility shape that has it's own build and re-position draw routines.
 */
export const createPolygon = ({
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
