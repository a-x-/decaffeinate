"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BoundFunctionPatcher_1 = require("./BoundFunctionPatcher");
var BoundAsyncFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BoundAsyncFunctionPatcher, _super);
    function BoundAsyncFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoundAsyncFunctionPatcher.prototype.patchFunctionStart = function () {
        this.insert(this.contentStart, 'async ');
        _super.prototype.patchFunctionStart.call(this);
    };
    return BoundAsyncFunctionPatcher;
}(BoundFunctionPatcher_1.default));
exports.default = BoundAsyncFunctionPatcher;
