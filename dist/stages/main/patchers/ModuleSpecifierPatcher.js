"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
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
}(NodePatcher_1.default));
exports.default = ModuleSpecifierPatcher;
