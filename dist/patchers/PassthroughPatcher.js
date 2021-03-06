"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("./NodePatcher");
var PassthroughPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(PassthroughPatcher, _super);
    function PassthroughPatcher(patcherContext) {
        var children = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            children[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, patcherContext) || this;
        _this.children = children;
        return _this;
    }
    PassthroughPatcher.prototype.patchAsExpression = function () {
        this.children.forEach(function (child) {
            if (Array.isArray(child)) {
                child.forEach(function (child) { return child && child.patch(); });
            }
            else if (child) {
                child.patch();
            }
        });
    };
    PassthroughPatcher.prototype.isRepeatable = function () {
        return true;
    };
    return PassthroughPatcher;
}(NodePatcher_1.default));
exports.default = PassthroughPatcher;
