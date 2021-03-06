import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
var BreakPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BreakPatcher, _super);
    function BreakPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BreakPatcher.prototype.patchAsStatement = function () {
        // nothing to do
    };
    BreakPatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    return BreakPatcher;
}(NodePatcher));
export default BreakPatcher;
