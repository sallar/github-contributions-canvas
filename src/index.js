"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawContributions = drawContributions;

var _moment = _interopRequireDefault(require("moment"));

var _themes = require("./themes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getTheme() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var themeName = opts.themeName,
      customTheme = opts.customTheme;

  if (customTheme) {
    return {
      background: customTheme.background || _themes.themes.standard.background,
      text: customTheme.text || _themes.themes.standard.text,
      meta: customTheme.meta || _themes.themes.standard.meta,
      grade4: customTheme.grade4 || _themes.themes.standard.grade4,
      grade3: customTheme.grade3 || _themes.themes.standard.grade3,
      grade2: customTheme.grade2 || _themes.themes.standard.grade2,
      grade1: customTheme.grade1 || _themes.themes.standard.grade1,
      grade0: customTheme.grade0 || _themes.themes.standard.grade0
    };
  }

  if (themeName in _themes.themes) {
    return _themes.themes[themeName];
  }

  return _themes.themes.standard;
}

function getDateInfo(data, date) {
  return data.contributions.find(function (contrib) {
    return contrib.date === date;
  });
}

function getContributionCount(graphEntries) {
  return graphEntries.reduce(function (rowTotal, row) {
    return rowTotal + row.reduce(function (colTotal, col) {
      return colTotal + (col.info ? col.info.count : 0);
    }, 0);
  }, 0);
}

var DATE_FORMAT = "YYYY-MM-DD";
var boxWidth = 10;
var boxMargin = 2;
var textHeight = 15;
var defaultFontFace = "IBM Plex Mono";
var headerHeight = 60;
var canvasMargin = 20;
var yearHeight = textHeight + (boxWidth + boxMargin) * 8 + canvasMargin;
var scaleFactor = window.devicePixelRatio || 1;

function drawYear(ctx) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var year = opts.year,
      _opts$offsetX = opts.offsetX,
      offsetX = _opts$offsetX === void 0 ? 0 : _opts$offsetX,
      _opts$offsetY = opts.offsetY,
      offsetY = _opts$offsetY === void 0 ? 0 : _opts$offsetY,
      data = opts.data,
      _opts$fontFace = opts.fontFace,
      fontFace = _opts$fontFace === void 0 ? defaultFontFace : _opts$fontFace;
  var thisYear = (0, _moment.default)().format("YYYY");
  var today = year.year === thisYear ? (0, _moment.default)() : (0, _moment.default)(year.range.end);
  var start = (0, _moment.default)("".concat(year.year, "-01-01"));
  var firstDate = start.clone();
  var theme = getTheme(opts);

  if (firstDate.day() !== 6) {
    firstDate.day(-(firstDate.day() + 1 % 7));
  }

  var nextDate = firstDate.clone();
  var firstRowDates = [];
  var graphEntries = [];

  while (nextDate <= today && nextDate.day(7) <= today) {
    var date = nextDate.format(DATE_FORMAT);
    firstRowDates.push({
      date: date,
      info: getDateInfo(data, date)
    });
  }

  graphEntries.push(firstRowDates);

  var _loop = function _loop(i) {
    graphEntries.push(firstRowDates.map(function (dateObj) {
      var date = (0, _moment.default)(dateObj.date).day(i).format(DATE_FORMAT);
      return {
        date: date,
        info: getDateInfo(data, date)
      };
    }));
  };

  for (var i = 1; i < 7; i += 1) {
    _loop(i);
  }
  if(!opts.skipHeader){
    var count = new Intl.NumberFormat().format(getContributionCount(graphEntries));
    ctx.textBaseline = "hanging";
    ctx.fillStyle = theme.text;
    ctx.font = "10px '".concat(fontFace, "'");
    ctx.fillText("".concat(year.year, ": ").concat(count, " Contribution").concat(year.total === 1 ? "" : "s").concat(thisYear === year.year ? " (so far)" : ""), offsetX, offsetY - 17);
  }
  for (var y = 0; y < graphEntries.length; y += 1) {
    for (var x = 0; x < graphEntries[y].length; x += 1) {
      var day = graphEntries[y][x];

      if ((0, _moment.default)(day.date) > today || !day.info) {
        continue;
      }

      var color = theme["grade".concat(day.info.intensity)];
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + (boxWidth + boxMargin) * x, offsetY + textHeight + (boxWidth + boxMargin) * y, 10, 10);
    }
  } // Draw Month Label


  var lastCountedMonth = 0;

  for (var _y = 0; _y < graphEntries[0].length; _y += 1) {
    var _date = (0, _moment.default)(graphEntries[0][_y].date);

    var month = _date.month() + 1;
    var firstMonthIsDec = month == 12 && _y == 0;
    var monthChanged = month !== lastCountedMonth;

    if (!skipAxisLabel && monthChanged && !firstMonthIsDec) {
      ctx.fillStyle = theme.meta;
      ctx.fillText(_date.format('MMM'), offsetX + (boxWidth + boxMargin) * _y, offsetY);
      lastCountedMonth = month;
    }
  }
}

function drawMetaData(ctx) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var username = opts.username,
      width = opts.width,
      height = opts.height,
      footerText = opts.footerText,
      _opts$fontFace2 = opts.fontFace,
      fontFace = _opts$fontFace2 === void 0 ? defaultFontFace : _opts$fontFace2;
  var theme = getTheme(opts);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  if (footerText) {
    ctx.fillStyle = theme.meta;
    ctx.textBaseline = "bottom";
    ctx.font = "10px '".concat(fontFace, "'");
    ctx.fillText(footerText, canvasMargin, height - 5);
  } // chart legend


  var themeGrades = 5;
  ctx.fillStyle = theme.text;
  ctx.fillText('Less', width - canvasMargin - (boxWidth + boxMargin) * themeGrades - 55, 37);
  ctx.fillText('More', width - canvasMargin - 25, 37);

  for (var x = 0; x < 5; x += 1) {
    ctx.fillStyle = theme["grade".concat(x)];
    ctx.fillRect(width - canvasMargin - (boxWidth + boxMargin) * themeGrades - 27, textHeight + boxWidth, 10, 10);
    themeGrades -= 1;
  }
  
  ctx.fillStyle = theme.text;
  ctx.textBaseline = "hanging";
  ctx.font = "20px '".concat(fontFace, "'");
  ctx.fillText("@".concat(username, " on GitHub"), canvasMargin, canvasMargin);
  ctx.beginPath();
  ctx.moveTo(canvasMargin, 55);
  ctx.lineTo(width - canvasMargin, 55);
  ctx.strokeStyle = theme.grade0;
  ctx.stroke();
}

function drawContributions(canvas, opts) {
  var data = opts.data,
      username = opts.username;
  var header = 0;
  if(!opts.skipHeader) {
    header = headerHeight;
  }
  var height = data.years.length * yearHeight + canvasMargin + header + 10;
  var width = 53 * (boxWidth + boxMargin) + canvasMargin * 2;
  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;
  var ctx = canvas.getContext("2d");
  ctx.scale(scaleFactor, scaleFactor);
  ctx.textBaseline = "hanging";
  if(!opts.skipHeader) {
    drawMetaData(ctx, _objectSpread({}, opts, {
     width: width,
     height: height
    }));
  }
  data.years.forEach(function (year, i) {
    var offsetY = yearHeight * i + canvasMargin + header;
    var offsetX = canvasMargin;
    drawYear(ctx, _objectSpread({}, opts, {
      year: year,
      offsetX: offsetX,
      offsetY: offsetY,
      data: data
    }));
  });
}