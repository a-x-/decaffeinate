import LinesAndColumns from 'lines-and-columns';
export default class CodeContext {
    readonly source: string;
    readonly linesAndColumns: LinesAndColumns;
    constructor(source: string);
    /**
     * Display a range of code, e.g. for a token or an AST node.
     *
     * The line and column are displayed as 1-indexed, to agree with most editors,
     * and the actual 0-indexed code index is also displayed.
     *
     * For example, if a program is just "foo", then the "foo" token has this range:
     * [1:1(0)-1:4(3)]
     */
    formatRange(startIndex: number, endIndex: number): string;
    formatIndex(index: number): string;
}
