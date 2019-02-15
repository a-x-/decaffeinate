"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var suggestions_1 = require("../../../suggestions");
var canPatchAssigneeToJavaScript_1 = require("../../../utils/canPatchAssigneeToJavaScript");
var containsSuperCall_1 = require("../../../utils/containsSuperCall");
var extractPrototypeAssignPatchers_1 = require("../../../utils/extractPrototypeAssignPatchers");
var getObjectAssigneeKeys_1 = require("../../../utils/getObjectAssigneeKeys");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ArrayInitialiserPatcher_1 = require("./ArrayInitialiserPatcher");
var ConditionalPatcher_1 = require("./ConditionalPatcher");
var DoOpPatcher_1 = require("./DoOpPatcher");
var DynamicMemberAccessOpPatcher_1 = require("./DynamicMemberAccessOpPatcher");
var ElisionPatcher_1 = require("./ElisionPatcher");
var ExpansionPatcher_1 = require("./ExpansionPatcher");
var FunctionApplicationPatcher_1 = require("./FunctionApplicationPatcher");
var FunctionPatcher_1 = require("./FunctionPatcher");
var IdentifierPatcher_1 = require("./IdentifierPatcher");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
var ObjectInitialiserMemberPatcher_1 = require("./ObjectInitialiserMemberPatcher");
var ObjectInitialiserPatcher_1 = require("./ObjectInitialiserPatcher");
var ReturnPatcher_1 = require("./ReturnPatcher");
var SlicePatcher_1 = require("./SlicePatcher");
var SpreadPatcher_1 = require("./SpreadPatcher");
var StringPatcher_1 = require("./StringPatcher");
var ThisPatcher_1 = require("./ThisPatcher");
var MULTI_ASSIGN_SINGLE_LINE_MAX_LENGTH = 100;
var OBJECT_WITHOUT_KEYS_HELPER = "function __objectWithoutKeys__(object, keys) {\n  const result = {...object};\n  for (const k of keys) {\n    delete result[keys];\n  }\n  return result;\n}";
var AssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(AssignOpPatcher, _super);
    function AssignOpPatcher(patcherContext, assignee, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.negated = false;
        _this.assignee = assignee;
        _this.expression = expression;
        return _this;
    }
    AssignOpPatcher.prototype.initialize = function () {
        this.assignee.setAssignee();
        this.assignee.setRequiresExpression();
        this.expression.setRequiresExpression();
    };
    AssignOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    AssignOpPatcher.prototype.patchAsExpression = function () {
        if (this.parent instanceof ObjectInitialiserPatcher_1.default) {
            this.patchAsObjectDestructureWithDefault();
            return;
        }
        this.markProtoAssignmentRepeatableIfNecessary();
        var shouldAddParens = !this.isAssignee() &&
            (this.negated ||
                (this.willResultInSeqExpression() && this.parent instanceof FunctionApplicationPatcher_1.default) ||
                (!this.isSurroundedByParentheses() &&
                    !(this.parent instanceof ReturnPatcher_1.default ||
                        this.parent instanceof DoOpPatcher_1.default ||
                        (this.parent instanceof ConditionalPatcher_1.default &&
                            this.parent.condition === this &&
                            !this.parent.willPatchAsTernary())) &&
                    !this.implicitlyReturns()));
        if (this.negated) {
            this.insert(this.innerStart, '!');
        }
        if (shouldAddParens) {
            this.insert(this.innerStart, '(');
        }
        if (canPatchAssigneeToJavaScript_1.default(this.assignee.node, this.options)) {
            this.patchSimpleAssignment();
        }
        else {
            this.addSuggestion(suggestions_1.SIMPLIFY_COMPLEX_ASSIGNMENTS);
            var assignments = [];
            // In an expression context, the result should always be the value of the
            // RHS, so we need to make it repeatable if it's not.
            var expressionCode = void 0;
            if (this.expression.isRepeatable()) {
                expressionCode = this.expression.patchAndGetCode();
            }
            else {
                var fullExpression = this.expression.patchAndGetCode();
                expressionCode = this.claimFreeBinding();
                assignments.push(expressionCode + " = " + fullExpression);
            }
            assignments.push.apply(assignments, tslib_1.__spread(this.generateAssignments(this.assignee, expressionCode, true)));
            assignments.push("" + expressionCode);
            this.overwrite(this.contentStart, this.contentEnd, assignments.join(', '));
        }
        if (shouldAddParens) {
            this.appendDeferredSuffix(')');
        }
    };
    AssignOpPatcher.prototype.patchAsStatement = function () {
        this.markProtoAssignmentRepeatableIfNecessary();
        if (canPatchAssigneeToJavaScript_1.default(this.assignee.node, this.options)) {
            var shouldAddParens = this.assignee.statementShouldAddParens();
            if (shouldAddParens) {
                this.insert(this.contentStart, '(');
            }
            this.patchSimpleAssignment();
            if (shouldAddParens) {
                this.insert(this.contentEnd, ')');
            }
        }
        else {
            this.addSuggestion(suggestions_1.SIMPLIFY_COMPLEX_ASSIGNMENTS);
            var assignments = this.generateAssignments(this.assignee, this.expression.patchAndGetCode(), this.expression.isRepeatable());
            this.overwriteWithAssignments(assignments);
        }
    };
    AssignOpPatcher.prototype.patchAsObjectDestructureWithDefault = function () {
        if (this.assignee instanceof MemberAccessOpPatcher_1.default && this.assignee.expression instanceof ThisPatcher_1.default) {
            // `{ @a = b }` → `{ a: @a = bb }`
            //                  ^^^^
            this.insert(this.assignee.outerStart, this.assignee.getMemberName() + ": ");
        }
        this.assignee.patch();
        this.expression.patch();
    };
    AssignOpPatcher.prototype.willResultInSeqExpression = function () {
        return (this.willPatchAsExpression() &&
            (!canPatchAssigneeToJavaScript_1.default(this.assignee.node, this.options) ||
                this.assignee instanceof ArrayInitialiserPatcher_1.default));
    };
    AssignOpPatcher.prototype.patchSimpleAssignment = function () {
        var needsArrayFrom = this.shouldUseArrayFrom() && this.assignee instanceof ArrayInitialiserPatcher_1.default;
        this.assignee.patch();
        if (needsArrayFrom) {
            this.addSuggestion(suggestions_1.REMOVE_ARRAY_FROM);
            this.insert(this.expression.outerStart, 'Array.from(');
        }
        if (needsArrayFrom) {
            if (this.willPatchAsExpression()) {
                var expressionRepeatCode = this.expression.patchRepeatable();
                this.insert(this.expression.outerEnd, "), " + expressionRepeatCode);
            }
            else {
                this.expression.patch();
                this.insert(this.expression.outerEnd, ")");
            }
        }
        else {
            this.expression.patch();
        }
    };
    AssignOpPatcher.prototype.overwriteWithAssignments = function (assignments) {
        var assignmentCode = assignments.join(', ');
        if (assignmentCode.length > MULTI_ASSIGN_SINGLE_LINE_MAX_LENGTH) {
            assignmentCode = assignments.join(",\n" + this.getIndent(1));
        }
        if (assignmentCode.startsWith('{')) {
            assignmentCode = "(" + assignmentCode + ")";
        }
        this.overwrite(this.contentStart, this.contentEnd, assignmentCode);
    };
    /**
     * Recursively walk a CoffeeScript assignee to generate a sequence of
     * JavaScript assignments.
     *
     * patcher is a patcher for the assignee.
     * ref is a code snippet, not necessarily repeatable, that can be used to
     *   reference the value being assigned.
     * refIsRepeatable says whether ref may be used more than once. If not, we
     *   sometimes generate an extra assignment to make it repeatable.
     */
    AssignOpPatcher.prototype.generateAssignments = function (patcher, ref, refIsRepeatable) {
        var e_1, _a, e_2, _b;
        if (patcher instanceof ExpansionPatcher_1.default) {
            // Expansions don't produce assignments.
            return [];
        }
        else if (patcher instanceof ElisionPatcher_1.default) {
            // Elisions don't produce assignments.
            return [];
        }
        else if (canPatchAssigneeToJavaScript_1.default(patcher.node, this.options)) {
            var assigneeCode = patcher.patchAndGetCode();
            if (this.shouldUseArrayFrom() && patcher instanceof ArrayInitialiserPatcher_1.default) {
                this.addSuggestion(suggestions_1.REMOVE_ARRAY_FROM);
                return [assigneeCode + " = Array.from(" + ref + ")"];
            }
            else {
                return [assigneeCode + " = " + ref];
            }
        }
        else if (patcher instanceof SpreadPatcher_1.default) {
            // Calling code seeing a spread patcher should provide an expression for
            // the resolved array.
            return this.generateAssignments(patcher.expression, ref, refIsRepeatable);
        }
        else if (patcher instanceof ArrayInitialiserPatcher_1.default) {
            if (!refIsRepeatable) {
                var arrReference = this.claimFreeBinding('array');
                return tslib_1.__spread([arrReference + " = " + ref], this.generateAssignments(patcher, arrReference, true));
            }
            var assignees = patcher.members;
            var hasSeenExpansion = false;
            var lengthCode = null;
            var assignments = [];
            try {
                for (var _c = tslib_1.__values(assignees.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = tslib_1.__read(_d.value, 2), i = _e[0], assignee = _e[1];
                    var valueCode = void 0;
                    if (assignee instanceof ExpansionPatcher_1.default || assignee instanceof SpreadPatcher_1.default) {
                        hasSeenExpansion = true;
                        if (assignee instanceof SpreadPatcher_1.default && i < assignees.length - 1) {
                            lengthCode = this.claimFreeBinding('adjustedLength');
                            assignments.push(lengthCode + " = Math.max(" + ref + ".length, " + (assignees.length - 1) + ")");
                        }
                        else {
                            lengthCode = ref + ".length";
                        }
                        valueCode = ref + ".slice(" + i + ", " + lengthCode + " - " + (assignees.length - i - 1) + ")";
                    }
                    else if (hasSeenExpansion) {
                        valueCode = ref + "[" + lengthCode + " - " + (assignees.length - i) + "]";
                    }
                    else {
                        valueCode = ref + "[" + i + "]";
                    }
                    assignments.push.apply(assignments, tslib_1.__spread(this.generateAssignments(assignee, valueCode, false)));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return assignments;
        }
        else if (patcher instanceof ObjectInitialiserPatcher_1.default) {
            if (!refIsRepeatable) {
                var objReference = this.claimFreeBinding('obj');
                return tslib_1.__spread([objReference + " = " + ref], this.generateAssignments(patcher, objReference, true));
            }
            var assignments = [];
            try {
                for (var _f = tslib_1.__values(patcher.members), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var member = _g.value;
                    if (member instanceof ObjectInitialiserMemberPatcher_1.default) {
                        var valueCode = "" + ref + this.accessFieldForObjectDestructure(member.key);
                        assignments.push.apply(assignments, tslib_1.__spread(this.generateAssignments(member.expression || member.key, valueCode, false)));
                    }
                    else if (member instanceof AssignOpPatcher) {
                        // Assignments like {a = b} = c end up as an assign op.
                        var valueCode = "" + ref + this.accessFieldForObjectDestructure(member.assignee);
                        assignments.push.apply(assignments, tslib_1.__spread(this.generateAssignments(member, valueCode, false)));
                    }
                    else if (member instanceof SpreadPatcher_1.default) {
                        var helper = this.registerHelper('__objectWithoutKeys__', OBJECT_WITHOUT_KEYS_HELPER);
                        var omittedKeysCode = getObjectAssigneeKeys_1.default(patcher)
                            .map(function (key) { return "'" + key + "'"; })
                            .join(', ');
                        assignments.push.apply(assignments, tslib_1.__spread(this.generateAssignments(member, helper + "(" + ref + ", [" + omittedKeysCode + "])", false)));
                    }
                    else {
                        // tslint:disable-next-line no-any
                        throw this.error("Unexpected object initializer member: " + member.node.type);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return assignments;
        }
        else if (patcher instanceof SlicePatcher_1.default) {
            return [patcher.getSpliceCode(ref)];
        }
        else if (patcher instanceof AssignOpPatcher) {
            this.addSuggestion(suggestions_1.SHORTEN_NULL_CHECKS);
            if (!refIsRepeatable) {
                var valReference = this.claimFreeBinding('val');
                return tslib_1.__spread([valReference + " = " + ref], this.generateAssignments(patcher, valReference, true));
            }
            var defaultCode = patcher.expression.patchAndGetCode();
            var comparison = this.options.useCS2 ? '!== undefined' : '!= null';
            return this.generateAssignments(patcher.assignee, ref + " " + comparison + " ? " + ref + " : " + defaultCode, false);
        }
        else {
            throw this.error("Invalid assignee type: " + patcher.node.type);
        }
    };
    AssignOpPatcher.prototype.accessFieldForObjectDestructure = function (patcher) {
        if (patcher instanceof IdentifierPatcher_1.default) {
            return "." + patcher.node.data;
        }
        else if (patcher instanceof MemberAccessOpPatcher_1.default && patcher.expression instanceof ThisPatcher_1.default) {
            return "." + patcher.node.member.data;
        }
        else if (patcher instanceof StringPatcher_1.default) {
            return "[" + patcher.patchAndGetCode() + "]";
        }
        else {
            throw this.error("Unexpected object destructure expression: " + patcher.node.type);
        }
    };
    /**
     * If this is an assignment of the form `A.prototype.b = -> super`, we need to
     * mark the `A` expression, and possibly the indexed value, as repeatable so
     * that the super transform can make use of it.
     */
    AssignOpPatcher.prototype.markProtoAssignmentRepeatableIfNecessary = function () {
        if (!(this.expression instanceof FunctionPatcher_1.default && containsSuperCall_1.default(this.expression.node))) {
            return;
        }
        var prototypeAssignPatchers = extractPrototypeAssignPatchers_1.default(this);
        if (!prototypeAssignPatchers) {
            return;
        }
        var classRefPatcher = prototypeAssignPatchers.classRefPatcher, methodAccessPatcher = prototypeAssignPatchers.methodAccessPatcher;
        classRefPatcher.setRequiresRepeatableExpression({
            parens: true,
            ref: 'cls',
            forceRepeat: true
        });
        if (methodAccessPatcher instanceof DynamicMemberAccessOpPatcher_1.default) {
            methodAccessPatcher.indexingExpr.setRequiresRepeatableExpression({
                ref: 'method',
                forceRepeat: true
            });
        }
    };
    AssignOpPatcher.prototype.shouldUseArrayFrom = function () {
        return !this.options.useCS2;
    };
    return AssignOpPatcher;
}(NodePatcher_1.default));
exports.default = AssignOpPatcher;
