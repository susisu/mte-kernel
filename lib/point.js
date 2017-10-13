/**
 * A `Point` represents a point in the text editor.
 */
export class Point {
  /**
   * Creates a new `Point` object.
   *
   * @param {number} row - Row of the point, starts from 0.
   * @param {number} column - Column of the point, starts from 0.
   */
  constructor(row, column) {
    /** @private */
    this._row = row;
    /** @private */
    this._column = column;
  }

  /**
   * Row of the point.
   *
   * @type {number}
   */
  get row() {
    return this._row;
  }

  /**
   * Column of the point.
   *
   * @type {number}
   */
  get column() {
    return this._column;
  }

  /**
   * Checks if the point is equal to another point.
   *
   * @param {Point} point - A point object.
   * @returns {boolean} `true` if two points are equal.
   */
  equals(point) {
    return this.row === point.row && this.column === point.column;
  }
}
