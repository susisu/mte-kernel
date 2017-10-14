import { Point } from "../lib/point.js";
import { ITextEditor } from "../lib/text-editor.js";

// This is a mock class of the ITextEditor interface
export class TextEditor extends ITextEditor {
  constructor(lines) {
    super();
    this._lines = lines.slice();
    this._cursorPos = new Point(0, 0);
  }

  getCursorPos() {
    return this._cursorPos;
  }

  setCursorPos(pos) {
    this._cursorPos = pos;
  }

  getLastRow() {
    return this._lines.length - 1;
  }

  getLine(row) {
    return this._lines[row];
  }
}
