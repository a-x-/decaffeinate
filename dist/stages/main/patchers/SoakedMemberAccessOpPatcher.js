"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var suggestions_1 = require("../../../suggestions");
var findSoakContainer_1 = require("../../../utils/findSoakContainer");
var nodeContainsSoakOperation_1 = require("../../../utils/nodeContainsSoakOperation");
var ternaryNeedsParens_1 = require("../../../utils/ternaryNeedsParens");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
var GUARD_HELPER = "function __guard__(value, transform) {\n  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;\n}";
var SoakedMemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SoakedMemberAccessOpPatcher, _super);
    function SoakedMemberAccessOpPatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._shouldSkipSoakPatch = false;
        return _this;
    }
    SoakedMemberAccessOpPatcher.prototype.patchAsExpression = function () {
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
        }
    };
    SoakedMemberAccessOpPatcher.prototype.shouldPatchAsOptionalChaining = function () {
        return this.options.useOptionalChaining === true && !this.expression.mayBeUnboundReference();
    };
    SoakedMemberAccessOpPatcher.prototype.shouldPatchAsConditional = function () {
        return this.expression.isRepeatable() && !nodeContainsSoakOperation_1.default(this.expression.node);
    };
    SoakedMemberAccessOpPatcher.prototype.patchAsOptionalChaining = function () {
        // The operator is the same, so nothing special to do.
        this.expression.patch();
    };
    SoakedMemberAccessOpPatcher.prototype.patchAsConditional = function () {
        this.addSuggestion(suggestions_1.SHORTEN_NULL_CHECKS);
        var soakContainer = findSoakContainer_1.default(this);
        var memberNameToken = this.getMemberNameSourceToken();
        var expressionCode = this.expression.patchRepeatable();
        var conditionCode;
        if (this.expression.mayBeUnboundReference()) {
            conditionCode = "typeof " + expressionCode + " !== 'undefined' && " + expressionCode + " !== null";
        }
        else {
            conditionCode = expressionCode + " != null";
        }
        this.overwrite(this.expression.outerEnd, memberNameToken.start, '.');
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
    SoakedMemberAccessOpPatcher.prototype.patchAsGuardCall = function () {
        this.registerHelper('__guard__', GUARD_HELPER);
        this.addSuggestion(suggestions_1.REMOVE_GUARD);
        var soakContainer = findSoakContainer_1.default(this);
        var varName = soakContainer.claimFreeBinding('x');
        var prefix = this.slice(soakContainer.contentStart, this.contentStart);
        if (prefix.length > 0) {
            this.remove(soakContainer.contentStart, this.contentStart);
        }
        var memberNameToken = this.getMemberNameSourceToken();
        this.overwrite(this.expression.outerEnd, memberNameToken.start, ", " + varName + " => " + prefix + varName + ".");
        soakContainer.insert(soakContainer.contentStart, '__guard__(');
        soakContainer.appendDeferredSuffix(')');
        this.expression.patch();
    };
    SoakedMemberAccessOpPatcher.prototype.setShouldSkipSoakPatch = function () {
        this._shouldSkipSoakPatch = true;
    };
    /**
     * There isn't an implicit-dot syntax like @a for soaked access.
     */
    SoakedMemberAccessOpPatcher.prototype.hasImplicitOperator = function () {
        return false;
    };
    return SoakedMemberAccessOpPatcher;
}(MemberAccessOpPatcher_1.default));
exports.default = SoakedMemberAccessOpPatcher;
