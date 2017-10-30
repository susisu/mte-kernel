import { Point } from "./point.js";
import { Range } from "./range.js";
import { Focus } from "./focus.js";
import { TableCell } from "./table-cell.js";
import { TableRow } from "./table-row.js";
import { readTable } from "./parser.js";
import {
  completeTable,
  formatTable,
  alterAlignment,
  insertRow,
  insertColumn
} from "./formatter.js";
import { shortestEditScript, applyEditScript } from "./edit-script.js";

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
    const pos = this._textEditor.getCursorPosition();
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
    const pos = this._textEditor.getCursorPosition();
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
    const focus = table.focusOfPosition(pos, startRow);
    return { range, lines, table, focus };
  }

  /**
   * Finds a table and does an operation with it.
   *
   * @private
   * @param {Function} func - A function that does some operation on table information obtained by
   * {@link TableEditor#_findTable}.
   * @returns {undefined}
   */
  _withTable(func) {
    const info = this._findTable();
    if (info === undefined) {
      return;
    }
    func(info);
  }

  /**
   * Updates lines in a given range in the text editor.
   *
   * @private
   * @param {number} startRow - Start row index, starts from `0`.
   * @param {number} endRow - End row index.
   * Lines from `startRow` to `endRow - 1` are replaced.
   * @param {Array<string>} newLines - New lines.
   * @param {Array<string>} [oldLines=undefined] - Old lines to be replaced.
   * @returns {undefined}
   */
  _updateLines(startRow, endRow, newLines, oldLines = undefined) {
    if (oldLines !== undefined) {
      // apply the shortest edit script
      // if a table is edited in a normal manner, the edit distance never exceeds 3
      const ses = shortestEditScript(oldLines, newLines, 3);
      if (ses !== undefined) {
        applyEditScript(this._textEditor, ses, startRow);
        return;
      }
    }
    this._textEditor.replaceLines(startRow, endRow, newLines);
  }

  /**
   * Moves the cursor position to the focused cell,
   *
   * @private
   * @param {number} startRow - Row index where the table starts in the text editor.
   * @param {Table} table - A table.
   * @param {Focus} focus - A focus to which the cursor will be moved.
   * @returns {undefined}
   */
  _moveToFocus(startRow, table, focus) {
    const pos = table.positionOfFocus(focus, startRow);
    if (pos !== undefined) {
      this._textEditor.setCursorPosition(pos);
    }
  }

  /**
   * Selects the focused cell.
   * If the cell has no content to be selected, then just moves the cursor position.
   *
   * @private
   * @param {number} startRow - Row index where the table starts in the text editor.
   * @param {Table} table - A table.
   * @param {Focus} focus - A focus to be selected.
   * @returns {undefined}
   */
  _selectFocus(startRow, table, focus) {
    const range = table.selectionRangeOfFocus(focus, startRow);
    if (range !== undefined) {
      this._textEditor.setSelectionRange(range);
    }
    else {
      this._moveToFocus(startRow, table, focus);
    }
  }

  /**
   * Formats the table under the cursor.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  format(options) {
    this._withTable(({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // format
      const formatted = formatTable(completed.table, options);
      // compute focus offset
      const completedFocusedCell = completed.table.getFocusedCell(newFocus);
      const formattedFocusedCell = formatted.table.getFocusedCell(newFocus);
      if (completedFocusedCell !== undefined && formattedFocusedCell !== undefined) {
        const contentOffset = Math.min(
          completedFocusedCell.computeContentOffset(newFocus.offset),
          formattedFocusedCell.content.length
        );
        newFocus = newFocus.setOffset(formattedFocusedCell.computeRawOffset(contentOffset));
      }
      else {
        newFocus = newFocus.setOffset(newFocus.column < 0 ? formatted.marginLeft.length : 0);
      }
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._moveToFocus(range.start.row, formatted.table, newFocus);
      });
    });
  }

  /**
   * Formats and escapes from the table.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  escape(options) {
    this._withTable(({ range, lines, table, focus }) => {
      // complete
      const completed = completeTable(table, options);
      // format
      const formatted = formatTable(completed.table, options);
      // apply
      const newPos = new Point(range.end.row + (completed.delimiterInserted ? 2 : 1), 0);
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        if (newPos.row > this._textEditor.getLastRow()) {
          this._textEditor.insertLine(newPos.row, "");
        }
        this._textEditor.setCursorPosition(newPos);
      });
      this.resetSmartCursor();
    });
  }

  /**
   * Alters the alignment of the focused column.
   *
   * @param {Alignment} alignment - New alignment.
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  alignColumn(alignment, options) {
    this._withTable(({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // alter alignment
      const altered = alterAlignment(completed.table, newFocus.column, alignment, options);
      // format
      const formatted = formatTable(altered, options);
      // compute focus offset
      const completedFocusedCell = completed.table.getFocusedCell(newFocus);
      const formattedFocusedCell = formatted.table.getFocusedCell(newFocus);
      if (completedFocusedCell !== undefined && formattedFocusedCell !== undefined) {
        const contentOffset = Math.min(
          completedFocusedCell.computeContentOffset(newFocus.offset),
          formattedFocusedCell.content.length
        );
        newFocus = newFocus.setOffset(formattedFocusedCell.computeRawOffset(contentOffset));
      }
      else {
        newFocus = newFocus.setOffset(newFocus.column < 0 ? formatted.marginLeft.length : 0);
      }
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._moveToFocus(range.start.row, formatted.table, newFocus);
      });
    });
  }

  /**
   * Selects the focused cell content.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  selectCell(options) {
    this._withTable(({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // format
      const formatted = formatTable(completed.table, options);
      // compute focus offset
      const completedFocusedCell = completed.table.getFocusedCell(newFocus);
      const formattedFocusedCell = formatted.table.getFocusedCell(newFocus);
      if (completedFocusedCell !== undefined && formattedFocusedCell !== undefined) {
        const contentOffset = Math.min(
          completedFocusedCell.computeContentOffset(newFocus.offset),
          formattedFocusedCell.content.length
        );
        newFocus = newFocus.setOffset(formattedFocusedCell.computeRawOffset(contentOffset));
      }
      else {
        newFocus = newFocus.setOffset(newFocus.column < 0 ? formatted.marginLeft.length : 0);
      }
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._selectFocus(range.start.row, formatted.table, newFocus);
      });
    });
  }

  /**
   * Moves the focus to another cell.
   *
   * @param {number} rowOffset - Offset in row.
   * @param {number} columnOffset - Offset in column.
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  moveFocus(rowOffset, columnOffset, options) {
    this._withTable(({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      const startFocus = newFocus;
      // move
      if (rowOffset !== 0) {
        const height = completed.table.getHeight();
        // skip delimiter row
        const skip =
            newFocus.row < 1 && newFocus.row + rowOffset >= 1 ? 1
          : newFocus.row > 1 && newFocus.row + rowOffset <= 1 ? -1
          : 0;
        newFocus = newFocus.setRow(
          Math.min(Math.max(newFocus.row + rowOffset + skip, 0), height <= 2 ? 0 : height - 1)
        );
      }
      if (columnOffset !== 0) {
        const width = completed.table.getHeaderWidth();
        if (!(newFocus.column < 0 && columnOffset < 0)
          && !(newFocus.column > width - 1 && columnOffset > 0)) {
          newFocus = newFocus.setColumn(
            Math.min(Math.max(newFocus.column + columnOffset, 0), width - 1)
          );
        }
      }
      const moved = !newFocus.posEquals(startFocus);
      // format
      const formatted = formatTable(completed.table, options);
      // compute focus offset
      if (moved) {
        const formattedFocusedCell = formatted.table.getFocusedCell(newFocus);
        if (formattedFocusedCell !== undefined) {
          newFocus = newFocus.setOffset(formattedFocusedCell.computeRawOffset(0));
        }
        else {
          newFocus = newFocus.setOffset(newFocus.column < 0 ? formatted.marginLeft.length : 0);
        }
      }
      else {
        const completedFocusedCell = completed.table.getFocusedCell(newFocus);
        const formattedFocusedCell = formatted.table.getFocusedCell(newFocus);
        if (completedFocusedCell !== undefined && formattedFocusedCell !== undefined) {
          const contentOffset = Math.min(
            completedFocusedCell.computeContentOffset(newFocus.offset),
            formattedFocusedCell.content.length
          );
          newFocus = newFocus.setOffset(formattedFocusedCell.computeRawOffset(contentOffset));
        }
        else {
          newFocus = newFocus.setOffset(newFocus.column < 0 ? formatted.marginLeft.length : 0);
        }
      }
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        if (moved) {
          this._selectFocus(range.start.row, formatted.table, newFocus);
        }
        else {
          this._moveToFocus(range.start.row, formatted.table, newFocus);
        }
      });
      if (moved) {
        this.resetSmartCursor();
      }
    });
  }

  /**
   * Moves the focus to the next cell.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  nextCell(options) {
    this._withTable(({ range, lines, table, focus }) => {
      // reset smart cursor if moved
      const focusMoved = (this._scTablePos !== null && !range.start.equals(this._scTablePos))
        || (this._scLastFocus !== null && !focus.posEquals(this._scLastFocus));
      if (this._scActive && focusMoved) {
        this.resetSmartCursor();
      }
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      const startFocus = newFocus;
      let altered = completed.table;
      // move
      if (newFocus.row === 1) {
        // move to next row
        newFocus = newFocus.setRow(2);
        if (options.smartCursor) {
          if (newFocus.column < 0 || altered.getHeaderWidth() - 1 < newFocus.column) {
            newFocus = newFocus.setColumn(0);
          }
        }
        else {
          newFocus = newFocus.setColumn(0);
        }
        // insert an empty row if needed
        if (newFocus.row > altered.getHeight() - 1) {
          const row = new Array(altered.getHeaderWidth()).fill(new TableCell(""));
          altered = insertRow(altered, altered.getHeight(), new TableRow(row, "", ""));
        }
      }
      else {
        // insert an empty column if needed
        if (newFocus.column > altered.getHeaderWidth() - 1) {
          const column = new Array(altered.getHeight() - 1).fill(new TableCell(""));
          altered = insertColumn(altered, altered.getHeaderWidth(), column, options);
        }
        // move to next column
        newFocus = newFocus.setColumn(newFocus.column + 1);
      }
      // format
      const formatted = formatTable(altered, options);
      // compute focus offset
      const formattedFocusedCell = formatted.table.getFocusedCell(newFocus);
      if (formattedFocusedCell !== undefined) {
        newFocus = newFocus.setOffset(formattedFocusedCell.computeRawOffset(0));
      }
      // apply
      const newLines = formatted.table.toLines();
      if (newFocus.column > formatted.table.getHeaderWidth() - 1) {
        // add margin
        newLines[newFocus.row] += " ";
        newFocus = newFocus.setOffset(1);
      }
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, newLines, lines);
        this._selectFocus(range.start.row, formatted.table, newFocus);
      });
      if (options.smartCursor) {
        if (!this._scActive) {
          // activate smart cursor
          this._scActive = true;
          this._scTablePos = range.start;
          if (startFocus.column < 0 || formatted.table.getHeaderWidth() - 1 < startFocus.column) {
            this._scStartFocus = new Focus(startFocus.row, 0, 0);
          }
          else {
            this._scStartFocus = startFocus;
          }
        }
        this._scLastFocus = newFocus;
      }
    });
  }
}
