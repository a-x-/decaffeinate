"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var FunctionPatcher_1 = require("./FunctionPatcher");
/**
 * Handles generator functions, i.e. produced by embedding `yield` statements.
 */
var GeneratorFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(GeneratorFunctionPatcher, _super);
    function GeneratorFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GeneratorFunctionPatcher.prototype.patchFunctionStart = function (_a) {
        var _b = _a.method, method = _b === void 0 ? false : _b;
        var arrow = this.getArrowToken();
        if (!method) {
            this.insert(this.contentStart, 'function*');
        }
        if (!this.hasParamStart()) {
            this.insert(this.contentStart, '() ');
        }
        this.overwrite(arrow.start, arrow.end, '{');
    };
    return GeneratorFunctionPatcher;
}(FunctionPatcher_1.default));
exports.default = GeneratorFunctionPatcher;
