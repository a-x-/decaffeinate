import * as tslib_1 from "tslib";
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
var FloorDivideOpCompoundAssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(FloorDivideOpCompoundAssignOpPatcher, _super);
    function FloorDivideOpCompoundAssignOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FloorDivideOpCompoundAssignOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? false : _b;
        var shouldAddParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
        if (this.negated) {
            this.insert(this.contentStart, '!');
        }
        if (shouldAddParens) {
            this.insert(this.contentStart, '(');
        }
        var assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
        // `a //= b` → `a = Math.floor(a / b`
        //               ^^^^^^^^^^^^^^^^^
        this.overwrite(this.assignee.outerEnd, this.expression.outerStart, " = Math.floor(" + assigneeAgain + " / ");
        this.expression.patch({ needsParens: true });
        // `a = Math.floor(a / b` → `a = Math.floor(a / b)`
        //                                               ^
        this.insert(this.expression.outerEnd, ')');
        if (shouldAddParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    FloorDivideOpCompoundAssignOpPatcher.prototype.patchAsStatement = function () {
        this.patchAsExpression();
    };
    return FloorDivideOpCompoundAssignOpPatcher;
}(CompoundAssignOpPatcher));
export default FloorDivideOpCompoundAssignOpPatcher;
