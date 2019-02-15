import * as tslib_1 from "tslib";
import FunctionPatcher from './FunctionPatcher';
var AsyncFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(AsyncFunctionPatcher, _super);
    function AsyncFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsyncFunctionPatcher.prototype.patchFunctionStart = function (_a) {
        var _b = _a.method, method = _b === void 0 ? false : _b;
        var arrow = this.getArrowToken();
        if (!method) {
            this.insert(this.contentStart, 'async function');
        }
        if (!this.hasParamStart()) {
            this.insert(this.contentStart, '() ');
        }
        this.overwrite(arrow.start, arrow.end, '{');
    };
    return AsyncFunctionPatcher;
}(FunctionPatcher));
export default AsyncFunctionPatcher;
