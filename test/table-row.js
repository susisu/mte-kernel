import { expect } from "chai";

import { TableCell } from "../lib/table-cell.js";
import { TableRow } from "../lib/table-row.js";

/**
 * @test {TableRow}
 */
describe("TableRow", () => {
  /**
   * @test {TableRow.constructor}
   */
  describe("constructor(cells, marginLeft, marginRight)", () => {
    it("should create a new TableRow object", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row).to.be.an.instanceOf(TableRow);
    });
  });

  /**
   * @test {TableRow#marginLeft}
   */
  describe("#marginLeft", () => {
    it("should get the margin string at the left", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row.marginLeft).to.equal(" ");
    });

    it("should be read-only", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(() => { row.marginLeft = "   "; }).to.throw(TypeError);
    });
  });

  /**
   * @test {TableRow#marginRight}
   */
  describe("#marginRight", () => {
    it("should get the margin string at the right", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row.marginRight).to.equal("  ");
    });

    it("should be read-only", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(() => { row.marginRight = "   "; }).to.throw(TypeError);
    });
  });

  /**
   * @test {TableRow#getWidth}
   */
  describe("#getWidth()", () => {
    it("should get the number of the cells", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row.getWidth()).to.equal(2);
    });
  });

  /**
   * @test {TableRow#getCellAt}
   */
  describe("#getCellAt(index)", () => {
    it("should return the cell at the index if exists", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row.getCellAt(0)).to.equal(cells[0]);
      expect(row.getCellAt(1)).to.equal(cells[1]);
    });

    it("should return undefined if no cell is found", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row.getCellAt(-1)).to.be.undefined;
      expect(row.getCellAt(2)).to.be.undefined;
    });
  });

  /**
   * @test {TableRow#getCells}
   */
  describe("#getCells()", () => {
    it("should return an array of cells that the row contains", () => {
      const originalCells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(originalCells, " ", "  ");
      const cells = row.getCells();
      expect(cells).to.be.an("array").of.length(2);
      expect(cells).to.not.equal(originalCells);
      for (let i = 0; i < 2; i++) {
        expect(cells[i]).to.equal(originalCells[i]);
      }
    });
  });

  /**
   * @test {TableRow#toText}
   */
  describe("#toText()", () => {
    it("should return a text representation of the row", () => {
      const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
      const row = new TableRow(cells, " ", "  ");
      expect(row.toText()).to.equal(" |  foo  |  bar  |  ");
    });
  });

  /**
   * @test {TableRow#isDelimiter}
   */
  describe("#isDelimiter", () => {
    it("should return true if the row is a delimiter", () => {
      {
        const row = new TableRow([], " ", "  ");
        expect(row.isDelimiter()).to.be.true;
      }
      {
        const cells = [new TableCell("  ---  "), new TableCell(" :---: ")];
        const row = new TableRow(cells, " ", "  ");
        expect(row.isDelimiter()).to.be.true;
      }
      {
        const cells = [new TableCell("  ---  "), new TableCell("  bar  ")];
        const row = new TableRow(cells, " ", "  ");
        expect(row.isDelimiter()).to.be.false;
      }
      {
        const cells = [new TableCell("  foo  "), new TableCell("  bar  ")];
        const row = new TableRow(cells, " ", "  ");
        expect(row.isDelimiter()).to.be.false;
      }
    });
  });
});
