import * as Pixi from "pixi.js";
import * as utils from "./utils";

(async () => {
  // Create audio instruments for plucking tones

  // Create ambient audio tones

  // Setup global app & utilities
  const { app, audioSwitch, logs } = await utils.createApp();

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

  // Manipulate elements according to the high-performance timestamp each frame
  app.ticker.add((ticker: Pixi.Ticker) => {
    const ms = performance.now();
  });
})();
