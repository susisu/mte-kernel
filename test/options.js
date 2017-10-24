import { expect } from "chai";

import { DefaultAlignment, HeaderAlignment } from "../lib/alignment.js";
import { FormatType } from "../lib/formatter.js";
import { _value, _values, options } from "../lib/options.js";

/**
 * @test {_value}
 */
describe("_value(obj, key, defaultVal)", () => {
  it("should read a value from the object or use the default value if not exists", () => {
    const obj = {
      foo: 1
    };
    expect(_value(obj, "foo", 2)).to.equal(1);
    expect(_value(obj, "bar", 2)).to.equal(2);
  });

  it("should return the default value if obj is not an object", () => {
    expect(_value(undefined, "foo", 2)).to.equal(2);
    expect(_value(null, "foo", 2)).to.equal(2);
  });
});

/**
 * @test {_values}
 */
describe("_values(obj, keys)", () => {
  it("should read multiple values from the object or use the default values if not exist", () => {
    const obj = {
      foo  : 1,
      bar  : 2,
      dummy: 0
    };
    expect(_values(obj, { foo: 3, bar: 4, baz: 5 })).to.deep.equal({
      foo: 1,
      bar: 2,
      baz: 5
    });
  });

  it("should use the default values if obj is not an object", () => {
    expect(_values(undefined, { foo: 3, bar: 4, baz: 5 })).to.deep.equal({
      foo: 3,
      bar: 4,
      baz: 5
    });
    expect(_values(null, { foo: 3, bar: 4, baz: 5 })).to.deep.equal({
      foo: 3,
      bar: 4,
      baz: 5
    });
  });
});

/**
 * @test {options}
 */
describe("options(obj)", () => {
  it("should read options from the object and return an object that contains complete options", () => {
    {
      const obj = {};
      expect(options(obj)).to.deep.equal({
        formatType       : FormatType.NORMAL,
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        smartCursor      : false,
        textWidthOptions : {
          normalize      : true,
          wideChars      : new Set(),
          narrowChars    : new Set(),
          ambiguousAsWide: false
        }
      });
    }
    {
      const obj = {
        formatType       : FormatType.WEAK,
        minDelimiterWidth: 5
      };
      expect(options(obj)).to.deep.equal({
        formatType       : FormatType.WEAK,
        minDelimiterWidth: 5,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        smartCursor      : false,
        textWidthOptions : {
          normalize      : true,
          wideChars      : new Set(),
          narrowChars    : new Set(),
          ambiguousAsWide: false
        }
      });
    }
    {
      const obj = {
        textWidthOptions: {}
      };
      expect(options(obj)).to.deep.equal({
        formatType       : FormatType.NORMAL,
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        smartCursor      : false,
        textWidthOptions : {
          normalize      : true,
          wideChars      : new Set(),
          narrowChars    : new Set(),
          ambiguousAsWide: false
        }
      });
    }
    {
      const obj = {
        textWidthOptions: {
          normalize      : false,
          ambiguousAsWide: true
        }
      };
      expect(options(obj)).to.deep.equal({
        formatType       : FormatType.NORMAL,
        minDelimiterWidth: 3,
        defaultAlignment : DefaultAlignment.LEFT,
        headerAlignment  : HeaderAlignment.FOLLOW,
        smartCursor      : false,
        textWidthOptions : {
          normalize      : false,
          wideChars      : new Set(),
          narrowChars    : new Set(),
          ambiguousAsWide: true
        }
      });
    }
    {
      const obj = {
        formatType       : FormatType.WEAK,
        minDelimiterWidth: 5,
        defaultAlignment : DefaultAlignment.CENTER,
        headerAlignment  : HeaderAlignment.CENTER,
        smartCursor      : true,
        textWidthOptions : {
          normalize      : false,
          wideChars      : new Set("→"),
          narrowChars    : new Set("λ"),
          ambiguousAsWide: true
        }
      };
      expect(options(obj)).to.deep.equal({
        formatType       : FormatType.WEAK,
        minDelimiterWidth: 5,
        defaultAlignment : DefaultAlignment.CENTER,
        headerAlignment  : HeaderAlignment.CENTER,
        smartCursor      : true,
        textWidthOptions : {
          normalize      : false,
          wideChars      : new Set("→"),
          narrowChars    : new Set("λ"),
          ambiguousAsWide: true
        }
      });
    }
  });
});
