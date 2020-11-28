import { expect } from "chai";

import { Point } from "../lib/point.js";
import { Range } from "../lib/range.js";
import { Focus } from "../lib/focus.js";
import { Alignment, DefaultAlignment } from "../lib/alignment.js";
import { Table } from "../lib/table.js";
import { readTable } from "../lib/parser.js";
import { completeTable, formatTable } from "../lib/formatter.js";
import { options } from "../lib/options.js";
import { _createIsTableRowRegex, _computeNewOffset, TableEditor } from "../lib/table-editor.js";

import { TextEditor } from "./text-editor-mock.js";

/**
 * @test {_createIsTableRowRegex}
 */
describe("_createIsTableRowRegex(leftMarginChars)", () => {
  it("should return a regular expression object that matches a table row", () => {
    {
      const re = _createIsTableRowRegex(new Set());
      expect(re.test("|")).to.be.true;
      expect(re.test("|foo")).to.be.true;
      expect(re.test(" \t|")).to.be.true;
      expect(re.test(" \t|foo")).to.be.true;
      expect(re.test("")).to.be.false;
      expect(re.test("foo")).to.be.false;
      expect(re.test(" \t")).to.be.false;
      expect(re.test(" \tfoo")).to.be.false;
      expect(re.test(" * |foo")).to.be.false;
    }
    {
      const re = _createIsTableRowRegex(new Set("*"));
      expect(re.test("|")).to.be.true;
      expect(re.test("|foo")).to.be.true;
      expect(re.test(" \t|")).to.be.true;
      expect(re.test(" \t|foo")).to.be.true;
      expect(re.test("")).to.be.false;
      expect(re.test("foo")).to.be.false;
      expect(re.test(" \t")).to.be.false;
      expect(re.test(" \tfoo")).to.be.false;
      expect(re.test(" * |foo")).to.be.true;
    }
  });

  it("should ignore a pipe, a backslash, and a backquote", () => {
    const re = _createIsTableRowRegex(new Set("*|\\`"));
    expect(re.test("|")).to.be.true;
    expect(re.test("|foo")).to.be.true;
    expect(re.test(" \t|")).to.be.true;
    expect(re.test(" \t|foo")).to.be.true;
    expect(re.test("")).to.be.false;
    expect(re.test("foo")).to.be.false;
    expect(re.test(" \t")).to.be.false;
    expect(re.test(" \tfoo")).to.be.false;
    expect(re.test(" * |foo")).to.be.true;
    expect(re.test(" \\|foo")).to.be.false;
    expect(re.test(" ` |foo")).to.be.false;
  });
});

/**
 * @test {_computeNewOffset}
 */
