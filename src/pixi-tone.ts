import * as Pixi from "pixi.js";
import * as Tone from "tone";
import * as utils from "./utils";

const { ss } = utils;

export const createApp = async ({
  application,
  embedElementId = "pixi-container",
}: {
  application?: Partial<Pixi.ApplicationOptions>;
  embedElementId?: string;
} = {}) => {
  const app = new Pixi.Application();
  await app.init({ background: "black", resizeTo: window, ...application });
  document.getElementById(embedElementId)!.appendChild(app.canvas);

  Pixi.Assets.addBundle("fonts", ss.font);
  await Pixi.Assets.loadBundle("fonts");

  const logs = utils.createLogs({ app, count: 4 });

  return {
    app,
    logs,
  };
};

// Keep adding types here...
type PixiToneAudioNode =
  | Tone.Synth
  | Tone.FatOscillator
  | Tone.Tremolo
  | Tone.Gain
  | Tone.Vibrato
  | Tone.Oscillator;

type PixiTone<T extends PixiToneAudioNode> = {
  connect: <U extends PixiToneAudioNode>(pt: PixiTone<U>) => void;
  disconnect: <U extends PixiToneAudioNode>(pt: PixiTone<U>) => void;
  tone: T;
  // pixi: {
  container: Pixi.Container;
  // draw: () => void;
  // update: () => void;
  // };
  // x: number;
  // y: number;
};

const createPixiTone = <T extends PixiToneAudioNode>({
  tone,
  // parentContainer,
}: {
  tone: T;
  // parentContainer: Pixi.Container;
}): PixiTone<T> => {
  const container = new Pixi.Container();
  const graphics = new Pixi.Graphics();
  graphics.circle(0, 0, 10);
  graphics.stroke({ color: 0x44ffdd, pixelLine: true });
  container.addChild(graphics);
  // parentContainer.addChild(container);

  return {
    connect: <U extends PixiToneAudioNode>(pt: PixiTone<U>) => {
      tone.connect(pt.tone);
    },
    disconnect: <U extends PixiToneAudioNode>(pt: PixiTone<U>) => {
      tone.disconnect(pt.tone);
    },
    tone,
    // pixi: {
    container,
    // draw: () => {},
    // update: () => {},
    // },
    // x: 0,
    // y: 0,
  };
};

(async () => {
  const { app, logs } = await createApp();

  const root = new Pixi.Container();
  app.stage.addChild(root);

  // Create PixiTones
  const oscillator = createPixiTone({
    // tone: new Tone.FatOscillator("B1", "triangle", 20),
    tone: new Tone.Oscillator("B1", "triangle"),
  });
  const tremolo = createPixiTone({
    tone: new Tone.Tremolo(100, 0.1),
  });
  const vibrato = createPixiTone({
    tone: new Tone.Vibrato(100, 0.1),
  });
  const gain = createPixiTone({
    tone: new Tone.Gain(1),
  });

  // Attach visuals
  root.addChild(oscillator.container);
  root.addChild(vibrato.container);
  root.addChild(gain.container);

  // Connect audio
  oscillator.connect(vibrato);
  vibrato.connect(gain);
  gain.tone.toDestination();

  const audioSwitch = utils.createAudioSwitch({
    start: () => {
      oscillator.tone.start();
      // gain.tone.gain.rampTo(0, 1);
    },
    stop: () => {
      oscillator.tone.stop();
    },
  });

  // Setup drawing
  const draw = () => {
    root.x = app.screen.width / 2;
    root.y = app.screen.height / 2;
  };
  draw();
  window.addEventListener("resize", draw);

  app.ticker.add((ticker: Pixi.Ticker) => {
    const ms = performance.now();

    // Gain node
    const x = Math.sin(ms / 40);
    const y = Math.sin(ms / 4000);
    // gain.container.y = y * 100;
    // gain.tone.gain.value = 1 - Math.abs(y);
    oscillator.container.x = x * 250;
    // oscillator.tone.type = y > 1 ? "triangle" : "sine";
    oscillator.tone.frequency.value = Math.abs(x) * 80 + 20;
    vibrato.container.y = y * 350;
    vibrato.tone.depth.value = 1 - Math.abs(y);
    // tremolo.container.y = y * 250;
    // tremolo.tone.depth.value = Math.abs(y);
  });
})();
