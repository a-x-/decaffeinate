"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var suggestions_1 = require("../../../suggestions");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ConditionalPatcher_1 = require("./ConditionalPatcher");
var SwitchPatcher_1 = require("./SwitchPatcher");
var ReturnPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ReturnPatcher, _super);
    function ReturnPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    ReturnPatcher.prototype.initialize = function () {
        this.setExplicitlyReturns();
        if (this.expression !== null) {
            if (this.willConvertToImplicitReturn()) {
                this.expression.setImplicitlyReturns();
            }
            else {
                this.expression.setRequiresExpression();
            }
        }
    };
    /**
     * Return statements cannot be expressions.
     */
    ReturnPatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    ReturnPatcher.prototype.patchAsStatement = function () {
        if (this.getScope().containerNode.type === 'Program') {
            this.addSuggestion(suggestions_1.AVOID_TOP_LEVEL_RETURN);
        }
        if (this.expression) {
            if (this.willConvertToImplicitReturn()) {
                this.remove(this.contentStart, this.expression.outerStart);
            }
            this.expression.patch();
        }
    };
    ReturnPatcher.prototype.willConvertToImplicitReturn = function () {
        if (!this.expression) {
            throw this.error('Expected non-null expression.');
        }
        return (!this.expression.isSurroundedByParentheses() &&
            (this.expression instanceof ConditionalPatcher_1.default || this.expression instanceof SwitchPatcher_1.default));
    };
    return ReturnPatcher;
}(NodePatcher_1.default));
exports.default = ReturnPatcher;
