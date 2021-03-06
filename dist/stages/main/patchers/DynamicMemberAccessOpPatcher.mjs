import * as tslib_1 from "tslib";
import NodePatcher from './../../../patchers/NodePatcher';
var DynamicMemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(DynamicMemberAccessOpPatcher, _super);
    function DynamicMemberAccessOpPatcher(patcherContext, expression, indexingExpr) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        _this.indexingExpr = indexingExpr;
        return _this;
    }
    DynamicMemberAccessOpPatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
        this.indexingExpr.setRequiresExpression();
    };
    DynamicMemberAccessOpPatcher.prototype.patchAsExpression = function () {
        this.expression.patch();
        this.indexingExpr.patch();
    };
    /**
     * We can make dynamic member access repeatable by making both parts
     * repeatable if they aren't already. We do that by giving them names and
     * referring to those names in a new dynamic member access. We cannot simply
     * save the value of the member access because this could be used as the LHS
     * of an assignment.
     */
    DynamicMemberAccessOpPatcher.prototype.patchAsRepeatableExpression = function (repeatableOptions, patchOptions) {
        if (repeatableOptions === void 0) { repeatableOptions = {}; }
        if (patchOptions === void 0) { patchOptions = {}; }
        if (repeatableOptions.isForAssignment) {
            this.expression.setRequiresRepeatableExpression({ isForAssignment: true, parens: true, ref: 'base' });
            this.indexingExpr.setRequiresRepeatableExpression({ ref: 'name' });
            this.patchAsExpression();
            this.commitDeferredSuffix();
            return this.expression.getRepeatCode() + "[" + this.indexingExpr.getRepeatCode() + "]";
        }
        else {
            return _super.prototype.patchAsRepeatableExpression.call(this, repeatableOptions, patchOptions);
        }
    };
    /**
     * CoffeeScript considers dynamic member access repeatable if both parts
     * are themselves repeatable. So, for example, `a[0]` is repeatable because
     * both `a` and `0` are repeatable, but `a()[0]` and `a[b()]` are not.
     */
    DynamicMemberAccessOpPatcher.prototype.isRepeatable = function () {
        return this.expression.isRepeatable() && this.indexingExpr.isRepeatable();
    };
    /**
     * If `BASE` needs parens, then `BASE[INDEX]` needs parens.
     */
    DynamicMemberAccessOpPatcher.prototype.statementNeedsParens = function () {
        return this.expression.statementShouldAddParens();
    };
    return DynamicMemberAccessOpPatcher;
}(NodePatcher));
export default DynamicMemberAccessOpPatcher;
