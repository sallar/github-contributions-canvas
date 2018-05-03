import path from "path";
import mockData from "./mock.json";
import { drawContributions } from "../src";
import { createCanvas, registerFont } from "canvas";
const canvas = createCanvas(200, 200);

registerFont(path.resolve(__dirname, "ibmplexmono.ttf"), {
  family: "PlexMono"
});

test("draws contributions correctly", () => {
  drawContributions(canvas, {
    data: mockData,
    username: "sallar",
    footerText: "test",
    theme: "standard",
    fontFace: "PlexMono"
  });
  expect(canvas.toDataURL()).toMatchSnapshot();
});
