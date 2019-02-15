import * as tslib_1 from "tslib";
import BoundFunctionPatcher from './BoundFunctionPatcher';
var BoundAsyncFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BoundAsyncFunctionPatcher, _super);
    function BoundAsyncFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoundAsyncFunctionPatcher.prototype.patchFunctionStart = function () {
        this.insert(this.contentStart, 'async ');
        _super.prototype.patchFunctionStart.call(this);
    };
    return BoundAsyncFunctionPatcher;
}(BoundFunctionPatcher));
export default BoundAsyncFunctionPatcher;
