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
  getCursorPosition() {
    throw new Error("Not implemented: getCursorPosition");
  }

  /**
   * Sets the cursor position to a specified one.
   *
   * @param {Point} pos - A point object which the cursor position is set to.
   * @returns {undefined}
   */
  setCursorPosition(pos) {
    throw new Error("Not implemented: setCursorPosition");
  }

  /**
   * Sets the selection range.
   * This method also expects the cursor position to be moved as the end of the selection range.
   *
   * @param {Range} range - A range object that describes a selection range.
   * @returns {undefined}
   */
  setSelectionRange(range) {
    throw new Error("Not implemented: setSelectionRange");
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
   * Checks if the editor accepts a table at a row to be editted.
   * It should return `false` if, for example, the row is in a code block (not Markdown).
   *
   * @param {number} row - A row index in the text editor.
   * @returns {boolean} `true` if the table at the row can be editted.
   */
  acceptsTableEdit(row) {
    throw new Error("Not implemented: acceptsTableEdit");
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

  /**
   * Inserts a line at a specified row.
   *
   * @param {number} row - Row index, starts from `0`.
   * @param {string} line - A string to be inserted.
   * This must not contain an EOL like `"\n"` or `"\r"`.
   * @return {undefined}
   */
  insertLine(row, line) {
    throw new Error("Not implemented: insertLine");
  }

  /**
   * Deletes a line at a specified row.
   *
   * @param {number} row - Row index, starts from `0`.
   * @returns {undefined}
   */
  deleteLine(row) {
    throw new Error("Not implemented: deleteLine");
  }

  /**
   * Replace lines in a specified range.
   *
   * @param {number} startRow - Start row index, starts from `0`.
   * @param {number} endRow - End row index.
   * Lines from `startRow` to `endRow - 1` is replaced.
   * @param {Array<string>} lines - An array of string.
   * Each strings must not contain an EOL like `"\n"` or `"\r"`.
   * @returns {undefined}
   */
  replaceLines(startRow, endRow, lines) {
    throw new Error("Not implemented: replaceLines");
  }

  /**
   * Batches multiple operations as a single undo/redo step.
   *
   * @param {Function} func - A callback function that executes some operations on the text editor.
   * @returns {undefined}
   */
  transact(func) {
    throw new Error("Not implemented: transact");
  }
}
