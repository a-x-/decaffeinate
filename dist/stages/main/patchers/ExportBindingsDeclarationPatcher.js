"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var types_1 = require("../../../utils/types");
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
            var commaTokenIndex = _this.indexOfSourceTokenAfterSourceTokenIndex(namedExport.outerEndTokenIndex, coffee_lex_1.SourceType.COMMA, types_1.isSemanticToken);
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
}(NodePatcher_1.default));
exports.default = ExportBindingsDeclarationPatcher;
