import mockData from "./mock.json";
import { drawContributions } from "../src";
import { createCanvas } from "canvas";
const canvas = createCanvas(200, 200);

test("draws contributions correctly", () => {
  drawContributions(canvas, {
    data: mockData,
    username: "sallar",
    footerText: "test",
    theme: "standard"
  });
  expect(canvas.toDataURL()).toMatchSnapshot();
});
