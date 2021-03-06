import * as tslib_1 from "tslib";
import { SHORTEN_NULL_CHECKS } from '../../../suggestions';
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
var ExistsOpCompoundAssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExistsOpCompoundAssignOpPatcher, _super);
    function ExistsOpCompoundAssignOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExistsOpCompoundAssignOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? false : _b;
        this.addSuggestion(SHORTEN_NULL_CHECKS);
        var shouldAddParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
        if (this.negated) {
            this.insert(this.contentStart, '!');
        }
        if (shouldAddParens) {
            this.insert(this.contentStart, '(');
        }
        var assigneeAgain;
        if (this.needsTypeofCheck()) {
            // `a ?= b` → `typeof a ?= b`
            //             ^^^^^^^
            this.insert(this.assignee.outerStart, "typeof ");
            assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
            // `typeof a ? b` → `typeof a !== 'undefined' && a !== null ? a ?= b`
            //                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            this.insert(this.assignee.outerEnd, " !== 'undefined' && " + assigneeAgain + " !== null ? " + assigneeAgain);
        }
        else {
            assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
            // `a.b ?= b` → `a.b != null ? a.b ?= b`
            //                  ^^^^^^^^^^^^^^
            this.insert(this.assignee.outerEnd, " != null ? " + assigneeAgain);
        }
        var operator = this.getOperatorToken();
        // `a.b != null ? a.b ?= b` → `a.b != null ? a.b : (a.b = b`
        //                    ^^                         ^^^^^^^^
        this.overwrite(operator.start, operator.end, ": (" + assigneeAgain + " =");
        this.expression.patch();
        // `a.b != null ? a.b : (a.b = b` → `a.b != null ? a.b : (a.b = b)`
        //                                                               ^
        this.insert(this.expression.outerEnd, ')');
        if (shouldAddParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    ExistsOpCompoundAssignOpPatcher.prototype.patchAsStatement = function () {
        if (this.lhsHasSoakOperation()) {
            this.patchAsExpression();
            return;
        }
        this.addSuggestion(SHORTEN_NULL_CHECKS);
        var assigneeAgain;
        if (this.needsTypeofCheck()) {
            // `a ?= b` → `if (typeof a ?= b`
            //             ^^^^^^^^^^^
            this.insert(this.assignee.outerStart, "if (typeof ");
            assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
            // `if (typeof a ?= b` → `if (typeof a === 'undefined' || a === null) { ?= b`
            //                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            this.insert(this.assignee.outerEnd, " === 'undefined' || " + assigneeAgain + " === null) {");
        }
        else {
            // `a.b ?= b` → `if (a.b ?= b`
            //               ^^^^
            this.insert(this.assignee.outerStart, "if (");
            assigneeAgain = this.assignee.patchRepeatable({ isForAssignment: true });
            // `if (a.b ?= b` → `if (a.b == null) { ?= b`
            //                          ^^^^^^^^^^^
            this.insert(this.assignee.outerEnd, " == null) {");
        }
        var operator = this.getOperatorToken();
        // `if (a.b == null) { ?= b` → `if (a.b == null) { a.b = b`
        //                     ^^                          ^^^^^
        this.overwrite(operator.start, operator.end, assigneeAgain + " =");
        this.expression.patch();
        // `if (a.b == null) { a.b = b` → `if (a.b == null) { a.b = b; }`
        //                                                           ^^^
        this.insert(this.expression.outerEnd, "; }");
    };
    /**
     * Determine if we need to do `typeof a !== undefined && a !== null` rather
     * than just `a != null`. We need to emit the more defensive version if the
     * variable might not be declared.
     */
    ExistsOpCompoundAssignOpPatcher.prototype.needsTypeofCheck = function () {
        return this.assignee.mayBeUnboundReference();
    };
    /**
     * We'll always start with an `if` so we don't need parens.
     */
    ExistsOpCompoundAssignOpPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    return ExistsOpCompoundAssignOpPatcher;
}(CompoundAssignOpPatcher));
export default ExistsOpCompoundAssignOpPatcher;
