import * as tslib_1 from "tslib";
import PassthroughPatcher from '../../../patchers/PassthroughPatcher';
var DynamicMemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(DynamicMemberAccessOpPatcher, _super);
    function DynamicMemberAccessOpPatcher(patcherContext, expression, indexingExpr) {
        var _this = _super.call(this, patcherContext, expression, indexingExpr) || this;
        _this.expression = expression;
        _this.indexingExpr = indexingExpr;
        return _this;
    }
    return DynamicMemberAccessOpPatcher;
}(PassthroughPatcher));
export default DynamicMemberAccessOpPatcher;
