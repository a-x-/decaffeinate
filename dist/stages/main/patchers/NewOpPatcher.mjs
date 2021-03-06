import * as tslib_1 from "tslib";
import FunctionApplicationPatcher from './FunctionApplicationPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
/**
 * Handles construction of objects with `new`.
 */
var NewOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(NewOpPatcher, _super);
    function NewOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewOpPatcher.prototype.patchAsExpression = function () {
        var fnNeedsParens = !this.fn.isSurroundedByParentheses() &&
            !(this.fn instanceof IdentifierPatcher) &&
            !(this.fn instanceof MemberAccessOpPatcher);
        _super.prototype.patchAsExpression.call(this, { fnNeedsParens: fnNeedsParens });
    };
    return NewOpPatcher;
}(FunctionApplicationPatcher));
export default NewOpPatcher;
