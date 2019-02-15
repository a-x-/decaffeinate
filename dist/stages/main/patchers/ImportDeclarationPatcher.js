"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var types_1 = require("../../../utils/types");
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
                var commaTokenIndex = _this.indexOfSourceTokenAfterSourceTokenIndex(namedImport.outerEndTokenIndex, coffee_lex_1.SourceType.COMMA, types_1.isSemanticToken);
                var commaToken = commaTokenIndex && _this.sourceTokenAtIndex(commaTokenIndex);
                if (!isLast && !commaToken) {
                    _this.insert(namedImport.outerEnd, ',');
                }
            });
        }
        this.source.patch();
    };
    return ImportDeclarationPatcher;
}(NodePatcher_1.default));
exports.default = ImportDeclarationPatcher;
