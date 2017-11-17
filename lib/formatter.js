import { getEAW } from "meaw";

import { Alignment, HeaderAlignment } from "./alignment.js";
import { TableCell } from "./table-cell.js";
import { TableRow } from "./table-row.js";
import { Table } from "./table.js";

/**
 * Creates a delimiter text.
 *
 * @private
 * @param {Alignment} alignment
 * @param {number} width - Width of the horizontal bar of delimiter.
 * @returns {string}
 * @throws {Error} Unknown alignment.
 */
export function _delimiterText(alignment, width) {
  const bar = "-".repeat(width);
  switch (alignment) {
  case Alignment.NONE:
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
 * After completion, all rows in the table have the same width.
 *
 * @private
 * @param {Table} table - A table object.
 * @param {Object} options - An object containing options for completion.
 *
 * | property name       | type           | description                                               |
 * | ------------------- | -------------- | --------------------------------------------------------- |
 * | `minDelimiterWidth` | {@link number} | Width of delimiters used when completing delimiter cells. |
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
          Alignment.NONE,
          j === delimiterCells.length
            ? Math.max(options.minDelimiterWidth, delimiterRow.marginRight.length - 2)
            : options.minDelimiterWidth
        )
      )),
      delimiterRow.marginLeft,
      delimiterCells.length < tableWidth ? "" : delimiterRow.marginRight
    ));
  }
  else {
    newRows.push(new TableRow(
      _extendArray([], tableWidth, () => new TableCell(
        _delimiterText(Alignment.NONE, options.minDelimiterWidth)
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
 * | property name     | type                               |
 * | ----------------- | ---------------------------------- |
 * | `normalize`       | {@link boolean}                    |
 * | `wideChars`       | {@link Set}&lt;{@link string} &gt; |
 * | `narrowChars`     | {@link Set}&lt;{@link string} &gt; |
 * | `ambiguousAsWide` | {@link boolean}                    |
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
  case Alignment.NONE:
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
 * @private
 * @param {Table} table - A table object.
 * @param {Object} options - An object containing options for formatting.
 *
 * | property name       | type                     | description                                             |
 * | ------------------- | ------------------------ | ------------------------------------------------------- |
 * | `minDelimiterWidth` | {@link number}           | Minimum width of delimiters.                            |
 * | `defaultAlignment`  | {@link DefaultAlignment} | Default alignment of columns.                           |
 * | `headerAlignment`   | {@link HeaderAlignment}  | Alignment of header cells.                              |
 * | `textWidthOptions`  | {@link Object}           | An object containing options for computing text widths. |
 *
 * `options.textWidthOptions` must contain the following options.
 *
 * | property name     | type                              | description                                         |
 * | ----------------- | --------------------------------- | --------------------------------------------------- |
 * | `normalize`       | {@link boolean}                   | Normalize texts before computing text widths.       |
 * | `wideChars`       | {@link Set}&lt;{@link string}&gt; | Set of characters that should be treated as wide.   |
 * | `narrowChars`     | {@link Set}&lt;{@link string}&gt; | Set of characters that should be treated as narrow. |
 * | `ambiguousAsWide` | {@link boolean}                   | Treat East Asian Ambiguous characters as wide.      |
 *
 * @returns {Object} An object that represents the result of formatting.
 *
 * | property name   | type           | description                                    |
 * | --------------- | -------------- | ---------------------------------------------- |
 * | `table`         | {@link Table}  | A formatted table object.                      |
 * | `marginLeft`    | {@link string} | The common left margin of the formatted table. |
 */
export function _formatTable(table, options) {
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
          ? (alignments[j] === Alignment.NONE ? options.defaultAlignment : alignments[j])
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
        new TableCell(_delimiterText(alignments[j], columnWidths[j]))
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
          alignments[j] === Alignment.NONE ? options.defaultAlignment : alignments[j],
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

/**
 * Formats a table weakly.
 * Rows are formatted independently to each other, cell contents are just trimmed and not aligned.
 * This is useful when using a non-monospaced font or dealing with wide tables.
 *
 * @private
 * @param {Table} table - A table object.
 * @param {Object} options - An object containing options for formatting.
 * The function accepts the same option object for {@link formatTable}, but properties not listed
 * here are just ignored.
 *
 * | property name       | type           | description          |
 * | ------------------- | -------------- | -------------------- |
 * | `minDelimiterWidth` | {@link number} | Width of delimiters. |
 *
 * @returns {Object} An object that represents the result of formatting.
 *
 * | property name   | type           | description                                    |
 * | --------------- | -------------- | ---------------------------------------------- |
 * | `table`         | {@link Table}  | A formatted table object.                      |
 * | `marginLeft`    | {@link string} | The common left margin of the formatted table. |
 */
export function _weakFormatTable(table, options) {
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
  const delimiterRow = table.getDelimiterRow();
  // format
  const rows = [];
  // header
  const headerRow = table.getRowAt(0);
  rows.push(new TableRow(
    headerRow.getCells().map(cell =>
      new TableCell(_padText(cell.content))
    ),
    marginLeft,
    ""
  ));
  // delimiter
  if (delimiterRow !== undefined) {
    rows.push(new TableRow(
      delimiterRow.getCells().map(cell =>
        new TableCell(_delimiterText(cell.getAlignment(), options.minDelimiterWidth))
      ),
      marginLeft,
      ""
    ));
  }
  // body
  for (let i = delimiterRow !== undefined ? 2 : 1; i < tableHeight; i++) {
    const row = table.getRowAt(i);
    rows.push(new TableRow(
      row.getCells().map(cell =>
        new TableCell(_padText(cell.content))
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

/**
 * Represents table format type.
 *
 * - `FormatType.NORMAL` - Formats table normally.
 * - `FormatType.WEAK` - Formats table weakly, rows are formatted independently to each other, cell
 *   contents are just trimmed and not aligned.
 *
 * @type {Object}
 */
export const FormatType = Object.freeze({
  NORMAL: "normal",
  WEAK  : "weak"
});


/**
 * Formats a table.
 *
 * @private
 * @param {Table} table - A table object.
 * @param {Object} options - An object containing options for formatting.
 *
 * | property name       | type                     | description                                             |
 * | ------------------- | ------------------------ | ------------------------------------------------------- |
 * | `formatType`        | {@link FormatType}       | Format type, normal or weak.                            |
 * | `minDelimiterWidth` | {@link number}           | Minimum width of delimiters.                            |
 * | `defaultAlignment`  | {@link DefaultAlignment} | Default alignment of columns.                           |
 * | `headerAlignment`   | {@link HeaderAlignment}  | Alignment of header cells.                              |
 * | `textWidthOptions`  | {@link Object}           | An object containing options for computing text widths. |
 *
 * `options.textWidthOptions` must contain the following options.
 *
 * | property name     | type                              | description                                         |
 * | ----------------- | --------------------------------- | --------------------------------------------------- |
 * | `normalize`       | {@link boolean}                   | Normalize texts before computing text widths.       |
 * | `wideChars`       | {@link Set}&lt;{@link string}&gt; | Set of characters that should be treated as wide.   |
 * | `narrowChars`     | {@link Set}&lt;{@link string}&gt; | Set of characters that should be treated as narrow. |
 * | `ambiguousAsWide` | {@link boolean}                   | Treat East Asian Ambiguous characters as wide.      |
 *
 * @returns {Object} An object that represents the result of formatting.
 *
 * | property name   | type           | description                                    |
 * | --------------- | -------------- | ---------------------------------------------- |
 * | `table`         | {@link Table}  | A formatted table object.                      |
 * | `marginLeft`    | {@link string} | The common left margin of the formatted table. |
 *
 * @throws {Error} Unknown format type.
 */
export function formatTable(table, options) {
  switch (options.formatType) {
  case FormatType.NORMAL:
    return _formatTable(table, options);
  case FormatType.WEAK:
    return _weakFormatTable(table, options);
  default:
    throw new Error("Unknown format type: " + options.formatType);
  }
}

/**
 * Alters a column's alignment of a table.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} columnIndex - An index of the column.
 * @param {Alignment} alignment - A new alignment of the column.
 * @param {Object} options - An object containing options for completion.
 *
 * | property name       | type           | description          |
 * | ------------------- | -------------- | -------------------- |
 * | `minDelimiterWidth` | {@link number} | Width of delimiters. |
 *
 * @returns {Table} An altered table object.
 * If the column index is out of range, returns the original table.
 */
export function alterAlignment(table, columnIndex, alignment, options) {
  const delimiterRow = table.getRowAt(1);
  if (columnIndex < 0 || delimiterRow.getWidth() - 1 < columnIndex) {
    return table;
  }
  const delimiterCells = delimiterRow.getCells();
  delimiterCells[columnIndex] = new TableCell(_delimiterText(alignment, options.minDelimiterWidth));
  const rows = table.getRows();
  rows[1] = new TableRow(delimiterCells, delimiterRow.marginLeft, delimiterRow.marginRight);
  return new Table(rows);
}

/**
 * Inserts a row to a table.
 * The row is always inserted after the header and the delimiter rows, even if the index specifies
 * the header or the delimiter.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} rowIndex - An row index at which a new row will be inserted.
 * @param {TableRow} row - A table row to be inserted.
 * @returns {Table} An altered table obejct.
 */
export function insertRow(table, rowIndex, row) {
  const rows = table.getRows();
  rows.splice(Math.max(rowIndex, 2), 0, row);
  return new Table(rows);
}

/**
 * Deletes a row in a table.
 * If the index specifies the header row, the cells are emptied but the row will not be removed.
 * If the index specifies the delimiter row, it does nothing.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} rowIndex - An index of the row to be deleted.
 * @returns {Table} An altered table obejct.
 */
export function deleteRow(table, rowIndex) {
  if (rowIndex === 1) {
    return table;
  }
  const rows = table.getRows();
  if (rowIndex === 0) {
    const headerRow = rows[0];
    rows[0] = new TableRow(
      new Array(headerRow.getWidth()).fill(new TableCell("")),
      headerRow.marginLeft,
      headerRow.marginRight
    );
  }
  else {
    rows.splice(rowIndex, 1);
  }
  return new Table(rows);
}

/**
 * Moves a row at the index to the specified destination.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} rowIndex - Index of the row to be moved.
 * @param {number} destIndex - Index of the destination.
 * @returns {Table} An altered table object.
 */
export function moveRow(table, rowIndex, destIndex) {
  if (rowIndex <= 1 || destIndex <= 1 || rowIndex === destIndex) {
    return table;
  }
  const rows = table.getRows();
  const row = rows[rowIndex];
  rows.splice(rowIndex, 1);
  rows.splice(destIndex, 0, row);
  return new Table(rows);
}

/**
 * Inserts a column to a table.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} columnIndex - An column index at which the new column will be inserted.
 * @param {Array<TableCell>} column - An array of cells.
 * @param {Object} options - An object containing options for completion.
 *
 * | property name       | type           | description             |
 * | ------------------- | -------------- | ----------------------- |
 * | `minDelimiterWidth` | {@link number} | Width of the delimiter. |
 *
 * @returns {Table} An altered table obejct.
 */
export function insertColumn(table, columnIndex, column, options) {
  const rows = table.getRows();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = rows[i].getCells();
    const cell = i === 1
      ? new TableCell(_delimiterText(Alignment.NONE, options.minDelimiterWidth))
      : column[i > 1 ? i - 1 : i];
    cells.splice(columnIndex, 0, cell);
    rows[i] = new TableRow(cells, row.marginLeft, row.marginRight);
  }
  return new Table(rows);
}

/**
 * Deletes a column in a table.
 * If there will be no columns after the deletion, the cells are emptied but the column will not be
 * removed.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} columnIndex - An index of the column to be deleted.
 * @param {Object} options - An object containing options for completion.
 *
 * | property name       | type           | description             |
 * | ------------------- | -------------- | ----------------------- |
 * | `minDelimiterWidth` | {@link number} | Width of the delimiter. |
 *
 * @returns {Table} An altered table object.
 */
export function deleteColumn(table, columnIndex, options) {
  const rows = table.getRows();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let cells = row.getCells();
    if (cells.length <= 1) {
      cells = [new TableCell(i === 1
        ? _delimiterText(Alignment.NONE, options.minDelimiterWidth)
        : ""
      )];
    }
    else {
      cells.splice(columnIndex, 1);
    }
    rows[i] = new TableRow(cells, row.marginLeft, row.marginRight);
  }
  return new Table(rows);
}

/**
 * Moves a column at the index to the specified destination.
 *
 * @private
 * @param {Table} table - A completed non-empty table.
 * @param {number} columnIndex - Index of the column to be moved.
 * @param {number} destIndex - Index of the destination.
 * @returns {Table} An altered table object.
 */
export function moveColumn(table, columnIndex, destIndex) {
  if (columnIndex === destIndex) {
    return table;
  }
  const rows = table.getRows();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getCells();
    const cell = cells[columnIndex];
    cells.splice(columnIndex, 1);
    cells.splice(destIndex, 0, cell);
    rows[i] = new TableRow(cells, row.marginLeft, row.marginRight);
  }
  return new Table(rows);
}
