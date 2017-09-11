import { expect } from "chai";

import { Point } from "../lib/point.js";

/**
 * @test {Point}
 */
describe("Point", () => {
  /**
   * @test {Point.constructor}
   */
  describe("constructor(row, column)", () => {
    it("should create a new Point object", () => {
      const point = new Point(1, 2);
      expect(point).to.be.an.instanceOf(Point);
    });
  });

  /**
   * @test {Point#row}
   */
  describe("#row", () => {
    it("should get the row of the point", () => {
      const point = new Point(1, 2);
      expect(point.row).to.equal(1);
    });

    it("should be read-only", () => {
      const point = new Point(1, 2);
      expect(() => { point.row = 3; }).to.throw(TypeError);
    });
  });

  /**
   * @test {Point#column}
   */
  describe("#column", () => {
    it("should get the column of the point", () => {
      const point = new Point(1, 2);
      expect(point.column).to.equal(2);
    });

    it("should be read-only", () => {
      const point = new Point(1, 2);
      expect(() => { point.column = 3; }).to.throw(TypeError);
    });
  });
});
