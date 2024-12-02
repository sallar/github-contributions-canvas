# Github Contributions on Canvas [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
A tool for drawing a heat-map of Github contributions on HTML Canvas.
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

## Available Themes

The themes are defined in the [`src/themes.js`](src/themes.js) file.
Currently the available themes are:

- `standard`
- `halloween`
- `teal`
- `leftPad`
- `dracula`
- `blue`
- `panda`
- `sunny`
- `pink`
- `YlGnBu`
- `solarizedDark`
- `solarizedLight`

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

@@ How To Contribute

- Fork the Repository: Click the "Fork" button to create your own copy of the repository.
- Clone the Repository: Use the command git clone <your-forked-repo-url> to download it locally.
- Create a New Branch: Run git checkout -b <branch-name> to work on a separate branch.
- Make Your Changes: Modify code, fix bugs, or update documentation as needed.
- Commit Your Changes: Use git commit -m "Descriptive message about your changes" to save your changes locally.
- Push to GitHub: Push the changes to your forked repository with git push origin <branch-name>.
- Create a Pull Request (PR): Go to the original repository and open a pull request explaining your changes.
- Address Feedback: Be ready to discuss and make additional changes if needed during the review process.
- Contributions of all types are welcome—thank you for helping improve the project!
