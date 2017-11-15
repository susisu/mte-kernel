/**
 * A `Focus` object represents which cell is focused in the table.
 *
 * Note that `row` and `column` properties specifiy a cell's position in the table, not the cursor's
 * position in the text editor as {@link Point} class.
 *
 * @private
 */
export class Focus {
  /**
   * Creates a new `Focus` object.
   *
   * @param {number} row - Row of the focused cell.
   * @param {number} column - Column of the focused cell.
   * @param {number} offset - Raw offset in the cell.
   */
  constructor(row, column, offset) {
    /** @private */
    this._row = row;
    /** @private */
    this._column = column;
    /** @private */
    this._offset = offset;
  }

  /**
   * Row of the focused cell.
   *
   * @type {number}
   */
  get row() {
    return this._row;
  }

  /**
   * Column of the focused cell.
   *
   * @type {number}
   */
  get column() {
    return this._column;
  }

  /**
   * Raw offset in the cell.
   *
   * @type {number}
   */
  get offset() {
    return this._offset;
  }

  /**
   * Checks if two focuses point the same cell.
   * Offsets are ignored.
   *
   * @param {Focus} focus - A focus object.
   * @returns {boolean}
   */
  posEquals(focus) {
    return this.row === focus.row && this.column === focus.column;
  }

  /**
   * Creates a copy of the focus object by setting its row to the specified value.
   *
   * @param {number} row - Row of the focused cell.
   * @returns {Focus} A new focus object with the specified row.
   */
  setRow(row) {
    return new Focus(row, this.column, this.offset);
  }

  /**
   * Creates a copy of the focus object by setting its column to the specified value.
   *
   * @param {number} column - Column of the focused cell.
   * @returns {Focus} A new focus object with the specified column.
   */
  setColumn(column) {
    return new Focus(this.row, column, this.offset);
  }

  /**
   * Creates a copy of the focus object by setting its offset to the specified value.
   *
   * @param {number} offset - Offset in the focused cell.
   * @returns {Focus} A new focus object with the specified offset.
   */
  setOffset(offset) {
    return new Focus(this.row, this.column, offset);
  }
}
