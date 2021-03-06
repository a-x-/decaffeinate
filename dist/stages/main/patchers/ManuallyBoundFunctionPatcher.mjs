import * as tslib_1 from "tslib";
import FunctionPatcher from './FunctionPatcher';
/**
 * Handles bound functions that cannot become arrow functions.
 */
var ManuallyBoundFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ManuallyBoundFunctionPatcher, _super);
    function ManuallyBoundFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ManuallyBoundFunctionPatcher.prototype.patchAsStatement = function (options) {
        if (options === void 0) { options = {}; }
        this.insert(this.innerStart, '(');
        _super.prototype.patchAsExpression.call(this, options);
        this.insert(this.innerEnd, '.bind(this))');
    };
    ManuallyBoundFunctionPatcher.prototype.patchAsExpression = function (options) {
        if (options === void 0) { options = {}; }
        _super.prototype.patchAsExpression.call(this, options);
        // If we're instructed to patch as a method, then it won't be legal to add
        // `.bind(this)`, so skip that step. Calling code is expected to bind us
        // some other way. In practice, this happens when patching class methods;
        // code will be added to the constructor to bind the method properly.
        if (!options.method) {
            this.insert(this.innerEnd, '.bind(this)');
        }
    };
    ManuallyBoundFunctionPatcher.prototype.expectedArrowType = function () {
        return '=>';
    };
    return ManuallyBoundFunctionPatcher;
}(FunctionPatcher));
export default ManuallyBoundFunctionPatcher;
