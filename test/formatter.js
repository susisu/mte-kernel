import { expect } from "chai";

import { Alignment, DefaultAlignment, HeaderAlignment } from "../lib/alignment";
import { TableRow } from "../lib/table-row.js";
import { Table } from "../lib/table.js";
import { readTable } from "../lib/parser.js";
import {
  _delimiterText,
  _extendArray,
  completeTable,
  _computeTextWidth,
  _alignText,
  _padText,
  _formatTable,
  _weakFormatTable,
  FormatType,
  formatTable
} from "../lib/formatter.js";

/**
 * @test {_delimiterText}
 */
describe("_delimiterText(width, alignment)", () => {
  it("should return a delimiter text for the specified alignment", () => {
    expect(_delimiterText(5, Alignment.DEFAULT)).to.equal(" ----- ");
    expect(_delimiterText(5, Alignment.LEFT)).to.equal(":----- ");
    expect(_delimiterText(5, Alignment.RIGHT)).to.equal(" -----:");
    expect(_delimiterText(5, Alignment.CENTER)).to.equal(":-----:");
  });

  it("should throw an error if the alignment is unknown", () => {
    expect(() => { _delimiterText(5, "top"); }).to.throw(Error, /unknown/i);
  });
});

/**
 * @test {_extendArray}
 */
describe("_extendArray(arr, size, callback)", () => {
  it("should create a new array that is extended to the specified size, filling empty elements by return values of the callback", () => {
    expect(_extendArray([], 2, i => i)).to.deep.equal([0, 1]);
    expect(_extendArray([0, 1], 4, i => i)).to.deep.equal([0, 1, 2, 3]);
    expect(_extendArray([0, 1, 2, 3], 2, i => i)).to.deep.equal([0, 1, 2, 3]);
  });
});

/**
 * @test {completeTable}
 */
describe("completeTable(table, options)", () => {
  it("should complete the given table by adding missing delimiter and cells", () => {
    {
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C | D |  "
      ];
      const expectLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C | D |  "
      ];
      const table = readTable(tableLines);
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toLines()).to.deep.equal(expectLines);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableLines = [
        "| A | ",
        "| --- |:----- | --- |",
        "  | B | C | D |  "
      ];
      const expectLines = [
        "| A | ||",
        "| --- |:----- | --- |",
        "  | B | C | D |  "
      ];
      const table = readTable(tableLines);
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toLines()).to.deep.equal(expectLines);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableLines = [
        "| A | B | C |",
        "| --- |      ",
        "  | D | E | F |  "
      ];
      const expectLines = [
        "| A | B | C |",
        "| --- | ---- | --- |",
        "  | D | E | F |  "
      ];
      const table = readTable(tableLines);
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toLines()).to.deep.equal(expectLines);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableLines = [
        "| A | B |",
        "  | C | D |  "
      ];
      const expectLines = [
        "| A | B |",
        "| --- | --- |",
        "  | C | D |  "
      ];
      const table = readTable(tableLines);
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toLines()).to.deep.equal(expectLines);
      expect(completed.delimiterInserted).to.be.true;
    }
    {
      const tableLines = [
        "| A | B | C |",
        "| --- |:----- | --- |",
        "  | D | "
      ];
      const expectLines = [
        "| A | B | C |",
        "| --- |:----- | --- |",
        "  | D | ||"
      ];
      const table = readTable(tableLines);
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toLines()).to.deep.equal(expectLines);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableLines = [
        "|",
        "|",
        " |  "
      ];
      const expectLines = [
        "||",
        "| --- |",
        "||",
        " |  |"
      ];
      const table = readTable(tableLines);
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toLines()).to.deep.equal(expectLines);
      expect(completed.delimiterInserted).to.be.true;
    }
  });

  it("should throw an error if table has no rows", () => {
    const table = new Table([]);
    expect(() => { completeTable(table,  { delimiterWidth: 3 }); }).to.throw(Error, /empty/i);
  });
});

