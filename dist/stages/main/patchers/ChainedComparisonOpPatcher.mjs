import * as tslib_1 from "tslib";
import getCompareOperator from '../../../utils/getCompareOperator';
import isCompareOpNegationUnsafe from '../../../utils/isCompareOpNegationUnsafe';
import NodePatcher from './../../../patchers/NodePatcher';
/**
 * Handles constructs of the form `a < b < c < … < z`.
 */
var ChainedComparisonOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ChainedComparisonOpPatcher, _super);
    /**
     * `node` should have type `ChainedComparisonOp`.
     */
    function ChainedComparisonOpPatcher(patcherContext, operands) {
        var _this = _super.call(this, patcherContext) || this;
        _this.negated = false;
        _this.operands = operands;
        return _this;
    }
    ChainedComparisonOpPatcher.prototype.initialize = function () {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.operands), _c = _b.next(); !_c.done; _c = _b.next()) {
                var operand = _c.value;
                operand.setRequiresExpression();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    ChainedComparisonOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? false : _b;
        var e_2, _c, e_3, _d, e_4, _e;
        var negateEntireExpression = this.shouldNegateEntireExpression();
        var addParens = negateEntireExpression || (needsParens && !this.isSurroundedByParentheses());
        if (negateEntireExpression) {
            this.insert(this.contentStart, '!');
        }
        if (addParens) {
            this.insert(this.contentStart, '(');
        }
        var middle = this.getMiddleOperands();
        var negated = !negateEntireExpression && this.negated;
        var logicalOperator = negated ? '||' : '&&';
        try {
            for (var middle_1 = tslib_1.__values(middle), middle_1_1 = middle_1.next(); !middle_1_1.done; middle_1_1 = middle_1.next()) {
                var operand = middle_1_1.value;
                operand.setRequiresRepeatableExpression({ parens: true, ref: 'middle' });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (middle_1_1 && !middle_1_1.done && (_c = middle_1.return)) _c.call(middle_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            for (var _f = tslib_1.__values(this.operands.entries()), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = tslib_1.__read(_g.value, 2), i = _h[0], operand = _h[1];
                operand.patch();
                var operator = this.node.operators[i];
                if (operator) {
                    var replacement = getCompareOperator(operator.operator, negated);
                    if (operator.operator !== replacement) {
                        this.overwrite(operator.token.start, operator.token.end, replacement);
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_d = _f.return)) _d.call(_f);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var middle_2 = tslib_1.__values(middle), middle_2_1 = middle_2.next(); !middle_2_1.done; middle_2_1 = middle_2.next()) {
                var operand = middle_2_1.value;
                // `a < b < c` → `a < b && b < c`
                //                     ^^^^^
                this.insert(operand.outerEnd, " " + logicalOperator + " " + operand.getRepeatCode());
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (middle_2_1 && !middle_2_1.done && (_e = middle_2.return)) _e.call(middle_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (addParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    /**
     * If any negation is unsafe, just wrap the whole thing in parens with a !
     * operator. That's easier and arguably nicer-looking than trying to
     * intelligently negate the subexpressions accounting for unsafe negations.
     */
    ChainedComparisonOpPatcher.prototype.shouldNegateEntireExpression = function () {
        return (this.negated &&
            this.node.operators.some(function (operator) { return isCompareOpNegationUnsafe(operator.operator); }) &&
            !this.options.looseComparisonNegation);
    };
    /**
     * @private
     */
    ChainedComparisonOpPatcher.prototype.getMiddleOperands = function () {
        return this.operands.slice(1, -1);
    };
    ChainedComparisonOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    /**
     * Forward the request to the first operand.
     */
    ChainedComparisonOpPatcher.prototype.statementNeedsParens = function () {
        return this.operands[0].statementShouldAddParens();
    };
    return ChainedComparisonOpPatcher;
}(NodePatcher));
export default ChainedComparisonOpPatcher;
