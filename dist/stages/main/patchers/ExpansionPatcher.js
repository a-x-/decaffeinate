"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ExpansionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExpansionPatcher, _super);
    function ExpansionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpansionPatcher.prototype.patchAsExpression = function () {
        // Any code handling expansions should process them without calling patch.
        // If patch ends up being called, then that means that we've hit an
        // unsupported case that's trying to treat this node as a normal expression.
        throw this.error('Unexpected traversal of expansion node.');
    };
    return ExpansionPatcher;
}(NodePatcher_1.default));
exports.default = ExpansionPatcher;
