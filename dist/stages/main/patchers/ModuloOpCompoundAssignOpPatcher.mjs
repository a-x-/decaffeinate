import * as tslib_1 from "tslib";
import registerModHelper from '../../../utils/registerModHelper';
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
var ModuloOpCompoundAssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ModuloOpCompoundAssignOpPatcher, _super);
    function ModuloOpCompoundAssignOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModuloOpCompoundAssignOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? false : _b;
        var helper = registerModHelper(this);
        var shouldAddParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
        if (this.negated) {
            this.insert(this.contentStart, '!');
        }
        if (shouldAddParens) {
            this.insert(this.contentStart, '(');
        }
        var assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
        // `a %%= b` → `a %%= __mod__(a, b`
        //               ^^^^^^^^^^^^^^^^
        this.overwrite(this.assignee.outerEnd, this.expression.outerStart, " = " + helper + "(" + assigneeAgain + ", ");
        this.expression.patch();
        // `a %%= __mod__(a, b` → `a %%= __mod__(a, b)`
        //                                           ^
        this.insert(this.expression.outerEnd, ')');
        if (shouldAddParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    ModuloOpCompoundAssignOpPatcher.prototype.patchAsStatement = function () {
        this.patchAsExpression();
    };
    return ModuloOpCompoundAssignOpPatcher;
}(CompoundAssignOpPatcher));
export default ModuloOpCompoundAssignOpPatcher;
