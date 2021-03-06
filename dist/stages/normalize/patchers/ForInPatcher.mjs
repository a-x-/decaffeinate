import * as tslib_1 from "tslib";
import postfixExpressionRequiresParens from '../../../utils/postfixExpressionRequiresParens';
import ForPatcher from './ForPatcher';
var ForInPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForInPatcher, _super);
    function ForInPatcher(patcherContext, keyAssignee, valAssignee, target, step, filter, body) {
        var _this = _super.call(this, patcherContext, keyAssignee, valAssignee, target, filter, body) || this;
        _this.step = step;
        return _this;
    }
    ForInPatcher.prototype.patchAsExpression = function () {
        if (this.step) {
            this.step.patch();
        }
        _super.prototype.patchAsExpression.call(this);
    };
    ForInPatcher.prototype.surroundThenUsagesInParens = function () {
        if (this.step && postfixExpressionRequiresParens(this.slice(this.step.contentStart, this.step.contentEnd))) {
            this.step.surroundInParens();
        }
        _super.prototype.surroundThenUsagesInParens.call(this);
    };
    return ForInPatcher;
}(ForPatcher));
export default ForInPatcher;
