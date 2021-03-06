import * as tslib_1 from "tslib";
var VALID_INDENTATIONS = ['    ', '   \t', '  \t', ' \t', '\t'];
/**
 * Convert Literate CoffeeScript into regular CoffeeScript.
 */
var LiterateStage = /** @class */ (function () {
    function LiterateStage() {
    }
    LiterateStage.run = function (content) {
        return {
            code: convertCodeFromLiterate(content),
            suggestions: []
        };
    };
    return LiterateStage;
}());
export default LiterateStage;
/**
 * Every line is either indented, unindented, or empty. A code section starts
 * when there is an empty line (or the start of the program) followed by an
 * indented line. A code section ends when there is an unindented line.
 *
 * This should match the behavior of helpers.invertLiterate in CoffeeScript,
 * while also forming the result into nice-looking comment blocks.
 */
function convertCodeFromLiterate(code) {
    var lines = code.split('\n');
    var resultLines = [];
    // null if we're in a code section; otherwise the comment lines so far for the
    // current comment.
    var commentLines = null;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (commentLines === null) {
            if (lineIsEmpty(line) || lineIsIndented(line)) {
                resultLines.push(removeIndentation(line));
            }
            else {
                commentLines = [line];
            }
        }
        else {
            // Remain a comment on an empty line, an unindented line, or if the last
            // line was nonempty.
            if (lineIsEmpty(line) || !lineIsIndented(line) || (i > 0 && !lineIsEmpty(lines[i - 1]))) {
                commentLines.push(line);
            }
            else {
                resultLines.push.apply(resultLines, tslib_1.__spread(convertCommentLines(commentLines)));
                commentLines = null;
                resultLines.push(removeIndentation(line));
            }
        }
    }
    resultLines.push.apply(resultLines, tslib_1.__spread(convertCommentLines(commentLines)));
    return resultLines.join('\n');
}
/**
 * Format a comment from an array of lines, including all trailing whitespace
 * lines. All comments become normal // comments in JS, since block comments are
 * treated specially by the CoffeeScript parser and can cause trouble if they
 * are introduced at the wrong indentation level.
 *
 * All blank lines between the comment lines and the following code are removed,
 * which generally matches JS comment style.
 */
function convertCommentLines(commentLines) {
    if (commentLines === null) {
        return [];
    }
    commentLines = commentLines.slice();
    while (commentLines.length > 0 && lineIsEmpty(commentLines[commentLines.length - 1])) {
        commentLines.pop();
    }
    return commentLines.map(function (line) { return "# " + line; });
}
function lineIsEmpty(line) {
    return /^\s*$/.test(line);
}
function lineIsIndented(line) {
    return VALID_INDENTATIONS.some(function (indent) { return line.startsWith(indent); });
}
function removeIndentation(line) {
    var e_1, _a;
    try {
        for (var VALID_INDENTATIONS_1 = tslib_1.__values(VALID_INDENTATIONS), VALID_INDENTATIONS_1_1 = VALID_INDENTATIONS_1.next(); !VALID_INDENTATIONS_1_1.done; VALID_INDENTATIONS_1_1 = VALID_INDENTATIONS_1.next()) {
            var indent = VALID_INDENTATIONS_1_1.value;
            if (line.startsWith(indent)) {
                return line.slice(indent.length);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (VALID_INDENTATIONS_1_1 && !VALID_INDENTATIONS_1_1.done && (_a = VALID_INDENTATIONS_1.return)) _a.call(VALID_INDENTATIONS_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (lineIsEmpty(line)) {
        return line;
    }
    throw new Error('Unexpectedly removed indentation from an unindented line.');
}
