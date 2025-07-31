import * as Pixi from "pixi.js";
import * as utils from ".";

const { ss } = utils;

export const createApp = async ({
  application,
  audio,
  embedElementId = "pixi-container",
  onSetup,
}: {
  application?: Partial<Pixi.ApplicationOptions>;
  audio?: utils.AudioSwitchParams;
  embedElementId?: string;
  onSetup?: (params: { app: Pixi.Application }) => any;
} = {}) => {
  const app = new Pixi.Application();
  await app.init({ background: "black", resizeTo: window, ...application });
  document.getElementById(embedElementId)!.appendChild(app.canvas);

  Pixi.Assets.addBundle("fonts", ss.font);
  await Pixi.Assets.loadBundle("fonts");

  const logs = utils.createLogs({ app, count: 4 });

  const audioSwitch = utils.createAudioSwitch(audio);

  onSetup?.({ app });

  return {
    app,
    audioSwitch,
    logs,
  };
};
