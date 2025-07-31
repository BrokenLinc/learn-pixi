import * as Pixi from "pixi.js";
import * as utils from "./utils";

const { ss } = utils;

(async () => {
  const { app, audioSwitch, logs } = await utils.createApp();

  const root = new Pixi.Container();
  app.stage.addChild(root);

  // const triangle = utils.createPoly();
  // root.addChild(triangle);

  const star15 = utils.createStar({ points: 1299, radius: 1200 });
  root.addChild(star15);

  const star16 = utils.createStar({
    points: 299,
    radius: 240,
    color: 0x991155,
  });
  root.addChild(star16);

  // const star5 = utils.createStar({ points: 5 });
  // root.addChild(star5);

  app.ticker.add((ticker: Pixi.Ticker) => {
    const ms = performance.now();
    star15.rotation = ms / 100000;
    star16.rotation = ms / 100000;
  });

  const position = () => {
    root.x = app.screen.width / 2;
    root.y = app.screen.height / 2;
  };
  window.addEventListener("resize", position);
  position();
})();
