import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import getCompareOperator from '../../../utils/getCompareOperator';
import isCompareOpNegationUnsafe from '../../../utils/isCompareOpNegationUnsafe';
import notNull from '../../../utils/notNull';
import BinaryOpPatcher from './BinaryOpPatcher';
/**
 * Handles equality and inequality comparisons.
 */
var EqualityPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(EqualityPatcher, _super);
    function EqualityPatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.negated = false;
        return _this;
    }
    EqualityPatcher.prototype.patchOperator = function () {
        var compareToken = this.getCompareToken();
        this.overwrite(compareToken.start, compareToken.end, this.getCompareOperator());
    };
    EqualityPatcher.prototype.getCompareOperator = function () {
        var token = this.getCompareToken();
        return getCompareOperator(this.sourceOfToken(token), this.negated);
    };
    /**
     * @private
     */
    EqualityPatcher.prototype.getCompareToken = function () {
        var _a = this, left = _a.left, right = _a.right;
        var compareTokenIndex = this.indexOfSourceTokenBetweenPatchersMatching(left, right, function (token) { return token.type === SourceType.OPERATOR; });
        if (!compareTokenIndex) {
            throw this.error('expected OPERATOR token but none was found', left.outerEnd, right.outerStart);
        }
        return notNull(this.sourceTokenAtIndex(compareTokenIndex));
    };
    /**
     * Flips negated flag but doesn't edit anything immediately so that we can
     * use the correct operator in `patch`. If the negation is unsafe, fall back
     * to the superclass default behavior of just adding ! to the front.
     */
    EqualityPatcher.prototype.negate = function () {
        if (isCompareOpNegationUnsafe(this.sourceOfToken(this.getCompareToken())) &&
            !this.options.looseComparisonNegation) {
            return _super.prototype.negate.call(this);
        }
        this.negated = !this.negated;
    };
    return EqualityPatcher;
}(BinaryOpPatcher));
export default EqualityPatcher;
