/**
 * A `TableRow` object represents a table row.
 *
 * @private
 */
export class TableRow {
  /**
   * Creates a new `TableRow` objec.
   *
   * @param {Array<TableCell>} cells - Cells that the row contains.
   * @param {string} marginLeft - Margin string at the left of the row.
   * @param {string} marginRight - Margin string at the right of the row.
   */
  constructor(cells, marginLeft, marginRight) {
    /** @private */
    this._cells = cells.slice();
    /** @private */
    this._marginLeft = marginLeft;
    /** @private */
    this._marginRight = marginRight;
  }

  /**
   * Margin string at the left of the row.
   *
   * @type {string}
   */
  get marginLeft() {
    return this._marginLeft;
  }

  /**
   * Margin string at the right of the row.
   *
   * @type {string}
   */
  get marginRight() {
    return this._marginRight;
  }

  /**
   * Gets the number of the cells in the row.
   *
   * @returns {number} Number of the cells.
   */
  getWidth() {
    return this._cells.length;
  }

  /**
   * Returns the cells that the row contains.
   *
   * @returns {Array<TableCell>} An array of cells that the row contains.
   */
  getCells() {
    return this._cells.slice();
  }

  /**
   * Gets a cell at the specified index.
   *
   * @param {number} index - Index.
   * @returns {TableCell|undefined} The cell at the specified index if exists;
   * `undefined` if no cell is found.
   */
  getCellAt(index) {
    return this._cells[index];
  }

  /**
   * Convers the row to a text representation.
   *
   * @returns {string} A text representation of the row.
   */
  toText() {
    if (this._cells.length === 0) {
      return this.marginLeft;
    }
    else {
      const cells = this._cells.map(cell => cell.toText()).join("|");
      return `${this.marginLeft}|${cells}|${this.marginRight}`;
    }
  }

  /**
   * Checks if the row is a delimiter or not.
   *
   * @returns {boolean} `true` if the row is a delimiter i.e. all the cells contained are delimiters.
   */
  isDelimiter() {
    return this._cells.every(cell => cell.isDelimiter());
  }
}
