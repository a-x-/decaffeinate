"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var notNull_1 = require("../../../utils/notNull");
var postfixExpressionRequiresParens_1 = require("../../../utils/postfixExpressionRequiresParens");
var postfixNodeNeedsOuterParens_1 = require("../../../utils/postfixNodeNeedsOuterParens");
/**
 * Normalizes conditionals by rewriting post-`if` into standard `if`, e.g.
 *
 *   return [] unless list?
 *
 * becomes
 *
 *   unless list? then return []
 */
var ConditionalPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ConditionalPatcher, _super);
    function ConditionalPatcher(patcherContext, condition, consequent, alternate) {
        var _this = _super.call(this, patcherContext) || this;
        _this.condition = condition;
        _this.consequent = consequent;
        _this.alternate = alternate;
        return _this;
    }
    ConditionalPatcher.prototype.patchAsExpression = function () {
        if (this.isPostIf()) {
            this.patchPostIf();
        }
        else {
            this.condition.patch();
            if (this.consequent !== null) {
                this.consequent.patch();
            }
            if (this.alternate !== null) {
                this.alternate.patch();
            }
        }
    };
    /**
     * `CONSEQUENT 'if' CONDITION` → `if CONDITION then CONSEQUENT`
     * `CONSEQUENT 'unless' CONDITION` → `unless CONDITION then CONSEQUENT`
     */
    ConditionalPatcher.prototype.patchPostIf = function () {
        if (!this.consequent) {
            throw this.error('Expected non-null consequent for post-if.');
        }
        this.condition.patch();
        if (postfixExpressionRequiresParens_1.default(this.slice(this.condition.contentStart, this.condition.contentEnd)) &&
            !this.condition.isSurroundedByParentheses()) {
            this.condition.surroundInParens();
        }
        var ifTokenIndex = this.getIfTokenIndex();
        var ifToken = this.sourceTokenAtIndex(ifTokenIndex);
        if (!ifToken) {
            throw this.error('Unable to find `if` token.');
        }
        var needsParens = postfixNodeNeedsOuterParens_1.default(this);
        var ifAndConditionCode = this.slice(ifToken.start, this.condition.outerEnd);
        if (needsParens) {
            this.insert(this.consequent.outerStart, '(');
        }
        this.insert(this.consequent.outerStart, ifAndConditionCode + " then ");
        this.consequent.patch();
        if (needsParens) {
            this.insert(this.consequent.outerEnd, ')');
        }
        this.remove(this.consequent.outerEnd, this.contentEnd);
    };
    ConditionalPatcher.prototype.isPostIf = function () {
        return this.consequent !== null && this.condition.contentStart > this.consequent.contentStart;
    };
    ConditionalPatcher.prototype.getIfTokenIndex = function () {
        var start = this.contentStartTokenIndex;
        var index = this.condition.outerStartTokenIndex;
        while (index !== start) {
            var token = this.sourceTokenAtIndex(index);
            if (token && token.type === coffee_lex_1.SourceType.IF) {
                break;
            }
            index = notNull_1.default(index.previous());
        }
        if (!index) {
            throw this.error('unable to find `if` token in conditional');
        }
        return index;
    };
    return ConditionalPatcher;
}(NodePatcher_1.default));
exports.default = ConditionalPatcher;
