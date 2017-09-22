import { expect } from "chai";

import { TableRow } from "../lib/table-row.js";
import { _splitCells, _readRow } from "../lib/parser.js";

/**
 * @test {_splitCells}
 */
describe("_splitCells(text)", () => {
  it("should split a text into cells", () => {
    expect(_splitCells("")).to.deep.equal([""]);
    expect(_splitCells(" | A | B | C | ")).to.deep.equal([" ", " A ", " B ", " C ", " "]);
    expect(_splitCells(" | \\A | B | ")).to.deep.equal([" ", " \\A ", " B ", " "]);
    expect(_splitCells(" | A \\| B | ")).to.deep.equal([" ", " A \\| B ", " "]);
    expect(_splitCells(" | A | B | \\")).to.deep.equal([" ", " A ", " B ", " \\"]);
    expect(_splitCells(" | A `|` B | ")).to.deep.equal([" ", " A `|` B ", " "]);
    expect(_splitCells(" | A ``|`` B | ")).to.deep.equal([" ", " A ``|`` B ", " "]);
    expect(_splitCells(" | A ``|` B | ")).to.deep.equal([" ", " A ``|` B ", " "]);
    expect(_splitCells(" | A `|`` B | ")).to.deep.equal([" ", " A `", "`` B ", " "]);
    expect(_splitCells(" | A `` `|` `` B | ")).to.deep.equal([" ", " A `` `|` `` B ", " "]);
    expect(_splitCells(" | A ` ``|`` ` B | ")).to.deep.equal([" ", " A ` ``|`` ` B ", " "]);
    expect(_splitCells(" | A `` ``|`` `` B | ")).to.deep.equal([" ", " A `` ``", "`` `` B ", " "]);
    expect(_splitCells(" | `\\` | B | ")).to.deep.equal([" ", " `\\` ", " B ", " "]);
    expect(_splitCells(" | A `\\|` B | ")).to.deep.equal([" ", " A `\\|` B ", " "]);
    expect(_splitCells(" | A \\`|` B | ")).to.deep.equal([" ", " A \\`", "` B ", " "]);
  });
});

/**
 * @test {_readRow}
 */
describe("_readRow(text)", () => {
  it("should read a table row", () => {
    {
      const row = _readRow("");
      expect(row).to.be.an.instanceOf(TableRow);
      expect(row.marginLeft).to.equal("");
      expect(row.marginRight).to.equal("");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(0);
    }
    {
      const row = _readRow("|");
      expect(row).to.be.an.instanceOf(TableRow);
      expect(row.marginLeft).to.equal("");
      expect(row.marginRight).to.equal("");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(0);
    }
    {
      const row = _readRow("| A | B | C |");
      expect(row).to.be.an.instanceOf(TableRow);
      expect(row.marginLeft).to.equal("");
      expect(row.marginRight).to.equal("");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(3);
      expect(cells[0].rawContent).to.equal(" A ");
      expect(cells[1].rawContent).to.equal(" B ");
      expect(cells[2].rawContent).to.equal(" C ");
    }
    {
      const row = _readRow(" | A | B | C |  ");
      expect(row).to.be.an.instanceOf(TableRow);
      expect(row.marginLeft).to.equal(" ");
      expect(row.marginRight).to.equal("  ");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(3);
      expect(cells[0].rawContent).to.equal(" A ");
      expect(cells[1].rawContent).to.equal(" B ");
      expect(cells[2].rawContent).to.equal(" C ");
    }
    {
      const row = _readRow(" A | B | C ");
      expect(row).to.be.an.instanceOf(TableRow);
      expect(row.marginLeft).to.equal("");
      expect(row.marginRight).to.equal("");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(3);
      expect(cells[0].rawContent).to.equal(" A ");
      expect(cells[1].rawContent).to.equal(" B ");
      expect(cells[2].rawContent).to.equal(" C ");
    }
    {
      const row = _readRow("| `\\` \\| B `|` C |");
      expect(row).to.be.an.instanceOf(TableRow);
      expect(row.marginLeft).to.equal("");
      expect(row.marginRight).to.equal("");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(1);
      expect(cells[0].rawContent).to.equal(" `\\` \\| B `|` C ");
    }
  });
});
