import LinesAndColumns from 'lines-and-columns';
import PatchError from './PatchError';
/**
 * If the given exception is an error with code location information, extract
 * its start and end position and return a PatchError to use in its place.
 * Otherwise, return null.
 */
// tslint:disable-next-line no-any
export default function resolveToPatchError(err, content, stageName) {
    var makePatchError = function (start, end, source) {
        return new PatchError(stageName + " failed to parse: " + err.message, source, start, end);
    };
    if (err.pos) {
        // Handle JavaScript parse errors.
        var pos = err.pos;
        if (pos === content.length) {
            pos--;
        }
        // In most cases, we can use the source code we already have, but for
        // esnext, the code might be an intermediate code state, so use that from
        // the exception if possible.
        var source = err.source || content;
        return makePatchError(pos, pos + 1, source);
    }
    else if (err.syntaxError) {
        // Handle CoffeeScript parse errors.
        var _a = err.syntaxError.location, first_line = _a.first_line, first_column = _a.first_column, last_line = _a.last_line, last_column = _a.last_column;
        var lineMap = new LinesAndColumns(content);
        var firstIndex = lineMap.indexForLocation({ line: first_line, column: first_column });
        var lastIndex = lineMap.indexForLocation({ line: last_line, column: last_column });
        if (firstIndex !== null) {
            if (lastIndex === null) {
                lastIndex = firstIndex + 1;
            }
            else {
                lastIndex++;
            }
            return makePatchError(firstIndex, lastIndex, content);
        }
    }
    return null;
}
