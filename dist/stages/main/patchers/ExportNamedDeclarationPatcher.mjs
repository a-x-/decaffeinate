import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
import AssignOpPatcher from './AssignOpPatcher';
var ExportNamedDeclarationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExportNamedDeclarationPatcher, _super);
    function ExportNamedDeclarationPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    ExportNamedDeclarationPatcher.prototype.patchAsStatement = function () {
        // export a = 1 → export var a = 1
        //                      ^^^^
        if (this.expression instanceof AssignOpPatcher) {
            // The assign op has bad location data (starts at the start of the export), so instead use
            // tokens to determine the insert position.
            var exportToken = this.firstToken();
            this.insert(exportToken.end, ' var');
        }
        this.expression.patch();
    };
    return ExportNamedDeclarationPatcher;
}(NodePatcher));
export default ExportNamedDeclarationPatcher;
