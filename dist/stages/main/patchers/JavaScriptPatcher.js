"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SourceType_1 = require("coffee-lex/dist/SourceType");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var FunctionApplicationPatcher_1 = require("./FunctionApplicationPatcher");
/**
 * Handles embedded JavaScript.
 */
var JavaScriptPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(JavaScriptPatcher, _super);
    function JavaScriptPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * We need to strip off the backticks and also remove any escape backslashes before backticks.
     */
    JavaScriptPatcher.prototype.patchAsExpression = function () {
        // For any normal surrounding parens, CoffeeScript's rule is to remove them,
        // which allows things like comment-only inline JS. Function call parens
        // should not be removed, though.
        var shouldRemoveSurroundingParens = !(this.parent instanceof FunctionApplicationPatcher_1.default && this === this.parent.args[0]);
        if (shouldRemoveSurroundingParens) {
            this.remove(this.outerStart, this.contentStart);
        }
        var token = this.firstToken();
        var tokenLength;
        if (token.type === SourceType_1.default.JS) {
            tokenLength = 1;
        }
        else if (token.type === SourceType_1.default.HEREJS) {
            tokenLength = 3;
        }
        else {
            throw this.error("Unexpected token in JavaScript node: " + token.type);
        }
        // '`void 0`' → 'void 0`'
        //  ^
        this.remove(this.contentStart, this.contentStart + tokenLength);
        // We want to allow escaped backticks, and escaped backslashes immediately before escaped
        // backticks.
        for (var i = this.contentStart + tokenLength; i < this.contentEnd - tokenLength - 1; i++) {
            if (this.slice(i, i + 2) === '\\`') {
                var startBackslash = i;
                while (this.context.source[startBackslash] === '\\') {
                    startBackslash--;
                }
                startBackslash++;
                // The range [startBackslash, i + 2) is now a string like "\\\\\`". One backslash is used
                // for the escape and two for each backslash to include, so 1 backslash should become 0,
                // 3 backslashes should become 1, 5 should become 2, etc. In normal (single-backtick) inline
                // JS, there will always be an odd number of backslashes (since otherwise the backtick would
                // be the end of the JS node), but in triple-backtick inline JS there could be an even
                // number. CoffeeScript has the same special escaping behavior there as well, so replicate
                // that: 2 backslashes become 1, 4 become 2, etc. In all case, this behavior only happens
                // for a sequence of backslashes followed by a backtick.
                var numBackslashesToKeep = Math.floor((i + 1 - startBackslash) / 2);
                this.remove(startBackslash, i + 1 - numBackslashesToKeep);
            }
        }
        // 'void 0`' → 'void 0'
        //        ^
        this.remove(this.contentEnd - tokenLength, this.contentEnd);
        if (shouldRemoveSurroundingParens) {
            this.remove(this.contentEnd, this.outerEnd);
        }
    };
    return JavaScriptPatcher;
}(NodePatcher_1.default));
exports.default = JavaScriptPatcher;
