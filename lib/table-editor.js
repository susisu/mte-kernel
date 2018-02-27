import { Point } from "./point.js";
import { Range } from "./range.js";
import { Focus } from "./focus.js";
import { TableCell } from "./table-cell.js";
import { TableRow } from "./table-row.js";
import { marginRegexSrc, readTable } from "./parser.js";
import {
  completeTable,
  formatTable,
  alterAlignment,
  insertRow,
  deleteRow,
  moveRow,
  insertColumn,
  deleteColumn,
  moveColumn
} from "./formatter.js";
import { shortestEditScript, applyEditScript } from "./edit-script.js";

/**
 * Creates a regular expression object that matches a table row.
 *
 * @param {Set<string>} leftMarginChars - A set of additional left margin characters.
 * A pipe `|`, a backslash `\`, and a backquote will be ignored.
 * @returns {RegExp} A regular expression object that matches a table row.
 */
export function _createIsTableRowRegex(leftMarginChars) {
  return new RegExp(`^${marginRegexSrc(leftMarginChars)}\\|`, "u");
}

/**
 * Computes new focus offset from information of completed and formatted tables.
 *
 * @private
 * @param {Focus} focus - A focus.
 * @param {Table} table - A completed but not formatted table with original cell contents.
 * @param {Object} formatted - Information of the formatted table.
 * @param {boolean} moved - Indicates whether the focus position is moved by a command or not.
 * @returns {number}
 */
