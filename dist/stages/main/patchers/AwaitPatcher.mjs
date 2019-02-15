import * as tslib_1 from "tslib";
import NodePatcher from './../../../patchers/NodePatcher';
var AwaitPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(AwaitPatcher, _super);
    function AwaitPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    AwaitPatcher.prototype.initialize = function () {
        this.awaits();
        this.expression.setRequiresExpression();
    };
    AwaitPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? true : _b;
        this.expression.patch({ needsParens: needsParens });
    };
    return AwaitPatcher;
}(NodePatcher));
export default AwaitPatcher;
