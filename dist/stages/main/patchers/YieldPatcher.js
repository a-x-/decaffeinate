"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var AssignOpPatcher_1 = require("./AssignOpPatcher");
var BlockPatcher_1 = require("./BlockPatcher");
var ReturnPatcher_1 = require("./ReturnPatcher");
var YieldPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(YieldPatcher, _super);
    function YieldPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    YieldPatcher.prototype.initialize = function () {
        this.yields();
        if (this.expression) {
            this.expression.setRequiresExpression();
        }
    };
    /**
     * 'yield' EXPRESSION
     */
    YieldPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? true : _b;
        var surroundInParens = this.needsParens() && !this.isSurroundedByParentheses();
        if (surroundInParens) {
            this.insert(this.contentStart, '(');
        }
        if (this.expression) {
            this.expression.patch({ needsParens: needsParens });
        }
        if (surroundInParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    YieldPatcher.prototype.needsParens = function () {
        return !(this.parent instanceof BlockPatcher_1.default ||
            this.parent instanceof ReturnPatcher_1.default ||
            (this.parent instanceof AssignOpPatcher_1.default && this.parent.expression === this));
    };
    return YieldPatcher;
}(NodePatcher_1.default));
exports.default = YieldPatcher;
