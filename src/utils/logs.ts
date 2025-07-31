import _ from "lodash";
import * as Pixi from "pixi.js";
import { ss } from ".";

export const createLogs = ({
  app,
  count,
}: {
  app: Pixi.Application;
  count: number;
}) => {
  const container = new Pixi.Container();
  app.stage.addChild(container);
  const logs = _.times(count, i => {
    const text = new Pixi.Text({ style: ss.text, y: i * 20 });
    container.addChild(text);
    return (message: any) => {
      text.text = message;
    };
  });
  return logs;
};
