import { getEAW } from "meaw";

import { Alignment } from "./alignment.js";
import { TableCell } from "./table-cell.js";
import { TableRow } from "./table-row.js";
import { Table } from "./table.js";

/**
 * Creates a delimiter text.
 *
 * @private
 * @param {number} width
 * @param {Alignment} alignment
 * @returns {string}
 * @throws {Error} Unknown alignment.
 */
export function _delimiterText(width, alignment) {
  const bar = "-".repeat(width);
  switch (alignment) {
  case Alignment.DEFAULT:
    return ` ${bar} `;
  case Alignment.LEFT:
    return `:${bar} `;
  case Alignment.RIGHT:
    return ` ${bar}:`;
  case Alignment.CENTER:
    return `:${bar}:`;
  default:
    throw new Error("Unknown alignment: " + alignment);
  }
}

/**
 * Extends array size.
 *
 * @private
 * @param {Array} arr
 * @param {number} size
 * @param {Function} callback - Callback function to fill newly created cells.
 * @returns {Array} Extended array.
 */
export function _extendArray(arr, size, callback) {
  const extended = arr.slice();
  for (let i = arr.length; i < size; i++) {
    extended.push(callback(i, arr));
  }
  return extended;
}

/**
 * Completes a table by adding missing delimiter and cells.
 *
 * @param {Table} table - A table object.
 * @param {Object} options - An object containing options for completion.
 *
 * | property name    | type           | description                                               |
 * | ---------------- | -------------- | --------------------------------------------------------- |
 * | `delimiterWidth` | {@link number} | Width of delimiters used when completing delimiter cells. |
 *
 * @returns {Object} An object that represents the result of the completion.
 *
 * | property name       | type            | description                            |
 * | ------------------- | --------------- | -------------------------------------- |
 * | `table`             | {@link Table}   | A completed table object.              |
 * | `delimiterInserted` | {@link boolean} | `true` if a delimiter row is inserted. |
 *
 * @throws {Error} Empty table.
 */
export function completeTable(table, options) {
  const height = table.getHeight();
  const width = table.getWidth();
  if (height === 0) {
    throw new Error("Empty table");
  }
  const rows = table.getRows();
  const newRows = [];
  // header
  const headerRow = rows[0];
  const headerCells = headerRow.getCells();
  newRows.push(new TableRow(
    _extendArray(headerCells, width, j => new TableCell(
      j === headerCells.length ? headerRow.marginRight : ""
    )),
    headerRow.marginLeft,
    headerCells.length < width ? "" : headerRow.marginRight
  ));
  // delimiter
  const delimiterRow = table.getDelimiterRow();
  if (delimiterRow !== undefined) {
    const delimiterCells = delimiterRow.getCells();
    newRows.push(new TableRow(
      _extendArray(delimiterCells, width, j => new TableCell(
        _delimiterText(
          j === delimiterCells.length
            ? Math.max(options.delimiterWidth, delimiterRow.marginRight.length - 2)
            : options.delimiterWidth,
          Alignment.DEFAULT
        )
      )),
      delimiterRow.marginLeft,
      delimiterCells.length < width ? "" : delimiterRow.marginRight
    ));
  }
  else {
    newRows.push(new TableRow(
      _extendArray([], width, () => new TableCell(
        _delimiterText(options.delimiterWidth, Alignment.DEFAULT)
      )),
      "",
      ""
    ));
  }
  // body
  for (let i = delimiterRow !== undefined ? 2 : 1; i < height; i++) {
    const row = rows[i];
    const cells = row.getCells();
    newRows.push(new TableRow(
      _extendArray(cells, width, j => new TableCell(
        j === cells.length ? row.marginRight : ""
      )),
      row.marginLeft,
      cells.length < width ? "" : row.marginRight
    ));
  }
  return {
    table            : new Table(newRows),
    delimiterInserted: delimiterRow === undefined
  };
}

/**
 * Calculates the width of a text based on characters' EAW properties.
 *
 * @private
 * @param {string} text
 * @param {Object} options -
 *
 * | property name   | type                               |
 * | --------------- | ---------------------------------- |
 * | normalize       | {@link boolean}                    |
 * | wideChars       | {@link Set}&lt;{@link string} &gt; |
 * | narrowChars     | {@link Set}&lt;{@link string} &gt; |
 * | ambiguousAsWide | {@link boolean}                    |
 *
 * @returns {number} Calculated width of the text.
 */
export function _computeWidth(text, options) {
  const normalized = options.normalize ? text.normalize("NFC") : text;
  let w = 0;
  for (const char of normalized) {
    if (options.wideChars.has(char)) {
      w += 2;
      continue;
    }
    if (options.narrowChars.has(char)) {
      w += 1;
      continue;
    }
    switch (getEAW(char)) {
    case "F":
    case "W":
      w += 2;
      break;
    case "A":
      w += options.ambiguousAsWide ? 2 : 1;
      break;
    default:
      w += 1;
    }
  }
  return w;
}

/**
 * Returns a aligned cell content.
 *
 * @private
 * @param {string} text
 * @param {number} width
 * @param {Alignment} alignment
 * @param {Object} options - Options for computing text width.
 * @returns {string}
 * @throws {Error} Unknown alignment.
 * @throws {Error} Unexpected default alignment.
 */
export function _align(text, width, alignment, options) {
  const space = width - _computeWidth(text, options);
  if (space < 0) {
    return text;
  }
  switch (alignment) {
  case Alignment.DEFAULT:
    throw new Error("Unexpected default alignment");
  case Alignment.LEFT:
    return text + " ".repeat(space);
  case Alignment.RIGHT:
    return " ".repeat(space) + text;
  case Alignment.CENTER:
    return " ".repeat(Math.floor(space / 2))
      + text
      + " ".repeat(Math.ceil(space / 2));
  default:
    throw new Error("Unknown alignment: " + alignment);
  }
}
