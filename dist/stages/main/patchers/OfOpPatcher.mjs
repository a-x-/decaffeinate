import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NegatableBinaryOpPatcher from './NegatableBinaryOpPatcher';
/**
 * Handles `of` operators, e.g. `a of b` and `a not of b`.
 */
var OfOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(OfOpPatcher, _super);
    function OfOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OfOpPatcher.prototype.operatorTokenPredicate = function () {
        return function (token) { return token.type === SourceType.RELATION; };
    };
    OfOpPatcher.prototype.javaScriptOperator = function () {
        return 'in';
    };
    return OfOpPatcher;
}(NegatableBinaryOpPatcher));
export default OfOpPatcher;
