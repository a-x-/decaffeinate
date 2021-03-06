import * as tslib_1 from "tslib";
import { SHORTEN_NULL_CHECKS } from '../../../suggestions';
import UnaryOpPatcher from './UnaryOpPatcher';
/**
 * Handles unary exists, e.g. `a?`.
 */
var UnaryExistsOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(UnaryExistsOpPatcher, _super);
    function UnaryExistsOpPatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.negated = false;
        return _this;
    }
    /**
     * The expression version of this sometimes needs parentheses, but we don't
     * yet have a good mechanism for determining when that is, so we just make
     * sure they're always there. For example, this doesn't need parentheses:
     *
     *   set = a?
     *
     * Because it becomes this:
     *
     *   var set = typeof a !== 'undefined' && a !== null;
     *
     * But this does:
     *
     *   'set? ' + a?
     *
     * Because this:
     *
     *   'set? ' + a != null;
     *
     * Is equivalent to this:
     *
     *   ('set? + a) != null;
     *
     * Which has a different meaning than this:
     *
     *   'set? ' + (a != null);
     */
    UnaryExistsOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? true : _b;
        var addParens = needsParens && !this.isSurroundedByParentheses();
        if (addParens) {
            // `a?` → `(a?`
            //         ^
            this.insert(this.contentStart, '(');
        }
        this.patchAsStatement();
        if (addParens) {
            // `(a?` → `(a?)`
            //             ^
            this.insert(this.contentEnd, ')');
        }
    };
    /**
     * EXPRESSION '?'
     */
    UnaryExistsOpPatcher.prototype.patchAsStatement = function () {
        this.addSuggestion(SHORTEN_NULL_CHECKS);
        var _a = this, expression = _a.node.expression, negated = _a.negated;
        var needsTypeofCheck = this.needsTypeofCheck();
        this.expression.patch();
        if (needsTypeofCheck) {
            if (negated) {
                // `a?` → `typeof a === 'undefined' && a === null`
                //  ^^     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                this.overwrite(this.contentStart, this.contentEnd, "typeof " + expression.raw + " === 'undefined' || " + expression.raw + " === null");
            }
            else {
                // `a?` → `typeof a !== 'undefined' && a !== null`
                //  ^^     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                this.overwrite(this.contentStart, this.contentEnd, "typeof " + expression.raw + " !== 'undefined' && " + expression.raw + " !== null");
            }
        }
        else {
            if (negated) {
                // `a.b?` → `a.b == null`
                //     ^        ^^^^^^^^
                this.overwrite(this.expression.outerEnd, this.contentEnd, ' == null');
            }
            else {
                // `a.b?` → `a.b != null`
                //     ^        ^^^^^^^^
                this.overwrite(this.expression.outerEnd, this.contentEnd, ' != null');
            }
        }
    };
    /**
     * Since we turn into an equality check, we can simply invert the operator
     * to handle negation internally rather than by prefixing with `!`.
     */
    UnaryExistsOpPatcher.prototype.canHandleNegationInternally = function () {
        return true;
    };
    /**
     * Flips negated flag but doesn't edit anything immediately so that we can
     * use the correct operator in `patch`.
     */
    UnaryExistsOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    /**
     * @private
     */
    UnaryExistsOpPatcher.prototype.needsTypeofCheck = function () {
        return this.expression.mayBeUnboundReference();
    };
    /**
     * When we prefix with a `typeof` check we don't need parens, otherwise
     * delegate.
     */
    UnaryExistsOpPatcher.prototype.statementNeedsParens = function () {
        if (this.needsTypeofCheck()) {
            return false;
        }
        else {
            return this.expression.statementShouldAddParens();
        }
    };
    return UnaryExistsOpPatcher;
}(UnaryOpPatcher));
export default UnaryExistsOpPatcher;
