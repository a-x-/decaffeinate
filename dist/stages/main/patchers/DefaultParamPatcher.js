"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var DefaultParamPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(DefaultParamPatcher, _super);
    function DefaultParamPatcher(patcherContext, param, value) {
        var _this = _super.call(this, patcherContext) || this;
        _this.param = param;
        _this.value = value;
        return _this;
    }
    DefaultParamPatcher.prototype.initialize = function () {
        this.param.setRequiresExpression();
        this.value.setRequiresExpression();
    };
    DefaultParamPatcher.prototype.patchAsExpression = function () {
        this.param.patch();
        this.value.patch();
    };
    return DefaultParamPatcher;
}(NodePatcher_1.default));
exports.default = DefaultParamPatcher;
