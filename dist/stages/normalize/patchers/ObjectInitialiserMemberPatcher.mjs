import * as tslib_1 from "tslib";
import PassthroughPatcher from '../../../patchers/PassthroughPatcher';
var ObjectInitialiserMemberPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ObjectInitialiserMemberPatcher, _super);
    function ObjectInitialiserMemberPatcher(patcherContext, key, expression) {
        var _this = _super.call(this, patcherContext, key, expression) || this;
        _this.key = key;
        _this.expression = expression;
        return _this;
    }
    return ObjectInitialiserMemberPatcher;
}(PassthroughPatcher));
export default ObjectInitialiserMemberPatcher;
