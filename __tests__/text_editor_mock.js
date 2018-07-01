const { AbstractTextEditor } = require("../src/text_editor.js");

class MockTextEditor extends AbstractTextEditor {
  constructor(lines) {
    super();
    this._lines = lines.slice();
    this._cursor = [0, 0];
    this._selection = null;
  }

  getCursor() {
    return this._cursor;
  }

  setCursor(cursor) {
    this._cursor = cursor;
    this._selection = null;
  }

  getSelection() {
    return this._selection;
  }

  setSelection(startCursor, endCursor) {
    this._cursor = endCursor;
    this._selection = [startCursor, endCursor];
  }

  getLastRow() {
    return this._lines.length - 1;
  }

  accept(row) {
    return this._lines[row].length > 0 && this._lines[row][0] === '|';
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

  replaceLines(range, lines) {
    this._lines.splice(range[0], range[1] - range[0], ...lines);
  }

  transact(callback) {
    callback();
  }
}

module.exports = {
  MockTextEditor,
};
