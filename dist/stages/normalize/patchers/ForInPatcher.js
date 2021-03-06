"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var postfixExpressionRequiresParens_1 = require("../../../utils/postfixExpressionRequiresParens");
var ForPatcher_1 = require("./ForPatcher");
var ForInPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForInPatcher, _super);
    function ForInPatcher(patcherContext, keyAssignee, valAssignee, target, step, filter, body) {
        var _this = _super.call(this, patcherContext, keyAssignee, valAssignee, target, filter, body) || this;
        _this.step = step;
        return _this;
    }
    ForInPatcher.prototype.patchAsExpression = function () {
        if (this.step) {
            this.step.patch();
        }
        _super.prototype.patchAsExpression.call(this);
    };
    ForInPatcher.prototype.surroundThenUsagesInParens = function () {
        if (this.step && postfixExpressionRequiresParens_1.default(this.slice(this.step.contentStart, this.step.contentEnd))) {
            this.step.surroundInParens();
        }
        _super.prototype.surroundThenUsagesInParens.call(this);
    };
    return ForInPatcher;
}(ForPatcher_1.default));
exports.default = ForInPatcher;
