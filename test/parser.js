import { expect } from "chai";

import { _splitCells } from "../lib/parser.js";

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
