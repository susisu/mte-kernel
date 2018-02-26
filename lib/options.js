import { DefaultAlignment, HeaderAlignment } from "./alignment.js";
import { FormatType } from "./formatter.js";

/**
 * Reads a property of an object if exists; otherwise uses a default value.
 *
 * @private
 * @param {*} obj - An object. If a non-object value is specified, the default value is used.
 * @param {string} key - A key (or property name).
 * @param {*} defaultVal - A default value that is used when a value does not exist.
 * @returns {*} A read value or the default value.
 */
export function _value(obj, key, defaultVal) {
  return (typeof obj === "object" && obj !== null && obj[key] !== undefined)
    ? obj[key]
    : defaultVal;
}

/**
 * Reads multiple properties of an object if exists; otherwise uses default values.
 *
 * @private
 * @param {*} obj - An object. If a non-object value is specified, the default value is used.
 * @param {Object} keys - An object that consists of pairs of a key and a default value.
 * @returns {Object} A new object that contains read values.
 */
export function _values(obj, keys) {
  const res = {};
  for (const [key, defaultVal] of Object.entries(keys)) {
    res[key] = _value(obj, key, defaultVal);
  }
  return res;
}

/**
 * Reads options for the formatter from an object.
 * The default values are used for options that are not specified.
 *
 * @param {Object} obj - An object containing options.
 * The available options and default values are listed below.
 *
 * | property name       | type                              | description                                             | default value            |
 * | ------------------- | --------------------------------- | ------------------------------------------------------- | ------------------------ |
 * | `leftMarginChars`   | {@link Set}&lt;{@link string}&gt; | A set of additional left margin characters.             | `new Set()`              |
 * | `formatType`        | {@link FormatType}                | Format type, normal or weak.                            | `FormatType.NORMAL`      |
 * | `minDelimiterWidth` | {@link number}                    | Minimum width of delimiters.                            | `3`                      |
 * | `defaultAlignment`  | {@link DefaultAlignment}          | Default alignment of columns.                           | `DefaultAlignment.LEFT`  |
 * | `headerAlignment`   | {@link HeaderAlignment}           | Alignment of header cells.                              | `HeaderAlignment.FOLLOW` |
 * | `textWidthOptions`  | {@link Object}                    | An object containing options for computing text widths. |                          |
 * | `smartCursor`       | {@link boolean}                   | Enables "Smart Cursor" feature.                         | `false`                  |
 *
 * The available options for `obj.textWidthOptions` are the following ones.
 *
 * | property name     | type                              | description                                           | default value |
 * | ----------------- | --------------------------------- | ----------------------------------------------------- | ------------- |
 * | `normalize`       | {@link boolean}                   | Normalizes texts before computing text widths.        | `true`        |
 * | `wideChars`       | {@link Set}&lt;{@link string}&gt; | A set of characters that should be treated as wide.   | `new Set()`   |
 * | `narrowChars`     | {@link Set}&lt;{@link string}&gt; | A set of characters that should be treated as narrow. | `new Set()`   |
 * | `ambiguousAsWide` | {@link boolean}                   | Treats East Asian Ambiguous characters as wide.       | `false`       |
 *
 * @returns {Object} - An object that contains complete options.
 */
export function options(obj) {
  const res = _values(obj, {
    leftMarginChars  : new Set(),
    formatType       : FormatType.NORMAL,
    minDelimiterWidth: 3,
    defaultAlignment : DefaultAlignment.LEFT,
    headerAlignment  : HeaderAlignment.FOLLOW,
    smartCursor      : false
  });
  res.textWidthOptions = _values(obj.textWidthOptions, {
    normalize      : true,
    wideChars      : new Set(),
    narrowChars    : new Set(),
    ambiguousAsWide: false
  });
  return res;
}
