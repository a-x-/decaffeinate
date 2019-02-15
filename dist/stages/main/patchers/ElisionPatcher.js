"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ElisionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ElisionPatcher, _super);
    function ElisionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ElisionPatcher.prototype.patchAsExpression = function () {
        // Nothing to patch.
    };
    return ElisionPatcher;
}(NodePatcher_1.default));
exports.default = ElisionPatcher;