/**
 * @test {_computeTextWidth}
 */
describe("_computeTextWidth(text, options)", () => {
  it("should compute the width of a text based on EAW properties", () => {
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_computeTextWidth("ℵAあＡｱ∀", options)).to.equal(8);
      expect(_computeTextWidth("\u0065\u0301", options)).to.equal(2);
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: true
      };
      expect(_computeTextWidth("ℵAあＡｱ∀", options)).to.equal(9);
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(["∀"]),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_computeTextWidth("ℵAあＡｱ∀", options)).to.equal(9);
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(["∀"]),
        ambiguousAsWide: true
      };
      expect(_computeTextWidth("ℵAあＡｱ∀", options)).to.equal(8);
    }
    {
      const options = {
        normalize      : true,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_computeTextWidth("\u0065\u0301", options)).to.equal(1);
    }
  });
});

/**
 * @test {_alignText}
 */
describe("_alignText(text, width, alignment, options)", () => {
  it("should align the text", () => {
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_alignText("foo", 5, Alignment.LEFT, options)).to.equal("foo  ");
      expect(_alignText("foo", 5, Alignment.RIGHT, options)).to.equal("  foo");
      expect(_alignText("foo", 5, Alignment.CENTER, options)).to.equal(" foo ");

      expect(_alignText("foobar", 5, Alignment.LEFT, options)).to.equal("foobar");
      expect(_alignText("foobar", 5, Alignment.RIGHT, options)).to.equal("foobar");
      expect(_alignText("foobar", 5, Alignment.CENTER, options)).to.equal("foobar");

      expect(_alignText("∀", 5, Alignment.LEFT, options)).to.equal("∀    ");
      expect(_alignText("\u0065\u0301", 5, Alignment.LEFT, options)).to.equal("\u0065\u0301   ");
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_alignText("foo", 7, Alignment.LEFT, options)).to.equal("foo    ");
      expect(_alignText("foo", 7, Alignment.RIGHT, options)).to.equal("    foo");
      expect(_alignText("foo", 7, Alignment.CENTER, options)).to.equal("  foo  ");
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: true
      };
      expect(_alignText("∀", 5, Alignment.LEFT, options)).to.equal("∀   ");
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set("∀"),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_alignText("∀", 5, Alignment.LEFT, options)).to.equal("∀   ");
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set("∀"),
        ambiguousAsWide: true
      };
      expect(_alignText("∀", 5, Alignment.LEFT, options)).to.equal("∀    ");
    }
    {
      const options = {
        normalize      : true,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_alignText("\u0065\u0301", 5, Alignment.LEFT, options)).to.equal("\u0065\u0301    ");
    }
  });

  it("should throw an error if the alignment is unknown", () => {
    const options = {
      normalize      : false,
      wideChars      : new Set(),
      narrowChars    : new Set(),
      ambiguousAsWide: false
    };
    expect(() => { _alignText("foo", 5, "top", options); }).to.throw(Error, /unknown/i);
  });

  it("should throw an error if default alignment is specified", () => {
    const options = {
      normalize      : false,
      wideChars      : new Set(),
      narrowChars    : new Set(),
      ambiguousAsWide: false
    };
    expect(() => { _alignText("foo", 5, Alignment.DEFAULT, options); }).to.throw(Error, /unexpected/i);
  });
});

/**
 * @test {_padText}
 */
describe("_padText(text)", () => {
  it("should add one space paddings to both sides of the text", () => {
    expect(_padText("")).to.equal("  ");
    expect(_padText("foo")).to.equal(" foo ");
  });
});

/**
 * @test {_formatTable}
 */
