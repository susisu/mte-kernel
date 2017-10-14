/**
 * The `ITextEditor` represents an interface to a text editor.
 *
 * @interface
 */
export class ITextEditor {
  /**
   * Gets the current cursor position.
   *
   * @returns {Point} A point object that represents the cursor position.
   */
  getCursorPos() {
    throw new Error("Not implemented: getCursorPos");
  }

  /**
   * Gets the last row index of the text editor.
   *
   * @returns {number} The last row index.
   */
  getLastRow() {
    throw new Error("Not implemented: getLastRow");
  }

  /**
   * Gets a line string at a row.
   *
   * @param {number} row - Row index, starts from `0`.
   * @returns {string} The line at the specified row.
   * The line must not contain an EOL like `"\n"` or `"\r"`.
   */
  getLine(row) {
    throw new Error("Not implemented: getLine");
  }
}
