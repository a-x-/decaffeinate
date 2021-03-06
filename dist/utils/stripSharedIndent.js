"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var getIndent_1 = require("./getIndent");
/**
 * Remove indentation shared by all lines and remove leading and trailing
 * newlines.
 */
function stripSharedIndent(source) {
    var lines = source.split('\n');
    var commonIndent = getCommonIndent(lines);
    lines = lines.map(function (line) {
        if (line.startsWith(commonIndent)) {
            return line.substr(commonIndent.length);
        }
        if (/^\s*$/.test(line)) {
            return '';
        }
        return line;
    });
    while (lines.length > 0 && lines[0].length === 0) {
        lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1].length === 0) {
        lines.pop();
    }
    return lines.join('\n');
}
exports.default = stripSharedIndent;
function getCommonIndent(lines) {
    var e_1, _a;
    var commonIndent = null;
    try {
        for (var lines_1 = tslib_1.__values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            var indent = getIndent_1.default(line, 0);
            if (indent === line) {
                continue;
            }
            if (commonIndent === null) {
                commonIndent = indent;
            }
            else {
                for (var i = 0; i < commonIndent.length; i++) {
                    if (i >= indent.length || indent[i] !== commonIndent[i]) {
                        commonIndent = commonIndent.substr(0, i);
                        break;
                    }
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return commonIndent === null ? '' : commonIndent;
}
