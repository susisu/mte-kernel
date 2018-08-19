export class AbstractTextEditor {
  getCursor() {
    throw new Error("Not implemented: getCursorPosition");
  }

  setCursor(cursor) {
    throw new Error("Not implemented: setCursorPosition");
  }

  setSelection(startCursor, endCursor) {
    throw new Error("Not implemented: setSelectionRange");
  }

  getLastRow() {
    throw new Error("Not implemented: getLastRow");
  }

  accepts(row) {
    throw new Error("Not implemented: acceptsTableEdit");
  }

  getLine(row) {
    throw new Error("Not implemented: getLine");
  }

  insertLine(row, line) {
    throw new Error("Not implemented: insertLine");
  }

  deleteLine(row) {
    throw new Error("Not implemented: deleteLine");
  }

  replaceLines(range, lines) {
    throw new Error("Not implemented: replaceLines");
  }

  transact(callback) {
    throw new Error("Not implemented: transact");
  }
}
