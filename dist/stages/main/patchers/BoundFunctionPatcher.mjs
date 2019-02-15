import * as tslib_1 from "tslib";
import { AssignOp } from 'decaffeinate-parser/dist/nodes';
import blockStartsWithObjectInitialiser from '../../../utils/blockStartsWithObjectInitialiser';
import containsDescendant from '../../../utils/containsDescendant';
import notNull from '../../../utils/notNull';
import referencesArguments from '../../../utils/referencesArguments';
import FunctionPatcher from './FunctionPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import ManuallyBoundFunctionPatcher from './ManuallyBoundFunctionPatcher';
/**
 * Handles bound functions, i.e. "fat arrows".
 */
var BoundFunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BoundFunctionPatcher, _super);
    function BoundFunctionPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoundFunctionPatcher.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        if (this.shouldPatchAsBlocklessArrowFunction()) {
            notNull(this.body).setExpression();
        }
    };
    /**
     * Use a slightly-modified version of the regular `FunctionPatcher` when
     * we can't use arrow functions.
     */
    BoundFunctionPatcher.patcherClassOverrideForNode = function (node) {
        if (referencesArguments(node)) {
            return ManuallyBoundFunctionPatcher;
        }
        else {
            return null;
        }
    };
    // There's no difference between statement and expression arrow functions.
    BoundFunctionPatcher.prototype.patchAsStatement = function (options) {
        if (options === void 0) { options = {}; }
        this.patchAsExpression(options);
    };
    BoundFunctionPatcher.prototype.patchFunctionStart = function () {
        var arrow = this.getArrowToken();
        if (!this.hasParamStart()) {
            this.insert(this.contentStart, '() ');
        }
        else if (!this.parameterListNeedsParentheses()) {
            var _a = tslib_1.__read(this.parameters, 1), param = _a[0];
            if (param.isSurroundedByParentheses()) {
                this.remove(param.outerStart, param.contentStart);
                this.remove(param.contentEnd, param.outerEnd);
            }
        }
        if (!this.willPatchBodyInline()) {
            this.insert(arrow.end, ' {');
        }
    };
    BoundFunctionPatcher.prototype.parameterListNeedsParentheses = function () {
        var parameters = this.parameters;
        if (parameters.length !== 1) {
            return true;
        }
        var _a = tslib_1.__read(parameters, 1), param = _a[0];
        return !(param instanceof IdentifierPatcher);
    };
    BoundFunctionPatcher.prototype.patchFunctionBody = function () {
        if (this.body) {
            if (!this.willPatchBodyInline()) {
                if (this.isEndOfFunctionCall()) {
                    this.body.patch({ leftBrace: false, rightBrace: false });
                    this.placeCloseBraceBeforeFunctionCallEnd();
                }
                else {
                    this.body.patch({ leftBrace: false });
                }
            }
            else {
                var needsParens = blockStartsWithObjectInitialiser(this.body) && !this.body.isSurroundedByParentheses();
                if (needsParens) {
                    this.insert(this.body.innerStart, '(');
                }
                this.body.patch();
                if (needsParens) {
                    this.insert(this.body.innerEnd, ')');
                }
            }
        }
        else {
            // No body, so BlockPatcher can't insert it for us.
            this.insert(this.innerEnd, '}');
        }
    };
    BoundFunctionPatcher.prototype.expectedArrowType = function () {
        return '=>';
    };
    BoundFunctionPatcher.prototype.willPatchBodyInline = function () {
        return this.body !== null && this.body.willPatchAsExpression();
    };
    BoundFunctionPatcher.prototype.shouldPatchAsBlocklessArrowFunction = function () {
        if (!this.body) {
            return false;
        }
        if (containsDescendant(this.node, function (child) { return child instanceof AssignOp; })) {
            return false;
        }
        return this.body.inline();
    };
    /**
     * Bound functions already start with a paren or a param identifier, and so
     * are safe to start a statement.
     */
    BoundFunctionPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    return BoundFunctionPatcher;
}(FunctionPatcher));
export default BoundFunctionPatcher;
