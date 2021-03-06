"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var postfixExpressionRequiresParens_1 = require("../../../utils/postfixExpressionRequiresParens");
var postfixNodeNeedsOuterParens_1 = require("../../../utils/postfixNodeNeedsOuterParens");
/**
 * Normalizes `while` loops by rewriting post-`while` into standard `while`, e.g.
 *
 *   a() while b()
 *
 * becomes
 *
 *   while b() then a()
 */
var WhilePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(WhilePatcher, _super);
    function WhilePatcher(patcherContext, condition, guard, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this.condition = condition;
        _this.guard = guard;
        _this.body = body;
        return _this;
    }
    WhilePatcher.prototype.patchAsExpression = function () {
        this.condition.patch();
        if (this.guard) {
            this.guard.patch();
        }
        if (this.body) {
            this.body.patch();
        }
        if (this.isPostWhile()) {
            this.normalize();
        }
    };
    WhilePatcher.prototype.patchAsStatement = function () {
        this.patchAsExpression();
    };
    /**
     * `BODY 'while' CONDITION ('when' GUARD)?` → `while CONDITION [when GUARD] then BODY`
     * `BODY 'until' CONDITION ('when' GUARD)?` → `until CONDITION [when GUARD] then BODY`
     *
     * @private
     */
    WhilePatcher.prototype.normalize = function () {
        if (this.body === null) {
            throw this.error('Expected non-null body.');
        }
        var patchedCondition = this.slice(this.condition.outerStart, this.condition.outerEnd);
        if (postfixExpressionRequiresParens_1.default(patchedCondition) && !this.condition.isSurroundedByParentheses()) {
            patchedCondition = "(" + patchedCondition + ")";
        }
        var patchedBody = this.slice(this.body.outerStart, this.body.outerEnd);
        var patchedGuard = null;
        if (this.guard) {
            patchedGuard = this.slice(this.guard.outerStart, this.guard.outerEnd);
            if (postfixExpressionRequiresParens_1.default(patchedGuard) && !this.guard.isSurroundedByParentheses()) {
                patchedGuard = "(" + patchedGuard + ")";
            }
        }
        var whileToken = this.node.isUntil ? 'until' : 'while';
        var newContent = whileToken + " " + patchedCondition + " " + (patchedGuard ? "when " + patchedGuard + " " : '') + "then " + patchedBody;
        if (postfixNodeNeedsOuterParens_1.default(this)) {
            newContent = "(" + newContent + ")";
        }
        this.overwrite(this.contentStart, this.contentEnd, newContent);
    };
    /**
     * @private
     */
    WhilePatcher.prototype.isPostWhile = function () {
        return this.body !== null && this.condition.contentStart > this.body.contentStart;
    };
    return WhilePatcher;
}(NodePatcher_1.default));
exports.default = WhilePatcher;
