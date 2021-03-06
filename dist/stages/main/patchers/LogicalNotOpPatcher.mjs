import * as tslib_1 from "tslib";
import UnaryOpPatcher from './UnaryOpPatcher';
var LogicalNotOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(LogicalNotOpPatcher, _super);
    function LogicalNotOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Though it's possible that `!` could trigger a `valueOf` call to arbitrary
     * code, CoffeeScript ignores that possibility and so do we.
     */
    LogicalNotOpPatcher.prototype.isRepeatable = function () {
        return this.expression.isRepeatable();
    };
    /**
     * ( `!` | `not` ) EXPRESSION
     */
    LogicalNotOpPatcher.prototype.patchAsExpression = function (options) {
        if (options === void 0) { options = {}; }
        if (this.expression.canHandleNegationInternally()) {
            this.expression.negate();
            this.remove(this.contentStart, this.expression.outerStart);
        }
        else {
            this.overwrite(this.contentStart, this.expression.outerStart, '!');
        }
        _super.prototype.patchAsExpression.call(this, options);
    };
    return LogicalNotOpPatcher;
}(UnaryOpPatcher));
export default LogicalNotOpPatcher;
