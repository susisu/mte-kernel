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
function delimiterText(width, alignment) {
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
    throw new Error("Unknown alignment");
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
function extendArray(arr, size, callback) {
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
    extendArray(headerCells, width, j => new TableCell(
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
      extendArray(delimiterCells, width, j => new TableCell(
        delimiterText(
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
      extendArray([], width, () => new TableCell(
        delimiterText(options.delimiterWidth, Alignment.DEFAULT)
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
      extendArray(cells, width, j => new TableCell(
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

function formatTable(table, options) {
  
}
