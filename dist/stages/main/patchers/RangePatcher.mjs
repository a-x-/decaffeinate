import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import { Int } from 'decaffeinate-parser/dist/nodes';
import BinaryOpPatcher from './BinaryOpPatcher';
var RANGE_HELPER = "function __range__(left, right, inclusive) {\n  let range = [];\n  let ascending = left < right;\n  let end = !inclusive ? right : ascending ? right + 1 : right - 1;\n  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {\n    range.push(i);\n  }\n  return range;\n}";
var MAXIMUM_LITERAL_RANGE_ELEMENTS = 21;
var RangePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(RangePatcher, _super);
    function RangePatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RangePatcher.prototype.patchAsExpression = function () {
        if (this.canBecomeLiteralArray()) {
            this.patchAsLiteralArray();
        }
        else {
            this.patchAsIIFE();
        }
    };
    /**
     * @private
     */
    RangePatcher.prototype.patchAsLiteralArray = function () {
        if (!(this.left.node instanceof Int) || !(this.right.node instanceof Int)) {
            throw this.error('Expected ints on both sides for a literal array.');
        }
        var start = this.left.node.data;
        var end = this.right.node.data;
        var inclusive = this.isInclusive();
        var ascending = start < end;
        if (inclusive) {
            end += ascending ? 1 : -1;
        }
        var list = '';
        for (var i = start; ascending ? i < end : i > end; ascending ? i++ : i--) {
            var isLast = ascending ? i === end - 1 : i === end + 1;
            if (isLast) {
                list += "" + i;
            }
            else {
                list += i + ", ";
            }
        }
        // `[0..2]` → `[0, 1, 2]`
        //  ^^^^^^     ^^^^^^^^^
        this.overwrite(this.contentStart, this.contentEnd, "[" + list + "]");
    };
    /**
     * @private
     */
    RangePatcher.prototype.patchAsIIFE = function () {
        var helper = this.registerHelper('__range__', RANGE_HELPER);
        // `[a..b]` → `__range__(a..b]`
        //  ^          ^^^^^^^^^^
        this.overwrite(this.contentStart, this.left.outerStart, helper + "(");
        this.left.patch();
        // `__range__(a..b]` → `__range__(a, b]`
        //             ^^                  ^^
        this.overwrite(this.left.outerEnd, this.right.outerStart, ', ');
        this.right.patch();
        // `__range__(a, b]` → `__range__(a, b, true)`
        //                ^                   ^^^^^^
        this.overwrite(this.right.outerEnd, this.contentEnd, ", " + this.isInclusive() + ")");
    };
    /**
     * @private
     */
    RangePatcher.prototype.canBecomeLiteralArray = function () {
        var range = this.getLiteralRange();
        if (!range) {
            return false;
        }
        var _a = tslib_1.__read(range, 2), first = _a[0], last = _a[1];
        return Math.abs(last - first) <= MAXIMUM_LITERAL_RANGE_ELEMENTS;
    };
    /**
     * @private
     */
    RangePatcher.prototype.getLiteralRange = function () {
        var left = this.left.node;
        var right = this.right.node;
        if (!(left instanceof Int) || !(right instanceof Int)) {
            return null;
        }
        var first = left.data;
        var last = right.data;
        if (first < last) {
            return [first, last + (this.isInclusive() ? 1 : 0)];
        }
        else {
            return [first, last - (this.isInclusive() ? 1 : 0)];
        }
    };
    /**
     * @private
     */
    RangePatcher.prototype.isInclusive = function () {
        return this.node.isInclusive;
    };
    RangePatcher.prototype.operatorTokenPredicate = function () {
        return function (token) { return token.type === SourceType.RANGE; };
    };
    return RangePatcher;
}(BinaryOpPatcher));
export default RangePatcher;
