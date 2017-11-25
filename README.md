# markdown-table-editor kernel
The text editor independent part of [atom-markdown-table-editor][atom-mte].

![demo](https://github.com/susisu/markdown-table-editor/wiki/images/demo.gif)

[You can try it on your browser!](https://susisu.github.io/mte-demo/)

## Installation
``` shell
npm i -S @susisu/mte-kernel
```

## Usage
Implement an [interface to the text editor][doc-ITextEditor].

``` javascript
interface ITextEditor {
  getCursorPosition(): Point;
  setCursorPosition(pos: Point): void;
  setSelectionRange(range: Range): void;
  getLastRow(): number;
  acceptsTableEdit(row: number): boolean;
  getLine(row: number): string;
  insertLine(row: number, line: string): void;
  deleteLine(row: number): void;
  replaceLines(startRow: number, endRow: number, lines: Array<string>): void;
  transact(func: Function): void;
}
```

And then you can execute [commands][doc-TableEditor] through a `TableEditor` object.

``` javascript
import { TableEditor, options } from "@susisu/mte-kernel";
const textEditor = ...; // interface to the text editor
const tableEditor = new TableEditor(textEditor);
tableEditor.formatAll(options({}));
```

See the [API reference][doc-API] for more information.
It is also good to look into [atom-markdown-table-editor][atom-mte-repo] as a reference implementation.

[doc-API]: https://doc.esdoc.org/github.com/susisu/mte-kernel/identifiers.html
[doc-ITextEditor]:  https://doc.esdoc.org/github.com/susisu/mte-kernel/class/lib/text-editor.js~ITextEditor.html
[doc-TableEditor]:  https://doc.esdoc.org/github.com/susisu/mte-kernel/class/lib/table-editor.js~TableEditor.html
[atom-mte]: https://atom.io/packages/markdown-table-editor
[atom-mte-repo]: https://github.com/susisu/atom-markdown-table-editor

## License
[MIT License](http://opensource.org/licenses/mit-license.php)

## Author
Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))
