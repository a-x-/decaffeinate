"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BinaryOpPatcher_1 = require("./BinaryOpPatcher");
/**
 * Handles logical AND and logical OR.
 *
 * This class is primarily responsible for rewriting `and` to `&&` and `or` to
 * `||`. It also applies De Morgan's laws [1] in the event of negation, such as
 * when used as the condition of an `unless` expression:
 *
 *   a unless b && c  # equivalent to `a if !b || !c`
 *
 * [1]: https://en.wikipedia.org/wiki/De_Morgan%27s_laws
 */
var LogicalOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(LogicalOpPatcher, _super);
    function LogicalOpPatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.negated = false;
        return _this;
    }
    LogicalOpPatcher.prototype.patchOperator = function () {
        var operatorToken = this.getOperatorToken();
        this.overwrite(operatorToken.start, operatorToken.end, this.getOperator());
    };
    /**
     * Apply De Morgan's law.
     *
     * @private
     */
    LogicalOpPatcher.prototype.getOperator = function () {
        var operatorToken = this.getOperatorToken();
        var operator = this.context.source.slice(operatorToken.start, operatorToken.end);
        if (operator === 'and') {
            operator = '&&';
        }
        else if (operator === 'or') {
            operator = '||';
        }
        if (this.negated) {
            return operator === '&&' ? '||' : '&&';
        }
        else {
            return operator;
        }
    };
    LogicalOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
        this.left.negate();
        this.right.negate();
    };
    return LogicalOpPatcher;
}(BinaryOpPatcher_1.default));
exports.default = LogicalOpPatcher;
