import { expect } from "chai";

import { Point } from "../lib/point.js";
import { Focus } from "../lib/focus.js";
import { TableCell } from "../lib/table-cell.js";
import { TableRow } from "../lib/table-row.js";
import { Table } from "../lib/table.js";

/**
 * @test {Table}
 */
describe("Table", () => {
  /**
   * @test {Table.constructor}
   */
  describe("constructor(rows)", () => {
    it("should create a new Table object", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table).to.be.an.instanceOf(Table);
    });
  });

  /**
   * @test {Table#getHeight}
   */
  describe("#getHeight()", () => {
    it("should return the number of the rows", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.getHeight()).to.equal(3);
    });
  });

  /**
   * @test {Table#getHeight}
   */
  describe("#getHeight()", () => {
    it("should return the number of the rows", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.getHeight()).to.equal(3);
    });
  });

  /**
   * @test {Table#getWidth}
   */
  describe("#getWidth()", () => {
    it("should return the maximum number of the columns of the rows", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.getWidth()).to.equal(3);
    });
  });

  /**
   * @test {Table#getHeaderWidth}
   */
  describe("#getHeaderWidth()", () => {
    it("should return the number of the columns of the header rows", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.getHeaderWidth()).to.equal(2);
    });

    it("should return undefined if there is no header row", () => {
      const table = new Table([]);
      expect(table.getHeaderWidth()).to.be.undefined;
    });
  });

  /**
   * @test {Table#getRows}
   */
  describe("#getRows()", () => {
    it("should return an array of the rows that the table contains", () => {
      const originalRows = [
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ];
      const table = new Table(originalRows);
      const rows = table.getRows();
      expect(rows).to.be.an("array").of.length(3);
      expect(rows).to.not.equal(originalRows);
      for (let i = 0; i < 3; i++) {
        expect(rows[i]).to.equal(originalRows[i]);
      }
    });
  });

  /**
   * @test {Table#getDelimiterRow}
   */
  describe("#getDelimiterRow()", () => {
    it("should return the delimiter row of the table", () => {
      const rows = [
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ];
      const table = new Table(rows);
      expect(table.getDelimiterRow()).to.equal(rows[1]);
    });

    it("should return undefined if there is no delimiter row", () => {
      {
        const table = new Table([
          new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
          new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
        ]);
        expect(table.getDelimiterRow()).to.be.undefined;
      }
      {
        const table = new Table([
          new TableRow([new TableCell("---")], "", ""),
          new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
          new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
        ]);
        expect(table.getDelimiterRow()).to.be.undefined;
      }
      {
        const table = new Table([
          new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
          new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
          new TableRow([new TableCell("---")], "", ""),
        ]);
        expect(table.getDelimiterRow()).to.be.undefined;
      }
    });
  });

  /**
   * @test {Table#getCellAt}
   */
  describe("#getCellAt(rowIndex, columnIndex)", () => {
    it("should return the cell at the specified index", () => {
      const cells = [
        [new TableCell("A"), new TableCell("B")],
        [new TableCell("---")],
        [new TableCell("C"), new TableCell("D"), new TableCell("E")]
      ];
      const table = new Table([
        new TableRow(cells[0], "", ""),
        new TableRow(cells[1], "", ""),
        new TableRow(cells[2], " ", "  "),
      ]);
      expect(table.getCellAt(0, 0)).to.equal(cells[0][0]);
      expect(table.getCellAt(0, 1)).to.equal(cells[0][1]);
      expect(table.getCellAt(1, 0)).to.equal(cells[1][0]);
      expect(table.getCellAt(2, 0)).to.equal(cells[2][0]);
      expect(table.getCellAt(2, 1)).to.equal(cells[2][1]);
      expect(table.getCellAt(2, 2)).to.equal(cells[2][2]);
    });

    it("should return undefined if no cell is found", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.getCellAt(-1, 0)).to.be.undefined;
      expect(table.getCellAt(0, -1)).to.be.undefined;
      expect(table.getCellAt(0, 2)).to.be.undefined;
      expect(table.getCellAt(3, 0)).to.be.undefined;
    });
  });

  /**
   * @test {Table#getFocusedCell}
   */
  describe("#getFocusedCell(focus)", () => {
    it("should get the cell at the focus", () => {
      const cells = [
        [new TableCell("A"), new TableCell("B")],
        [new TableCell("---")],
        [new TableCell("C"), new TableCell("D"), new TableCell("E")]
      ];
      const table = new Table([
        new TableRow(cells[0], "", ""),
        new TableRow(cells[1], "", ""),
        new TableRow(cells[2], " ", "  "),
      ]);
      expect(table.getFocusedCell(new Focus(0, 0, 1))).to.equal(cells[0][0]);
      expect(table.getFocusedCell(new Focus(0, 1, 1))).to.equal(cells[0][1]);
      expect(table.getFocusedCell(new Focus(1, 0, 1))).to.equal(cells[1][0]);
      expect(table.getFocusedCell(new Focus(2, 0, 1))).to.equal(cells[2][0]);
      expect(table.getFocusedCell(new Focus(2, 1, 1))).to.equal(cells[2][1]);
      expect(table.getFocusedCell(new Focus(2, 2, 1))).to.equal(cells[2][2]);
    });

    it("should return undefined if no cell is found", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.getFocusedCell(new Focus(-1, 0, 1))).to.be.undefined;
      expect(table.getFocusedCell(new Focus(0, -1, 1))).to.be.undefined;
      expect(table.getFocusedCell(new Focus(0, 2, 1))).to.be.undefined;
      expect(table.getFocusedCell(new Focus(3, 0, 1))).to.be.undefined;
    });
  });

  /**
   * @test {Table#toText}
   */
  describe("#toText()", () => {
    it("should return a text representation of the table", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      const text =
          "|A|B|\n"
        + "|---|\n"
        + " |C|D|E|  ";
      expect(table.toText()).to.equal(text);
    });
  });

  /**
   * @test {Table#computeFocus}
   */
  describe("#computeFocus(pos, rowOffset)", () => {
    it("should compute a focus from a point in the text editor", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      {
        const focus = table.computeFocus(new Point(1, 0), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(0);
        expect(focus.column).to.equal(-1);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(1, 1), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(0);
        expect(focus.column).to.equal(0);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(1, 2), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(0);
        expect(focus.column).to.equal(0);
        expect(focus.offset).to.equal(1);
      }
      {
        const focus = table.computeFocus(new Point(1, 3), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(0);
        expect(focus.column).to.equal(1);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(1, 4), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(0);
        expect(focus.column).to.equal(1);
        expect(focus.offset).to.equal(1);
      }
      {
        const focus = table.computeFocus(new Point(1, 5), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(0);
        expect(focus.column).to.equal(2);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(3, 0), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(2);
        expect(focus.column).to.equal(-1);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(3, 1), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(2);
        expect(focus.column).to.equal(-1);
        expect(focus.offset).to.equal(1);
      }
      {
        const focus = table.computeFocus(new Point(3, 2), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(2);
        expect(focus.column).to.equal(0);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(3, 7), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(2);
        expect(focus.column).to.equal(2);
        expect(focus.offset).to.equal(1);
      }
      {
        const focus = table.computeFocus(new Point(3, 8), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(2);
        expect(focus.column).to.equal(3);
        expect(focus.offset).to.equal(0);
      }
      {
        const focus = table.computeFocus(new Point(3, 9), 1);
        expect(focus).to.be.an.instanceOf(Focus);
        expect(focus.row).to.equal(2);
        expect(focus.column).to.equal(3);
        expect(focus.offset).to.equal(1);
      }
    });

    it("should return undefined if the row index is out of bounds", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.computeFocus(new Point(0, 1), 1)).to.be.undefined;
      expect(table.computeFocus(new Point(4, 1), 1)).to.be.undefined;
    });
  });

  /**
   * @test {Table#computePosition}
   */
  describe("#computePosition(focus, rowOffset)", () => {
    it("should compute a position from a focus", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      {
        const pos = table.computePosition(new Focus(2, -1, 0), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(0);
      }
      {
        const pos = table.computePosition(new Focus(2, -1, 1), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(1);
      }
      {
        const pos = table.computePosition(new Focus(2, 0, 0), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(2);
      }
      {
        const pos = table.computePosition(new Focus(2, 0, 1), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(3);
      }
      {
        const pos = table.computePosition(new Focus(2, 1, 0), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(4);
      }
      {
        const pos = table.computePosition(new Focus(2, 1, 1), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(5);
      }
      {
        const pos = table.computePosition(new Focus(2, 2, 0), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(6);
      }
      {
        const pos = table.computePosition(new Focus(2, 2, 1), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(7);
      }
      {
        const pos = table.computePosition(new Focus(2, 3, 0), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(8);
      }
      {
        const pos = table.computePosition(new Focus(2, 3, 1), 1);
        expect(pos).to.be.an.instanceOf(Point);
        expect(pos.row).to.equal(3);
        expect(pos.column).to.equal(9);
      }
    });

    it("should return undefined if the focus is out of the table", () => {
      const table = new Table([
        new TableRow([new TableCell("A"), new TableCell("B")], "", ""),
        new TableRow([new TableCell("---")], "", ""),
        new TableRow([new TableCell("C"), new TableCell("D"), new TableCell("E")], " ", "  "),
      ]);
      expect(table.computePosition(new Focus(-1, 0, 0), 1)).to.be.undefined;
      expect(table.computePosition(new Focus(3, 0, 0), 1)).to.be.undefined;
    });
  });
});
