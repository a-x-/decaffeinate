import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../../../utils/notNull';
import ReturnPatcher from './ReturnPatcher';
var YieldReturnPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(YieldReturnPatcher, _super);
    function YieldReturnPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    YieldReturnPatcher.prototype.initialize = function () {
        this.yields();
        _super.prototype.initialize.call(this);
    };
    YieldReturnPatcher.prototype.patchAsStatement = function () {
        var yieldTokenIndex = this.contentStartTokenIndex;
        var returnTokenIndex = notNull(yieldTokenIndex.next());
        var yieldToken = notNull(this.sourceTokenAtIndex(yieldTokenIndex));
        var returnToken = notNull(this.sourceTokenAtIndex(returnTokenIndex));
        if (yieldToken.type !== SourceType.YIELD || returnToken.type !== SourceType.RETURN) {
            throw this.error('Unexpected token types for `yield return`.');
        }
        this.remove(yieldToken.start, returnToken.start);
        _super.prototype.patchAsStatement.call(this);
    };
    return YieldReturnPatcher;
}(ReturnPatcher));
export default YieldReturnPatcher;
