import path from "path";
import mockData from "./mock.json";
import { drawContributions } from "../src";
import { createCanvas, registerFont } from "canvas";

const canvas = createCanvas(200, 200);
import fs from "fs";

registerFont(path.resolve(__dirname, "ibmplexmono.ttf"), {
  family: "PlexMono"
});

test("draws contributions correctly", () => {
  drawContributions(canvas, {
    data: mockData,
    username: "sallar",
    footerText: "test",
    themeName: "__test__",
    fontFace: "PlexMono",
    scaleFactor: 2
  });
  expect(canvas.toDataURL()).toMatchSnapshot();

  /*
  const dataBuffer = new Buffer(canvas.toDataURL().replace(/^data:image\/\w+;base64,/, ""), "base64");
  fs.writeFile(path.resolve(__dirname, "__snapshots__", "snapshots.png"), dataBuffer);
  */
});
