"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lines_and_columns_1 = require("lines-and-columns");
var printTable_1 = require("./printTable");
var PatchError = /** @class */ (function (_super) {
    tslib_1.__extends(PatchError, _super);
    function PatchError(message, source, start, end) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.source = source;
        _this.start = start;
        _this.end = end;
        return _this;
    }
    PatchError.prototype.toString = function () {
        return this.message;
    };
    /**
     * Due to babel's inability to simulate extending native types, we have our
     * own method for determining whether an object is an instance of
     * `PatchError`.
     *
     * @see http://stackoverflow.com/a/33837088/549363
     */
    PatchError.detect = function (error) {
        return error instanceof Error && 'source' in error && 'start' in error && 'end' in error;
    };
    PatchError.prettyPrint = function (error) {
        var source = error.source, start = error.start, end = error.end, message = error.message;
        start = Math.min(Math.max(start, 0), source.length);
        end = Math.min(Math.max(end, start), source.length);
        var lineMap = new lines_and_columns_1.default(source);
        var startLoc = lineMap.locationForIndex(start);
        var endLoc = lineMap.locationForIndex(end);
        if (!startLoc || !endLoc) {
            throw new Error("unable to find locations for range: [" + start + ", " + end + ")");
        }
        var displayStartLine = Math.max(0, startLoc.line - 2);
        var displayEndLine = endLoc.line + 2;
        var rows = [];
        for (var line = displayStartLine; line <= displayEndLine; line++) {
            var startOfLine = lineMap.indexForLocation({ line: line, column: 0 });
            var endOfLine = lineMap.indexForLocation({ line: line + 1, column: 0 });
            if (startOfLine === null) {
                break;
            }
            if (endOfLine === null) {
                endOfLine = source.length;
            }
            var lineSource = trimRight(source.slice(startOfLine, endOfLine));
            if (startLoc.line !== endLoc.line) {
                if (line >= startLoc.line && line <= endLoc.line) {
                    rows.push([">", line + 1 + " |", lineSource]);
                }
                else {
                    rows.push(["", line + 1 + " |", lineSource]);
                }
            }
            else if (line === startLoc.line) {
                var highlightLength = Math.max(endLoc.column - startLoc.column, 1);
                rows.push([">", line + 1 + " |", lineSource], ["", "|", ' '.repeat(startLoc.column) + '^'.repeat(highlightLength)]);
            }
            else {
                rows.push(["", line + 1 + " |", lineSource]);
            }
        }
        var columns = [
            { id: 'marker', align: 'right' },
            { id: 'line', align: 'right' },
            { id: 'source', align: 'left' }
        ];
        return message + "\n" + printTable_1.default({ rows: rows, columns: columns });
    };
    return PatchError;
}(Error));
exports.default = PatchError;
function trimRight(string) {
    return string.replace(/\s+$/, '');
}
