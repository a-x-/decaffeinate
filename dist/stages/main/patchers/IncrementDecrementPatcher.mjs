import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
var IncrementDecrementPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(IncrementDecrementPatcher, _super);
    function IncrementDecrementPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    IncrementDecrementPatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
    };
    IncrementDecrementPatcher.prototype.patchAsExpression = function () {
        this.expression.patch();
    };
    IncrementDecrementPatcher.prototype.isRepeatable = function () {
        return false;
    };
    return IncrementDecrementPatcher;
}(NodePatcher));
export default IncrementDecrementPatcher;
