import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import { isSemanticToken } from '../../../utils/types';
var ImportDeclarationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ImportDeclarationPatcher, _super);
    function ImportDeclarationPatcher(patcherContext, defaultBinding, namespaceImport, namedImports, source) {
        var _this = _super.call(this, patcherContext) || this;
        _this.defaultBinding = defaultBinding;
        _this.namespaceImport = namespaceImport;
        _this.namedImports = namedImports;
        _this.source = source;
        return _this;
    }
    ImportDeclarationPatcher.prototype.patchAsStatement = function () {
        var _this = this;
        if (this.defaultBinding) {
            this.defaultBinding.patch();
        }
        if (this.namespaceImport) {
            this.namespaceImport.patch();
        }
        var namedImports = this.namedImports;
        if (namedImports) {
            namedImports.forEach(function (namedImport, i) {
                namedImport.patch();
                var isLast = i === namedImports.length - 1;
                var commaTokenIndex = _this.indexOfSourceTokenAfterSourceTokenIndex(namedImport.outerEndTokenIndex, SourceType.COMMA, isSemanticToken);
                var commaToken = commaTokenIndex && _this.sourceTokenAtIndex(commaTokenIndex);
                if (!isLast && !commaToken) {
                    _this.insert(namedImport.outerEnd, ',');
                }
            });
        }
        this.source.patch();
    };
    return ImportDeclarationPatcher;
}(NodePatcher));
export default ImportDeclarationPatcher;
