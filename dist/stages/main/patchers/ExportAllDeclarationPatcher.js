"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
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
}(NodePatcher_1.default));
exports.default = ExportAllDeclarationPatcher;
