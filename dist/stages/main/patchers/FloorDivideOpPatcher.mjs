import * as tslib_1 from "tslib";
import BinaryOpPatcher from './BinaryOpPatcher';
var FloorDivideOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(FloorDivideOpPatcher, _super);
    function FloorDivideOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * LEFT '//' RIGHT
     */
    FloorDivideOpPatcher.prototype.patchAsExpression = function () {
        var operator = this.getOperatorToken();
        // `a // b` → `Math.floor(a // b`
        //             ^^^^^^^^^^^
        this.insert(this.contentStart, 'Math.floor(');
        this.left.patch({ needsParens: true });
        // `Math.floor(a // b)` → `Math.floor(a / b)`
        //               ^^                     ^
        this.overwrite(operator.start, operator.end, '/');
        this.right.patch({ needsParens: true });
        // `Math.floor(a // b` → `Math.floor(a // b)`
        //                                         ^
        this.insert(this.contentEnd, ')');
    };
    /**
     * We always prefix with `Math.floor`, so no need for parens.
     */
    FloorDivideOpPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    return FloorDivideOpPatcher;
}(BinaryOpPatcher));
export default FloorDivideOpPatcher;
