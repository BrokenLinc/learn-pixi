import { Application, Container, Graphics, Text, Ticker } from "pixi.js";

const strokeStyle = { color: 0x44ffdd, pixelLine: true };
const textStyle = { fontFamily: "Arial", fontSize: 8, fill: 0xff44dd };

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#000000", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // // Load the bunny texture
  // const texture = await Assets.load("/assets/bunny.png");

  // // Create a bunny Sprite
  // const bunny = new Sprite(texture);

  // // Center the sprite's anchor point
  // bunny.anchor.set(0.5);

  // // Move the sprite to the center of the screen
  // bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Create and add a container to the stage
  const container = new Container();

  app.stage.addChild(container);

  const lineContainer = new Container();

  container.addChild(lineContainer);

  // Create a Graphics object and draw a pixel-perfect line
  const graphics = new Graphics()
    .moveTo(-2200 / 2, 0)
    .lineTo(2200 / 2, 0)
    .stroke(strokeStyle);

  const basicText = new Text({
    text: "0",
    style: textStyle,
  });
  graphics.addChild(basicText);

  // Add it to the stage
  lineContainer.addChild(graphics);

  const circleContainer = new Container();

  container.addChild(circleContainer);

  const circles: { graphics: Graphics; scanRotation: number }[] = [];
  for (let i = 0; i < 200; i++) {
    const x = (Math.random() - 0.5) * window.screen.width;
    const y = (Math.random() - 0.5) * window.screen.height;
    const scanRotation = (Math.atan2(y, x) + Math.PI) % Math.PI;
    const graphics = new Graphics()
      .circle(x, y, Math.random() * 4 + 1)
      .stroke(strokeStyle);
    const basicText = new Text({
      x: x + 10,
      y: y - 5,
      text: [Math.round(x), Math.round(y), scanRotation.toFixed(2)].join(", "),
      style: textStyle,
    });
    circleContainer.addChild(graphics);
    graphics.addChild(basicText);
    circles.push({
      graphics,
      scanRotation: Math.atan2(y, x),
    });
  }

  // // Add the bunny to the stage
  // app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add((time: Ticker) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    lineContainer.rotation =
      (lineContainer.rotation + 0.005 * time.deltaTime) % Math.PI;
    circles.forEach(circle => {
      const scanProgress =
        ((lineContainer.rotation - circle.scanRotation + Math.PI) % Math.PI) /
        Math.PI;
      circle.graphics.alpha = 1 - scanProgress;
      // circle.graphics.angle = -scanProgress * 100;
    });
    basicText.text = lineContainer.rotation.toFixed(2);
  });
})();
