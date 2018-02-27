import { TableCell } from "./table-cell.js";
import { TableRow } from "./table-row.js";
import { Table } from "./table.js";

/**
 * Splits a text into cells.
 *
 * @private
 * @param {string} text
 * @returns {Array<string>}
 */
export function _splitCells(text) {
  const cells = [];
  let buf = "";
  let rest = text;
  while (rest !== "") {
    switch (rest[0]) {
    case "`":
      // read code span
      {
        const start = rest.match(/^`*/)[0];
        let buf1 = start;
        let rest1 = rest.substr(start.length);
        let closed = false;
        while (rest1 !== "") {
          if (rest1[0] === "`") {
            const end = rest1.match(/^`*/)[0];
            buf1 += end;
            rest1 = rest1.substr(end.length);
            if (end.length === start.length) {
              closed = true;
              break;
            }
          }
          else {
            buf1 += rest1[0];
            rest1 = rest1.substr(1);
          }
        }
        if (closed) {
          buf += buf1;
          rest = rest1;
        }
        else {
          buf += "`";
          rest = rest.substr(1);
        }
      }
      break;
    case "\\":
      // escape next character
      if (rest.length >= 2) {
        buf += rest.substr(0, 2);
        rest = rest.substr(2);
      }
      else {
        buf += "\\";
        rest = rest.substr(1);
      }
      break;
    case "|":
      // flush buffer
      cells.push(buf);
      buf = "";
      rest = rest.substr(1);
      break;
    default:
      buf += rest[0];
      rest = rest.substr(1);
    }
  }
  cells.push(buf);
  return cells;
}

/**
 * Reads a table row.
 *
 * @private
 * @param {string} text - A text.
 * @param {RegExp} [leftMarginRegex=/^\s*$/] - A regular expression object that matches left margin.
 * @returns {TableRow}
 */
export function _readRow(text, leftMarginRegex = /^\s*$/) {
  let cells = _splitCells(text);
  let marginLeft;
  if (cells.length > 0 && leftMarginRegex.test(cells[0])) {
    marginLeft = cells[0];
    cells = cells.slice(1);
  }
  else {
    marginLeft = "";
  }
  let marginRight;
  if (cells.length > 1 && /^\s*$/.test(cells[cells.length - 1])) {
    marginRight = cells[cells.length - 1];
    cells = cells.slice(0, cells.length - 1);
  }
  else {
    marginRight = "";
  }
  return new TableRow(cells.map(cell => new TableCell(cell)), marginLeft, marginRight);
}

/**
 * Creates a regex source string of margin character class.
 *
 * @private
 * @param {Set<string>} chars - A set of additional margin characters.
 * A pipe `|`, a backslash `\`, and a backquote will be ignored.
 * @return {string} A regex source string.
 */
export function marginRegexSrc(chars) {
  let cs = "";
  for (const c of chars) {
    if (c !== "|" && c !== "\\" && c !== "`") {
      cs += `\\u{${c.codePointAt(0).toString(16)}}`;
    }
  }
  return `[\\s${cs}]*`;
}

/**
 * Creates a regular expression object that matches margin of tables.
 *
 * @private
 * @param {Set<string>} chars - A set of additional margin characters.
 * A pipe `|`, a backslash `\`, and a backquote will be ignored.
 * @return {RegExp} An regular expression object that matches margin of tables.
 */
export function _marginRegex(chars) {
  return new RegExp(`^${marginRegexSrc(chars)}$`, "u");
}

/**
 * Reads a table from lines.
 *
 * @private
 * @param {Array<string>} lines - An array of texts, each text represents a row.
 * @param {Object} options - An object containing options for parsing.
 *
 * | property name     | type                              | description                                 |
 * | ----------------- | --------------------------------- | ------------------------------------------- |
 * | `leftMarginChars` | {@link Set}&lt;{@link string}&gt; | A set of additional left margin characters. |
 *
 * @returns {Table} The table red from the lines.
 */
export function readTable(lines, options) {
  const leftMarginRegex = _marginRegex(options.leftMarginChars);
  return new Table(lines.map(line => _readRow(line, leftMarginRegex)));
}
