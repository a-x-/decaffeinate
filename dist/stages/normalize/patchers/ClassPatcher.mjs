import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from './../../../patchers/NodePatcher';
import BlockPatcher from './BlockPatcher';
import ConstructorPatcher from './ConstructorPatcher';
import FunctionPatcher from './FunctionPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import ProgramPatcher from './ProgramPatcher';
import { AssignOp, BaseFunction, ClassProtoAssignOp, DynamicMemberAccessOp, Identifier, MemberAccessOp, This } from 'decaffeinate-parser/dist/nodes';
import { AVOID_INITCLASS } from '../../../suggestions';
var ClassPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ClassPatcher, _super);
    function ClassPatcher(patcherContext, nameAssignee, parent, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this.nameAssignee = nameAssignee;
        _this.superclass = parent;
        _this.body = body;
        return _this;
    }
    /**
     * Handle code within class bodies by restructuring the class to use a static
     * method instead.
     *
     * Current limitations:
     * - Doesn't deconflict the "initClass" name of the static method.
     * - Technically this changes the execution order of the class body, although
     *   it does so in a way that is unlikely to cause problems in reasonable
     *   code.
     */
    ClassPatcher.prototype.patchAsStatement = function () {
        var e_1, _a;
        // Indentation needs to happen before child patching in case we have child
        // classes or other nested indentation situations.
        if (this.needsIndent()) {
            this.indent(1, { skipFirstLine: true });
        }
        // We also need to remove `then` early so it doesn't remove other inserted
        // code.
        this.removeThenTokenIfNecessary();
        var indent = this.getIndent();
        if (this.nameAssignee) {
            this.nameAssignee.patch();
        }
        if (this.superclass) {
            this.superclass.patch();
        }
        if (this.body) {
            this.body.patch();
        }
        if (!this.needsInitClass()) {
            return;
        }
        this.addSuggestion(AVOID_INITCLASS);
        var insertPoint = this.getInitClassInsertPoint();
        var nonMethodPatchers = this.getNonMethodPatchers();
        var customConstructorInfo = this.extractCustomConstructorInfo();
        var shouldUseIIFE = this.shouldUseIIFE();
        if (shouldUseIIFE) {
            // If the class declaration might introduce a variable, we need to make
            // sure that assignment happens outside the IIFE so that it can be used
            // by the outside world.
            if (this.nameAssignee instanceof IdentifierPatcher) {
                this.insert(this.outerStart, this.nameAssignee.node.data + " = ");
            }
            this.insert(this.outerStart, "do ->\n" + indent);
        }
        var needsTmpName = false;
        var classRef;
        if (this.nameAssignee instanceof IdentifierPatcher) {
            classRef = this.nameAssignee.node.data;
        }
        else {
            classRef = this.claimFreeBinding('Cls');
            needsTmpName = true;
        }
        var assignmentNames = this.generateInitClassMethod(nonMethodPatchers, customConstructorInfo, insertPoint);
        this.insert(this.outerEnd, "\n" + indent + classRef + ".initClass()");
        if (shouldUseIIFE) {
            this.insert(this.outerEnd, "\n" + indent + "return " + classRef);
        }
        try {
            for (var assignmentNames_1 = tslib_1.__values(assignmentNames), assignmentNames_1_1 = assignmentNames_1.next(); !assignmentNames_1_1.done; assignmentNames_1_1 = assignmentNames_1.next()) {
                var assignmentName = assignmentNames_1_1.value;
                this.insert(this.outerStart, assignmentName + " = undefined\n" + indent);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (assignmentNames_1_1 && !assignmentNames_1_1.done && (_a = assignmentNames_1.return)) _a.call(assignmentNames_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (needsTmpName) {
            this.insert(this.outerStart, classRef + " = ");
        }
    };
    /**
     * For now, code in class bodies is only supported for statement classes.
     */
    ClassPatcher.prototype.patchAsExpression = function () {
        if (this.body) {
            this.body.patch();
        }
    };
    ClassPatcher.prototype.needsIndent = function () {
        return this.needsInitClass() && this.shouldUseIIFE();
    };
    ClassPatcher.prototype.needsInitClass = function () {
        if (!this.body) {
            return false;
        }
        if (this.body.statements.length === 0) {
            return false;
        }
        var nonMethodPatchers = this.getNonMethodPatchers();
        if (nonMethodPatchers.length === 0 && !this.needsCustomConstructor()) {
            return false;
        }
        return true;
    };
    ClassPatcher.prototype.removeThenTokenIfNecessary = function () {
        var searchStart;
        if (this.superclass) {
            searchStart = this.superclass.outerEnd;
        }
        else if (this.nameAssignee) {
            searchStart = this.nameAssignee.outerEnd;
        }
        else {
            searchStart = this.firstToken().end;
        }
        var searchEnd;
        if (this.body) {
            searchEnd = this.body.outerStart;
        }
        else {
            searchEnd = this.contentEnd;
        }
        var index = this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === SourceType.THEN; });
        if (index) {
            this.overwrite(searchStart, searchEnd, "\n" + this.getIndent(1));
        }
    };
    ClassPatcher.prototype.shouldUseIIFE = function () {
        var nonMethodPatchers = this.getNonMethodPatchers();
        if (this.hasAnyAssignments(nonMethodPatchers)) {
            return true;
        }
        // It's safe to use the more straightforward class init approach as long as
        // we know that a statement can be added after us and we're not in an
        // implicit return position.
        if (this.parent instanceof BlockPatcher) {
            var statements = this.parent.statements;
            if (!(this.parent.parent instanceof ProgramPatcher) && this === statements[statements.length - 1]) {
                return true;
            }
            return false;
        }
        return true;
    };
    ClassPatcher.prototype.getInitClassInsertPoint = function () {
        if (this.superclass) {
            return this.superclass.outerEnd;
        }
        if (this.nameAssignee) {
            return this.nameAssignee.outerEnd;
        }
        return this.firstToken().end;
    };
    /**
     * Find the statements in the class body that can't be converted to JS
     * methods. These will later be moved to the top of the class in a static
     * method.
     */
    ClassPatcher.prototype.getNonMethodPatchers = function () {
        var e_2, _a;
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        var nonMethodPatchers = [];
        var deleteStart = this.getInitClassInsertPoint();
        try {
            for (var _b = tslib_1.__values(this.body.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var patcher = _c.value;
                if (!this.isClassMethod(patcher)) {
                    nonMethodPatchers.push({
                        patcher: patcher,
                        deleteStart: deleteStart
                    });
                }
                deleteStart = patcher.outerEnd;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return nonMethodPatchers;
    };
    ClassPatcher.prototype.isClassMethod = function (patcher) {
        if (patcher instanceof ConstructorPatcher) {
            return true;
        }
        var node = patcher.node;
        if (this.isClassAssignment(node)) {
            // Bound static methods must be moved to initClass so they are properly
            // bound.
            if (node instanceof AssignOp && ['BoundFunction', 'BoundGeneratorFunction'].indexOf(node.expression.type) >= 0) {
                return false;
            }
            if (node.expression instanceof BaseFunction) {
                return true;
            }
        }
        return false;
    };
    ClassPatcher.prototype.isClassAssignment = function (node) {
        if (node instanceof ClassProtoAssignOp) {
            return true;
        }
        if (node instanceof AssignOp) {
            var assignee = node.assignee;
            if (assignee instanceof MemberAccessOp || assignee instanceof DynamicMemberAccessOp) {
                if (assignee.expression instanceof This) {
                    return true;
                }
                if (this.nameAssignee && this.nameAssignee instanceof IdentifierPatcher) {
                    var className = this.nameAssignee.node.data;
                    if (assignee.expression instanceof Identifier && assignee.expression.data === className) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    ClassPatcher.prototype.needsCustomConstructor = function () {
        var e_3, _a;
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        try {
            for (var _b = tslib_1.__values(this.body.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var patcher = _c.value;
                if (patcher instanceof ConstructorPatcher && !(patcher.expression instanceof FunctionPatcher)) {
                    return true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return false;
    };
    /**
     * Constructors in CoffeeScript can be arbitrary expressions, so if that's the
     * case, we need to save that expression so we can compute it at class init
     * time and call it from the real constructor. If this is such a case, pick a
     * name for the constructor, get the code to evaluate the constructor
     * function, and overwrite the constructor with a function that forwards to
     * that constructor function.
     */
    ClassPatcher.prototype.extractCustomConstructorInfo = function () {
        var e_4, _a;
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        try {
            for (var _b = tslib_1.__values(this.body.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var patcher = _c.value;
                if (patcher instanceof ConstructorPatcher) {
                    if (!(patcher.expression instanceof FunctionPatcher)) {
                        var expressionCode = this.slice(patcher.expression.contentStart, patcher.expression.contentEnd);
                        var ctorName = void 0;
                        if (this.nameAssignee instanceof IdentifierPatcher) {
                            var className = this.nameAssignee.node.data;
                            ctorName = this.claimFreeBinding("create" + className);
                        }
                        else {
                            ctorName = this.claimFreeBinding('createInstance');
                        }
                        var bodyIndent = this.getBodyIndent();
                        var indentString = this.getProgramIndentString();
                        this.overwrite(patcher.expression.outerStart, patcher.expression.outerEnd, "->\n" + bodyIndent + indentString + "return " + ctorName + ".apply(this, arguments)");
                        return {
                            ctorName: ctorName,
                            expressionCode: expressionCode
                        };
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return null;
    };
    /**
     * Create the initClass static method by moving nodes from the class body into
     * the static method and indenting them one level.
     *
     * Also return an array of variables that were assigned so that later code can
     * declare them outside the class body to make them accessible within the
     * class.
     */
    ClassPatcher.prototype.generateInitClassMethod = function (nonMethodPatchers, customConstructorInfo, insertPoint) {
        var e_5, _a;
        var bodyIndent = this.getBodyIndent();
        var indentString = this.getProgramIndentString();
        this.insert(insertPoint, "\n" + bodyIndent + "@initClass: ->");
        var assignmentNames = [];
        try {
            for (var nonMethodPatchers_1 = tslib_1.__values(nonMethodPatchers), nonMethodPatchers_1_1 = nonMethodPatchers_1.next(); !nonMethodPatchers_1_1.done; nonMethodPatchers_1_1 = nonMethodPatchers_1.next()) {
                var _b = nonMethodPatchers_1_1.value, patcher = _b.patcher, deleteStart = _b.deleteStart;
                var assignmentName = this.getAssignmentName(patcher);
                if (assignmentName) {
                    assignmentNames.push(assignmentName);
                }
                var statementCode = this.slice(deleteStart, patcher.outerEnd);
                statementCode = statementCode.replace(/\n/g, "\n" + indentString);
                this.insert(insertPoint, statementCode);
                this.remove(deleteStart, patcher.outerEnd);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (nonMethodPatchers_1_1 && !nonMethodPatchers_1_1.done && (_a = nonMethodPatchers_1.return)) _a.call(nonMethodPatchers_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (customConstructorInfo) {
            var ctorName = customConstructorInfo.ctorName, expressionCode = customConstructorInfo.expressionCode;
            this.insert(insertPoint, "\n" + bodyIndent + indentString + ctorName + " = " + expressionCode);
            assignmentNames.push(ctorName);
        }
        this.insert(insertPoint, "\n" + bodyIndent + indentString + "return");
        return assignmentNames;
    };
    ClassPatcher.prototype.hasAnyAssignments = function (nonMethodPatchers) {
        var e_6, _a;
        try {
            for (var nonMethodPatchers_2 = tslib_1.__values(nonMethodPatchers), nonMethodPatchers_2_1 = nonMethodPatchers_2.next(); !nonMethodPatchers_2_1.done; nonMethodPatchers_2_1 = nonMethodPatchers_2.next()) {
                var patcher = nonMethodPatchers_2_1.value.patcher;
                if (this.getAssignmentName(patcher)) {
                    return true;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (nonMethodPatchers_2_1 && !nonMethodPatchers_2_1.done && (_a = nonMethodPatchers_2.return)) _a.call(nonMethodPatchers_2);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return false;
    };
    ClassPatcher.prototype.getBodyIndent = function () {
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        var bodyNodeIndent = this.body.getIndent();
        // If the body is inline, generate code at one indent level up instead of
        // at the class indentation level.
        if (bodyNodeIndent === this.getIndent()) {
            return this.getIndent(1);
        }
        else {
            return bodyNodeIndent;
        }
    };
    /**
     * Determine the variable assigned in the given statement, if any, since any
     * assigned variables need to be declared externally so they are available
     * within the class body. Note that this is incomplete at the moment and only
     * covers the common case of a single variable being defined.
     */
    ClassPatcher.prototype.getAssignmentName = function (statementPatcher) {
        if (statementPatcher.node instanceof AssignOp && statementPatcher.node.assignee instanceof Identifier) {
            return statementPatcher.node.assignee.data;
        }
        if (statementPatcher instanceof ClassPatcher && statementPatcher.nameAssignee instanceof IdentifierPatcher) {
            return statementPatcher.nameAssignee.node.data;
        }
        return null;
    };
    return ClassPatcher;
}(NodePatcher));
export default ClassPatcher;
