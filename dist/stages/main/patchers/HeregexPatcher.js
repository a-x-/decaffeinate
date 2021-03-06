"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var InterpolatedPatcher_1 = require("./InterpolatedPatcher");
var CLOSE_TOKEN_BASE_LENGTH = 3;
var HeregexPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(HeregexPatcher, _super);
    function HeregexPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeregexPatcher.prototype.patchAsExpression = function () {
        var openToken = this.firstToken();
        var closeToken = this.lastToken();
        this.overwrite(openToken.start, openToken.end, 'new RegExp(`');
        if (closeToken.end - closeToken.start > CLOSE_TOKEN_BASE_LENGTH) {
            // If the close token has flags, e.g. ///gi, keep the flags as a string literal.
            this.overwrite(closeToken.start, closeToken.start + CLOSE_TOKEN_BASE_LENGTH, "`, '");
            this.insert(closeToken.end, "')");
        }
        else {
            // Otherwise, don't specify flags.
            this.overwrite(closeToken.start, closeToken.end, '`)');
        }
        this.patchInterpolations();
        this.processContents();
        this.escapeQuasis(/^\\\s/, ['`', '${', '\\']);
    };
    HeregexPatcher.prototype.shouldExcapeZeroChars = function () {
        return true;
    };
    HeregexPatcher.prototype.shouldDowngradeUnicodeCodePointEscapes = function () {
        return !this.node.flags.unicode;
    };
    return HeregexPatcher;
}(InterpolatedPatcher_1.default));
exports.default = HeregexPatcher;
