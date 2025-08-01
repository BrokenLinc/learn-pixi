import * as Pixi from "pixi.js";
import * as utils from ".";

const { ss } = utils;

/**
 * Create a Pixi Application with some sensible defaults and some common utilities.
 */
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
  // Create the app and attach it to the document
  const app = new Pixi.Application();
  await app.init({ background: "black", resizeTo: window, ...application });
  document.getElementById(embedElementId)!.appendChild(app.canvas);

  // Preload standard font assets
  Pixi.Assets.addBundle("fonts", ss.font);
  await Pixi.Assets.loadBundle("fonts");

  // Create a few debugging logs on screen
  const logs = utils.createLogs({ app, count: 4 });

  // Add a manual audio toggle
  const audioSwitch = utils.createAudioSwitch(audio);

  // Fire the optional callback
  onSetup?.({ app });

  return {
    app,
    audioSwitch,
    logs,
  };
};
