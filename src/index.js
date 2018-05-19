import moment from "moment";
import { themes } from "./themes";

function getTheme(opts = {}) {
  const { themeName } = opts;
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
const boxMargin = 2;
const textHeight = 15;
const defaultFontFace = "IBM Plex Mono";
const headerHeight = 60;
const canvasMargin = 20;
const yearHeight = textHeight + (boxWidth + boxMargin) * 8 + canvasMargin;
const scaleFactor = window.devicePixelRatio || 1;

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
  ctx.font = `10px '${fontFace}'`;
  ctx.fillText(
    `${year.year}: ${count} Contribution${year.total === 1 ? "" : "s"}${
      thisYear === year.year ? " (so far)" : ""
    }`,
    offsetX,
    offsetY - 17
  );

  for (let y = 0; y < graphEntries.length; y += 1) {
    for (let x = 0; x < graphEntries[y].length; x += 1) {
      const day = graphEntries[y][x];
      if (moment(day.date) > today || !day.info) {
        continue;
      }
      const color = theme[`grade${day.info.intensity}`];
      ctx.fillStyle = color;
      ctx.fillRect(
        offsetX + (boxWidth + boxMargin) * x,
        offsetY + textHeight + (boxWidth + boxMargin) * y,
        10,
        10
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
      ctx.fillText(date.format('MMM'), offsetX + (boxWidth + boxMargin) * y, offsetY);
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
  ctx.fillText('Less', width - canvasMargin - (boxWidth + boxMargin) * (themeGrades) - 55, 37);
  ctx.fillText('More', (width - canvasMargin) - 25, 37);
  for (let x = 0; x < 5; x += 1) {
    ctx.fillStyle = theme[`grade${x}`];
    ctx.fillRect(width - canvasMargin - (boxWidth + boxMargin) * (themeGrades) - 27,textHeight + boxWidth,10,10);
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
  const { data, username } = opts;
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

/**
 * Draws a line graph of your github contributions over time
 * @param canvas the canvas element used to draw the graph
 * @param opts other options including the username, font, footerText, etc.
 */
export function drawLineGraph(canvas, opts) {
  const { data, username } = opts;
  const lineGraphHeight = 500;
  const xAxisMargin = 50;
  const tickLength = 30;
  const yAxisMargin = 50;
  const yAxis = lineGraphHeight + 85;
  const height =
    lineGraphHeight + canvasMargin + headerHeight + xAxisMargin + 10;
  const width = 53 * (boxWidth + boxMargin) + canvasMargin * 2;
  const xAxis = width - 100; //length of line of x axis
  const theme = getTheme(opts);
  const {
    footerText,
    fontFace = defaultFontFace
  } = opts;
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

  drawEmptyLineGraph(ctx, {
    ...opts,
    xAxis,
    yAxis,
    lineGraphHeight,
    yAxisMargin,
    xAxisMargin
  })


  var total = 0;
  var largestYear = 0;
  var smallestYear = 0;
  data.years.forEach((year) => {
    total += year.total;
    largestYear = year.total>largestYear ? year.total:largestYear;
    smallestYear = year.total<smallestYear ? year.total:smallestYear;
  });
  const pointSpacingY=largestYear/(lineGraphHeight-xAxisMargin); //Space betweeen each point in the graph based on the largest value and the height of the available space
  const allowedSpace = 10; //Amount of space allowed between y axis values
  var xAxisSpacing = xAxis/(data.years.length); //Space between tick marks
  const rectangleWidth = 10;
  var points = []; //Array of the points added to the grpah and thier x y location with respect to the webpage
  var contributions = []; //Array of all the total contributions added to the graph already
  data.years.reverse();//Start at earliest year
  data.years.forEach((year, i) => {
    var point = new Point(yAxisMargin+canvasMargin+(xAxisSpacing*i), lineGraphHeight + 70 - xAxisMargin-year.total/pointSpacingY, year.total)

    if (!contributions.includes(year.total)) {
      if (point.total != smallestYear && smallestYear != largestYear) {
        ctx.beginPath();
        ctx.moveTo(yAxisMargin + canvasMargin - tickLength/2, point.y);
        ctx.lineTo(yAxisMargin + canvasMargin + tickLength/2 , point.y);
        ctx.strokeStyle = theme.grade3;
        ctx.stroke();
      }
      if(!yAxisTextOverlap(points, point.y, allowedSpace)) {
        ctx.fillStyle = theme.text;
        ctx.textBaseline = "hanging";
        ctx.font = `10px '${fontFace}'`;
        ctx.fillText(year.total, canvasMargin, point.y-rectangleWidth/2,yAxisMargin);
      }

      contributions.push(year.total);
    }

    if(point.x != yAxisMargin+canvasMargin) {
      ctx.beginPath();
      ctx.moveTo(point.x, lineGraphHeight + 70 - xAxisMargin - tickLength/2);
      ctx.lineTo(point.x, lineGraphHeight + 70 - xAxisMargin + tickLength/2);
      ctx.strokeStyle = theme.grade3;
      ctx.stroke();
    }

    ctx.fillStyle = theme.text;
    ctx.textBaseline = "hanging";
    ctx.font = `10px '${fontFace}'`;
    ctx.fillText(year.year, point.x-13, lineGraphHeight - xAxisMargin + tickLength/2 + 120);

    points.push(point);
  });

  points.forEach((point, i) => {
    if(i != 0) {
      ctx.lineTo(point.x,point.y);
      ctx.strokeStyle = theme.grade2;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(point.x,point.y);
    }
  });

  points.forEach((point, i) => {
    ctx.fillStyle = theme.grade1;
    ctx.fillRect(point.x-rectangleWidth/2, point.y-rectangleWidth/2,rectangleWidth,rectangleWidth);
  })
}

/**
 * Draws an empty graph with an x and y axis
 * @param ctx the canvas used to draw
 * @param opts other options
 */
function drawEmptyLineGraph(ctx, opts = {}) {
  const {
    xAxis,
    yAxis,
    lineGraphHeight,
    yAxisMargin,
    xAxisMargin,
    fontFace = defaultFontFace
  } = opts;
  const theme = getTheme(opts);

  ctx.beginPath();
  ctx.moveTo(yAxisMargin + canvasMargin, 70);
  ctx.lineTo(yAxisMargin + canvasMargin, yAxis - xAxisMargin);
  ctx.strokeStyle = theme.grade4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(yAxisMargin + 5, lineGraphHeight + 70 - xAxisMargin);
  ctx.lineTo(yAxisMargin + xAxis, lineGraphHeight + 70 - xAxisMargin);
  ctx.strokeStyle = theme.grade4;
  ctx.stroke();
  ctx.save();

  ctx.fillStyle = theme.text;
  ctx.textBaseline = "hanging";
  ctx.font = `10px '${fontFace}'`;
  ctx.translate(canvasMargin-15, lineGraphHeight/2 + 70);
  ctx.rotate(Math.PI/-2)
  ctx.fillText("contributions", 0, 0);
  ctx.restore();
}

/**
 * Point object
 * @param x horizontal location in the page
 * @param y vertical location in the page
 * @param total number of contributions
 */
function Point(x,y,total) {
  this.x = x;
  this.y = y;
  this.total = total;
}

/**
 * Checks if any other points have similar y values
 * This stops the y axis from getting super crowded with values.
 * @param points array of point objects already added to the graph
 * @param y vertical spot in the page for the new point
 * @param allowedSpace the amount of space allowed between values on the y axis
 * @returns boolean whether the point im trying to add will overlap something
 */
function yAxisTextOverlap(points, y, allowedSpace) {
    var returnVal = false;
    points.forEach((point, i) => {
      if (Math.abs(point.y-y)<allowedSpace) {
        returnVal = true;
      }
    });
    return returnVal;
}
