import {
  Application,
  Assets,
  Container,
  Graphics,
  Text,
  TextStyle,
  Ticker,
} from "pixi.js";
import * as Tone from "tone";
// import SilkScreenFont from "../public/assets/slkscre.ttf";

const strokeStyle = { color: 0x44ffdd, pixelLine: true };
const textStyle: Partial<TextStyle> = {
  // fontFamily: "Micro 5",
  fontFamily: "EditUndo",
  fontSize: 13.9,
  // fill: 0xff44dd,
  fill: 0xffffff,
};

const createAudioSwitch = () => {
  const state = {
    enabled: false,
  };
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "m") {
      state.enabled = !state.enabled;
    }
  });

  return state;
};

const startPixi = async () => {
  Assets.addBundle("fonts", [
    // {
    //   alias: "ChaChicle",
    //   src: "https://pixijs.com/assets/webfont-loader/ChaChicle.ttf",
    // },
    // {
    //   alias: "Lineal",
    //   src: "https://pixijs.com/assets/webfont-loader/Lineal.otf",
    // },
    // {
    //   alias: "Dotrice Regular",
    //   src: "https://pixijs.com/assets/webfont-loader/Dotrice-Regular.woff",
    // },
    // {
    //   alias: "Crosterian",
    //   src: "https://pixijs.com/assets/webfont-loader/Crosterian.woff2",
    // },
    // {
    //   alias: "SilkScreen",
    //   // src: "/assets/slkscre.ttf",
    //   src: "/assets/edunline.ttf",
    // },
    {
      alias: "Micro 5",
      src: "/assets/Micro5-Regular.ttf",
    },
    { alias: "EditUndo", src: "/assets/editundo.woff" },
  ]);
  await Assets.loadBundle("fonts");

  const app = new Application();
  await app.init({ background: "#000000", resizeTo: window, antialias: false });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const audio = createAudioSwitch();
  const synth = new Tone.Synth().toDestination();

  const mainContainer = new Container();
  app.stage.addChild(mainContainer);

  const lineContainer = new Container();
  mainContainer.addChild(lineContainer);

  const graphics = new Graphics()
    .moveTo(-2200 / 2, 0)
    .lineTo(2200 / 2, 0)
    .stroke(strokeStyle);
  const basicText = new Text({
    text: "0",
    style: textStyle,
  });
  graphics.addChild(basicText);
  lineContainer.addChild(graphics);

  const circleContainer = new Container();
  mainContainer.addChild(circleContainer);

  const circles: { graphics: Graphics; scanRotation: number; size: number }[] =
    [];
  for (let i = 0; i < 200; i++) {
    const x = (Math.random() - 0.5) * app.screen.width;
    const y = (Math.random() - 0.5) * app.screen.height;
    const scanRotation = (Math.atan2(y, x) + Math.PI) % Math.PI;
    const size = Math.random() * 40 + 1;
    const graphics = new Graphics().circle(x, y, size).stroke(strokeStyle);
    const basicText = new Text({
      x: x + 10,
      y: y - 5,
      text: [Math.round(x), Math.round(y), scanRotation.toFixed(2)].join(", "),
      style: textStyle,
      textureStyle: {
        scaleMode: "nearest",
      },
    });
    circleContainer.addChild(graphics);
    graphics.addChild(basicText);
    circles.push({
      graphics,
      scanRotation: Math.atan2(y, x),
      size,
    });
  }

  app.ticker.add((time: Ticker) => {
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    mainContainer.x = app.screen.width / 2;
    mainContainer.y = app.screen.height / 2;
    const scanRotation =
      (lineContainer.rotation + 0.005 * time.deltaTime) % Math.PI;
    lineContainer.rotation = scanRotation;
    circles.forEach(circle => {
      const prevAlpha = circle.graphics.alpha;
      const scanProgress =
        ((lineContainer.rotation - circle.scanRotation + Math.PI) % Math.PI) /
        Math.PI;
      circle.graphics.alpha = 1 - scanProgress;
      // circle.graphics.angle = -scanProgress * 100;
      if (circle.graphics.alpha > prevAlpha && audio.enabled) {
        synth?.triggerAttackRelease(
          circle.size * 50 + 100,
          // String.fromCharCode(circle.size + 65) + 5,
          0.1
        );
      }
    });
    basicText.text = lineContainer.rotation.toFixed(2);
  });
};

startPixi();
