import { expect } from "chai";

import { Alignment } from "../lib/alignment.js";
import { TableCell } from "../lib/table-cell.js";

/**
 * @test {TableCell}
 */
describe("TableCell", () => {
  /**
   * @test {TableCell.constructor}
   */
  describe("constructor(rawContent)", () => {
    it("should create a new TableCell object", () => {
      const cell = new TableCell("  foo  ");
      expect(cell).to.be.an.instanceOf(TableCell);
    });
  });

  /**
   * @test {TableCell#rawContent}
   */
  describe("#rawContent", () => {
    it("should get the raw content of the cell", () => {
      {
        const cell = new TableCell("");
        expect(cell.rawContent).to.equal("");
      }
      {
        const cell = new TableCell("    ");
        expect(cell.rawContent).to.equal("    ");
      }
      {
        const cell = new TableCell("  foo  ");
        expect(cell.rawContent).to.equal("  foo  ");
      }
    });

    it("should be read-only", () => {
      const cell = new TableCell("  foo  ");
      expect(() => { cell.rawContent = "  bar  "; }).to.throw(TypeError);
    });
  });

  /**
   * @test {TableCell#content}
   */
  describe("#content", () => {
    it("should get the trimmed content of the cell", () => {
      {
        const cell = new TableCell("");
        expect(cell.content).to.equal("");
      }
      {
        const cell = new TableCell("    ");
        expect(cell.content).to.equal("");
      }
      {
        const cell = new TableCell("  foo  ");
        expect(cell.content).to.equal("foo");
      }
    });

    it("should be read-only", () => {
      const cell = new TableCell("  foo  ");
      expect(() => { cell.content = "bar"; }).to.throw(TypeError);
    });
  });

  /**
   * @test {TableCell#toText}
   */
  describe("#toText()", () => {
    it("should return the raw content of the cell", () => {
      const cell = new TableCell("  foo  ");
      expect(cell.toText()).to.equal("  foo  ");
    });
  });

  /**
   * @test {TableCell#isDelimiter}
   */
  describe("#isDelimiter()", () => {
    it("should return true if it only contains hyphens with optional one leading and trailing colons", () => {
      {
        const cell = new TableCell("  ---  ");
        expect(cell.isDelimiter()).to.be.true;
      }
      {
        const cell = new TableCell(" :---  ");
        expect(cell.isDelimiter()).to.be.true;
      }
      {
        const cell = new TableCell("  ---: ");
        expect(cell.isDelimiter()).to.be.true;
      }
      {
        const cell = new TableCell(" :---: ");
        expect(cell.isDelimiter()).to.be.true;
      }
      {
        const cell = new TableCell("");
        expect(cell.isDelimiter()).to.be.false;
      }
      {
        const cell = new TableCell("    ");
        expect(cell.isDelimiter()).to.be.false;
      }
      {
        const cell = new TableCell("  foo  ");
        expect(cell.isDelimiter()).to.be.false;
      }
      {
        const cell = new TableCell("  ::  ");
        expect(cell.isDelimiter()).to.be.false;
      }
      {
        const cell = new TableCell("  - -  ");
        expect(cell.isDelimiter()).to.be.false;
      }
      {
        const cell = new TableCell(": ---  ");
        expect(cell.isDelimiter()).to.be.false;
      }
      {
        const cell = new TableCell("::---  ");
        expect(cell.isDelimiter()).to.be.false;
      }
    });
  });

  /**
   * @test {TableCell#getAlignment}
   */
  describe("#getAlignment()", () => {
    it("should return the alignment that the cell represents", () => {
      {
        const cell = new TableCell("  ---  ");
        expect(cell.getAlignment()).to.equal(Alignment.DEFAULT);
      }
      {
        const cell = new TableCell(" :---  ");
        expect(cell.getAlignment()).to.equal(Alignment.LEFT);
      }
      {
        const cell = new TableCell("  ---: ");
        expect(cell.getAlignment()).to.equal(Alignment.RIGHT);
      }
      {
        const cell = new TableCell(" :---: ");
        expect(cell.getAlignment()).to.equal(Alignment.CENTER);
      }
    });

    it("should return undefined if the cell is not a delimiter", () => {
      const cell = new TableCell("  foo  ");
      expect(cell.getAlignment()).to.be.undefined;
    });
  });

  /**
   * @test {TableCell#computeContentOffset}
   */
  describe("#computeContentOffset(rawOffset)", () => {
    it("should compute a relative position in the trimmed content from that in the raw content", () => {
      {
        const cell = new TableCell("");
        expect(cell.computeContentOffset(0)).to.equal(0);
      }
      {
        const cell = new TableCell("    ");
        expect(cell.computeContentOffset(0)).to.equal(0);
        expect(cell.computeContentOffset(1)).to.equal(0);
        expect(cell.computeContentOffset(2)).to.equal(0);
        expect(cell.computeContentOffset(3)).to.equal(0);
        expect(cell.computeContentOffset(4)).to.equal(0);
      }
      {
        const cell = new TableCell("  foo  ");
        expect(cell.computeContentOffset(0)).to.equal(0);
        expect(cell.computeContentOffset(1)).to.equal(0);
        expect(cell.computeContentOffset(2)).to.equal(0);
        expect(cell.computeContentOffset(3)).to.equal(1);
        expect(cell.computeContentOffset(4)).to.equal(2);
        expect(cell.computeContentOffset(5)).to.equal(3);
        expect(cell.computeContentOffset(6)).to.equal(3);
        expect(cell.computeContentOffset(7)).to.equal(3);
      }
    });
  });

  /**
   * @test {TableCell#computeRawOffset}
   */
  describe("#computeRawOffset(contentOffset)", () => {
    it("should compute a relative position in the raw content from that in the trimmed content", () => {
      {
        const cell = new TableCell("");
        expect(cell.computeRawOffset(0)).to.equal(0);
      }
      {
        const cell = new TableCell("    ");
        expect(cell.computeRawOffset(0)).to.equal(1);
      }
      {
        const cell = new TableCell("  foo  ");
        expect(cell.computeRawOffset(0)).to.equal(2);
        expect(cell.computeRawOffset(1)).to.equal(3);
        expect(cell.computeRawOffset(2)).to.equal(4);
        expect(cell.computeRawOffset(3)).to.equal(5);
      }
    });
  });
});
