"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
/**
 * Handles array or string slicing, e.g. `names[i..]`.
 */
var SlicePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SlicePatcher, _super);
    /**
     * `node` is of type `Slice`.
     */
    function SlicePatcher(patcherContext, expression, left, right) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        _this.left = left;
        _this.right = right;
        return _this;
    }
    SlicePatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
        if (this.left) {
            this.left.setRequiresExpression();
        }
        if (this.right) {
            this.right.setRequiresExpression();
        }
    };
    SlicePatcher.prototype.shouldPatchAsOptionalChaining = function () {
        return false;
    };
    /**
     * EXPRESSION '[' LEFT? ( .. | ... ) RIGHT? ']'
     */
    SlicePatcher.prototype.patchAsExpression = function () {
        this.expression.patch();
        var indexStart = this.getIndexStartSourceToken();
        // `a[0..1]` → `a.slice(0..1]`
        //   ^           ^^^^^^^
        var dot = this.shouldPatchAsOptionalChaining() ? '?.' : '.';
        this.overwrite(this.expression.outerEnd, indexStart.end, dot + "slice(");
        if (this.left) {
            this.left.patch();
        }
        else if (this.right) {
            // `a.slice(..1]` → `a.slice(0..1]`
            //                           ^
            this.insert(indexStart.end, '0');
        }
        var slice = this.getSliceSourceToken();
        var right = this.right;
        if (right) {
            if (this.isInclusive()) {
                if (right.node.raw === '-1') {
                    this.remove(slice.start, right.outerEnd);
                }
                else if (right.node instanceof nodes_1.Int) {
                    this.overwrite(slice.start, right.outerEnd, ", " + (right.node.data + 1));
                }
                else {
                    // `a.slice(0..1]` → `a.slice(0, +1]`
                    //           ^^                ^^^
                    this.overwrite(slice.start, slice.end, ', +');
                    // Don't put two `+` operations immediately next to each other, since
                    // otherwise it will become a `++`. Checking if the CoffeeScript code
                    // starts with `+` should be easy and correct in this case.
                    if (this.slice(right.contentStart, right.contentStart + 1) === '+') {
                        this.insert(slice.end, ' ');
                    }
                    right.patch({ needsParens: true });
                    this.insert(right.outerEnd, ' + 1 || undefined');
                }
            }
            else {
                // `a.slice(0..1]` → `a.slice(0, 1]`
                //           ^^                ^^
                this.overwrite(slice.start, slice.end, ', ');
                right.patch();
            }
        }
        else {
            // `a.slice(0..]` → `a.slice(0]`
            //           ^^
            this.overwrite(slice.start, slice.end, '');
        }
        var indexEnd = this.getIndexEndSourceToken();
        // `a.slice(0, 1]` → `a.slice(0, 1)`
        //              ^                 ^
        this.overwrite(indexEnd.start, indexEnd.end, ')');
    };
    /**
     * Given the RHS of a splice expression, return the code for it. This only
     * happens in a context where our expression will go away, so children can be
     * patched as necessary.
     */
    SlicePatcher.prototype.getSpliceCode = function (expressionCode) {
        var _this = this;
        var spliceStart = this.captureCodeForPatchOperation(function () { return _this.patchAsSpliceExpressionStart(); });
        return spliceStart + ", ...[].concat(" + expressionCode + "))";
    };
    /**
     * Patch into the first part of a splice expression. For example,
     *
     * a[b...c]
     *
     * becomes
     *
     * a.splice(b, c - b
     *
     * The enclosing assignment operator patcher will do the rest.
     */
    SlicePatcher.prototype.patchAsSpliceExpressionStart = function () {
        this.expression.patch();
        var indexStart = this.getIndexStartSourceToken();
        // `a[b..c]` → `a.splice(b..c]`
        //   ^           ^^^^^^^^
        var dot = this.shouldPatchAsOptionalChaining() ? '?.' : '.';
        this.overwrite(this.expression.outerEnd, indexStart.end, dot + "splice(");
        var leftCode;
        if (this.left) {
            leftCode = this.left.patchRepeatable();
        }
        else {
            // `a.splice(..c]` → `a.splice(0..c]`
            //                             ^
            this.insert(indexStart.end, '0');
            leftCode = '0';
        }
        var slice = this.getSliceSourceToken();
        var right = this.right;
        if (right) {
            // `a.splice(b..c]` → `a.splice(b, c]`
            //                               ^^
            this.overwrite(slice.start, slice.end, ', ');
            right.patch({ needsParens: true });
            if (leftCode !== '0') {
                // `a.splice(b, c]` → `a.splice(b, c - b]`
                //                                  ^^^^
                this.insert(right.outerEnd, " - " + leftCode);
            }
            if (this.isInclusive()) {
                // `a.splice(b, c - b]` → `a.splice(b, c - b + 1]`
                //                                          ^^^^
                this.insert(right.outerEnd, ' + 1');
            }
        }
        else {
            // `a.splice(b..]` → `a.splice(b, 9e9]`
            //            ^^                ^^^^^
            this.overwrite(slice.start, slice.end, ', 9e9');
        }
        var indexEnd = this.getIndexEndSourceToken();
        // `a.splice(b, c - b + 1]` → `a.splice(b, c - b + 1`
        //                       ^
        this.remove(indexEnd.start, indexEnd.end);
    };
    /**
     * @private
     */
    SlicePatcher.prototype.isInclusive = function () {
        var slice = this.getSliceSourceToken();
        return slice.end - slice.start === '..'.length;
    };
    /**
     * @private
     */
    SlicePatcher.prototype.getIndexStartSourceToken = function () {
        var tokens = this.context.sourceTokens;
        var index = tokens.indexOfTokenMatchingPredicate(function (token) { return token.type === coffee_lex_1.SourceType.LBRACKET; }, this.expression.outerEndTokenIndex);
        if (!index || index.isAfter(this.contentEndTokenIndex)) {
            throw this.error("could not find INDEX_START after slice expression");
        }
        return notNull_1.default(tokens.tokenAtIndex(index));
    };
    /**
     * @private
     */
    SlicePatcher.prototype.getSliceSourceToken = function () {
        var tokens = this.context.sourceTokens;
        var source = this.context.source;
        var index = tokens.indexOfTokenMatchingPredicate(function (token) {
            if (token.type !== coffee_lex_1.SourceType.RANGE) {
                return false;
            }
            var operator = source.slice(token.start, token.end);
            return operator === '...' || operator === '..';
        }, this.left ? this.left.outerEndTokenIndex : this.expression.outerEndTokenIndex);
        if (!index || index.isAfter(this.contentEndTokenIndex)) {
            throw this.error("could not find '..' or '...' in slice");
        }
        return notNull_1.default(tokens.tokenAtIndex(index));
    };
    /**
     * @private
     */
    SlicePatcher.prototype.getIndexEndSourceToken = function () {
        var tokens = this.context.sourceTokens;
        var index = tokens.lastIndexOfTokenMatchingPredicate(function (token) { return token.type === coffee_lex_1.SourceType.RBRACKET; }, this.outerEndTokenIndex);
        if (!index || index.isBefore(this.contentStartTokenIndex)) {
            throw this.error("could not find ']' ending slice");
        }
        return notNull_1.default(tokens.tokenAtIndex(index));
    };
    /**
     * If `BASE` needs parens then `BASE[0..1]` needs parens.
     */
    SlicePatcher.prototype.statementNeedsParens = function () {
        return this.expression.statementShouldAddParens();
    };
    return SlicePatcher;
}(NodePatcher_1.default));
exports.default = SlicePatcher;
