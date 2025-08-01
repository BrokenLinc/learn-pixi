import _ from "lodash";
import * as Pixi from "pixi.js";
import { ss } from ".";

/**
 * Creates a series of on-screen debugging logs.
 * This is just a vertical stack of text elements that are easy to update.
 */
export const createLogs = ({
  app,
  count,
}: {
  app: Pixi.Application;
  /* The number of logs desired */
  count: number;
}) => {
  // Create the main container
  const container = new Pixi.Container();
  app.stage.addChild(container);

  // Create as many logs as desired, in a vertical stack.
  const logs = _.times(count, i => {
    const text = new Pixi.Text({ style: ss.text, y: i * 20 });
    container.addChild(text);
    // Return a function that updates this log element's text.
    return (message: any) => {
      text.text = message;
    };
  });

  // Return the array of updater functions
  return logs;
};
