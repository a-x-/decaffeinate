import * as tslib_1 from "tslib";
import PassthroughPatcher from '../../../patchers/PassthroughPatcher';
var ConstructorPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ConstructorPatcher, _super);
    function ConstructorPatcher(patcherContext, assignee, expression) {
        var _this = _super.call(this, patcherContext, assignee, expression) || this;
        _this.assignee = assignee;
        _this.expression = expression;
        return _this;
    }
    return ConstructorPatcher;
}(PassthroughPatcher));
export default ConstructorPatcher;
