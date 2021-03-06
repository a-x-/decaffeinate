import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import { REMOVE_GUARD } from '../../../suggestions';
import findSoakContainer from '../../../utils/findSoakContainer';
import nodeContainsSoakOperation from '../../../utils/nodeContainsSoakOperation';
import notNull from '../../../utils/notNull';
import ternaryNeedsParens from '../../../utils/ternaryNeedsParens';
import DynamicMemberAccessOpPatcher from './DynamicMemberAccessOpPatcher';
import FunctionApplicationPatcher from './FunctionApplicationPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
import SoakedDynamicMemberAccessOpPatcher from './SoakedDynamicMemberAccessOpPatcher';
import SoakedMemberAccessOpPatcher from './SoakedMemberAccessOpPatcher';
var GUARD_FUNC_HELPER = "function __guardFunc__(func, transform) {\n  return typeof func === 'function' ? transform(func) : undefined;\n}";
/**
 * Special guard function so that the calling code can properly specify the
 * proper `this` value in the call.
 *
 * Note that this method is slightly incorrect in that it's more defensive than
 * `a.b?()`; it does a null check on `a`, when CoffeeScript code would crash on
 * null/undefined `a`. This may be possible to correct in the future, but there
 * are a few reasons it's useful in the current implementation:
 * - The implementation of soak chaining requires that soak operations do
 *   nothing if their leftmost value is undefined, e.g. that `a?.b?.c` can be
 *   correctly rewritten as `(a?.b)?.c`. Soaked method-style function
 *   application is a counterexample, though: `a?.b.c?()` cannot be rewritten as
 *   `(a?.b).c?()`, since the second one crashes if `a` is null. So, instead, we
 *   effectively treat it as `(a?.b)?.c?()`, which again isn't 100% correct, but
 *   will properly guard on `a` being null/undefined.
 * - We'd need a function like this anyway to transform code like `a?.b?()`, so
 *   this avoids the need to have two slightly different functions to handle
 *   this case which is already fairly obscure.
 */
