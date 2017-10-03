import { getEAW } from "meaw";

import { Alignment, HeaderAlignment } from "./alignment.js";
import { TableCell } from "./table-cell.js";
import { TableRow } from "./table-row.js";
import { Table } from "./table.js";

/**
 * Creates a delimiter text.
 *
 * @private
 * @param {number} width - Width of the horizontal bar of delimiter.
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
  const tableHeight = table.getHeight();
  const tableWidth = table.getWidth();
  if (tableHeight === 0) {
    throw new Error("Empty table");
  }
  const rows = table.getRows();
  const newRows = [];
  // header
  const headerRow = rows[0];
  const headerCells = headerRow.getCells();
  newRows.push(new TableRow(
    _extendArray(headerCells, tableWidth, j => new TableCell(
      j === headerCells.length ? headerRow.marginRight : ""
    )),
    headerRow.marginLeft,
    headerCells.length < tableWidth ? "" : headerRow.marginRight
  ));
  // delimiter
  const delimiterRow = table.getDelimiterRow();
  if (delimiterRow !== undefined) {
    const delimiterCells = delimiterRow.getCells();
    newRows.push(new TableRow(
      _extendArray(delimiterCells, tableWidth, j => new TableCell(
        _delimiterText(
          j === delimiterCells.length
            ? Math.max(options.delimiterWidth, delimiterRow.marginRight.length - 2)
            : options.delimiterWidth,
          Alignment.DEFAULT
        )
      )),
      delimiterRow.marginLeft,
      delimiterCells.length < tableWidth ? "" : delimiterRow.marginRight
    ));
  }
  else {
    newRows.push(new TableRow(
      _extendArray([], tableWidth, () => new TableCell(
        _delimiterText(options.delimiterWidth, Alignment.DEFAULT)
      )),
      "",
      ""
    ));
  }
  // body
  for (let i = delimiterRow !== undefined ? 2 : 1; i < tableHeight; i++) {
    const row = rows[i];
    const cells = row.getCells();
    newRows.push(new TableRow(
      _extendArray(cells, tableWidth, j => new TableCell(
        j === cells.length ? row.marginRight : ""
      )),
      row.marginLeft,
      cells.length < tableWidth ? "" : row.marginRight
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
export function _computeTextWidth(text, options) {
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
export function _alignText(text, width, alignment, options) {
  const space = width - _computeTextWidth(text, options);
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

/**
 * Just adds one space paddings to both sides of a text.
 *
 * @private
 * @param {string} text
 * @returns {string}
 */
export function _padText(text) {
  return ` ${text} `;
}


/**
 * Formats a table.
 *
 * @param {Table} table - A table object.
 * @param {Object} options - An object containing options for formatting.
 *
 * | property name     | type                     | description                                             |
 * | ----------------- | ------------------------ | ------------------------------------------------------- |
 * | minDelimiterWidth | {@link number}           | Minimum width of delimiters.                            |
 * | defaultAlignment  | {@link DefaultAlignment} | Default alignment of columns.                           |
 * | headerAlignment   | {@link HeaderAlignment}  | Alignment of header cells.                              |
 * | textWidthOptions  | {@link Object}           | An object containing options for computing text widths. |
 *
 * `options.textWidthOptions` must contain the following options.
 *
 * | property name   | type                              | description                                         |
 * | --------------- | --------------------------------- | --------------------------------------------------- |
 * | normalize       | {@link boolean}                   | Normalize texts before computing text widths.       |
 * | wideChars       | {@link Set}&lt;{@link string}&gt; | Set of characters that should be treated as wide.   |
 * | narrowChars     | {@link Set}&lt;{@link string}&gt; | Set of characters that should be treated as narrow. |
 * | ambiguousAsWide | {@link boolean}                   | Treat East Asian Ambiguous characters as wide.      |
 *
 * @returns {Object}
 */
export function formatTable(table, options) {
  const tableHeight = table.getHeight();
  const tableWidth = table.getWidth();
  if (tableHeight === 0) {
    return {
      table,
      marginLeft: ""
    };
  }
  const marginLeft = table.getRowAt(0).marginLeft;
  if (tableWidth === 0) {
    const rows = new Array(tableHeight).fill()
      .map(() => new TableRow([], marginLeft, ""));
    return {
      table: new Table(rows),
      marginLeft
    };
  }
  // compute column widths
  const delimiterRow = table.getDelimiterRow();
  const columnWidths = new Array(tableWidth).fill(0);
  if (delimiterRow !== undefined) {
    const delimiterRowWidth = delimiterRow.getWidth();
    for (let j = 0; j < delimiterRowWidth; j++) {
      columnWidths[j] = options.minDelimiterWidth;
    }
  }
  for (let i = 0; i < tableHeight; i++) {
    if (delimiterRow !== undefined && i === 1) {
      continue;
    }
    const row = table.getRowAt(i);
    const rowWidth = row.getWidth();
    for (let j = 0; j < rowWidth; j++) {
      columnWidths[j] = Math.max(
        columnWidths[j],
        _computeTextWidth(row.getCellAt(j).content, options.textWidthOptions)
      );
    }
  }
  // get column alignments
  const alignments = delimiterRow !== undefined
    ? _extendArray(
      delimiterRow.getCells().map(cell => cell.getAlignment()),
      tableWidth,
      () => options.defaultAlignment
    )
    : new Array(tableWidth).fill(options.defaultAlignment);
  // format
  const rows = [];
  // header
  const headerRow = table.getRowAt(0);
  rows.push(new TableRow(
    headerRow.getCells().map((cell, j) =>
      new TableCell(_padText(_alignText(
        cell.content,
        columnWidths[j],
        options.headerAlignment === HeaderAlignment.FOLLOW
          ? (alignments[j] === Alignment.DEFAULT ? options.defaultAlignment : alignments[j])
          : options.headerAlignment,
        options.textWidthOptions
      )))
    ),
    marginLeft,
    ""
  ));
  // delimiter
  if (delimiterRow !== undefined) {
    rows.push(new TableRow(
      delimiterRow.getCells().map((cell, j) =>
        new TableCell(_delimiterText(columnWidths[j], alignments[j]))
      ),
      marginLeft,
      ""
    ));
  }
  // body
  for (let i = delimiterRow !== undefined ? 2 : 1; i < tableHeight; i++) {
    const row = table.getRowAt(i);
    rows.push(new TableRow(
      row.getCells().map((cell, j) =>
        new TableCell(_padText(_alignText(
          cell.content,
          columnWidths[j],
          alignments[j] === Alignment.DEFAULT ? options.defaultAlignment : alignments[j],
          options.textWidthOptions
        )))
      ),
      marginLeft,
      ""
    ));
  }
  return {
    table: new Table(rows),
    marginLeft
  };
}
