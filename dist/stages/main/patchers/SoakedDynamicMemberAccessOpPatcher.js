"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var suggestions_1 = require("../../../suggestions");
var findSoakContainer_1 = require("../../../utils/findSoakContainer");
var nodeContainsSoakOperation_1 = require("../../../utils/nodeContainsSoakOperation");
var ternaryNeedsParens_1 = require("../../../utils/ternaryNeedsParens");
var DynamicMemberAccessOpPatcher_1 = require("./DynamicMemberAccessOpPatcher");
var GUARD_HELPER = "function __guard__(value, transform) {\n  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;\n}";
var SoakedDynamicMemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SoakedDynamicMemberAccessOpPatcher, _super);
    function SoakedDynamicMemberAccessOpPatcher(patcherContext, expression, indexingExpr) {
        var _this = _super.call(this, patcherContext, expression, indexingExpr) || this;
        _this._shouldSkipSoakPatch = false;
        return _this;
    }
    SoakedDynamicMemberAccessOpPatcher.prototype.patchAsExpression = function () {
        if (!this._shouldSkipSoakPatch) {
            if (this.shouldPatchAsOptionalChaining()) {
                this.patchAsOptionalChaining();
            }
            else if (this.shouldPatchAsConditional()) {
                this.patchAsConditional();
            }
            else {
                this.patchAsGuardCall();
            }
        }
        else {
            this.expression.patch();
            this.indexingExpr.patch();
        }
    };
    SoakedDynamicMemberAccessOpPatcher.prototype.shouldPatchAsOptionalChaining = function () {
        return this.options.useOptionalChaining === true && !this.expression.mayBeUnboundReference();
    };
    SoakedDynamicMemberAccessOpPatcher.prototype.shouldPatchAsConditional = function () {
        return this.expression.isRepeatable() && !nodeContainsSoakOperation_1.default(this.expression.node);
    };
    SoakedDynamicMemberAccessOpPatcher.prototype.patchAsOptionalChaining = function () {
        this.expression.patch();
        // `a?[b]` → `a?.[b]`
        //              ^
        this.overwrite(this.expression.outerEnd, this.indexingExpr.outerStart, '?.[');
        this.indexingExpr.patch();
    };
    SoakedDynamicMemberAccessOpPatcher.prototype.patchAsConditional = function () {
        this.addSuggestion(suggestions_1.SHORTEN_NULL_CHECKS);
        var soakContainer = findSoakContainer_1.default(this);
        var expressionCode = this.expression.patchRepeatable();
        var conditionCode;
        if (this.expression.mayBeUnboundReference()) {
            conditionCode = "typeof " + expressionCode + " !== 'undefined' && " + expressionCode + " !== null";
        }
        else {
            conditionCode = expressionCode + " != null";
        }
        this.overwrite(this.expression.outerEnd, this.indexingExpr.outerStart, '[');
        this.indexingExpr.patch();
        if (soakContainer.willPatchAsExpression()) {
            var containerNeedsParens = ternaryNeedsParens_1.default(soakContainer);
            if (containerNeedsParens) {
                soakContainer.insert(soakContainer.contentStart, '(');
            }
            soakContainer.insert(soakContainer.contentStart, conditionCode + " ? ");
            soakContainer.appendDeferredSuffix(' : undefined');
            if (containerNeedsParens) {
                soakContainer.appendDeferredSuffix(')');
            }
        }
        else {
            soakContainer.insert(soakContainer.contentStart, "if (" + conditionCode + ") {\n" + soakContainer.getIndent(1));
            soakContainer.appendDeferredSuffix("\n" + soakContainer.getIndent() + "}");
        }
    };
    SoakedDynamicMemberAccessOpPatcher.prototype.patchAsGuardCall = function () {
        this.registerHelper('__guard__', GUARD_HELPER);
        this.addSuggestion(suggestions_1.REMOVE_GUARD);
        var soakContainer = findSoakContainer_1.default(this);
        var varName = soakContainer.claimFreeBinding('x');
        var prefix = this.slice(soakContainer.contentStart, this.contentStart);
        if (prefix.length > 0) {
            this.remove(soakContainer.contentStart, this.contentStart);
        }
        this.overwrite(this.expression.outerEnd, this.indexingExpr.outerStart, ", " + varName + " => " + prefix + varName + "[");
        soakContainer.insert(soakContainer.contentStart, '__guard__(');
        soakContainer.appendDeferredSuffix(')');
        this.expression.patch();
        this.indexingExpr.patch();
    };
    SoakedDynamicMemberAccessOpPatcher.prototype.setShouldSkipSoakPatch = function () {
        this._shouldSkipSoakPatch = true;
    };
    return SoakedDynamicMemberAccessOpPatcher;
}(DynamicMemberAccessOpPatcher_1.default));
exports.default = SoakedDynamicMemberAccessOpPatcher;
