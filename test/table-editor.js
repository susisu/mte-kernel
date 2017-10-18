import { expect } from "chai";

import { Point } from "../lib/point.js";
import { Range } from "../lib/range.js";
import { Focus } from "../lib/focus.js";
import { Table } from "../lib/table.js";
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
});
