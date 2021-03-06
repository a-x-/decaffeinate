"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BinaryOpPatcher_1 = require("./BinaryOpPatcher");
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
}(BinaryOpPatcher_1.default));
exports.default = FloorDivideOpPatcher;
