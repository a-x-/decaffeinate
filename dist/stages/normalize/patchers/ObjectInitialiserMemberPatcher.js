"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PassthroughPatcher_1 = require("../../../patchers/PassthroughPatcher");
var ObjectInitialiserMemberPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ObjectInitialiserMemberPatcher, _super);
    function ObjectInitialiserMemberPatcher(patcherContext, key, expression) {
        var _this = _super.call(this, patcherContext, key, expression) || this;
        _this.key = key;
        _this.expression = expression;
        return _this;
    }
    return ObjectInitialiserMemberPatcher;
}(PassthroughPatcher_1.default));
exports.default = ObjectInitialiserMemberPatcher;