describe("_formatTable(table, options)", () => {
  it("should format a table", () => {
    const twOptions = {
      normalize      : false,
      wideChars      : new Set(),
      narrowChars    : new Set(),
      ambiguousAsWide: false
    };
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const table = new Table([]);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.getHeight()).to.equal(0);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      {
        const table = new Table([
          new TableRow([], "", " "),
          new TableRow([], "  ", "   ")
        ]);
        const formatted = _formatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        const rows = formatted.table.getRows();
        for (const row of rows) {
          expect(row.getWidth()).to.equal(0);
          expect(row.marginLeft).to.equal("");
          expect(row.marginRight).to.equal("");
        }
        expect(formatted.marginLeft).to.equal("");
      }
      {
        const table = new Table([
          new TableRow([], " ", " "),
          new TableRow([], "  ", "   ")
        ]);
        const formatted = _formatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        const rows = formatted.table.getRows();
        for (const row of rows) {
          expect(row.getWidth()).to.equal(0);
          expect(row.marginLeft).to.equal(" ");
          expect(row.marginRight).to.equal("");
        }
        expect(formatted.marginLeft).to.equal(" ");
      }
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      {
        const tableLines = [
          "| A | B |",
          "| --- |:----- |",
          "  | C |  "
        ];
        const expectLines = [
          "| A   | B   |",
          "| --- |:--- |",
          "| C   |"
        ];
        const table = readTable(tableLines);
        const formatted = _formatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        expect(formatted.table.toLines()).to.deep.equal(expectLines);
        expect(formatted.marginLeft).to.equal("");
      }
      {
        const tableLines = [
          " | A | B |",
          "| --- |:----- |",
          "  | C |  "
        ];
        const expectLines = [
          " | A   | B   |",
          " | --- |:--- |",
          " | C   |"
        ];
        const table = readTable(tableLines);
        const formatted = _formatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        expect(formatted.table.toLines()).to.deep.equal(expectLines);
        expect(formatted.marginLeft).to.equal(" ");
      }
    }
    {
      const options = {
        minDelimiterWidth: 5,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "| A     | B     |",
        "| ----- |:----- |",
        "| C     |"
      ];
      const table = readTable(tableLines);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.CENTER,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "|  A  | B   |",
        "| --- |:--- |",
        "|  C  |"
      ];
      const table = readTable(tableLines);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.CENTER,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "|  A  |  B  |",
        "| --- |:--- |",
        "| C   |"
      ];
      const table = readTable(tableLines);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "  | CDE |  "
      ];
      const expectLines = [
        "| A   | B |",
        "| CDE |"
      ];
      const table = readTable(tableLines);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| ---:|",
        "  | CDE | FG | "
      ];
      const expectLines = [
        "|   A | B  |",
        "| ---:|",
        "| CDE | FG |"
      ];
      const table = readTable(tableLines);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "|",
        "|",
        " |  "
      ];
      const expectLines = [
        "|  |",
        "|  |",
        "|  |"
      ];
      const table = readTable(tableLines);
      const formatted = _formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
  });
});


/**
 * @test {_weakFormatTable}
 */