describe("_computeNewOffset(focus, completed, formatted, moved)", () => {
  it("should compute new focus offset from the information of the completed and formatted tables", () => {
    const table = readTable(
      [
        " | A | B | ",
        "| --- | ---:|",
        "  | C | D |  "
      ],
      { leftMarginChars: new Set() }
    );
    const ops = options({});
    const completed = completeTable(table, ops);
    const formatted = formatTable(completed.table, ops);
    expect(_computeNewOffset(new Focus(2, 0, 0), completed.table, formatted, false)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 0, 1), completed.table, formatted, false)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 0, 2), completed.table, formatted, false)).to.equal(2);
    expect(_computeNewOffset(new Focus(2, 0, 3), completed.table, formatted, false)).to.equal(2);
    expect(_computeNewOffset(new Focus(2, 0, 0), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 0, 1), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 0, 2), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 0, 3), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 1, 0), completed.table, formatted, false)).to.equal(3);
    expect(_computeNewOffset(new Focus(2, 1, 1), completed.table, formatted, false)).to.equal(3);
    expect(_computeNewOffset(new Focus(2, 1, 2), completed.table, formatted, false)).to.equal(4);
    expect(_computeNewOffset(new Focus(2, 1, 3), completed.table, formatted, false)).to.equal(4);
    expect(_computeNewOffset(new Focus(2, 1, 0), completed.table, formatted, true)).to.equal(3);
    expect(_computeNewOffset(new Focus(2, 1, 1), completed.table, formatted, true)).to.equal(3);
    expect(_computeNewOffset(new Focus(2, 1, 2), completed.table, formatted, true)).to.equal(3);
    expect(_computeNewOffset(new Focus(2, 1, 3), completed.table, formatted, true)).to.equal(3);
    expect(_computeNewOffset(new Focus(2, -1, 0), completed.table, formatted, false)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, -1, 1), completed.table, formatted, false)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, -1, 2), completed.table, formatted, false)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, -1, 0), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, -1, 1), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, -1, 2), completed.table, formatted, true)).to.equal(1);
    expect(_computeNewOffset(new Focus(2, 2, 0), completed.table, formatted, false)).to.equal(0);
    expect(_computeNewOffset(new Focus(2, 2, 1), completed.table, formatted, false)).to.equal(0);
    expect(_computeNewOffset(new Focus(2, 2, 2), completed.table, formatted, false)).to.equal(0);
    expect(_computeNewOffset(new Focus(2, 2, 0), completed.table, formatted, true)).to.equal(0);
    expect(_computeNewOffset(new Focus(2, 2, 1), completed.table, formatted, true)).to.equal(0);
    expect(_computeNewOffset(new Focus(2, 2, 2), completed.table, formatted, true)).to.equal(0);
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
  describe("#cursorIsInTable(options)", () => {
    it("should return true if the cursor of the text editor is in a table", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| ?   | ?   |", // not included in table for some reason
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |",
          "| ?   | ?   |", // not included in table for some reason
          "bar"
        ]);
        textEditor.acceptsTableEdit = function (row) {
          return row !== 1 && row !== 6;
        };
        const ops = options({});
        const tableEditor = new TableEditor(textEditor);
        textEditor.setCursorPosition(new Point(0, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(0, 3));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(1, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(1, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(2, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(2, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(3, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(3, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(4, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(4, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(5, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(5, 16));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(6, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(6, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(7, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(7, 3));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| ?   | ?   |", // not included in table for some reason
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |",
          "| ?   | ?   |", // not included in table for some reason
          "bar"
        ]);
        textEditor.acceptsTableEdit = function (row) {
          return row !== 1 && row !== 6;
        };
        const ops = options({
          leftMarginChars: new Set("*")
        });
        const tableEditor = new TableEditor(textEditor);
        textEditor.setCursorPosition(new Point(0, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(0, 3));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(1, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(1, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(2, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(2, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(3, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(3, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(4, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(4, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(5, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(5, 16));
        expect(tableEditor.cursorIsInTable(ops)).to.be.true;
        textEditor.setCursorPosition(new Point(6, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(6, 13));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(7, 0));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
        textEditor.setCursorPosition(new Point(7, 3));
        expect(tableEditor.cursorIsInTable(ops)).to.be.false;
      }
    });
  });

  /**
   * @test {TableEditor#_findTable}
   */
  describe("#_findTable(options)", () => {
    it("should find a table under the current cursor position and return an object that describes the table", () => {
      const textEditor = new TextEditor([
        "foo",
        "| ?   | ?   |", // not included in table for some reason
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        " * | E   | F   |",
        "| ?   | ?   |", // not included in table for some reason
        "bar"
      ]);
      textEditor.acceptsTableEdit = function (row) {
        return row !== 1 && row !== 6;
      };
      const tableEditor = new TableEditor(textEditor);
      textEditor.setCursorPosition(new Point(2, 0));
      {
        const ops = options({});
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(4);
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
      textEditor.setCursorPosition(new Point(2, 2));
      {
        const ops = options({});
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(4);
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
      textEditor.setCursorPosition(new Point(2, 9));
      {
        const ops = options({});
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(4);
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
      textEditor.setCursorPosition(new Point(2, 13));
      {
        const ops = options({});
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(4);
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
      textEditor.setCursorPosition(new Point(3, 2));
      {
        const ops = options({});
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(4);
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
      textEditor.setCursorPosition(new Point(4, 2));
      {
        const ops = options({});
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(4);
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
      textEditor.setCursorPosition(new Point(2, 0));
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(5);
        expect(info.range.end.column).to.equal(16);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(0);
        expect(info.focus.column).to.equal(-1);
        expect(info.focus.offset).to.equal(0);
      }
      textEditor.setCursorPosition(new Point(5, 0));
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(5);
        expect(info.range.end.column).to.equal(16);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(3);
        expect(info.focus.column).to.equal(-1);
        expect(info.focus.offset).to.equal(0);
      }
      textEditor.setCursorPosition(new Point(5, 5));
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        const info = tableEditor._findTable(ops);
        expect(info).to.be.an("object");
        expect(info.range).to.be.an.instanceOf(Range);
        expect(info.range.start.row).to.equal(2);
        expect(info.range.start.column).to.equal(0);
        expect(info.range.end.row).to.equal(5);
        expect(info.range.end.column).to.equal(16);
        expect(info.lines).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |"
        ]);
        expect(info.table).to.be.an.instanceOf(Table);
        expect(info.table.toLines()).to.deep.equal([
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          " * | E   | F   |"
        ]);
        expect(info.focus).to.be.an.instanceOf(Focus);
        expect(info.focus.row).to.equal(3);
        expect(info.focus.column).to.equal(0);
        expect(info.focus.offset).to.equal(1);
      }
    });

    it("should return undefined if there is no table at the cursor position", () => {
      const textEditor = new TextEditor([
        "foo",
        "| ?   | ?   |", // not included in table for some reason
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        " * | E   | F   |",
        "| ?   | ?   |", // not included in table for some reason
        "bar"
      ]);
      textEditor.acceptsTableEdit = function (row) {
        return row !== 1 && row !== 6;
      };
      const tableEditor = new TableEditor(textEditor);
      {
        const ops = options({});
        textEditor.setCursorPosition(new Point(0, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(0, 3));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(1, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(1, 13));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(5, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(5, 16));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(6, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(6, 13));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(7, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(7, 3));
        expect(tableEditor._findTable(ops)).to.be.undefined;
      }
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        textEditor.setCursorPosition(new Point(0, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(0, 3));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(1, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(1, 13));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(6, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(6, 13));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(7, 0));
        expect(tableEditor._findTable(ops)).to.be.undefined;
        textEditor.setCursorPosition(new Point(7, 3));
        expect(tableEditor._findTable(ops)).to.be.undefined;
      }
    });
  });

  /**
   * @test {TableEditor#_withTable}
   */
  describe("#_withTable(options, func)", () => {
    it("should call the function with table information obtained by _findTable() method", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        " * | E   | F   |",
        "bar"
      ]);
      const tableEditor = new TableEditor(textEditor);
      textEditor.setCursorPosition(new Point(1, 2));
      {
        const ops = options({});
        tableEditor._withTable(ops, info => {
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
        });
      }
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        tableEditor._withTable(ops, info => {
          expect(info).to.be.an("object");
          expect(info.range).to.be.an.instanceOf(Range);
          expect(info.range.start.row).to.equal(1);
          expect(info.range.start.column).to.equal(0);
          expect(info.range.end.row).to.equal(4);
          expect(info.range.end.column).to.equal(16);
          expect(info.lines).to.deep.equal([
            "| A   | B   |",
            "| --- | --- |",
            "| C   | D   |",
            " * | E   | F   |"
          ]);
          expect(info.table).to.be.an.instanceOf(Table);
          expect(info.table.toLines()).to.deep.equal([
            "| A   | B   |",
            "| --- | --- |",
            "| C   | D   |",
            " * | E   | F   |"
          ]);
          expect(info.focus).to.be.an.instanceOf(Focus);
          expect(info.focus.row).to.equal(0);
          expect(info.focus.column).to.equal(0);
          expect(info.focus.offset).to.equal(1);
        });
      }
    });

    it("should not call the function if no table is found", () => {
      const textEditor = new TextEditor([
        "foo",
        "| A   | B   |",
        "| --- | --- |",
        "| C   | D   |",
        "* | E   | F   |",
        "bar"
      ]);
      const tableEditor = new TableEditor(textEditor);
      {
        textEditor.setCursorPosition(new Point(0, 0));
        const ops = options({});
        let called = false;
        tableEditor._withTable(ops, info => {
          called = true;
        });
        expect(called).to.be.false;
      }
      {
        textEditor.setCursorPosition(new Point(4, 0));
        const ops = options({});
        let called = false;
        tableEditor._withTable(ops, info => {
          called = true;
        });
        expect(called).to.be.false;
      }
      {
        textEditor.setCursorPosition(new Point(5, 0));
        const ops = options({});
        let called = false;
        tableEditor._withTable(ops, info => {
          called = true;
        });
        expect(called).to.be.false;
      }
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        textEditor.setCursorPosition(new Point(0, 0));
        let called = false;
        tableEditor._withTable(ops, info => {
          called = true;
        });
        expect(called).to.be.false;
      }
      {
        const ops = options({
          leftMarginChars: new Set("*")
        });
        textEditor.setCursorPosition(new Point(5, 0));
        let called = false;
        tableEditor._withTable(ops, info => {
          called = true;
        });
        expect(called).to.be.false;
      }
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
      const ops = options({});
      const info = tableEditor._findTable(ops);
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
      const ops = options({});
      const info = tableEditor._findTable(ops);
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
      const ops = options({});
      const info = tableEditor._findTable(ops);
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
      const ops = options({});
      const info = tableEditor._findTable(ops);
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
      const ops = options({});
      const info = tableEditor._findTable(ops);
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
          " * foo",
          " * | A | B |",
          " *  | ----- | --- |",
          " *   | C | D |",
          " *   bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {
          leftMarginChars: new Set("*")
        };
        tableEditor.escape(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(5);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          " * foo",
          " * | A   | B   |",
          " * | --- | --- |",
          " * | C   | D   |",
          " *   bar"
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
      {
        const textEditor = new TextEditor([
          " * foo",
          " * | A | B |",
          " *   | C | D |",
          " *   bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {
          leftMarginChars: new Set("*")
        };
        tableEditor.escape(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(5);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          " * foo",
          " * | A   | B   |",
          " * | --- | --- |",
          " * | C   | D   |",
          " *   bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#alignColumn}
   */
  describe("#alignColumn(alignment, options)", () => {
    it("should alter alignment of a column", () => {
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
        tableEditor.alignColumn(Alignment.RIGHT, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(4);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|   A | B   |",
          "| ---:| --- |",
          "|   C | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.alignColumn(Alignment.RIGHT, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(4);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|   A | B   |",
          "| ---:| --- |",
          "|   C | D   |",
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
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.alignColumn(Alignment.RIGHT, options(ops));
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.alignColumn(Alignment.RIGHT, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
    });
  });

  /**
   * @test {TableEditor#selectCell}
   */
  describe("#selectCell(options)", () => {
    it("should select the focused cell content", () => {
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
        tableEditor.selectCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
          "  | C |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 7));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.selectCell(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   |     |",
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
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.selectCell(options(ops));
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.selectCell(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.selectCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.selectCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(2);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(2);
        expect(range.end.column).to.equal(5);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#moveFocus}
   */
  describe("#moveFocus(rowOffset, columnOffset, options)", () => {
    it("should move focus by the offsets", () => {
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
        tableEditor.moveFocus(0, 0, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(-1, 0, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
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
        const ops = {};
        tableEditor.moveFocus(0, -1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, 1, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, -1, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, 1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(-1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
        tableEditor.moveFocus(1, 0, options(ops));
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(4);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(4);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(-1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(-1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 11));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, -1, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(2);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(2);
        expect(range.end.column).to.equal(5);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, 1, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(2);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(2);
        expect(range.end.column).to.equal(11);
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
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(-1, 0, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
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
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
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
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, -1, options(ops));
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
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, 1, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(1, 0, options(ops));
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, -1, options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveFocus(0, 1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
    });
  });

  /**
   * @test {TableEditor#nextCell}
   */
  describe("#nextCell(options)", () => {
    it("should move the focus to the next cell", () => {
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
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
        const ops = {};
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(14);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   | ",
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(20);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |     | ",
          "| --- | --- | --- |",
          "| C   | D   |     |",
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 11));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 16));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(9);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
    });

    it("should treat smart cursor correctly", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(0);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(0);
        expect(tableEditor._scLastFocus.column).to.equal(2);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(0);
        expect(tableEditor._scLastFocus.row).to.equal(0);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(2);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 8));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(1);
        expect(tableEditor._scStartFocus.column).to.equal(1);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(0);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        textEditor.setCursorPosition(new Point(3, 2));
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(2);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(0);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        textEditor.setCursorPosition(new Point(5, 8));
        tableEditor.nextCell(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(5);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(1);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(0);
        expect(tableEditor._scLastFocus.column).to.equal(2);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 11));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(9);
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
        textEditor.setCursorPosition(new Point(2, 16));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#previousCell}
   */
  describe("#previousCell(options)", () => {
    it("should move the focus to the previous cell", () => {
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
        tableEditor.previousCell(options(ops));
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
        const ops = {};
        tableEditor.previousCell(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
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
        textEditor.setCursorPosition(new Point(2, 11));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
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
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
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
        textEditor.setCursorPosition(new Point(3, 8));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(9);
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(9);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.previousCell(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(9);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#nextRow}
   */
  describe("#nextRow(options)", () => {
    it("should move the focus to the next row", () => {
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
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
        textEditor.setCursorPosition(new Point(2, 11));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(4);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(4);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 8));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(4);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(4);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(4);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(4);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.nextRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
          "bar"
        ]);
      }
    });

    it("should treat smart cursor correctly", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(3);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 8));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(1);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(1);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(3);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(0);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(2);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(3);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 8));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(1);
        expect(tableEditor._scStartFocus.column).to.equal(1);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        textEditor.setCursorPosition(new Point(1, 8));
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(1);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(1);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(1);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(0);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(2);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
        textEditor.setCursorPosition(new Point(8, 2));
        tableEditor.nextRow(options(ops));
        expect(tableEditor._scActive).to.be.true;
        expect(tableEditor._scTablePos.row).to.equal(6);
        expect(tableEditor._scTablePos.column).to.equal(0);
        expect(tableEditor._scStartFocus.row).to.equal(2);
        expect(tableEditor._scStartFocus.column).to.equal(0);
        expect(tableEditor._scStartFocus.offset).to.equal(1);
        expect(tableEditor._scLastFocus.row).to.equal(3);
        expect(tableEditor._scLastFocus.column).to.equal(0);
        expect(tableEditor._scLastFocus.offset).to.equal(1);
      }

      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(9);
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
          "| A | B | C |",
          " | ----- | --- | --- |",
          "  | D | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = { smartCursor: true };
        tableEditor.nextCell(options(ops));
        tableEditor.nextRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(8);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(9);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   | C   |",
          "| --- | --- | --- |",
          "| D   | E   | F   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#insertRow}
   */
  describe("#insertRow(options)", () => {
    it("should insert an empty row at the focus", () => {
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
        tableEditor.insertRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
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
        tableEditor.insertRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "|     |     |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "|     |     |",
          "| C   | D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#deleteRow}
   */
  describe("#deleteRow(options)", () => {
    it("should delete a row at the focus", () => {
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
        tableEditor.deleteRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     |     |",
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
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     |     |",
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     |     |",
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(13);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     |     |",
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(2);
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
        tableEditor.deleteRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
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
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteRow(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| E   | F   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#moveRow}
   */
  describe("#moveRow(offset, options)", () => {
    it("should move the focused row by the specified offset", () => {
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
        tableEditor.moveRow(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(2);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(2);
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          " | ----- | --- |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(3, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| E   | F   |",
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| E   | F   |",
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
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(4, 5));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| E   | F   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "   | E | F |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveRow(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| E   | F   |",
          "| C   | D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#insertColumn}
   */
  describe("#insertColumn(options)", () => {
    it("should insert an empty column at the focus", () => {
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
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     | A   | B   |",
          "| --- | --- | --- |",
          "|     | C   | D   |",
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
        const ops = {};
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     | A   | B   |",
          "| --- | --- | --- |",
          "|     | C   | D   |",
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   |     | B   |",
          "| --- | --- | --- |",
          "| C   |     | D   |",
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(14);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |     |",
          "| --- | --- | --- |",
          "| C   | D   |     |",
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     | A   | B   |",
          "| --- | --- | --- |",
          "|     | C   | D   |",
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
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     | A   | B   |",
          "| --- | --- | --- |",
          "|     | C   | D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.insertColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     | A   | B   |",
          "| --- | --- | --- |",
          "|     | C   | D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#deleteColumn}
   */
  describe("#deleteColumn(options)", () => {
    it("should delete a column at the current focus", () => {
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
        tableEditor.deleteColumn(options(ops));
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
        const ops = {};
        tableEditor.deleteColumn(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   |",
          "| --- |",
          "| D   |",
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteColumn(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   |",
          "| --- |",
          "| C   |",
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(2, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteColumn(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(1);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(1);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   |",
          "| --- |",
          "| D   |",
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
        tableEditor.deleteColumn(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   |",
          "| --- |",
          "| D   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A |",
          " | ----- |",
          "  | C |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteColumn(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "|     |",
          "| --- |",
          "|     |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.deleteColumn(options(ops));
        const range = textEditor.getSelectionRange();
        expect(range.start.row).to.equal(3);
        expect(range.start.column).to.equal(2);
        expect(range.end.row).to.equal(3);
        expect(range.end.column).to.equal(3);
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   |",
          "| --- |",
          "| D   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#moveColumn}
   */
  describe("#moveColumn(offset, options)", () => {
    it("should move the focused column by the specified offset", () => {
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
        tableEditor.moveColumn(-1, options(ops));
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
        textEditor.setCursorPosition(new Point(1, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(1, options(ops));
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
        const ops = {};
        tableEditor.moveColumn(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   | A   |",
          "| --- | --- |",
          "| D   | C   |",
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   | A   |",
          "| --- | --- |",
          "| D   | C   |",
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
        textEditor.setCursorPosition(new Point(1, 6));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(1, 9));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
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
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(-1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(2);
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
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(2);
        expect(pos.column).to.equal(9);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   | A   |",
          "| --- | --- |",
          "| D   | C   |",
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
        tableEditor.moveColumn(-1, options(ops));
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
        tableEditor.moveColumn(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   | A   |",
          "| --- | --- |",
          "| D   | C   |",
          "bar"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.moveColumn(1, options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(8);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| B   | A   |",
          "| --- | --- |",
          "| D   | C   |",
          "bar"
        ]);
      }
    });
  });

  /**
   * @test {TableEditor#formatAll}
   */
  describe("#formatAll(options)", () => {
    it("should format all the tables in the text editor", () => {
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          " | ----- | --- |",
          "  | G | H |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(0, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(0);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "baz"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          " | ----- | --- |",
          "  | G | H |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(2, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "baz"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          " | ----- | --- |",
          "  | G | H |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(3, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(4);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "baz"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          " | ----- | --- |",
          "  | G | H |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(6, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(7);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "baz"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          " | ----- | --- |",
          "  | G | H |",
          "baz"
        ]);
        textEditor.setCursorPosition(new Point(7, 3));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(8);
        expect(pos.column).to.equal(3);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |",
          "baz"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          "  | G | H |"
        ]);
        textEditor.setCursorPosition(new Point(0, 0));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(0);
        expect(pos.column).to.equal(0);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          "  | G | H |"
        ]);
        textEditor.setCursorPosition(new Point(4, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(5);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| A | B |",
          "  | C | D |",
          "bar",
          "| E | F |",
          "  | G | H |"
        ]);
        textEditor.setCursorPosition(new Point(5, 4));
        const tableEditor = new TableEditor(textEditor);
        const ops = {};
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(7);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "bar",
          "| E   | F   |",
          "| --- | --- |",
          "| G   | H   |"
        ]);
      }
      {
        const textEditor = new TextEditor([
          "foo",
          "| ? | ? |", // not included in table for some reason
          "| A | B |",
          "  | C | D |",
          "| ? | ? |", // not included in table for some reason
          "bar",
          " * | E | F |",
          " *  | ----- | --- |",
          " *   | G | H |",
          "baz"
        ]);
        textEditor.acceptsTableEdit = function (row) {
          return row !== 1 && row !== 4;
        };
        textEditor.setCursorPosition(new Point(1, 2));
        const tableEditor = new TableEditor(textEditor);
        const ops = {
          leftMarginChars: new Set("*")
        };
        tableEditor.formatAll(options(ops));
        const pos = textEditor.getCursorPosition();
        expect(pos.row).to.equal(1);
        expect(pos.column).to.equal(2);
        expect(textEditor.getSelectionRange()).to.be.null;
        expect(textEditor.getLines()).to.deep.equal([
          "foo",
          "| ? | ? |",
          "| A   | B   |",
          "| --- | --- |",
          "| C   | D   |",
          "| ? | ? |",
          "bar",
          " * | E   | F   |",
          " * | --- | --- |",
          " * | G   | H   |",
          "baz"
        ]);
      }
    });
  });
});
