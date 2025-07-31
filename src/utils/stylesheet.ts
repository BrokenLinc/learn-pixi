import * as Pixi from "pixi.js";

export const ss = {
  stroke: {
    color: 0x44ffdd,
    pixelLine: true,
  } as Pixi.StrokeStyle,
  text: {
    fontFamily: "EditUndo",
    fontSize: 13.9,
    fill: 0xff44dd,
  } as Pixi.TextStyle,
  font: {
    alias: "EditUndo",
    src: "/assets/editundo.woff",
  } as Pixi.UnresolvedAsset<any>,
};
