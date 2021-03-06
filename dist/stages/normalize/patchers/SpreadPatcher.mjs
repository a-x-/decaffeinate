import * as tslib_1 from "tslib";
import PassthroughPatcher from '../../../patchers/PassthroughPatcher';
var SpreadPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SpreadPatcher, _super);
    function SpreadPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext, expression) || this;
        _this.expression = expression;
        return _this;
    }
    return SpreadPatcher;
}(PassthroughPatcher));
export default SpreadPatcher;
