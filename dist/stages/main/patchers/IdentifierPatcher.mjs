import * as tslib_1 from "tslib";
import PassthroughPatcher from './../../../patchers/PassthroughPatcher';
var IdentifierPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(IdentifierPatcher, _super);
    function IdentifierPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IdentifierPatcher.prototype.isRepeatable = function () {
        return true;
    };
    /**
     * Determine if this identifier might refer to a non-existent variable. In
     * that case, some code paths need to emit a `typeof` check to ensure that
     * we don't crash if this variable hasn't been declared.
     */
    IdentifierPatcher.prototype.mayBeUnboundReference = function () {
        return !this.getScope().hasBinding(this.node.data);
    };
    return IdentifierPatcher;
}(PassthroughPatcher));
export default IdentifierPatcher;
