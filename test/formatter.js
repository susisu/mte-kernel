import { expect } from "chai";

import { Table } from "../lib/table.js";
import { readTable } from "../lib/parser.js";
import { completeTable } from "../lib/formatter.js";

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
