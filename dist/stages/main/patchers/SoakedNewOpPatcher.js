"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SoakedFunctionApplicationPatcher_1 = require("./SoakedFunctionApplicationPatcher");
var SoakedNewOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SoakedNewOpPatcher, _super);
    function SoakedNewOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Since `new` makes a new `this`, don't bother with the `guardMethod` variant.
     */
    SoakedNewOpPatcher.prototype.patchMethodCall = function () {
        this.patchNonMethodCall();
    };
    /**
     * Since `new` makes a new `this`, don't bother with the `guardMethod` variant.
     */
    SoakedNewOpPatcher.prototype.patchDynamicMethodCall = function () {
        this.patchNonMethodCall();
    };
    return SoakedNewOpPatcher;
}(SoakedFunctionApplicationPatcher_1.default));
exports.default = SoakedNewOpPatcher;
