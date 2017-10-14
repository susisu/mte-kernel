import { expect } from "chai";

import { ITextEditor } from "../lib/text-editor.js";

/**
 * @test {ITextEditor}
 */
describe("ITextEditor", () => {
  /**
   * @test {ITextEditor#getCursorPos}
   */
  describe("#getCursorPos()", () => {
    it("should be not implemented, throw an error", () => {
      const textEditor = new ITextEditor();
      expect(() => { textEditor.getCursorPos(); }).to.throw(Error, /not implemented/i);
    });
  });

  /**
   * @test {ITextEditor#getLastRow}
   */
  describe("#getLastRow()", () => {
    it("should be not implemented, throw an error", () => {
      const textEditor = new ITextEditor();
      expect(() => { textEditor.getLastRow(); }).to.throw(Error, /not implemented/i);
    });
  });

  /**
   * @test {ITextEditor#getLine}
   */
  describe("#getLine()", () => {
    it("should be not implemented, throw an error", () => {
      const textEditor = new ITextEditor();
      expect(() => { textEditor.getLine(0); }).to.throw(Error, /not implemented/i);
    });
  });
});
