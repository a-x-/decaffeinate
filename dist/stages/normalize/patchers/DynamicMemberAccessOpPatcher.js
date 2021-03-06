"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PassthroughPatcher_1 = require("../../../patchers/PassthroughPatcher");
var DynamicMemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(DynamicMemberAccessOpPatcher, _super);
    function DynamicMemberAccessOpPatcher(patcherContext, expression, indexingExpr) {
        var _this = _super.call(this, patcherContext, expression, indexingExpr) || this;
        _this.expression = expression;
        _this.indexingExpr = indexingExpr;
        return _this;
    }
    return DynamicMemberAccessOpPatcher;
}(PassthroughPatcher_1.default));
exports.default = DynamicMemberAccessOpPatcher;
