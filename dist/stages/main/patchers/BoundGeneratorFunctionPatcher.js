"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ManuallyBoundFunctionPatcher_1 = require("./ManuallyBoundFunctionPatcher");
var BoundGeneratorFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BoundGeneratorFunctionPatcher, _super);
    function BoundGeneratorFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoundGeneratorFunctionPatcher.prototype.patchFunctionStart = function (_a) {
        var _b = (_a === void 0 ? {} : _a).method, method = _b === void 0 ? false : _b;
        var arrow = this.getArrowToken();
        if (!method) {
            this.insert(this.contentStart, 'function*');
        }
        if (!this.hasParamStart()) {
            this.insert(this.contentStart, '() ');
        }
        this.overwrite(arrow.start, arrow.end, '{');
    };
    return BoundGeneratorFunctionPatcher;
}(ManuallyBoundFunctionPatcher_1.default));
exports.default = BoundGeneratorFunctionPatcher;
