import moment from "moment";
import { themes } from "./themes";

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

function getTheme(opts = {}) {
  const { themeName, customTheme } = opts;
  if (customTheme) {
    return {
      background: customTheme.background || themes.standard.background,
      text: customTheme.text || themes.standard.text,
      meta: customTheme.meta || themes.standard.meta,
      stroke: customTheme.stroke || themes.standard.stroke,
      grade4: customTheme.grade4 || themes.standard.grade4,
      grade3: customTheme.grade3 || themes.standard.grade3,
      grade2: customTheme.grade2 || themes.standard.grade2,
      grade1: customTheme.grade1 || themes.standard.grade1,
      grade0: customTheme.grade0 || themes.standard.grade0
    };
  }
  if (themeName in themes) {
    return themes[themeName];
  }
  return themes.standard;
}

function getDateInfo(data, date) {
  return data.contributions.find(contrib => contrib.date === date);
}

function getContributionCount(graphEntries) {
  return graphEntries.reduce((rowTotal, row) => {
    return (
      rowTotal +
      row.reduce((colTotal, col) => {
        return colTotal + (col.info ? col.info.count : 0);
      }, 0)
    );
  }, 0);
}

const DATE_FORMAT = "YYYY-MM-DD";
const boxWidth = 10;
const boxMargin = 3;
const textHeight = 15;
const defaultFontFace = "IBM Plex Mono";
const headerHeight = 60;
const canvasMargin = 20;
const yearHeight = textHeight + (boxWidth + boxMargin) * 8 + canvasMargin;

function drawContributionRect(ctx, x, y, width, height, radius, strokeColor) {
  const boxRadius = radius || 0;
  drawRoundedRect(ctx, x, y, width, height, boxRadius, true, false);

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    drawRoundedRect(ctx, x + 0.5, y + 0.5, width - 1, height - 1, boxRadius, false, true);
  }
}

function drawYear(ctx, opts = {}) {
  const {
    year,
    offsetX = 0,
    offsetY = 0,
    data,
    fontFace = defaultFontFace
  } = opts;
  const thisYear = moment().format("YYYY");
  const today = year.year === thisYear ? moment() : moment(year.range.end);
  const start = moment(`${year.year}-01-01`);
  const firstDate = start.clone();
  const theme = getTheme(opts);

  if (firstDate.day() !== 6) {
    firstDate.day(-(firstDate.day() + 1 % 7));
  }

  const nextDate = firstDate.clone();
  const firstRowDates = [];
  const graphEntries = [];

  while (nextDate <= today && nextDate.day(7) <= today) {
    const date = nextDate.format(DATE_FORMAT);
    firstRowDates.push({
      date,
      info: getDateInfo(data, date)
    });
  }

  graphEntries.push(firstRowDates);

  for (let i = 1; i < 7; i += 1) {
    graphEntries.push(
      firstRowDates.map(dateObj => {
        const date = moment(dateObj.date)
          .day(i)
          .format(DATE_FORMAT);
        return {
          date,
          info: getDateInfo(data, date)
        };
      })
    );
  }

  const count = new Intl.NumberFormat().format(
    getContributionCount(graphEntries)
  );

  ctx.textBaseline = "hanging";
  ctx.fillStyle = theme.text;
  ctx.font = `14px '${fontFace}'`;
  ctx.fillText(
    `${year.year}: ${count} Contribution${year.total === 1 ? "" : "s"}${
      thisYear === year.year ? " (so far)" : ""
    }`,
    offsetX,
    offsetY - 20
  );

  for (let y = 0; y < graphEntries.length; y += 1) {
    for (let x = 0; x < graphEntries[y].length; x += 1) {
      const day = graphEntries[y][x];
      if (moment(day.date) > today || !day.info) {
        continue;
      }

      ctx.fillStyle = theme[`grade${day.info.intensity}`];

      drawContributionRect(ctx,
        offsetX + (boxWidth + boxMargin) * x,
        offsetY + textHeight + (boxWidth + boxMargin) * y,
        10,
        10,
        theme.radius,
        theme.stroke
      );
    }
  }

  // Draw Month Label
  let lastCountedMonth = 0;
  for (let y = 0; y < graphEntries[0].length; y += 1) {
    const date = moment(graphEntries[0][y].date);
    const month = date.month() + 1;
    const firstMonthIsDec = month == 12 && y == 0;
    const monthChanged = month !== lastCountedMonth;
    if (monthChanged && !firstMonthIsDec) {
      ctx.fillStyle = theme.meta;
      ctx.font = `10px '${fontFace}'`;
      ctx.fillText(date.format("MMM"), offsetX + (boxWidth + boxMargin) * y, offsetY);
      lastCountedMonth = month;
    }
  }
}

function drawMetaData(ctx, opts = {}) {
  const {
    username,
    width,
    height,
    footerText,
    fontFace = defaultFontFace
  } = opts;
  const theme = getTheme(opts);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  if (footerText) {
    ctx.fillStyle = theme.meta;
    ctx.textBaseline = "bottom";
    ctx.font = `10px '${fontFace}'`;
    ctx.fillText(footerText, canvasMargin, height - 5);
  }

  // chart legend
  let themeGrades = 5;
  ctx.fillStyle = theme.text;
  ctx.fillText("Less", width - canvasMargin - (boxWidth + boxMargin) * (themeGrades) - 55, 37);
  ctx.fillText("More", (width - canvasMargin) - 25, 37);
  for (let x = 0; x < 5; x += 1) {
    ctx.fillStyle = theme[`grade${x}`];

    drawContributionRect(ctx, width - canvasMargin - (boxWidth + boxMargin) * (themeGrades) - 27, textHeight + boxWidth, 10, 10, theme.radius, theme.stroke);

    themeGrades -= 1;
  }

  ctx.fillStyle = theme.text;
  ctx.textBaseline = "hanging";
  ctx.font = `20px '${fontFace}'`;
  ctx.fillText(`@${username} on GitHub`, canvasMargin, canvasMargin);

  ctx.beginPath();
  ctx.moveTo(canvasMargin, 55);
  ctx.lineTo(width - canvasMargin, 55);
  ctx.strokeStyle = theme.grade0;
  ctx.stroke();
}

export function drawContributions(canvas, opts) {
  const { data, username, scaleFactor } = opts;
  const height =
    data.years.length * yearHeight + canvasMargin + headerHeight + 10;
  const width = 53 * (boxWidth + boxMargin) + canvasMargin * 2;

  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;

  const ctx = canvas.getContext("2d");
  ctx.scale(scaleFactor, scaleFactor);
  ctx.textBaseline = "hanging";

  drawMetaData(ctx, {
    ...opts,
    width,
    height
  });

  data.years.forEach((year, i) => {
    const offsetY = yearHeight * i + canvasMargin + headerHeight;
    const offsetX = canvasMargin;
    drawYear(ctx, {
      ...opts,
      year,
      offsetX,
      offsetY,
      data
    });
  });
}
