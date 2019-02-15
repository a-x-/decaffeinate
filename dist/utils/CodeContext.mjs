import LinesAndColumns from 'lines-and-columns';
var CodeContext = /** @class */ (function () {
    function CodeContext(source) {
        this.source = source;
        this.linesAndColumns = new LinesAndColumns(source);
    }
    /**
     * Display a range of code, e.g. for a token or an AST node.
     *
     * The line and column are displayed as 1-indexed, to agree with most editors,
     * and the actual 0-indexed code index is also displayed.
     *
     * For example, if a program is just "foo", then the "foo" token has this range:
     * [1:1(0)-1:4(3)]
     */
    CodeContext.prototype.formatRange = function (startIndex, endIndex) {
        return "[" + this.formatIndex(startIndex) + "-" + this.formatIndex(endIndex) + "]";
    };
    CodeContext.prototype.formatIndex = function (index) {
        if (index > this.source.length) {
            index = this.source.length;
        }
        var location = this.linesAndColumns.locationForIndex(index);
        if (!location) {
            return 'INVALID POSITION';
        }
        var line = location.line, column = location.column;
        return line + 1 + ":" + (column + 1) + "(" + index + ")";
    };
    return CodeContext;
}());
export default CodeContext;
