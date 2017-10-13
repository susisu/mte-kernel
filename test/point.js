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

  /**
   * @test {Point#equals}
   */
  describe("#equals(point)", () => {
    it("should return true if two points are equal", () => {
      const point = new Point(1, 2);
      expect(point.equals(new Point(1, 2))).to.be.true;
      expect(point.equals(new Point(1, 3))).to.be.false;
      expect(point.equals(new Point(3, 2))).to.be.false;
      expect(point.equals(new Point(3, 4))).to.be.false;
    });
  });
});
