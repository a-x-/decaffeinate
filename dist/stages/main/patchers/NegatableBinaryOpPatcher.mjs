import * as tslib_1 from "tslib";
import BinaryOpPatcher from './BinaryOpPatcher';
/**
 * Handles `instanceof` operator, e.g. `a instanceof b`.
 */
var NegatableBinaryOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(NegatableBinaryOpPatcher, _super);
    function NegatableBinaryOpPatcher(patcherContext, left, right) {
        var _this = _super.call(this, patcherContext, left, right) || this;
        _this.negated = patcherContext.node.isNot;
        return _this;
    }
    NegatableBinaryOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    NegatableBinaryOpPatcher.prototype.javaScriptOperator = function () {
        throw new Error("'javaScriptOperator' should be implemented in subclass");
    };
    /**
     * LEFT 'not'? OP RIGHT
     */
    NegatableBinaryOpPatcher.prototype.patchAsExpression = function () {
        var negated = this.negated;
        if (negated) {
            // `a not instanceof b` → `!(a not instanceof b`
            //                         ^^
            this.insert(this.innerStart, '!(');
        }
        // Patch LEFT and RIGHT.
        _super.prototype.patchAsExpression.call(this);
        if (negated) {
            // `!(a not instanceof b` → `!(a not instanceof b)`
            //                                               ^
            this.insert(this.innerEnd, ')');
        }
        // `!(a not instanceof b)` → `!(a instanceof b)`
        //      ^^^^^^^^^^^^^^            ^^^^^^^^^^
        var token = this.getOperatorToken();
        this.overwrite(token.start, token.end, this.javaScriptOperator());
    };
    /**
     * It may be wrapped due to negation, so don't double-wrap.
     */
    NegatableBinaryOpPatcher.prototype.statementNeedsParens = function () {
        if (this.negated) {
            return false;
        }
        else {
            return _super.prototype.statementNeedsParens.call(this);
        }
    };
    return NegatableBinaryOpPatcher;
}(BinaryOpPatcher));
export default NegatableBinaryOpPatcher;
