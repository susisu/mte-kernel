import { Point } from "./point.js";
import { Range } from "./range.js";
import { Focus } from "./focus.js";

/**
 * A `Table` object represents a table.
 *
 * @private
 */
export class Table {
  /**
   * Creates a new `Table` object.
   *
   * @param {Array<TableRow>} rows - An array of rows that the table contains.
   */
  constructor(rows) {
    /** @private */
    this._rows = rows.slice();
  }

  /**
   * Gets the number of rows in the table.
   *
   * @returns {number} The number of rows.
   */
  getHeight() {
    return this._rows.length;
  }

  /**
   * Gets the maximum width of the rows in the table.
   *
   * @returns {number} The maximum width of the rows.
   */
  getWidth() {
    return this._rows.map(row => row.getWidth())
      .reduce((x, y) => Math.max(x, y), 0);
  }

  /**
   * Gets the width of the header row.
   *
   * @returns {number|undefined} The width of the header row;
   * `undefined` if there is no header row.
   */
  getHeaderWidth() {
    if (this._rows.length === 0) {
      return undefined;
    }
    return this._rows[0].getWidth();
  }

  /**
   * Gets the rows that the table contains.
   *
   * @returns {Array<TableRow>} An array of the rows.
   */
  getRows() {
    return this._rows.slice();
  }

  /**
   * Gets a row at the specified index.
   *
   * @param {number} index - Row index.
   * @returns {TableRow|undefined} The row at the specified index;
   * `undefined` if not found.
   */
  getRowAt(index) {
    return this._rows[index];
  }

  /**
   * Gets the delimiter row of the table.
   *
   * @returns {TableRow|undefined} The delimiter row;
   * `undefined` if there is not delimiter row.
   */
  getDelimiterRow() {
    const row = this._rows[1];
    if (row === undefined) {
      return undefined;
    }
    if (row.isDelimiter()) {
      return row;
    }
    else {
      return undefined;
    }
  }

  /**
   * Gets a cell at the specified index.
   *
   * @param {number} rowIndex - Row index of the cell.
   * @param {number} columnIndex - Column index of the cell.
   * @returns {TableCell|undefined} The cell at the specified index;
   * `undefined` if not found.
   */
  getCellAt(rowIndex, columnIndex) {
    const row = this._rows[rowIndex];
    if (row === undefined) {
      return undefined;
    }
    return row.getCellAt(columnIndex);
  }

  /**
   * Gets the cell at the focus.
   *
   * @param {Focus} focus - Focus object.
   * @returns {TableCell|undefined} The cell at the focus;
   * `undefined` if not found.
   */
  getFocusedCell(focus) {
    return this.getCellAt(focus.row, focus.column);
  }

  /**
   * Converts the table to an array of text representations of the rows.
   *
   * @returns {Array<string>} An array of text representations of the rows.
   */
  toLines() {
    return this._rows.map(row => row.toText());
  }

  /**
   * Computes a focus from a point in the text editor.
   *
   * @param {Point} pos - A point in the text editor.
   * @param {number} rowOffset - The row index where the table starts in the text editor.
   * @returns {Focus|undefined} A focus object that corresponds to the specified point;
   * `undefined` if the row index is out of bounds.
   */
  focusOfPosition(pos, rowOffset) {
    const rowIndex = pos.row - rowOffset;
    const row = this._rows[rowIndex];
    if (row === undefined) {
      return undefined;
    }
    if (pos.column < row.marginLeft.length + 1) {
      return new Focus(rowIndex, -1, pos.column);
    }
    else {
      const cellWidths = row.getCells().map(cell => cell.rawContent.length);
      let columnPos = row.marginLeft.length + 1; // left margin + a pipe
      let columnIndex = 0;
      for (; columnIndex < cellWidths.length; columnIndex++) {
        if (columnPos + cellWidths[columnIndex] + 1 > pos.column) {
          break;
        }
        columnPos += cellWidths[columnIndex] + 1;
      }
      const offset = pos.column - columnPos;
      return new Focus(rowIndex, columnIndex, offset);
    }
  }

  /**
   * Computes a position in the text editor from a focus.
   *
   * @param {Focus} focus - A focus object.
   * @param {number} rowOffset - The row index where the table starts in the text editor.
   * @returns {Point|undefined} A position in the text editor that corresponds to the focus;
   * `undefined` if the focused row  is out of the table.
   */
  positionOfFocus(focus, rowOffset) {
    const row = this._rows[focus.row];
    if (row === undefined) {
      return undefined;
    }
    const rowPos = focus.row + rowOffset;
    if (focus.column < 0) {
      return new Point(rowPos, focus.offset);
    }
    const cellWidths = row.getCells().map(cell => cell.rawContent.length);
    const maxIndex = Math.min(focus.column, cellWidths.length);
    let columnPos = row.marginLeft.length + 1;
    for (let columnIndex = 0; columnIndex < maxIndex; columnIndex++) {
      columnPos += cellWidths[columnIndex] + 1;
    }
    return new Point(rowPos, columnPos + focus.offset);
  }

  /**
   * Computes a selection range from a focus.
   *
   * @param {Focus} focus - A focus object.
   * @param {number} rowOffset - The row index where the table starts in the text editor.
   * @returns {Range|undefined} A range to be selected that corresponds to the focus;
   * `undefined` if the focus does not specify any cell or the specified cell is empty.
   */
  selectionRangeOfFocus(focus, rowOffset) {
    const row = this._rows[focus.row];
    if (row === undefined) {
      return undefined;
    }
    const cell = row.getCellAt(focus.column);
    if (cell === undefined) {
      return undefined;
    }
    if (cell.content === "") {
      return undefined;
    }
    const rowPos = focus.row + rowOffset;
    const cellWidths = row.getCells().map(cell => cell.rawContent.length);
    let columnPos = row.marginLeft.length + 1;
    for (let columnIndex = 0; columnIndex < focus.column; columnIndex++) {
      columnPos += cellWidths[columnIndex] + 1;
    }
    columnPos += cell.paddingLeft;
    return new Range(
      new Point(rowPos, columnPos),
      new Point(rowPos, columnPos + cell.content.length)
    );
  }
}
