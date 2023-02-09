import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import getMonth from "date-fns/getMonth";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import parseISO from "date-fns/parseISO";
import setDay from "date-fns/setDay";
import startOfWeek from "date-fns/startOfWeek";
import { themes } from "./themes";

interface DataStructYear {
  year: string;
  total: number;
  range: {
    start: string;
    end: string;
  };
}

interface DataStructContribution {
  date: string;
  count: number;
  color: string;
  intensity: number;
}

interface DataStruct {
  years: DataStructYear[];
  contributions: DataStructContribution[];
}

interface GraphEntry {
  date: string;
  info?: DataStructContribution;
}

interface Options {
  scaleFactor?: number;
  themeName?: keyof typeof themes;
  customTheme?: Theme;
  skipHeader?: boolean;
  skipAxisLabel?: boolean;
  username: string;
  data: DataStruct;
  fontFace?: string;
  footerText?: string;
}

interface DrawYearOptions extends Options {
  year: DataStructYear;
  offsetX?: number;
  offsetY?: number;
}

interface DrawMetadataOptions extends Options {
  width: number;
  height: number;
}

interface Theme {
  background: string;
  text: string;
  meta: string;
  grade4: string;
  grade3: string;
  grade2: string;
  grade1: string;
  grade0: string;
}

function getPixelRatio() {
  if (typeof window === "undefined") {
    return 1;
  }
  return window.devicePixelRatio || 1;
}

const DATE_FORMAT = "yyyy-MM-dd";
const boxWidth = 10;
const boxMargin = 2;
const textHeight = 15;
const defaultFontFace = "IBM Plex Mono";
const headerHeight = 60;
const canvasMargin = 20;
const yearHeight = textHeight + (boxWidth + boxMargin) * 8 + canvasMargin;

function getTheme(opts: Options): Theme {
  const { themeName, customTheme } = opts;
  if (customTheme) {
    return {
      background: customTheme.background ?? themes.standard.background,
      text: customTheme.text ?? themes.standard.text,
      meta: customTheme.meta ?? themes.standard.meta,
      grade4: customTheme.grade4 ?? themes.standard.grade4,
      grade3: customTheme.grade3 ?? themes.standard.grade3,
      grade2: customTheme.grade2 ?? themes.standard.grade2,
      grade1: customTheme.grade1 ?? themes.standard.grade1,
      grade0: customTheme.grade0 ?? themes.standard.grade0
    };
  }
  const name = themeName ?? "standard";
  return themes[name] ?? themes.standard;
}

function getDateInfo(data: DataStruct, date: string) {
  return data.contributions.find(contrib => contrib.date === date);
}

function getContributionCount(graphEntries: GraphEntry[][]) {
  return graphEntries.reduce((rowTotal, row) => {
    return (
      rowTotal +
      row.reduce((colTotal, col) => {
        return colTotal + (col.info ? col.info.count : 0);
      }, 0)
    );
  }, 0);
}

function drawYear(ctx: CanvasRenderingContext2D, opts: DrawYearOptions) {
  const {
    year,
    offsetX = 0,
    offsetY = 0,
    data,
    fontFace = defaultFontFace
  } = opts;
  const theme = getTheme(opts);

  const today = new Date();
  const thisYear = format(today, "yyyy");
  const lastDate = year.year === thisYear ? today : parseISO(year.range.end);
  const firstRealDate = parseISO(`${year.year}-01-01`);
  const firstDate = startOfWeek(firstRealDate);

  let nextDate = firstDate;
  const firstRowDates: GraphEntry[] = [];
  const graphEntries: GraphEntry[][] = [];

  while (isBefore(nextDate, lastDate)) {
    const date = format(nextDate, DATE_FORMAT);
    firstRowDates.push({
      date,
      info: getDateInfo(data, date)
    });
    nextDate = addWeeks(nextDate, 1);
  }

  graphEntries.push(firstRowDates);

  for (let i = 1; i < 7; i += 1) {
    graphEntries.push(
      firstRowDates.map(dateObj => {
        const date = format(setDay(parseISO(dateObj.date), i), DATE_FORMAT);
        return {
          date,
          info: getDateInfo(data, date)
        };
      })
    );
  }
  if (!opts.skipHeader) {
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
  }

  for (let y = 0; y < graphEntries.length; y += 1) {
    for (let x = 0; x < graphEntries[y].length; x += 1) {
      const day = graphEntries[y][x];
      const cellDate = parseISO(day.date);
      if (isAfter(cellDate, lastDate) || !day.info) {
        continue;
      }
      // @ts-ignore
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
    const date = parseISO(graphEntries[0][y].date);
    const month = getMonth(date) + 1;
    const firstMonthIsDec = month === 12 && y === 0;
    const monthChanged = month !== lastCountedMonth;
    if (!opts.skipAxisLabel && monthChanged && !firstMonthIsDec) {
      ctx.fillStyle = theme.meta;
      ctx.fillText(
        format(date, "MMM"),
        offsetX + (boxWidth + boxMargin) * y,
        offsetY
      );
      lastCountedMonth = month;
    }
  }
}

function drawMetaData(
  ctx: CanvasRenderingContext2D,
  opts: DrawMetadataOptions
) {
  const {
    username,
    width,
    height,
    footerText,
    data,
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
  ctx.fillText(
    "Less",
    width - canvasMargin - (boxWidth + boxMargin) * themeGrades - 55,
    37
  );
  ctx.fillText("More", width - canvasMargin - 25, 37);
  for (let x = 0; x < 5; x += 1) {
    // @ts-ignore
    ctx.fillStyle = theme[`grade${x}`];
    ctx.fillRect(
      width - canvasMargin - (boxWidth + boxMargin) * themeGrades - 27,
      textHeight + boxWidth,
      10,
      10
    );
    themeGrades -= 1;
  }

  ctx.fillStyle = theme.text;
  ctx.textBaseline = "hanging";
  ctx.font = `20px '${fontFace}'`;
  ctx.fillText(`@${username} on GitHub`, canvasMargin, canvasMargin);

  let totalContributions = 0;
  for (const year of data.years) {
    totalContributions += year.total;
  }
  ctx.font = `10px '${fontFace}'`;
  ctx.fillText(
    `Total Contributions: ${totalContributions}`,
    canvasMargin,
    canvasMargin + 30
  );

  ctx.beginPath();
  ctx.moveTo(canvasMargin, 55 + 10);
  ctx.lineTo(width - canvasMargin, 55 + 10);
  ctx.strokeStyle = theme.grade0;
  ctx.stroke();
}

export function drawContributions(canvas: HTMLCanvasElement, opts: Options) {
  const { data } = opts;
  let headerOffset = 0;
  if (!opts.skipHeader) {
    headerOffset = headerHeight;
  }
  const height =
    data.years.length * yearHeight + canvasMargin + headerOffset + 10;
  const width = 53 * (boxWidth + boxMargin) + canvasMargin * 2;

  let scaleFactor;
  if (!opts.scaleFactor) {
    scaleFactor = getPixelRatio();
  } else {
    scaleFactor = opts.scaleFactor;
  }
  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get 2d context from Canvas");
  }

  ctx.scale(scaleFactor, scaleFactor);
  ctx.textBaseline = "hanging";
  if (!opts.skipHeader) {
    drawMetaData(ctx, {
      ...opts,
      width,
      height,
      data
    });
  }

  data.years.forEach((year, i) => {
    const offsetY = yearHeight * i + canvasMargin + headerOffset + 10;
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

export { themes } from "./themes";
