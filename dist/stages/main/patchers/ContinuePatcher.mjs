import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
var ContinuePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ContinuePatcher, _super);
    function ContinuePatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContinuePatcher.prototype.patchAsStatement = function () {
        // nothing to do
    };
    ContinuePatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    return ContinuePatcher;
}(NodePatcher));
export default ContinuePatcher;
