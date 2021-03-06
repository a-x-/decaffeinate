"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var BreakPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BreakPatcher, _super);
    function BreakPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BreakPatcher.prototype.patchAsStatement = function () {
        // nothing to do
    };
    BreakPatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    return BreakPatcher;
}(NodePatcher_1.default));
exports.default = BreakPatcher;
