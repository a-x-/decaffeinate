"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var blockStartsWithObjectInitialiser_1 = require("../../../utils/blockStartsWithObjectInitialiser");
var containsDescendant_1 = require("../../../utils/containsDescendant");
var notNull_1 = require("../../../utils/notNull");
var referencesArguments_1 = require("../../../utils/referencesArguments");
var FunctionPatcher_1 = require("./FunctionPatcher");
var IdentifierPatcher_1 = require("./IdentifierPatcher");
var ManuallyBoundFunctionPatcher_1 = require("./ManuallyBoundFunctionPatcher");
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
            notNull_1.default(this.body).setExpression();
        }
    };
    /**
     * Use a slightly-modified version of the regular `FunctionPatcher` when
     * we can't use arrow functions.
     */
    BoundFunctionPatcher.patcherClassOverrideForNode = function (node) {
        if (referencesArguments_1.default(node)) {
            return ManuallyBoundFunctionPatcher_1.default;
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
        return !(param instanceof IdentifierPatcher_1.default);
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
                var needsParens = blockStartsWithObjectInitialiser_1.default(this.body) && !this.body.isSurroundedByParentheses();
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
        if (containsDescendant_1.default(this.node, function (child) { return child instanceof nodes_1.AssignOp; })) {
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
}(FunctionPatcher_1.default));
exports.default = BoundFunctionPatcher;
