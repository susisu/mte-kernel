/**
 * The `Insert` class represents an insertion of a line.
 *
 * @private
 */
export class Insert {
  /**
   * Creats a new `Insert` object.
   *
   * @param {number} row - Row index, starts from `0`.
   * @param {string} line - A string to be inserted at the row.
   */
  constructor(row, line) {
    /** @private */
    this._row = row;
    /** @private */
    this._line = line;
  }

  /**
   * Row index, starts from `0`.
   *
   * @type {number}
   */
  get row() {
    return this._row;
  }

  /**
   * A string to be inserted.
   *
   * @type {string}
   */
  get line() {
    return this._line;
  }
}

/**
 * The `Delete` class represents a deletion of a line.
 *
 * @private
 */
export class Delete {
  /**
   * Creates a new `Delete` object.
   *
   * @param {number} row - Row index, starts from `0`.
   */
  constructor(row) {
    /** @private */
    this._row = row;
  }

  /**
   * Row index, starts from `0`.
   *
   * @type {number}
   */
  get row() {
    return this._row;
  }
}

/**
 * Applies a command to the text editor.
 *
 * @private
 * @param {ITextEditor} textEditor - An interface to the text editor.
 * @param {Insert|Delete} command - A command.
 * @param {number} rowOffset - Offset to the row index of the command.
 * @returns {undefined}
 */
export function _applyCommand(textEditor, command, rowOffset) {
  if (command instanceof Insert) {
    textEditor.insertLine(rowOffset + command.row, command.line);
  }
  else if (command instanceof Delete) {
    textEditor.deleteLine(rowOffset + command.row);
  }
  else {
    throw new Error("Unknown command");
  }
}

/**
 * Apply an edit script (array of commands) to the text editor.
 *
 * @private
 * @param {ITextEditor} textEditor - An interface to the text editor.
 * @param {Array<Insert|Delete>} script - An array of commands.
 * The commands are applied sequentially in the order of the array.
 * @param {number} rowOffset - Offset to the row index of the commands.
 * @returns {undefined}
 */
export function applyEditScript(textEditor, script, rowOffset) {
  for (const command of script) {
    _applyCommand(textEditor, command, rowOffset);
  }
}


/**
 * Linked list used to remember edit script.
 *
 * @private
 */
class IList {
  get car() {
    throw new Error("Not implemented");
  }

  get cdr() {
    throw new Error("Not implemented");
  }

  isEmpty() {
    throw new Error("Not implemented");
  }

  unshift(value) {
    return new Cons(value, this);
  }

  toArray() {
    const arr = [];
    let rest = this;
    while (!rest.isEmpty()) {
      arr.push(rest.car);
      rest = rest.cdr;
    }
    return arr;
  }
}

/**
 * @private
 */
class Nil extends IList {
  constructor() {
    super();
  }

  get car() {
    throw new Error("Empty list");
  }

  get cdr() {
    throw new Error("Empty list");
  }

  isEmpty() {
    return true;
  }
}

/**
 * @private
 */
class Cons extends IList {
  constructor(car, cdr) {
    super();
    this._car = car;
    this._cdr = cdr;
  }

  get car() {
    return this._car;
  }

  get cdr() {
    return this._cdr;
  }

  isEmpty() {
    return false;
  }
}

const nil = new Nil();


/**
 * Computes the shortest edit script between two arrays of strings.
 *
 * @private
 * @param {Array<string>} from - An array of string the edit starts from.
 * @param {Array<string>} to - An array of string the edit goes to.
 * @param {number} [limit=-1] - Upper limit of edit distance to be searched.
 * If negative, there is no limit.
 * @returns {Array<Insert|Delete>|undefined} The shortest edit script that turns `from` into `to`;
 * `undefined` if no edit script is found in the given range.
 */
export function shortestEditScript(from, to, limit = -1) {
  const fromLen = from.length;
  const toLen = to.length;
  const maxd = limit >= 0 ? Math.min(limit, fromLen + toLen) : fromLen + toLen;
  const mem = new Array(Math.min(maxd, fromLen) + Math.min(maxd, toLen) + 1);
  const offset = Math.min(maxd, fromLen);
  for (let d = 0; d <= maxd; d++) {
    const mink = d <= fromLen ? -d :  d - 2 * fromLen;
    const maxk = d <= toLen   ?  d : -d + 2 * toLen;
    for (let k = mink; k <= maxk; k += 2) {
      let i;
      let script;
      if (d === 0) {
        i = 0;
        script = nil;
      }
      else if (k === -d) {
        i = mem[offset + k + 1].i + 1;
        script = mem[offset + k + 1].script.unshift(new Delete(i + k));
      }
      else if (k === d) {
        i = mem[offset + k - 1].i;
        script = mem[offset + k - 1].script.unshift(new Insert(i + k - 1, to[i + k - 1]));
      }
      else {
        const vi = mem[offset + k + 1].i + 1;
        const hi = mem[offset + k - 1].i;
        if (vi > hi) {
          i = vi;
          script = mem[offset + k + 1].script.unshift(new Delete(i + k));
        }
        else {
          i = hi;
          script = mem[offset + k - 1].script.unshift(new Insert(i + k - 1, to[i + k - 1]));
        }
      }
      while (i < fromLen && i + k < toLen && from[i] === to[i + k]) {
        i += 1;
      }
      if (k === toLen - fromLen && i === fromLen) {
        return script.toArray().reverse();
      }
      mem[offset + k] = { i, script };
    }
  }
  return undefined;
}
