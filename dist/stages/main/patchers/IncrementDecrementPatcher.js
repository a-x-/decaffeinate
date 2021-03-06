"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var IncrementDecrementPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(IncrementDecrementPatcher, _super);
    function IncrementDecrementPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    IncrementDecrementPatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
    };
    IncrementDecrementPatcher.prototype.patchAsExpression = function () {
        this.expression.patch();
    };
    IncrementDecrementPatcher.prototype.isRepeatable = function () {
        return false;
    };
    return IncrementDecrementPatcher;
}(NodePatcher_1.default));
exports.default = IncrementDecrementPatcher;
