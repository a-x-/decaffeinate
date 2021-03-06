import * as tslib_1 from "tslib";
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
var LogicalOpCompoundAssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(LogicalOpCompoundAssignOpPatcher, _super);
    function LogicalOpCompoundAssignOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogicalOpCompoundAssignOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? false : _b;
        var shouldAddParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
        if (this.negated) {
            this.insert(this.contentStart, '!');
        }
        if (shouldAddParens) {
            this.insert(this.contentStart, '(');
        }
        var operator = this.getOperatorToken();
        // `a &&= b` → `a && b`
        //    ^^^         ^^
        this.overwrite(operator.start, operator.end, this.isOrOp() ? "||" : "&&");
        var assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
        // `a && b` → `a && (a = b`
        //                  ^^^^^
        this.insert(this.expression.outerStart, "(" + assigneeAgain + " = ");
        this.expression.patch();
        // `a && (a = b` → `a && (a = b)`
        //                             ^
        this.insert(this.expression.outerEnd, ')');
        if (shouldAddParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    LogicalOpCompoundAssignOpPatcher.prototype.patchAsStatement = function (options) {
        if (options === void 0) { options = {}; }
        if (this.lhsHasSoakOperation()) {
            this.patchAsExpression(options);
            return;
        }
        // `a &&= b` → `if (a &&= b`
        //              ^^^^
        this.insert(this.contentStart, 'if (');
        if (this.isOrOp()) {
            this.assignee.negate();
        }
        var assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
        // `if (a &&= b` → `if (a) { a = b`
        //       ^^^^^           ^^^^^^^^
        this.overwrite(this.assignee.outerEnd, this.expression.outerStart, ") { " + assigneeAgain + " = ");
        this.expression.patch();
        // `if (a) { a = b` → `if (a) { a = b }`
        //                                   ^^
        this.insert(this.expression.outerEnd, ' }');
    };
    /**
     * @private
     */
    LogicalOpCompoundAssignOpPatcher.prototype.isOrOp = function () {
        var operator = this.getOperatorToken();
        var op = this.sourceOfToken(operator);
        // There could be a space in the middle of the operator, like `or =` or
        // `|| =`, and "op" will just be the first token in that case. So just check
        // the start of the operator.
        return op.substr(0, 2) === '||' || op.substr(0, 2) === 'or';
    };
    /**
     * We always start with an `if` statement, so no parens.
     */
    LogicalOpCompoundAssignOpPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    return LogicalOpCompoundAssignOpPatcher;
}(CompoundAssignOpPatcher));
export default LogicalOpCompoundAssignOpPatcher;
