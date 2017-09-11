import { Alignment } from "./alignment.js";

/**
 * A `TableCell` object represents a table cell.
 */
export class TableCell {
  /**
   * Creates a new `TableCell` object.
   *
   * @param {string} rawContent - Raw content of the cell.
   */
  constructor(rawContent) {
    this._rawContent = rawContent;
    this._content    = rawContent.trim();
  }

  /**
   * Raw content of the cell.
   *
   * @type {string}
   */
  get rawContent() {
    return this._rawContent;
  }

  /**
   * Trimmed content of the cell.
   *
   * @type {string}
   */
  get content() {
    return this._content;
  }

  /**
   * Convers the cell to a text representation.
   *
   * @returns {string} The raw content of the cell.
   */
  toText() {
    return this.rawContent;
  }

  /**
   * Checks if the cell is a delimiter i.e. it only contains hyphens `-` with optional one
   * leading and trailing colons `:`.
   *
   * @returns {boolean} `true` if the cell is a delimiter.
   */
  isDelimiter() {
    return /^\s*:?-+:?\s*$/.test(this.rawContent);
  }

  /**
   * Returns the alignment the cell represents.
   *
   * @returns {Alignment|undefined} The alignment the cell represents;
   * `undefined` if the cell is not a delimiter.
   */
  getAlignment() {
    if (!this.isDelimiter()) {
      return undefined;
    }
    if (this.content[0] === ":") {
      if (this.content[this.content.length - 1] === ":") {
        return Alignment.CENTER;
      }
      else {
        return Alignment.LEFT;
      }
    }
    else {
      if (this.content[this.content.length - 1] === ":") {
        return Alignment.RIGHT;
      }
      else {
        return Alignment.DEFAULT;
      }
    }
  }

  /**
   * Computes a relative position in the trimmed content from that in the raw content.
   *
   * @param {number} rawOffset - Relative position in the raw content.
   * @returns {number} - Relative position in the trimmed content.
   */
  computeContentOffset(rawOffset) {
    if (this.content === "") {
      return 0;
    }
    const paddingLeft = this.rawContent.length - this.rawContent.trimLeft().length;
    if (rawOffset < paddingLeft) {
      return 0;
    }
    if (rawOffset < paddingLeft + this.content.length) {
      return rawOffset - paddingLeft;
    }
    else {
      return this.content.length;
    }
  }

  /**
   * Computes a relative position in the raw content from that in the trimmed content.
   *
   * @param {number} contentOffset - Relative position in the trimmed content.
   * @returns {number} - Relative position in the raw content.
   */
  computeRawOffset(contentOffset) {
    if (this.content === "") {
      return this.rawContent === "" ? 0 : 1;
    }
    const paddingLeft = this.rawContent.length - this.rawContent.trimLeft().length;
    return contentOffset + paddingLeft;
  }
}
