import * as tslib_1 from "tslib";
import NodePatcher from './../../../patchers/NodePatcher';
import AssignOpPatcher from './AssignOpPatcher';
import BlockPatcher from './BlockPatcher';
import ReturnPatcher from './ReturnPatcher';
var YieldPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(YieldPatcher, _super);
    function YieldPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    YieldPatcher.prototype.initialize = function () {
        this.yields();
        if (this.expression) {
            this.expression.setRequiresExpression();
        }
    };
    /**
     * 'yield' EXPRESSION
     */
    YieldPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? true : _b;
        var surroundInParens = this.needsParens() && !this.isSurroundedByParentheses();
        if (surroundInParens) {
            this.insert(this.contentStart, '(');
        }
        if (this.expression) {
            this.expression.patch({ needsParens: needsParens });
        }
        if (surroundInParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    YieldPatcher.prototype.needsParens = function () {
        return !(this.parent instanceof BlockPatcher ||
            this.parent instanceof ReturnPatcher ||
            (this.parent instanceof AssignOpPatcher && this.parent.expression === this));
    };
    return YieldPatcher;
}(NodePatcher));
export default YieldPatcher;