export function _computeNewOffset(focus, table, formatted, moved) {
  if (moved) {
    const formattedFocusedCell = formatted.table.getFocusedCell(focus);
    if (formattedFocusedCell !== undefined) {
      return formattedFocusedCell.computeRawOffset(0);
    }
    else {
      return focus.column < 0 ? formatted.marginLeft.length : 0;
    }
  }
  else {
    const focusedCell = table.getFocusedCell(focus);
    const formattedFocusedCell = formatted.table.getFocusedCell(focus);
    if (focusedCell !== undefined && formattedFocusedCell !== undefined) {
      const contentOffset = Math.min(
        focusedCell.computeContentOffset(focus.offset),
        formattedFocusedCell.content.length
      );
      return formattedFocusedCell.computeRawOffset(contentOffset);
    }
    else {
      return focus.column < 0 ? formatted.marginLeft.length : 0;
    }
  }
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
   * @param {Object} options - See {@link options}.
   * @returns {boolean} `true` if the cursor is in a table row.
   */
  cursorIsInTable(options) {
    const re = _createIsTableRowRegex(options.leftMarginChars);
    const pos = this._textEditor.getCursorPosition();
    return this._textEditor.acceptsTableEdit(pos.row)
      && re.test(this._textEditor.getLine(pos.row));
  }

  /**
   * Finds a table under the current cursor position.
   *
   * @private
   * @param {Object} options - See {@link options}.
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
  _findTable(options) {
    const re = _createIsTableRowRegex(options.leftMarginChars);
    const pos = this._textEditor.getCursorPosition();
    const lastRow = this._textEditor.getLastRow();
    const lines = [];
    let startRow = pos.row;
    let endRow = pos.row;
    // current line
    {
      const line = this._textEditor.getLine(pos.row);
      if (!this._textEditor.acceptsTableEdit(pos.row) || !re.test(line)) {
        return undefined;
      }
      lines.push(line);
    }
    // previous lines
    for (let row = pos.row - 1; row >= 0; row--) {
      const line = this._textEditor.getLine(row);
      if (!this._textEditor.acceptsTableEdit(row) || !re.test(line)) {
        break;
      }
      lines.unshift(line);
      startRow = row;
    }
    // next lines
    for (let row = pos.row + 1; row <= lastRow; row++) {
      const line = this._textEditor.getLine(row);
      if (!this._textEditor.acceptsTableEdit(row) || !re.test(line)) {
        break;
      }
      lines.push(line);
      endRow = row;
    }
    const range = new Range(
      new Point(startRow, 0),
      new Point(endRow, lines[lines.length - 1].length)
    );
    const table = readTable(lines, options);
    const focus = table.focusOfPosition(pos, startRow);
    return { range, lines, table, focus };
  }

  /**
   * Finds a table and does an operation with it.
   *
   * @private
   * @param {Object} options - See {@link options}.
   * @param {Function} func - A function that does some operation on table information obtained by
   * {@link TableEditor#_findTable}.
   * @returns {undefined}
   */
  _withTable(options, func) {
    const info = this._findTable(options);
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
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // format
      const formatted = formatTable(completed.table, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, completed.table, formatted, false));
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
    this._withTable(options, ({ range, lines, table, focus }) => {
      // complete
      const completed = completeTable(table, options);
      // format
      const formatted = formatTable(completed.table, options);
      // apply
      const newRow = range.end.row + (completed.delimiterInserted ? 2 : 1);
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        let newPos;
        if (newRow > this._textEditor.getLastRow()) {
          this._textEditor.insertLine(newRow, "");
          newPos = new Point(newRow, 0);
        }
        else {
          const re = new RegExp(`^${marginRegexSrc(options.leftMarginChars)}`, "u");
          const nextLine = this._textEditor.getLine(newRow);
          const margin = re.exec(nextLine)[0];
          newPos = new Point(newRow, margin.length);
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
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // alter alignment
      let altered = completed.table;
      if (0 <= newFocus.column && newFocus.column <= altered.getHeaderWidth() - 1) {
        altered = alterAlignment(completed.table, newFocus.column, alignment, options);
      }
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, completed.table, formatted, false));
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
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // format
      const formatted = formatTable(completed.table, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, completed.table, formatted, false));
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
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      const startFocus = newFocus;
      // move focus
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
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, completed.table, formatted, moved));
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
    this._withTable(options, ({ range, lines, table, focus }) => {
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
      // move focus
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
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, true));
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

  /**
   * Moves the focus to the previous cell.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  previousCell(options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      const startFocus = newFocus;
      // move focus
      if (newFocus.row === 0) {
        if (newFocus.column > 0) {
          newFocus = newFocus.setColumn(newFocus.column - 1);
        }
      }
      else if (newFocus.row === 1) {
        newFocus = new Focus(0, completed.table.getHeaderWidth() - 1, newFocus.offset);
      }
      else {
        if (newFocus.column > 0) {
          newFocus = newFocus.setColumn(newFocus.column - 1);
        }
        else {
          newFocus = new Focus(
            newFocus.row === 2 ? 0 : newFocus.row - 1,
            completed.table.getHeaderWidth() - 1,
            newFocus.offset
          );
        }
      }
      const moved = !newFocus.posEquals(startFocus);
      // format
      const formatted = formatTable(completed.table, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, completed.table, formatted, moved));
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
   * Moves the focus to the next row.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  nextRow(options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
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
      // move focus
      if (newFocus.row === 0) {
        newFocus = newFocus.setRow(2);
      }
      else {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      if (options.smartCursor) {
        if (this._scActive) {
          newFocus = newFocus.setColumn(this._scStartFocus.column);
        }
        else if (newFocus.column < 0 || altered.getHeaderWidth() - 1 < newFocus.column) {
          newFocus = newFocus.setColumn(0);
        }
      }
      else {
        newFocus = newFocus.setColumn(0);
      }
      // insert empty row if needed
      if (newFocus.row > altered.getHeight() - 1) {
        const row = new Array(altered.getHeaderWidth()).fill(new TableCell(""));
        altered = insertRow(altered, altered.getHeight(), new TableRow(row, "", ""));
      }
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, true));
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
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

  /**
   * Inserts an empty row at the current focus.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  insertRow(options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // move focus
      if (newFocus.row <= 1) {
        newFocus = newFocus.setRow(2);
      }
      newFocus = newFocus.setColumn(0);
      // insert an empty row
      const row = new Array(completed.table.getHeaderWidth()).fill(new TableCell(""));
      const altered = insertRow(completed.table, newFocus.row, new TableRow(row, "", ""));
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, true));
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._moveToFocus(range.start.row, formatted.table, newFocus);
      });
      this.resetSmartCursor();
    });
  }

  /**
   * Deletes a row at the current focus.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  deleteRow(options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // delete a row
      let altered = completed.table;
      let moved = false;
      if (newFocus.row !== 1) {
        altered = deleteRow(altered, newFocus.row);
        moved = true;
        if (newFocus.row > altered.getHeight() - 1) {
          newFocus = newFocus.setRow(newFocus.row === 2 ? 0 : newFocus.row - 1);
        }
      }
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, moved));
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
      this.resetSmartCursor();
    });
  }

  /**
   * Moves the focused row by the specified offset.
   *
   * @param {number} offset - An offset the row is moved by.
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  moveRow(offset, options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // move row
      let altered = completed.table;
      if (newFocus.row > 1) {
        const dest = Math.min(Math.max(newFocus.row + offset, 2), altered.getHeight() - 1);
        altered = moveRow(altered, newFocus.row, dest);
        newFocus = newFocus.setRow(dest);
      }
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, false));
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._moveToFocus(range.start.row, formatted.table, newFocus);
      });
      this.resetSmartCursor();
    });
  }

  /**
   * Inserts an empty column at the current focus.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  insertColumn(options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // move focus
      if (newFocus.row === 1) {
        newFocus = newFocus.setRow(0);
      }
      if (newFocus.column < 0) {
        newFocus = newFocus.setColumn(0);
      }
      // insert an empty column
      const column = new Array(completed.table.getHeight() - 1).fill(new TableCell(""));
      const altered = insertColumn(completed.table, newFocus.column, column, options);
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, true));
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._moveToFocus(range.start.row, formatted.table, newFocus);
      });
      this.resetSmartCursor();
    });
  }

  /**
   * Deletes a column at the current focus.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  deleteColumn(options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // move focus
      if (newFocus.row === 1) {
        newFocus = newFocus.setRow(0);
      }
      // delete a column
      let altered = completed.table;
      let moved = false;
      if (0 <= newFocus.column && newFocus.column <= altered.getHeaderWidth() - 1) {
        altered = deleteColumn(completed.table, newFocus.column, options);
        moved = true;
        if (newFocus.column > altered.getHeaderWidth() - 1) {
          newFocus = newFocus.setColumn(altered.getHeaderWidth() - 1);
        }
      }
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, moved));
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
      this.resetSmartCursor();
    });
  }

  /**
   * Moves the focused column by the specified offset.
   *
   * @param {number} offset - An offset the column is moved by.
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  moveColumn(offset, options) {
    this._withTable(options, ({ range, lines, table, focus }) => {
      let newFocus = focus;
      // complete
      const completed = completeTable(table, options);
      if (completed.delimiterInserted && newFocus.row > 0) {
        newFocus = newFocus.setRow(newFocus.row + 1);
      }
      // move column
      let altered = completed.table;
      if (0 <= newFocus.column && newFocus.column <= altered.getHeaderWidth() - 1) {
        const dest = Math.min(Math.max(newFocus.column + offset, 0), altered.getHeaderWidth() - 1);
        altered = moveColumn(altered, newFocus.column, dest);
        newFocus = newFocus.setColumn(dest);
      }
      // format
      const formatted = formatTable(altered, options);
      newFocus = newFocus.setOffset(_computeNewOffset(newFocus, altered, formatted, false));
      // apply
      this._textEditor.transact(() => {
        this._updateLines(range.start.row, range.end.row + 1, formatted.table.toLines(), lines);
        this._moveToFocus(range.start.row, formatted.table, newFocus);
      });
      this.resetSmartCursor();
    });
  }

  /**
   * Formats all the tables in the text editor.
   *
   * @param {Object} options - See {@link options}.
   * @returns {undefined}
   */
  formatAll(options) {
    this._textEditor.transact(() => {
      const re = _createIsTableRowRegex(options.leftMarginChars);
      let pos = this._textEditor.getCursorPosition();
      let lines = [];
      let startRow = undefined;
      let lastRow = this._textEditor.getLastRow();
      // find tables
      for (let row = 0; row <= lastRow; row++) {
        const line = this._textEditor.getLine(row);
        if (this._textEditor.acceptsTableEdit(row) && re.test(line)) {
          lines.push(line);
          if (startRow === undefined) {
            startRow = row;
          }
        }
        else if (startRow !== undefined) {
          // get table info
          const endRow = row - 1;
          const range = new Range(
            new Point(startRow, 0),
            new Point(endRow, lines[lines.length - 1].length)
          );
          const table = readTable(lines, options);
          const focus = table.focusOfPosition(pos, startRow);
          const focused = focus !== undefined;
          // format
          let newFocus = focus;
          const completed = completeTable(table, options);
          if (focused && completed.delimiterInserted && newFocus.row > 0) {
            newFocus = newFocus.setRow(newFocus.row + 1);
          }
          const formatted = formatTable(completed.table, options);
          if (focused) {
            newFocus = newFocus.setOffset(
              _computeNewOffset(newFocus, completed.table, formatted, false)
            );
          }
          // apply
          const newLines = formatted.table.toLines();
          this._updateLines(range.start.row, range.end.row + 1, newLines, lines);
          // update cursor position
          const diff = newLines.length - lines.length;
          if (focused) {
            pos = formatted.table.positionOfFocus(newFocus, startRow);
          }
          else if (pos.row > endRow) {
            pos = new Point(pos.row + diff, pos.column);
          }
          // reset
          lines = [];
          startRow = undefined;
          // update
          lastRow += diff;
          row += diff;
        }
      }
      if (startRow !== undefined) {
        // get table info
        const endRow = lastRow;
        const range = new Range(
          new Point(startRow, 0),
          new Point(endRow, lines[lines.length - 1].length)
        );
        const table = readTable(lines, options);
        const focus = table.focusOfPosition(pos, startRow);
        // format
        let newFocus = focus;
        const completed = completeTable(table, options);
        if (completed.delimiterInserted && newFocus.row > 0) {
          newFocus = newFocus.setRow(newFocus.row + 1);
        }
        const formatted = formatTable(completed.table, options);
        newFocus = newFocus.setOffset(
          _computeNewOffset(newFocus, completed.table, formatted, false)
        );
        // apply
        const newLines = formatted.table.toLines();
        this._updateLines(range.start.row, range.end.row + 1, newLines, lines);
        pos = formatted.table.positionOfFocus(newFocus, startRow);
      }
      this._textEditor.setCursorPosition(pos);
    });
  }
}
