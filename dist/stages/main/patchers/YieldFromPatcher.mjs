import * as tslib_1 from "tslib";
import YieldPatcher from './YieldPatcher';
var YieldFromPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(YieldFromPatcher, _super);
    function YieldFromPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 'yield' 'from' EXPRESSION
     */
    YieldFromPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? true : _b;
        var firstToken = this.firstToken();
        this.overwrite(firstToken.start, firstToken.end, 'yield*');
        _super.prototype.patchAsExpression.call(this, { needsParens: needsParens });
    };
    return YieldFromPatcher;
}(YieldPatcher));
export default YieldFromPatcher;