var GUARD_METHOD_HELPER = "function __guardMethod__(obj, methodName, transform) {\n  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {\n    return transform(obj, methodName);\n  } else {\n    return undefined;\n  }\n}";
var SoakedFunctionApplicationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SoakedFunctionApplicationPatcher, _super);
    function SoakedFunctionApplicationPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SoakedFunctionApplicationPatcher.prototype.patchAsExpression = function () {
        if (this.shouldPatchAsOptionalChaining()) {
            this.patchAsOptionalChaining();
        }
        else if (this.shouldPatchAsConditional()) {
            this.patchAsConditional();
        }
        else {
            if (this.fn instanceof MemberAccessOpPatcher) {
                this.patchMethodCall(this.fn);
            }
            else if (this.fn instanceof DynamicMemberAccessOpPatcher) {
                this.patchDynamicMethodCall(this.fn);
            }
            else {
                this.patchNonMethodCall();
            }
            _super.prototype.patchAsExpression.call(this);
        }
    };
    SoakedFunctionApplicationPatcher.prototype.shouldPatchAsOptionalChaining = function () {
        return this.options.useOptionalChaining === true && !this.fn.mayBeUnboundReference();
    };
    SoakedFunctionApplicationPatcher.prototype.shouldPatchAsConditional = function () {
        return this.fn.isRepeatable() && !nodeContainsSoakOperation(this.fn.node);
    };
    SoakedFunctionApplicationPatcher.prototype.patchAsOptionalChaining = function () {
        var callStartToken = this.getCallStartToken();
        // `a?(b)` → `a?.(b)`
        //              ^
        this.insert(callStartToken.start, '.');
        _super.prototype.patchAsExpression.call(this);
    };
    SoakedFunctionApplicationPatcher.prototype.patchAsConditional = function () {
        var soakContainer = findSoakContainer(this);
        this.fn.setRequiresRepeatableExpression();
        _super.prototype.patchAsExpression.call(this);
        var fnCode = this.fn.getRepeatCode();
        var conditionCode = "typeof " + fnCode + " === 'function'";
        var callStartToken = this.getCallStartToken();
        this.remove(this.fn.outerEnd, callStartToken.start);
        if (soakContainer.willPatchAsExpression()) {
            var containerNeedsParens = ternaryNeedsParens(soakContainer);
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
    /**
     * Change a.b?() to __guardMethod__(a, 'b', o => o.b())
     */
    SoakedFunctionApplicationPatcher.prototype.patchMethodCall = function (fn) {
        var memberName = fn.getMemberName();
        if (fn.hasImplicitOperator()) {
            fn.setSkipImplicitDotCreation();
        }
        this.registerHelper('__guardMethod__', GUARD_METHOD_HELPER);
        this.addSuggestion(REMOVE_GUARD);
        if (fn instanceof SoakedMemberAccessOpPatcher) {
            fn.setShouldSkipSoakPatch();
        }
        var callStartToken = this.getCallStartToken();
        var soakContainer = findSoakContainer(this);
        var varName = soakContainer.claimFreeBinding('o');
        var prefix = this.slice(soakContainer.contentStart, this.fn.outerStart);
        if (prefix.length > 0) {
            this.remove(soakContainer.contentStart, this.fn.outerStart);
        }
        // Since memberName is always a valid identifier, we can put it in a string
        // literal without worrying about escaping.
        this.overwrite(fn.expression.outerEnd, callStartToken.end, ", '" + memberName + "', " + varName + " => " + prefix + varName + "." + memberName + "(");
        soakContainer.insert(soakContainer.contentStart, '__guardMethod__(');
        soakContainer.appendDeferredSuffix(')');
    };
    /**
     * Change a[b]?() to __guardMethod__(a, b, (o, m) => o[m]())
     */
    SoakedFunctionApplicationPatcher.prototype.patchDynamicMethodCall = function (fn) {
        var expression = fn.expression, indexingExpr = fn.indexingExpr;
        this.registerHelper('__guardMethod__', GUARD_METHOD_HELPER);
        this.addSuggestion(REMOVE_GUARD);
        if (fn instanceof SoakedDynamicMemberAccessOpPatcher) {
            fn.setShouldSkipSoakPatch();
        }
        var callStartToken = this.getCallStartToken();
        var soakContainer = findSoakContainer(this);
        var objVarName = soakContainer.claimFreeBinding('o');
        var methodVarName = soakContainer.claimFreeBinding('m');
        var prefix = this.slice(soakContainer.contentStart, this.fn.outerStart);
        if (prefix.length > 0) {
            this.remove(soakContainer.contentStart, this.fn.outerStart);
        }
        this.overwrite(expression.outerEnd, indexingExpr.outerStart, ", ");
        this.overwrite(indexingExpr.outerEnd, callStartToken.end, ", (" + objVarName + ", " + methodVarName + ") => " + prefix + objVarName + "[" + methodVarName + "](");
        soakContainer.insert(soakContainer.contentStart, '__guardMethod__(');
        soakContainer.appendDeferredSuffix(')');
    };
    SoakedFunctionApplicationPatcher.prototype.patchNonMethodCall = function () {
        this.registerHelper('__guardFunc__', GUARD_FUNC_HELPER);
        this.addSuggestion(REMOVE_GUARD);
        var callStartToken = this.getCallStartToken();
        var soakContainer = findSoakContainer(this);
        var varName = soakContainer.claimFreeBinding('f');
        var prefix = this.slice(soakContainer.contentStart, this.fn.outerStart);
        if (prefix.length > 0) {
            this.remove(soakContainer.contentStart, this.fn.outerStart);
        }
        this.overwrite(this.fn.outerEnd, callStartToken.end, ", " + varName + " => " + prefix + varName + "(");
        soakContainer.insert(soakContainer.contentStart, '__guardFunc__(');
        soakContainer.appendDeferredSuffix(')');
    };
    SoakedFunctionApplicationPatcher.prototype.getCallStartToken = function () {
        var tokens = this.context.sourceTokens;
        var index = tokens.indexOfTokenMatchingPredicate(function (token) { return token.type === SourceType.CALL_START; }, this.fn.outerEndTokenIndex);
        if (!index || index.isAfter(this.contentEndTokenIndex)) {
            throw this.error("unable to find open-paren for function call");
        }
        return notNull(tokens.tokenAtIndex(index));
    };
    return SoakedFunctionApplicationPatcher;
}(FunctionApplicationPatcher));
export default SoakedFunctionApplicationPatcher;
