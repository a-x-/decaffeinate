"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var ExportDefaultDeclarationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExportDefaultDeclarationPatcher, _super);
    function ExportDefaultDeclarationPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    ExportDefaultDeclarationPatcher.prototype.patchAsStatement = function () {
        this.expression.patch();
    };
    return ExportDefaultDeclarationPatcher;
}(NodePatcher_1.default));
exports.default = ExportDefaultDeclarationPatcher;
