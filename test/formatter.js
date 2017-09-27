import { expect } from "chai";

import { Alignment } from "../lib/alignment";
import { Table } from "../lib/table.js";
import { readTable } from "../lib/parser.js";
import { _delimiterText, _extendArray, completeTable } from "../lib/formatter.js";

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
      const tableText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const expectText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A |\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const expectText =
          "| A ||\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A | B |\n"
        + "| --- |\n"
        + "  | C | D |  ";
      const expectText =
          "| A | B |\n"
        + "| --- | --- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A | B |\n"
        + "  | C | D |  ";
      const expectText =
          "| A | B |\n"
        + "| --- | --- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.true;
    }
    {
      const tableText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C |";
      const expectText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C ||";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C |  ";
      const expectText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C |  |";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "|\n"
        + "|\n"
        + " |  ";
      const expectText =
          "||\n"
        + "| --- |\n"
        + "||\n"
        + " |  |";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.true;
    }
  });

  it("should throw an error if table has no rows", () => {
    const table = new Table([]);
    expect(() => { completeTable(table,  { delimiterWidth: 3 }); }).to.throw(Error, /empty/i);
  });
});
