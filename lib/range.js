/**
 * A `Range` object represents a range in the text editor.
 */
export class Range {
  /**
   * Creates a new `Range` object.
   *
   * @param {Point} start - The start point of the range.
   * @param {Point} end - The end point of the range.
   */
  constructor(start, end) {
    /** @private */
    this._start = start;
    /** @private */
    this._end = end;
  }

  /**
   * The start point of the range.
   *
   * @type {Point}
   */
  get start() {
    return this._start;
  }

  /**
   * The end point of the range.
   *
   * @type {Point}
   */
  get end() {
    return this._end;
  }
}
