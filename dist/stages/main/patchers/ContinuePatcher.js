"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var ContinuePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ContinuePatcher, _super);
    function ContinuePatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContinuePatcher.prototype.patchAsStatement = function () {
        // nothing to do
    };
    ContinuePatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    return ContinuePatcher;
}(NodePatcher_1.default));
exports.default = ContinuePatcher;
