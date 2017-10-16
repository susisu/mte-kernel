import { Point } from "./point.js";
import { Range } from "./range.js";
import { readTable } from "./parser.js";

/**
 * Checks if a line is a table row.
 *
 * @private
 * @param {string} line - A string.
 * @returns {boolean} `true` if the given line starts with a pipe `|`.
 */
export function _isTableRow(line) {
  return line.trimLeft()[0] === "|";
}


/**
 * The `TableEditor` class is at the center of the markdown-table-editor.
 * When a command is executed, it reads a table from the text editor, does some operation on the
 * table, and then apply the result to the text editor.
 *
 * To use this class, the text editor (or an interface to it) must implement {@link ITextEditor}.
 */
export class TableEditor {
  /**
   * Creates a new table editor instance.
   *
   * @param {ITextEditor} textEditor - A text editor interface.
   */
  constructor(textEditor) {
    /** @private */
    this._textEditor = textEditor;

    // smart cursor
    /** @private */
    this._scActive = false;
    /** @private */
    this._scTablePos = null;
    /** @private */
    this._scStartFocus = null;
    /** @private */
    this._scLastFocus = null;
  }

  /**
   * Resets the smart cursor.
   * Call this method when the table editor is inactivated.
   *
   * @returns {undefined}
   */
  resetSmartCursor() {
    this._scActive = false;
  }

  /**
   * Checks if the cursor is in a table row.
   * This is useful to check whether the table editor should be activated or not.
   *
   * @returns {boolean} `true` if the cursor is in a table row.
   */
  cursorIsInTable() {
    const pos = this._textEditor.getCursorPos();
    const line = this._textEditor.getLine(pos.row);
    return _isTableRow(line);
  }

  /**
   * Finds a table under the current cursor position.
   *
   * @private
   * @returns {Object|undefined} An object that contains information about the table;
   * `undefined` if there is no table.
   * The return object contains the properties listed in the table.
   *
   * | property name   | type                                | description                                                              |
   * | --------------- | ----------------------------------- | ------------------------------------------------------------------------ |
   * | `range`         | {@link Range}                       | The range of the table.                                                  |
   * | `lines`         | {@link Array}&lt;{@link string}&gt; | An array of the lines in the range.                                      |
   * | `table`         | {@link Table}                       | A table object read from the text editor.                                |
   * | `focus`         | {@link Focus}                       | A focus object that represents the current cursor position in the table. |
   */
  _findTable() {
    const pos = this._textEditor.getCursorPos();
    const lastRow = this._textEditor.getLastRow();
    const lines = [];
    let startRow = pos.row;
    let endRow = pos.row;
    // current line
    {
      const line = this._textEditor.getLine(pos.row);
      if (!_isTableRow(line)) {
        return undefined;
      }
      lines.push(line);
    }
    // previous lines
    for (let row = pos.row - 1; row >= 0; row--) {
      const line = this._textEditor.getLine(row);
      if (!_isTableRow(line)) {
        break;
      }
      lines.unshift(line);
      startRow = row;
    }
    // next lines
    for (let row = pos.row + 1; row <= lastRow; row++) {
      const line = this._textEditor.getLine(row);
      if (!_isTableRow(line)) {
        break;
      }
      lines.push(line);
      endRow = row;
    }
    const range = new Range(
      new Point(startRow, 0),
      new Point(endRow, lines[lines.length - 1].length)
    );
    const table = readTable(lines);
    const focus = table.computeFocus(pos, startRow);
    return { range, lines, table, focus };
  }
}
