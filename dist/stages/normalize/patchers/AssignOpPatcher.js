"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var containsSuperCall_1 = require("../../../utils/containsSuperCall");
var notNull_1 = require("../../../utils/notNull");
var ClassPatcher_1 = require("./ClassPatcher");
var DynamicMemberAccessOpPatcher_1 = require("./DynamicMemberAccessOpPatcher");
var FunctionPatcher_1 = require("./FunctionPatcher");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
var AssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(AssignOpPatcher, _super);
    function AssignOpPatcher(patcherContext, assignee, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.assignee = assignee;
        _this.expression = expression;
        return _this;
    }
    AssignOpPatcher.prototype.patchAsExpression = function () {
        this.prepareEarlySuperTransform();
        var isDynamicallyCreatedClassAssignment = this.isDynamicallyCreatedClassAssignment();
        if (isDynamicallyCreatedClassAssignment) {
            this.patchClassAssignmentPrefix();
        }
        this.assignee.patch();
        if (isDynamicallyCreatedClassAssignment) {
            this.patchClassAssignmentOperator();
        }
        this.removeUnnecessaryThenToken();
        this.expression.patch();
    };
    AssignOpPatcher.prototype.isDynamicallyCreatedClassAssignment = function () {
        var classParent = this.getClassParent();
        return (classParent !== null &&
            classParent.isClassAssignment(this.node) &&
            !(classParent.isClassMethod(this) && notNull_1.default(classParent.body).statements.indexOf(this) > -1));
    };
    AssignOpPatcher.prototype.patchClassAssignmentPrefix = function () {
        if (this.node.type === 'ClassProtoAssignOp') {
            this.insert(this.assignee.outerStart, '@prototype.');
        }
    };
    AssignOpPatcher.prototype.patchClassAssignmentOperator = function () {
        var colonIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.assignee, this.expression, function (token) { return token.type === coffee_lex_1.SourceType.COLON; });
        if (colonIndex) {
            var colonToken = notNull_1.default(this.sourceTokenAtIndex(colonIndex));
            this.overwrite(colonToken.start, colonToken.end, ' =');
        }
    };
    /**
     * If we are within a class body (not a method), return that class.
     */
    AssignOpPatcher.prototype.getClassParent = function () {
        var parent = this;
        while (parent) {
            if (parent instanceof FunctionPatcher_1.default) {
                return null;
            }
            else if (parent instanceof ClassPatcher_1.default) {
                return parent;
            }
            parent = parent.parent;
        }
        return null;
    };
    /**
     * Dynamically-created static methods using super need to be transformed in
     * the normalize stage instead of the main stage. Otherwise, the `super` will
     * resolve to `initClass` instead of the proper static method.
     */
    AssignOpPatcher.prototype.needsEarlySuperTransform = function () {
        if (!this.isDynamicallyCreatedClassAssignment()) {
            return false;
        }
        return (this.node.type !== 'ClassProtoAssignOp' &&
            this.expression instanceof FunctionPatcher_1.default &&
            containsSuperCall_1.default(this.expression.node));
    };
    AssignOpPatcher.prototype.prepareEarlySuperTransform = function () {
        if (this.needsEarlySuperTransform()) {
            if (this.assignee instanceof MemberAccessOpPatcher_1.default) {
                this.assignee.expression.setRequiresRepeatableExpression({
                    parens: true,
                    ref: 'cls',
                    forceRepeat: true
                });
            }
            else if (this.assignee instanceof DynamicMemberAccessOpPatcher_1.default) {
                this.assignee.expression.setRequiresRepeatableExpression({
                    parens: true,
                    ref: 'cls',
                    forceRepeat: true
                });
                this.assignee.indexingExpr.setRequiresRepeatableExpression({
                    ref: 'method',
                    forceRepeat: true
                });
            }
            else {
                throw this.error('Unexpected assignee type for early super transform.');
            }
        }
    };
    AssignOpPatcher.prototype.getEarlySuperTransformInfo = function () {
        if (this.needsEarlySuperTransform()) {
            if (this.assignee instanceof MemberAccessOpPatcher_1.default) {
                return {
                    classCode: this.assignee.expression.getRepeatCode(),
                    accessCode: "." + this.assignee.member.node.data
                };
            }
            else if (this.assignee instanceof DynamicMemberAccessOpPatcher_1.default) {
                return {
                    classCode: this.assignee.expression.getRepeatCode(),
                    accessCode: "[" + this.assignee.indexingExpr.getRepeatCode() + "]"
                };
            }
            else {
                throw this.error('Unexpected assignee type for early super transform.');
            }
        }
        return null;
    };
    /**
     * Assignment operators are allowed to have a `then` token after them for some
     * reason, and it doesn't do anything, so just get rid of it.
     */
    AssignOpPatcher.prototype.removeUnnecessaryThenToken = function () {
        var thenIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.assignee, this.expression, function (token) { return token.type === coffee_lex_1.SourceType.THEN; });
        if (thenIndex) {
            var thenToken = notNull_1.default(this.sourceTokenAtIndex(thenIndex));
            if (this.slice(thenToken.start - 1, thenToken.start) === ' ') {
                this.remove(thenToken.start - 1, thenToken.end);
            }
            else {
                this.remove(thenToken.start, thenToken.end);
            }
        }
    };
    return AssignOpPatcher;
}(NodePatcher_1.default));
exports.default = AssignOpPatcher;
