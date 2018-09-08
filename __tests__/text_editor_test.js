import { AbstractTextEditor } from "../src/text_editor.js";

describe("AbstractTextEditor", () => {
  describe("#getCursor", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.getCursor(); }).toThrow(/Not implemented/i);
    });
  });

  describe("#setCursor", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.setCursor([0, 1]); }).toThrow(/Not implemented/i);
    });
  });

  describe("#setSelection", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.setSelection([0, 1], [2, 3]); }).toThrow(/Not implemented/i);
    });
  });

  describe("#getLastRow", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.getLastRow(); }).toThrow(/Not implemented/i);
    });
  });

  describe("#accepts", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.accepts(0); }).toThrow(/Not implemented/i);
    });
  });

  describe("#getLine", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.getLine(0); }).toThrow(/Not implemented/i);
    });
  });

  describe("#insertLine", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.insertLine(0, "foo"); }).toThrow(/Not implemented/i);
    });
  });

  describe("#deleteLine", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.deleteLine(0); }).toThrow(/Not implemented/i);
    });
  });

  describe("#replaceLines", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.replaceLines([0, 1], ["foo", "bar"]); }).toThrow(/Not implemented/i);
    });
  });

  describe("#transact", () => {
    test("should throw not implemented error", () => {
      const te = new AbstractTextEditor();
      expect(() => { te.transact(() => {}); }).toThrow(/Not implemented/i);
    });
  });
});
