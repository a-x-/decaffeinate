"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PassthroughPatcher_1 = require("../../../patchers/PassthroughPatcher");
var SpreadPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SpreadPatcher, _super);
    function SpreadPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext, expression) || this;
        _this.expression = expression;
        return _this;
    }
    return SpreadPatcher;
}(PassthroughPatcher_1.default));
exports.default = SpreadPatcher;
