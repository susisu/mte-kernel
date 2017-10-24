import { expect } from "chai";

import { Point } from "../lib/point.js";
import { Range } from "../lib/range.js";
import { Focus } from "../lib/focus.js";
import { DefaultAlignment } from "../lib/alignment.js";
import { Table } from "../lib/table.js";
import { options } from "../lib/options.js";
import { _isTableRow, TableEditor } from "../lib/table-editor.js";

import { TextEditor } from "./text-editor-mock.js";

/**
 * @test {_isTableRow}
 */
describe("_isTableRow(line)", () => {
  it("should return true if the line starts with a pipe", () => {
    expect(_isTableRow("|")).to.be.true;
    expect(_isTableRow("|foo")).to.be.true;
    expect(_isTableRow(" \t|")).to.be.true;
    expect(_isTableRow(" \t|foo")).to.be.true;
    expect(_isTableRow("")).to.be.false;
    expect(_isTableRow("foo")).to.be.false;
    expect(_isTableRow(" \t")).to.be.false;
    expect(_isTableRow(" \tfoo")).to.be.false;
  });
});

/**
 * @test {TableEditor}
 */
describe("TableEditor", () => {
  /**
   * @test {TableEditor.constructor}
   */
  describe("constructor(textEditor)", () => {
    it("should create a new TableEditor object", () => {
      const tableEditor = new TableEditor(new TextEditor([]));
      expect(tableEditor).to.be.an.instanceOf(TableEditor);
    });
  });

  /**
   * @test {TableEditor#resetSmartCursor}
   */
  describe("#resetSmartCursor()", () => {
    it("should reset the smart cursor flag", () => {
      const tableEditor = new TableEditor(new TextEditor([]));
      tableEditor._scActive = true;
      expect(tableEditor._scActive).to.be.true;
      tableEditor.resetSmartCursor();
      expect(tableEditor._scActive).to.be.false;
    });
  });

  /**
   * @test {TableEditor#cursorIsInTable}
   */
  describe("#cursorIsInTable()", () => {
    it("should return true if the cursor of the text editor is in a table", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        "bar"
      ]);
      const tableEditor = new TableEditor(textEditor);
      textEditor.setCursorPosition(new Point(0, 0));
      expect(tableEditor.cursorIsInTable()).to.be.false;
      textEditor.setCursorPosition(new Point(0, 3));
      expect(tableEditor.cursorIsInTable()).to.be.false;
      textEditor.setCursorPosition(new Point(1, 0));
      expect(tableEditor.cursorIsInTable()).to.be.true;
      textEditor.setCursorPosition(new Point(1, 13));
      expect(tableEditor.cursorIsInTable()).to.be.true;
      textEditor.setCursorPosition(new Point(2, 0));
      expect(tableEditor.cursorIsInTable()).to.be.true;
      textEditor.setCursorPosition(new Point(2, 13));
      expect(tableEditor.cursorIsInTable()).to.be.true;
      textEditor.setCursorPosition(new Point(3, 0));
      expect(tableEditor.cursorIsInTable()).to.be.true;
      textEditor.setCursorPosition(new Point(3, 13));
      expect(tableEditor.cursorIsInTable()).to.be.true;
      textEditor.setCursorPosition(new Point(4, 0));
      expect(tableEditor.cursorIsInTable()).to.be.false;
      textEditor.setCursorPosition(new Point(4, 3));
      expect(tableEditor.cursorIsInTable()).to.be.false;
    });
  });

  /**
   * @test{TableEditor#_findTable}
   */
  describe("#_findTable()", () => {
    it("should find a table under the current cursor position and return an object that describes the table", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        "bar"
      ]);
      const tableEditor = new TableEditor(textEditor);
      textEditor.setCursorPosition(new Point(1, 0));
      {
        const info = tableEditor._findTable();
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(1);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(3);
        expect(info.range.end.column).to.equal(13);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(0);
        expect(info.focus.column).to.equal(-1);
        expect(info.focus.offset).to.equal(0);
      }
      textEditor.setCursorPosition(new Point(1, 2));
      {
        const info = tableEditor._findTable();
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(1);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(3);
        expect(info.range.end.column).to.equal(13);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(0);
        expect(info.focus.column).to.equal(0);
        expect(info.focus.offset).to.equal(1);
      }
      textEditor.setCursorPosition(new Point(1, 9));
      {
        const info = tableEditor._findTable();
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(1);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(3);
        expect(info.range.end.column).to.equal(13);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(0);
        expect(info.focus.column).to.equal(1);
        expect(info.focus.offset).to.equal(2);
      }
      textEditor.setCursorPosition(new Point(1, 13));
      {
        const info = tableEditor._findTable();
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(1);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(3);
        expect(info.range.end.column).to.equal(13);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(0);
        expect(info.focus.column).to.equal(2);
        expect(info.focus.offset).to.equal(0);
      }
      textEditor.setCursorPosition(new Point(2, 2));
      {
        const info = tableEditor._findTable();
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(1);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(3);
        expect(info.range.end.column).to.equal(13);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(1);
        expect(info.focus.column).to.equal(0);
        expect(info.focus.offset).to.equal(1);
      }
      textEditor.setCursorPosition(new Point(3, 2));
      {
        const info = tableEditor._findTable();
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(1);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(3);
        expect(info.range.end.column).to.equal(13);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(2);
        expect(info.focus.column).to.equal(0);
        expect(info.focus.offset).to.equal(1);
      }
    });

    it("should return undefined if there is no table at the cursor position", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        "bar"
      ]);
      const tableEditor = new TableEditor(textEditor);
      textEditor.setCursorPosition(new Point(0, 0));
      expect(tableEditor._findTable()).to.be.undefined;
      textEditor.setCursorPosition(new Point(0, 3));
      expect(tableEditor._findTable()).to.be.undefined;
      textEditor.setCursorPosition(new Point(4, 0));
      expect(tableEditor._findTable()).to.be.undefined;
      textEditor.setCursorPosition(new Point(4, 3));
      expect(tableEditor._findTable()).to.be.undefined;
    });
  });

  /**
   * @test {TableEditor#_updateLines}
   */
  describe("#_updateLines(startRow, endRow, newLines, oldLines = undefined)", () => {
    it("should update lines in the specified range", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        const tableEditor = new TableEditor(textEditor);
        const newLines = [
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |"
        ];
        tableEditor._updateLines(1, 4, newLines);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        const tableEditor = new TableEditor(textEditor);
        const oldLines = [
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ];
        const newLines = [
          "| A   | B   |",
          "| --- | --- |",
          "| G   | H   |"
        ];
        tableEditor._updateLines(1, 4, newLines, oldLines);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| G   | H   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        const tableEditor = new TableEditor(textEditor);
        const oldLines = [
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |"
        ];
        const newLines = [
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |"
        ];
        tableEditor._updateLines(1, 4, newLines, oldLines);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#_moveToFocus}
   */
  describe("#_moveToFocus(startRow, table, focus)", () => {
    it("should move the cursor position to the focused cell", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        "bar"
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      const info = tableEditor._findTable();
      {
        const focus = new Focus(0, 1, 2);
        tableEditor._moveToFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(9);
      }
      {
        const focus = new Focus(2, 0, 1);
        tableEditor._moveToFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
      }
      {
        const focus = new Focus(0, -1, 0);
        tableEditor._moveToFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
      }
      {
        const focus = new Focus(0, 2, 0);
        tableEditor._moveToFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(13);
      }
    });

    it("should do nothing if the focused row is out of the table", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        "bar"
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      const info = tableEditor._findTable();
      {
        const focus = new Focus(-1, 0, 0);
        tableEditor._moveToFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
      }
      {
        const focus = new Focus(3, 0, 0);
        tableEditor._moveToFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
      }
    });
  });

  /**
   * @test {TableEditor#_selectFocus}
   */
  describe("#_selectFocus(startRow, table, focus)", () => {
    it("should select the focued cell in the text editor if the cell is not empty", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A    | B   |",
        "| ---- | --- |",
        "| test |     |",
        "bar"
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      const info = tableEditor._findTable();
      {
        const focus = new Focus(0, 0, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
      }
      {
        const focus = new Focus(0, 0, 2);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
      }
      {
        const focus = new Focus(0, 1, 3);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(9);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(10);
      }
      {
        const focus = new Focus(2, 0, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(6);
      }
    });

    it("should move the cursor position if the cell is empty", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A    | B   |",
        "| ---- | --- |",
        "| test |     |",
        "bar"
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      const info = tableEditor._findTable();
      {
        const focus = new Focus(2, 1, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
      }
      {
        const focus = new Focus(0, -1, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
      }
      {
        const focus = new Focus(0, 2, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(14);
        expect(textEditor.getSelectionRange()).to.be.null;
      }
    });

    it("should do nothing if the focused row is out of the table", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A    | B   |",
        "| ---- | --- |",
        "| test |     |",
        "bar"
      ]);
      textEditor.setCursorPosition(new Point(1, 0));
      const tableEditor = new TableEditor(textEditor);
      const info = tableEditor._findTable();
      {
        const focus = new Focus(-1, 0, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
      }
      {
        const focus = new Focus(3, 0, 0);
        tableEditor._selectFocus(info.range.start.row, info.table, focus);
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
      }
    });
  });

  /**
   * @test {TableEditor#format}
   */
  describe("format(options)", () => {
    it("should format the table under the cursor", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {
          minDelimiterWidth: 5,
          defaultAlignment : DefaultAlignment.CENTER
        };
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(4);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|   A   |   B   |",
          "| ----- | ----- |",
          "|   C   |   D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 1));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(3);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(3);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 7));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 11));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(13);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 8));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(2);
        expect(pos.column).to.equal(5);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   |     |",
          "bar"
        ]);
      }
    });

    it("should do nothing if there is no table", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(0, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(0);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.format(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#escape}
   */
  describe("#escape(options)", () => {
    it("should format and escape from the table", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.escape(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.escape(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          ""
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.escape(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.escape(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          ""
        ]);
      }
    });

    it("should do nothing if there is no table", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A | B |",
        " | ----- | --- |",
        "  | C | D |",
        "bar"
      ]);
      textEditor.setCursorPosition(new Point(0, 0));
      const tableEditor = new TableEditor(textEditor);
      const ops = {};
      tableEditor.escape(options(ops));
      const pos = textEditor.getCursorPosition();
      expect(pos.row).to.equal(0);
      expect(pos.column).to.equal(0);
      expect(textEditor.getSelectionRange()).to.be.null;
      expect(textEditor.getLines()).to.deep.equal([
        "foo",
        "| A | B |",
        " | ----- | --- |",
        "  | C | D |",
        "bar"
      ]);
    });
  });
});
