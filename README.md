# Github Contributions on Canvas [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

A tool for drawing a heat-map of Github contributions on HTML Canvas. You can also draw a line graph displaying your contributions over time.

This module is used for drawing user contributions in [this project](https://github-contributions.now.sh).

## Install

```sh
$ npm install github-contributions-canvas
```

## Usage

```js
import { drawContributions } from "github-contributions-canvas";

drawContributions(canvasEl, {
  data: contributionData,
  username: "myusername",
  themeName: "standard",
  footerText: "Made by @sallar - github-contributions.now.sh"
});
```

```js
import { drawLineGraph } from "github-contributions-canvas";

drawLineGraph(canvasEl, {
  data: contributionData,
  username: "myusername",
  themeName: "standard",
  footerText: "Made by @sallar - github-contributions.now.sh"
});
```

## Available Themes

- `standard`
- `teal`
- `halloween`
- `leftPad`
- `panda`
- `blue`
- `dracula`

## Data Format

This module accepts the output from [sallar/github-contributions-api](https://github.com/sallar/github-contributions-api) API. Check that project for more info.

## License

Sallar Kaboli © [MIT License](LICENSE)

[npm-image]: https://badge.fury.io/js/github-contributions-canvas.svg
[npm-url]: https://npmjs.org/package/github-contributions-canvas
[travis-image]: https://travis-ci.com/sallar/github-contributions-canvas.svg?branch=master
[travis-url]: https://travis-ci.com/sallar/github-contributions-canvas
[daviddm-image]: https://david-dm.org/sallar/github-contributions-canvas.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/sallar/github-contributions-canvas
