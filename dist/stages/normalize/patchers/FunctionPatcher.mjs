import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import { Constructor } from 'decaffeinate-parser/dist/nodes';
import canPatchAssigneeToJavaScript from '../../../utils/canPatchAssigneeToJavaScript';
import getAssigneeBindings from '../../../utils/getAssigneeBindings';
import normalizeListItem from '../../../utils/normalizeListItem';
import notNull from '../../../utils/notNull';
import stripSharedIndent from '../../../utils/stripSharedIndent';
import NodePatcher from './../../../patchers/NodePatcher';
import ArrayInitialiserPatcher from './ArrayInitialiserPatcher';
import DefaultParamPatcher from './DefaultParamPatcher';
import ExpansionPatcher from './ExpansionPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import RestPatcher from './SpreadPatcher';
var FunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(FunctionPatcher, _super);
    function FunctionPatcher(patcherContext, parameters, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this.parameters = parameters;
        _this.body = body;
        return _this;
    }
    FunctionPatcher.prototype.patchAsExpression = function () {
        var _this = this;
        var e_1, _a, e_2, _b;
        // Make sure there is at least one character of whitespace between the ->
        // and the body, since otherwise the main stage can run into subtle
        // magic-string issues later.
        if (this.body && !this.slice(this.body.contentStart - 1, this.body.contentStart).match(/\s/)) {
            this.insert(this.body.contentStart, ' ');
        }
        var neededExplicitBindings = [];
        var firstRestParamIndex = this.getFirstRestParamIndex();
        var assignments = [];
        try {
            for (var _c = tslib_1.__values(this.parameters.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = tslib_1.__read(_d.value, 2), i = _e[0], parameter = _e[1];
                if (firstRestParamIndex === -1 || i < firstRestParamIndex) {
                    var _f = this.patchParameterAndGetAssignments(parameter), newAssignments = _f.newAssignments, newBindings = _f.newBindings;
                    assignments.push.apply(assignments, tslib_1.__spread(newAssignments));
                    neededExplicitBindings.push.apply(neededExplicitBindings, tslib_1.__spread(newBindings));
                }
                else {
                    parameter.patch();
                }
                normalizeListItem(this, parameter, this.parameters[i + 1]);
                if (i === this.parameters.length - 1) {
                    // Parameter lists allow trailing semicolons but not trailing commas, so
                    // just get rid of it as a special case if it's there.
                    var nextToken = parameter.nextSemanticToken();
                    if (nextToken && nextToken.type === SourceType.SEMICOLON) {
                        this.remove(nextToken.start, nextToken.end);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (firstRestParamIndex !== -1) {
            if (firstRestParamIndex === this.parameters.length - 1 &&
                this.parameters[this.parameters.length - 1] instanceof ExpansionPatcher) {
                // Just get rid of the ... at the end if it's there.
                if (firstRestParamIndex === 0) {
                    this.remove(this.parameters[0].contentStart, this.parameters[0].contentEnd);
                }
                else {
                    this.remove(this.parameters[firstRestParamIndex - 1].outerEnd, this.parameters[this.parameters.length - 1].outerEnd);
                }
            }
            else {
                // Move expansion or intermediate rest params into an array destructure
                // on the first line.
                var candidateName = firstRestParamIndex === 0 ? 'args' : 'rest';
                var paramName = this.claimFreeBinding(candidateName);
                var restParamsStart = this.parameters[firstRestParamIndex].contentStart;
                var restParamsEnd = this.parameters[this.parameters.length - 1].contentEnd;
                var paramCode = this.slice(restParamsStart, restParamsEnd);
                paramCode = this.fixGeneratedAssigneeWhitespace(paramCode);
                this.overwrite(restParamsStart, restParamsEnd, paramName + "...");
                assignments.push("[" + paramCode + "] = " + paramName);
                for (var i = firstRestParamIndex; i < this.parameters.length; i++) {
                    neededExplicitBindings.push.apply(neededExplicitBindings, tslib_1.__spread(getAssigneeBindings(this.parameters[i].node)));
                }
            }
        }
        var uniqueExplicitBindings = tslib_1.__spread(new Set(neededExplicitBindings));
        // To avoid ugly code, limit the explicit `var` to cases where we're
        // actually shadowing an outer variable.
        uniqueExplicitBindings = uniqueExplicitBindings.filter(function (name) {
            return notNull(_this.parent)
                .getScope()
                .hasBinding(name);
        });
        if (uniqueExplicitBindings.length > 0) {
            assignments.unshift("`var " + uniqueExplicitBindings.join(', ') + ";`");
        }
        // If there were assignments from parameters insert them
        if (this.body) {
            try {
                // before the actual body
                for (var assignments_1 = tslib_1.__values(assignments), assignments_1_1 = assignments_1.next(); !assignments_1_1.done; assignments_1_1 = assignments_1.next()) {
                    var assignment = assignments_1_1.value;
                    this.body.insertLineBefore(assignment);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (assignments_1_1 && !assignments_1_1.done && (_b = assignments_1.return)) _b.call(assignments_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.body.patch();
        }
        else if (assignments.length) {
            // as the body if there is no body
            // Add a return statement for non-constructor methods without body to avoid bad implicit return
            if (!(this.context.getParent(this.node) instanceof Constructor)) {
                assignments.push('return');
            }
            var indent = this.getIndent(1);
            var text = assignments.join("\n" + indent);
            this.insert(this.contentEnd, "\n" + indent + text);
        }
    };
    /**
     * Produce assignments to put at the top of the function for this parameter.
     * Also declare any variables that are assigned and need to be
     * function-scoped, so the outer code can insert `var` declarations.
     */
    FunctionPatcher.prototype.patchParameterAndGetAssignments = function (parameter) {
        var _this = this;
        var thisAssignments = [];
        var defaultParamAssignments = [];
        var newBindings = [];
        // To avoid knowledge of all the details how assignments can be nested in nodes,
        // we add a callback to the function node before patching the parameters and remove it afterwards.
        // This is detected and used by the MemberAccessOpPatcher to claim a free binding for this parameter
        // (from the functions scope, not the body's scope)
        this.addThisAssignmentAtScopeHeader = function (memberName) {
            var varName = _this.claimFreeBinding(memberName);
            thisAssignments.push("@" + memberName + " = " + varName);
            _this.log("Replacing parameter @" + memberName + " with " + varName);
            return varName;
        };
        this.addDefaultParamAssignmentAtScopeHeader = function (assigneeCode, initCode, assigneeNode) {
            if (assigneeNode.type === 'Identifier' || assigneeNode.type === 'MemberAccessOp') {
                // Wrap in parens to avoid precedence issues for inline statements. The
                // parens will be removed later in normal situations.
                defaultParamAssignments.push("(" + assigneeCode + " ?= " + initCode + ")");
                return assigneeCode;
            }
            else {
                // Handle cases like `({a}={}) ->`, where we need to check for default
                // with the param as a normal variable, then include the destructure.
                assigneeCode = _this.fixGeneratedAssigneeWhitespace(assigneeCode);
                var paramName = _this.claimFreeBinding('param');
                defaultParamAssignments.push("(" + paramName + " ?= " + initCode + ")");
                defaultParamAssignments.push(assigneeCode + " = " + paramName);
                newBindings.push.apply(newBindings, tslib_1.__spread(getAssigneeBindings(assigneeNode)));
                return paramName;
            }
        };
        parameter.patch();
        delete this.addDefaultParamAssignmentAtScopeHeader;
        delete this.addThisAssignmentAtScopeHeader;
        return {
            newAssignments: tslib_1.__spread(defaultParamAssignments, thisAssignments),
            newBindings: newBindings
        };
    };
    /**
     * If the assignee in a generated code is multiline and we're not careful, we
     * might end up placing code before the function body indentation level, which
     * will make the CoffeeScript parser complain later. To fix, adjust the
     * indentation to the desired level. Note that this potentially could add
     * whitespace to multiline strings, but all types of multiline strings in
     * CoffeeScript strip common leading whitespace, so the resulting code is
     * still the same.
     */
    FunctionPatcher.prototype.fixGeneratedAssigneeWhitespace = function (assigneeCode) {
        var firstNewlineIndex = assigneeCode.indexOf('\n');
        if (firstNewlineIndex < 0) {
            return assigneeCode;
        }
        var indent = this.body ? this.body.getIndent(0) : this.getIndent(1);
        var firstLine = assigneeCode.substr(0, firstNewlineIndex);
        var otherLines = assigneeCode.substr(firstNewlineIndex + 1);
        otherLines = stripSharedIndent(otherLines);
        otherLines = otherLines.replace(/\n/g, "\n" + indent);
        return firstLine + "\n" + indent + otherLines;
    };
    /**
     * Get the index of the first parameter that will be included in the rest
     * parameters (if any). All parameters from this point forward will be moved
     * to an array destructure at the start of the function.
     *
     * The main stage handles the fully general case for array destructuring,
     * including things like nested expansions and defaults, so anything requiring
     * that level of generality should be extracted to an array destructure.
     * Simpler cases that only use param defaults and this-assignment are better
     * off being handled as normal parameters if we can get away with it. Also,
     * any array destructure in a parameter needs to be extracted so that we can
     * properly wrap it in Array.from.
     */
    FunctionPatcher.prototype.getFirstRestParamIndex = function () {
        var _this = this;
        // If there is any expansion param, all params need to be pulled into the
        // array destructure, so set index 0. For example, in the param list
        // `(a, ..., b, c)`, `b` is set to the second-to-last arg, which might be the
        // same as `a`, so all args need to be included in the destructure.
        if (this.parameters.some(function (param, i) { return i < _this.parameters.length - 1 && param instanceof ExpansionPatcher; })) {
            return 0;
        }
        for (var i = 0; i < this.parameters.length; i++) {
            var parameter = this.parameters[i];
            // We have separate code to handle relatively simple default params that
            // results in better code, so use that.
            if (parameter instanceof DefaultParamPatcher &&
                canPatchAssigneeToJavaScript(parameter.param.node, this.options)) {
                continue;
            }
            // A rest assignment at the very end can be converted correctly as long as
            // it does not expand the rest array in a complicated way.
            if (i === this.parameters.length - 1 &&
                parameter instanceof RestPatcher &&
                parameter.expression instanceof IdentifierPatcher) {
                continue;
            }
            if ((!this.options.useCS2 && parameter instanceof ArrayInitialiserPatcher) ||
                !canPatchAssigneeToJavaScript(parameter.node, this.options)) {
                return i;
            }
        }
        return -1;
    };
    return FunctionPatcher;
}(NodePatcher));
export default FunctionPatcher;
