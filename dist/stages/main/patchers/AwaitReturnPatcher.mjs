import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../../../utils/notNull';
import ReturnPatcher from './ReturnPatcher';
var AwaitReturnPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(AwaitReturnPatcher, _super);
    function AwaitReturnPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AwaitReturnPatcher.prototype.initialize = function () {
        this.awaits();
        _super.prototype.initialize.call(this);
    };
    AwaitReturnPatcher.prototype.patchAsStatement = function () {
        var awaitTokenIndex = this.contentStartTokenIndex;
        var returnTokenIndex = notNull(awaitTokenIndex.next());
        var awaitToken = notNull(this.sourceTokenAtIndex(awaitTokenIndex));
        var returnToken = notNull(this.sourceTokenAtIndex(returnTokenIndex));
        if (awaitToken.type !== SourceType.IDENTIFIER || returnToken.type !== SourceType.RETURN) {
            throw this.error('Unexpected token types for `await return`.');
        }
        this.remove(awaitToken.start, returnToken.start);
        _super.prototype.patchAsStatement.call(this);
    };
    return AwaitReturnPatcher;
}(ReturnPatcher));
export default AwaitReturnPatcher;
