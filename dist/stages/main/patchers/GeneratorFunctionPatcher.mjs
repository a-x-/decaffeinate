import * as tslib_1 from "tslib";
import FunctionPatcher from './FunctionPatcher';
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
}(FunctionPatcher));
export default GeneratorFunctionPatcher;
