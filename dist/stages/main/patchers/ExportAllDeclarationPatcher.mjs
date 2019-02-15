import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
var ExportAllDeclarationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExportAllDeclarationPatcher, _super);
    function ExportAllDeclarationPatcher(patcherContext, source) {
        var _this = _super.call(this, patcherContext) || this;
        _this.source = source;
        return _this;
    }
    ExportAllDeclarationPatcher.prototype.patchAsStatement = function () {
        this.source.patch();
    };
    return ExportAllDeclarationPatcher;
}(NodePatcher));
export default ExportAllDeclarationPatcher;