describe("_weakFormatTable(table, options)", () => {
  it("should format a table weakly", () => {
    const twOptions = {
      normalize      : false,
      wideChars      : new Set(),
      narrowChars    : new Set(),
      ambiguousAsWide: false
    };
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const table = new Table([]);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.getHeight()).to.equal(0);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      {
        const table = new Table([
          new TableRow([], "", " "),
          new TableRow([], "  ", "   ")
        ]);
        const formatted = _weakFormatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        const rows = formatted.table.getRows();
        for (const row of rows) {
          expect(row.getWidth()).to.equal(0);
          expect(row.marginLeft).to.equal("");
          expect(row.marginRight).to.equal("");
        }
        expect(formatted.marginLeft).to.equal("");
      }
      {
        const table = new Table([
          new TableRow([], " ", " "),
          new TableRow([], "  ", "   ")
        ]);
        const formatted = _weakFormatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        const rows = formatted.table.getRows();
        for (const row of rows) {
          expect(row.getWidth()).to.equal(0);
          expect(row.marginLeft).to.equal(" ");
          expect(row.marginRight).to.equal("");
        }
        expect(formatted.marginLeft).to.equal(" ");
      }
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      {
        const tableLines = [
          "| A | B |",
          "| --- |:----- |",
          "  | C |  "
        ];
        const expectLines = [
          "| A | B |",
          "| --- |:--- |",
          "| C |"
        ];
        const table = readTable(tableLines);
        const formatted = _weakFormatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        expect(formatted.table.toLines()).to.deep.equal(expectLines);
        expect(formatted.marginLeft).to.equal("");
      }
      {
        const tableLines = [
          " | A | B |",
          "| --- |:----- |",
          "  | C |  "
        ];
        const expectLines = [
          " | A | B |",
          " | --- |:--- |",
          " | C |"
        ];
        const table = readTable(tableLines);
        const formatted = _weakFormatTable(table, options);
        expect(formatted.table).to.be.an.instanceOf(Table);
        expect(formatted.table.toLines()).to.deep.equal(expectLines);
        expect(formatted.marginLeft).to.equal(" ");
      }
    }
    {
      const options = {
        minDelimiterWidth: 5,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "| A | B |",
        "| ----- |:----- |",
        "| C |"
      ];
      const table = readTable(tableLines);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.CENTER,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "| A | B |",
        "| --- |:--- |",
        "| C |"
      ];
      const table = readTable(tableLines);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.CENTER,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "| A | B |",
        "| --- |:--- |",
        "| C |"
      ];
      const table = readTable(tableLines);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "  | CDE |  "
      ];
      const expectLines = [
        "| A | B |",
        "| CDE |"
      ];
      const table = readTable(tableLines);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| ---:|",
        "  | CDE | FG | "
      ];
      const expectLines = [
        "| A | B |",
        "| ---:|",
        "| CDE | FG |"
      ];
      const table = readTable(tableLines);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "|",
        "|",
        " |  "
      ];
      const expectLines = [
        "|  |",
        "|  |",
        "|  |"
      ];
      const table = readTable(tableLines);
      const formatted = _weakFormatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
  });
});

/**
 * @test {formatTable}
 */
describe("formatTable(table, options)", () => {
  it("should format a table, normally or weakly", () => {
    const twOptions = {
      normalize      : false,
      wideChars      : new Set(),
      narrowChars    : new Set(),
      ambiguousAsWide: false
    };
    {
      const options = {
        formatType       : FormatType.NORMAL,
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "| A   | B   |",
        "| --- |:--- |",
        "| C   |"
      ];
      const table = readTable(tableLines);
      const formatted = formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
    {
      const options = {
        formatType       : FormatType.WEAK,
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        textWidthOptions : twOptions
      };
      const tableLines = [
        "| A | B |",
        "| --- |:----- |",
        "  | C |  "
      ];
      const expectLines = [
        "| A | B |",
        "| --- |:--- |",
        "| C |"
      ];
      const table = readTable(tableLines);
      const formatted = formatTable(table, options);
      expect(formatted.table).to.be.an.instanceOf(Table);
      expect(formatted.table.toLines()).to.deep.equal(expectLines);
      expect(formatted.marginLeft).to.equal("");
    }
  });

  it("should throw an error if an unknown format type is specified", () => {
    const twOptions = {
      normalize      : false,
      wideChars      : new Set(),
      narrowChars    : new Set(),
      ambiguousAsWide: false
    };
    const options = {
      formatType       : "strong",
      minDelimiterWidth: 3,
      defaultAlignment : DefaultAlignment.LEFT,
      headerAlignment  : HeaderAlignment.FOLLOW,
      textWidthOptions : twOptions
    };
    const tableLines = [
      "| A | B |",
      "| --- |:----- |",
      "  | C |  "
    ];
    const table = readTable(tableLines);
    expect(() => { formatTable(table, options); }).to.throw(Error, /unknown/i);
  });
});
