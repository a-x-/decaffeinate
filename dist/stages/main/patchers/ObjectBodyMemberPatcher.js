"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var AsyncFunctionPatcher_1 = require("./AsyncFunctionPatcher");
var BoundAsyncFunctionPatcher_1 = require("./BoundAsyncFunctionPatcher");
var BoundFunctionPatcher_1 = require("./BoundFunctionPatcher");
var BoundGeneratorFunctionPatcher_1 = require("./BoundGeneratorFunctionPatcher");
var FunctionPatcher_1 = require("./FunctionPatcher");
var GeneratorFunctionPatcher_1 = require("./GeneratorFunctionPatcher");
var IdentifierPatcher_1 = require("./IdentifierPatcher");
var ManuallyBoundFunctionPatcher_1 = require("./ManuallyBoundFunctionPatcher");
var StringPatcher_1 = require("./StringPatcher");
/**
 * Handles object properties.
 */
var ObjectBodyMemberPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ObjectBodyMemberPatcher, _super);
    function ObjectBodyMemberPatcher(patcherContext, key, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.key = key;
        _this.expression = expression;
        return _this;
    }
    ObjectBodyMemberPatcher.prototype.initialize = function () {
        this.key.setRequiresExpression();
        if (this.expression) {
            this.expression.setRequiresExpression();
        }
    };
    /**
     * KEY : EXPRESSION
     */
    ObjectBodyMemberPatcher.prototype.patchAsExpression = function () {
        if (this.isMethod()) {
            this.patchAsMethod();
        }
        else {
            this.patchAsProperty();
        }
    };
    ObjectBodyMemberPatcher.prototype.patchAsMethod = function () {
        if (!this.expression) {
            throw this.error('Expected expression to be non-null in method case.');
        }
        if (this.isAsyncMethod()) {
            this.insert(this.key.outerStart, 'async ');
        }
        if (this.isGeneratorMethod()) {
            this.insert(this.key.outerStart, '*');
        }
        this.patchKey();
        // `{ ['hi there']: ->` → `{ ['hi there']->`
        //                ^^
        this.remove(this.key.outerEnd, this.expression.outerStart);
        // The function expression might be surrounded by parens, so remove them if
        // necessary.
        this.remove(this.expression.outerStart, this.expression.contentStart);
        this.remove(this.expression.contentEnd, this.expression.outerEnd);
        this.patchExpression();
    };
    ObjectBodyMemberPatcher.prototype.patchAsProperty = function () {
        this.patchKey();
        this.patchExpression();
    };
    ObjectBodyMemberPatcher.prototype.patchKey = function () {
        if (this.node instanceof nodes_1.ObjectInitialiserMember && this.node.isComputed) {
            // Explicit CS2 computed keys are already in the right syntax and just need to be patched.
            this.key.patch();
            return;
        }
        var computedKeyPatcher = this.getComputedKeyPatcher();
        if (computedKeyPatcher !== null) {
            // Since we're replacing an expression like `"#{foo}"` with just `foo`,
            // the outer string expression might be marked as repeatable, in which case
            // we should delegate that to the inner expression.
            var repeatOptions = this.key.getRepeatableOptions();
            if (repeatOptions) {
                computedKeyPatcher.setRequiresRepeatableExpression(repeatOptions);
            }
            this.overwrite(this.key.outerStart, computedKeyPatcher.outerStart, '[');
            computedKeyPatcher.patch();
            this.overwrite(computedKeyPatcher.outerEnd, this.key.outerEnd, ']');
            if (repeatOptions) {
                this.key.overrideRepeatCode(computedKeyPatcher.getRepeatCode());
            }
        }
        else {
            var needsBrackets = !(this.key instanceof StringPatcher_1.default && !this.key.shouldBecomeTemplateLiteral()) &&
                !(this.key instanceof IdentifierPatcher_1.default) &&
                (this.key.node.type !== 'Int' && this.key.node.type !== 'Float');
            if (needsBrackets) {
                this.insert(this.key.outerStart, '[');
            }
            this.key.patch();
            if (needsBrackets) {
                this.insert(this.key.outerEnd, ']');
            }
        }
    };
    /**
     * As a special case, transform {"#{a.b}": c} to {[a.b]: c}, since a template
     * literal is the best way to do computed keys in CoffeeScript. This method
     * gets the patcher for that computed key node, if any.
     */
    ObjectBodyMemberPatcher.prototype.getComputedKeyPatcher = function () {
        if (this.key instanceof StringPatcher_1.default &&
            this.key.quasis.length === 2 &&
            this.key.expressions.length === 1 &&
            this.key.quasis[0].node.data === '' &&
            this.key.quasis[1].node.data === '') {
            return this.key.expressions[0];
        }
        return null;
    };
    ObjectBodyMemberPatcher.prototype.patchExpression = function () {
        if (this.expression) {
            this.expression.patch({ method: this.isMethod() });
        }
    };
    /**
     * In normal object bodies, we can use method syntax for normal arrow
     * functions and for normal generator functions. If we need to explicitly add
     * `.bind(this)`, then we won't be able to use the method form. But for
     * classes, since the binding is done in the constructor, we can still use
     * method syntax, so ClassAssignOpPatcher overrides this method for that case.
     * We also allow ClassBoundMethodFunctionPatcher since that only comes up in
     * the class case.
     *
     * @protected
     */
    ObjectBodyMemberPatcher.prototype.isMethod = function () {
        return (this.expression instanceof FunctionPatcher_1.default &&
            !(this.expression instanceof ManuallyBoundFunctionPatcher_1.default) &&
            !(this.expression instanceof BoundFunctionPatcher_1.default));
    };
    /**
     * Note that we include BoundGeneratorFunctionPatcher, even though the object
     * case doesn't treat it as a method, since the class case should use a
     * generator method.
     *
     * @protected
     */
    ObjectBodyMemberPatcher.prototype.isGeneratorMethod = function () {
        return (this.expression instanceof GeneratorFunctionPatcher_1.default || this.expression instanceof BoundGeneratorFunctionPatcher_1.default);
    };
    ObjectBodyMemberPatcher.prototype.isAsyncMethod = function () {
        return this.expression instanceof AsyncFunctionPatcher_1.default || this.expression instanceof BoundAsyncFunctionPatcher_1.default;
    };
    return ObjectBodyMemberPatcher;
}(NodePatcher_1.default));
exports.default = ObjectBodyMemberPatcher;
