"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Normal JS regular expressions don't support unicode code point escapes (e.g. /\u{1a}/), so
 * CoffeeScript compiles them to normal unicode escapes /\u001a/. Note that regexes now support the
 * "u" flag that makes them support unicode code point escapes and changes a few other aspects of
 * their behavior, but CoffeeScript still keeps the old behavior and just compiles the code point to
 * normal unicode escapes when the "u" flag is missing.
 *
 * needsExtraEscape is for heregexes where we'll need two backslashes before each 'u'. The first one
 * will be handled automatically by later code, but the second one we need to insert here.
 */
function downgradeUnicodeCodePointEscapesInRange(start, end, patcher, _a) {
    var needsExtraEscape = (_a === void 0 ? {} : _a).needsExtraEscape;
    var source = patcher.context.source;
    var numBackslashes = 0;
    for (var i = start; i < end - 2; i++) {
        if (source[i] === '\\') {
            numBackslashes++;
        }
        else {
            numBackslashes = 0;
        }
        if (numBackslashes % 2 === 1 && source.slice(i, i + 3) === '\\u{') {
            var codePointEnd = i + 3;
            while (codePointEnd < source.length && source[codePointEnd] !== '}') {
                codePointEnd++;
            }
            // Logic taken from unicodeCodePointToUnicodeEscapes in CoffeeScript's lexer.coffee.
            var codePointText = source.slice(i + 3, codePointEnd);
            var codePoint = parseInt(codePointText, 16);
            if (codePoint < 0x10000) {
                patcher.overwrite(i, codePointEnd + 1, toUnicodeEscape(codePoint));
            }
            else {
                var high = Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
                var low = ((codePoint - 0x10000) % 0x400) + 0xdc00;
                patcher.overwrite(i, codePointEnd + 1, "" + toUnicodeEscape(high) + (needsExtraEscape ? '\\' : '') + toUnicodeEscape(low));
            }
            i = codePointEnd;
        }
    }
}
exports.default = downgradeUnicodeCodePointEscapesInRange;
function toUnicodeEscape(val) {
    var str = val.toString(16);
    return "\\u" + '0'.repeat(4 - str.length) + str;
}
