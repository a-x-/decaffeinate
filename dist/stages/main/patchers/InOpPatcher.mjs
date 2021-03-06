import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import { FIX_INCLUDES_EVALUATION_ORDER, REMOVE_ARRAY_FROM } from '../../../suggestions';
import ArrayInitialiserPatcher from './ArrayInitialiserPatcher';
import BinaryOpPatcher from './BinaryOpPatcher';
import DynamicMemberAccessOpPatcher from './DynamicMemberAccessOpPatcher';
import FunctionApplicationPatcher from './FunctionApplicationPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
import StringPatcher from './StringPatcher';
var IN_HELPER = "function __in__(needle, haystack) {\n  return Array.from(haystack).indexOf(needle) >= 0;\n}";
/**
 * Handles `in` operators, e.g. `a in b` and `a not in b`.
 */
var InOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(InOpPatcher, _super);
    /**
     * `node` is of type `InOp`.
     */
    function InOpPatcher(patcherContext, left, right) {
        var _this = _super.call(this, patcherContext, left, right) || this;
        _this.negated = patcherContext.node.isNot;
        return _this;
    }
    InOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    InOpPatcher.prototype.operatorTokenPredicate = function () {
        return function (token) { return token.type === SourceType.RELATION; };
    };
    /**
     * LEFT 'in' RIGHT
     */
    InOpPatcher.prototype.patchAsExpression = function () {
        if (this.options.noArrayIncludes) {
            this.patchAsIndexLookup();
            return;
        }
        if (!this.left.isPure() || !this.right.isPure()) {
            this.patchWithLHSExtracted();
            return;
        }
        var rightCode = this.right.patchAndGetCode();
        if (this.shouldWrapInArrayFrom()) {
            rightCode = "Array.from(" + rightCode + ")";
        }
        else if (this.rhsNeedsParens()) {
            rightCode = "(" + rightCode + ")";
        }
        // `a in b` → `a`
        //   ^^^^^
        this.remove(this.left.outerEnd, this.right.outerEnd);
        if (this.negated) {
            // `a` → `!a`
            //        ^
            this.insert(this.left.outerStart, '!');
        }
        // `!a` → `!b.includes(a`
        //          ^^^^^^^^^^^
        this.insert(this.left.outerStart, rightCode + ".includes(");
        this.left.patch();
        // `!b.includes(a` → `!b.includes(a)`
        //                                 ^
        this.insert(this.left.outerEnd, ')');
    };
    InOpPatcher.prototype.patchWithLHSExtracted = function () {
        this.addSuggestion(FIX_INCLUDES_EVALUATION_ORDER);
        // `a() in b` → `(needle = a(), in b`
        //               ^^^^^^^^^^^^^^^
        this.insert(this.contentStart, '(');
        var leftRef = this.left.patchRepeatable({ ref: 'needle', forceRepeat: true });
        this.insert(this.left.outerEnd, ", ");
        // `(needle = a(), in b` → `(needle = a(), b`
        //                 ^^^
        this.remove(this.left.outerEnd, this.right.outerStart);
        // `(needle = a(), b` → `(needle = a(), !Array.from(b).includes(needle))`
        //                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        if (this.negated) {
            this.insert(this.right.outerStart, '!');
        }
        var wrapInArrayFrom = this.shouldWrapInArrayFrom();
        var rhsNeedsParens = wrapInArrayFrom || this.rhsNeedsParens();
        if (wrapInArrayFrom) {
            this.insert(this.right.outerStart, 'Array.from');
        }
        if (rhsNeedsParens) {
            this.insert(this.right.outerStart, '(');
        }
        this.right.patch();
        if (rhsNeedsParens) {
            this.insert(this.right.outerEnd, ')');
        }
        this.insert(this.right.outerEnd, ".includes(" + leftRef + "))");
    };
    InOpPatcher.prototype.shouldWrapInArrayFrom = function () {
        if (this.options.looseIncludes) {
            return false;
        }
        var shouldWrap = !(this.right instanceof ArrayInitialiserPatcher);
        if (shouldWrap) {
            this.addSuggestion(REMOVE_ARRAY_FROM);
        }
        return shouldWrap;
    };
    InOpPatcher.prototype.rhsNeedsParens = function () {
        // In typical cases, when converting `a in b` to `b.includes(a)`, parens
        // won't be necessary around the `b`, but to be safe, only skip the parens
        // in a specific set of known-good cases.
        return (!(this.right instanceof IdentifierPatcher) &&
            !(this.right instanceof MemberAccessOpPatcher) &&
            !(this.right instanceof DynamicMemberAccessOpPatcher) &&
            !(this.right instanceof FunctionApplicationPatcher) &&
            !(this.right instanceof ArrayInitialiserPatcher) &&
            !(this.right instanceof StringPatcher));
    };
    InOpPatcher.prototype.patchAsIndexLookup = function () {
        var helper = this.registerHelper('__in__', IN_HELPER);
        if (this.negated) {
            // `a in b` → `!a in b`
            //             ^
            this.insert(this.left.outerStart, '!');
        }
        // `a in b` → `__in__(a in b`
        //             ^^^^^^^
        this.insert(this.left.outerStart, helper + "(");
        this.left.patch();
        // `__in__(a in b` → `__in__(a, b`
        //          ^^^^              ^^
        this.overwrite(this.left.outerEnd, this.right.outerStart, ', ');
        this.right.patch();
        // `__in__(a, b` → `__in__(a, b)`
        //                             ^
        this.insert(this.right.outerEnd, ')');
    };
    /**
     * Method invocations don't need parens.
     */
    InOpPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    return InOpPatcher;
}(BinaryOpPatcher));
export default InOpPatcher;
