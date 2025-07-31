import _ from "lodash";
import * as Pixi from "pixi.js";
import * as utils from "./utils";

const { ss } = utils;

(async () => {
  // Setup app
  const { app, audioSwitch, logs } = await utils.createApp();

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

  app.ticker.add((ticker: Pixi.Ticker) => {});
})();
