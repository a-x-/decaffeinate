import * as tslib_1 from "tslib";
import NegatableBinaryOpPatcher from './NegatableBinaryOpPatcher';
/**
 * Handles `instanceof` operator, e.g. `a instanceof b`.
 */
var InstanceofOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(InstanceofOpPatcher, _super);
    function InstanceofOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InstanceofOpPatcher.prototype.javaScriptOperator = function () {
        return 'instanceof';
    };
    return InstanceofOpPatcher;
}(NegatableBinaryOpPatcher));
export default InstanceofOpPatcher;
