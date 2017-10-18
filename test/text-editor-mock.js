import { Point } from "../lib/point.js";
import { ITextEditor } from "../lib/text-editor.js";

// This is a mock class of the ITextEditor interface
export class TextEditor extends ITextEditor {
  constructor(lines) {
    super();
    this._lines = lines.slice();
    this._cursorPos = new Point(0, 0);
    this._selectionRange = null;
  }

  getCursorPosition() {
    return this._cursorPos;
  }

  setCursorPosition(pos) {
    this._cursorPos = pos;
  }

  getSelectionRange() {
    return this._selectionRange;
  }

  setSelectionRange(range) {
    this._selectionRange = range;
  }

  getLastRow() {
    return this._lines.length - 1;
  }

  getLine(row) {
    return this._lines[row];
  }

  getLines() {
    return this._lines.slice();
  }

  insertLine(row, line) {
    this._lines.splice(row, 0, line);
  }

  deleteLine(row) {
    this._lines.splice(row, 1);
  }

  replaceLines(startRow, endRow, lines) {
    this._lines.splice(startRow, endRow - startRow, ...lines);
  }

  transact(func) {
    func();
  }
}
