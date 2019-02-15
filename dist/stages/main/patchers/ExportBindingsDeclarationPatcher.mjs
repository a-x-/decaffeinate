import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import { isSemanticToken } from '../../../utils/types';
var ExportBindingsDeclarationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExportBindingsDeclarationPatcher, _super);
    function ExportBindingsDeclarationPatcher(patcherContext, namedExports, source) {
        var _this = _super.call(this, patcherContext) || this;
        _this.namedExports = namedExports;
        _this.source = source;
        return _this;
    }
    ExportBindingsDeclarationPatcher.prototype.patchAsStatement = function () {
        var _this = this;
        this.namedExports.forEach(function (namedExport, i) {
            namedExport.patch();
            var isLast = i === _this.namedExports.length - 1;
            var commaTokenIndex = _this.indexOfSourceTokenAfterSourceTokenIndex(namedExport.outerEndTokenIndex, SourceType.COMMA, isSemanticToken);
            var commaToken = commaTokenIndex && _this.sourceTokenAtIndex(commaTokenIndex);
            if (!isLast && !commaToken) {
                _this.insert(namedExport.outerEnd, ',');
            }
        });
        if (this.source) {
            this.source.patch();
        }
    };
    return ExportBindingsDeclarationPatcher;
}(NodePatcher));
export default ExportBindingsDeclarationPatcher;
