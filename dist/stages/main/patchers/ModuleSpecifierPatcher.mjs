import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
var ModuleSpecifierPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ModuleSpecifierPatcher, _super);
    function ModuleSpecifierPatcher(patcherContext, original, alias) {
        var _this = _super.call(this, patcherContext) || this;
        _this.original = original;
        _this.alias = alias;
        return _this;
    }
    ModuleSpecifierPatcher.prototype.patchAsStatement = function () {
        this.original.patch();
        if (this.alias) {
            this.alias.patch();
        }
    };
    return ModuleSpecifierPatcher;
}(NodePatcher));
export default ModuleSpecifierPatcher;
