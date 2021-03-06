import * as tslib_1 from "tslib";
import { traverse } from 'decaffeinate-parser';
import { Float, Int, Number, UnaryNegateOp } from 'decaffeinate-parser/dist/nodes';
import { REMOVE_ARRAY_FROM, SIMPLIFY_DYNAMIC_RANGE_LOOPS } from '../../../suggestions';
import blockStartsWithObjectInitialiser from '../../../utils/blockStartsWithObjectInitialiser';
import countVariableUsages from '../../../utils/countVariableUsages';
import notNull from '../../../utils/notNull';
import Scope from '../../../utils/Scope';
import ArrayInitialiserPatcher from './ArrayInitialiserPatcher';
import BlockPatcher from './BlockPatcher';
import ForPatcher from './ForPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import RangePatcher from './RangePatcher';
import UnaryMathOpPatcher from './UnaryMathOpPatcher';
var UP = 'UP';
var DOWN = 'DOWN';
var UNKNOWN = 'UNKNOWN';
/**
 * Patcher for CS for...in. We also subclass this patcher for CS for...from, since the behavior is
 * nearly the same.
 */
var ForInPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForInPatcher, _super);
    function ForInPatcher(patcherContext, keyAssignee, valAssignee, target, step, filter, body) {
        var _this = _super.call(this, patcherContext, keyAssignee, valAssignee, target, filter, body) || this;
        _this._ascReference = null;
        _this._endCode = null;
        _this._endReference = null;
        _this._internalIndexBinding = null;
        _this._startCode = null;
        _this._startReference = null;
        _this._valueBinding = null;
        _this._step = null;
        _this.step = step;
        return _this;
    }
    ForInPatcher.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        if (this.step) {
            this.step.setRequiresExpression();
        }
    };
    ForInPatcher.prototype.patchAsExpression = function () {
        // When possible, we want to transform the loop into a use of `map`, but
        // there are some cases when we can't. Use the more general approach of a
        // statement loop within an IIFE if that's the case.
        if (!this.canPatchAsMapExpression()) {
            return _super.prototype.patchAsExpression.call(this);
        }
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        this.removeThenToken();
        var assigneeCode = this.getValueBinding();
        if (this.keyAssignee) {
            assigneeCode += ", " + this.getIndexBinding();
        }
        // for a in b when c d  ->  b when c d
        // ("then" was removed above).
        this.remove(this.contentStart, this.target.outerStart);
        if (this.shouldWrapMapExpressionTargetInArrayFrom()) {
            this.insert(this.target.contentStart, 'Array.from(');
        }
        this.target.patch();
        if (this.shouldWrapMapExpressionTargetInArrayFrom()) {
            this.insert(this.target.contentEnd, ')');
        }
        var mapInsertPoint;
        if (this.filter !== null) {
            // b when c d  ->  b.filter((a) => c d
            this.overwrite(this.target.outerEnd, this.filter.outerStart, ".filter((" + assigneeCode + ") => ");
            this.filter.patch();
            // b.filter((a) => c d  ->  b.filter((a) => c).map((a) => d
            this.insert(this.filter.outerEnd, ")");
            mapInsertPoint = this.filter.outerEnd;
        }
        else {
            mapInsertPoint = this.target.outerEnd;
        }
        if (this.isMapBodyNoOp()) {
            this.remove(mapInsertPoint, this.body.outerEnd);
        }
        else {
            // b d  ->  b.map((a) => d
            this.insert(mapInsertPoint, ".map((" + assigneeCode + ") =>");
            this.patchBodyForExpressionLoop();
            // b.filter((a) => c).map((a) => d  ->  b.filter((a) => c).map((a) => d)
            this.insert(this.body.outerEnd, ')');
        }
    };
    /**
     * In a case like `x = for a in b when c then a`, we should skip the `map`
     * altogether and just use a `filter`.
     */
    ForInPatcher.prototype.isMapBodyNoOp = function () {
        if (this.valAssignee instanceof IdentifierPatcher) {
            var varName = this.valAssignee.node.data;
            if (this.body instanceof BlockPatcher && this.body.statements.length === 1) {
                var statement = this.body.statements[0];
                if (statement instanceof IdentifierPatcher && statement.node.data === varName) {
                    return true;
                }
            }
        }
        return false;
    };
    ForInPatcher.prototype.patchBodyForExpressionLoop = function () {
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        this.body.setRequiresExpression();
        var bodyNeedsParens = blockStartsWithObjectInitialiser(this.body) && !this.body.isSurroundedByParentheses();
        if (bodyNeedsParens) {
            var insertPoint = this.filter ? this.filter.outerEnd : this.target.outerEnd;
            // Handle both inline and multiline cases by either skipping the existing
            // space or adding one.
            if (this.slice(insertPoint, insertPoint + 1) === ' ') {
                this.body.insert(insertPoint + 1, '(');
            }
            else {
                this.body.insert(insertPoint, ' (');
            }
        }
        this.body.patch();
        if (bodyNeedsParens) {
            this.body.insert(this.body.outerEnd, ')');
        }
    };
    ForInPatcher.prototype.canPatchAsMapExpression = function () {
        if (!this.canAssigneesBecomeParams()) {
            return false;
        }
        if (this.step !== null) {
            return false;
        }
        if (this.body === null || !this.body.prefersToPatchAsExpression()) {
            return false;
        }
        // The high-level approach of a.filter(...).map((x, i) => ...) doesn't work,
        // since the filter will change the indexes, so we specifically exclude that
        // case.
        if (this.filter !== null && this.keyAssignee !== null) {
            return false;
        }
        if (this.filter !== null && !this.filter.isPure()) {
            return false;
        }
        if (this.body.containsYield() || (this.filter && this.filter.containsYield())) {
            return false;
        }
        if (this.body.containsAwait() || (this.filter && this.filter.containsAwait())) {
            return false;
        }
        return true;
    };
    ForInPatcher.prototype.canAssigneesBecomeParams = function () {
        var e_1, _a;
        var assignees = [this.valAssignee, this.keyAssignee].filter(function (assignee) { return assignee; });
        try {
            for (var assignees_1 = tslib_1.__values(assignees), assignees_1_1 = assignees_1.next(); !assignees_1_1.done; assignees_1_1 = assignees_1.next()) {
                var assignee = assignees_1_1.value;
                if (!(assignee instanceof IdentifierPatcher)) {
                    return false;
                }
                var name = assignee.node.data;
                // Find the enclosing function or program node for the binding so we can
                // find all usages of this variable.
                var assignmentNode = this.getScope().getBinding(name);
                if (!assignmentNode) {
                    throw this.error('Expected loop assignee to have a binding in its scope.');
                }
                var containerNode = this.context.getScope(assignmentNode).containerNode;
                // If the number of usages in the enclosing function is more than the
                // number of usages in the loop, then there must be some external usages,
                // so we can't safely change this to a parameter.
                if (countVariableUsages(containerNode, name) !== countVariableUsages(this.node, name)) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (assignees_1_1 && !assignees_1_1.done && (_a = assignees_1.return)) _a.call(assignees_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    ForInPatcher.prototype.willPatchAsIIFE = function () {
        return this.willPatchAsExpression() && !this.canPatchAsMapExpression();
    };
    ForInPatcher.prototype.patchAsStatement = function () {
        if (this.body && !this.body.inline()) {
            this.body.setIndent(this.getLoopBodyIndent());
        }
        if (this.shouldPatchAsForOf()) {
            this.getFilterCode();
            this.patchForOfLoop();
        }
        else {
            // Run for the side-effect of patching and slicing the value.
            this.getIndexBinding();
            this.getValueBinding();
            this.getFilterCode();
            this.patchForLoopHeader();
            this.patchForLoopBody();
        }
    };
    /**
     * As long as we aren't using the loop index or a step, we prefer to use JS
     * for-of loops.
     *
     * Overridden by CS for...from to always patch as JS for...of.
     */
    ForInPatcher.prototype.shouldPatchAsForOf = function () {
        return !this.shouldPatchAsInitTestUpdateLoop() && this.step === null && this.keyAssignee === null;
    };
    ForInPatcher.prototype.getValueBinding = function () {
        if (!this._valueBinding) {
            if (this.valAssignee) {
                this._valueBinding = this.valAssignee.patchAndGetCode();
            }
            else if (this.shouldPatchAsInitTestUpdateLoop()) {
                this._valueBinding = this.claimFreeBinding(this.indexBindingCandidates());
            }
            else {
                this._valueBinding = this.claimFreeBinding('value');
            }
        }
        return this._valueBinding;
    };
    /**
     * @protected
     */
    ForInPatcher.prototype.computeIndexBinding = function () {
        if (this.shouldPatchAsInitTestUpdateLoop()) {
            return this.getValueBinding();
        }
        else {
            return _super.prototype.computeIndexBinding.call(this);
        }
    };
    ForInPatcher.prototype.patchForLoopHeader = function () {
        if (this.requiresExtractingTarget()) {
            this.insert(this.innerStart, this.getTargetReference() + " = " + this.getTargetCode() + "\n" + this.getLoopIndent());
        }
        var firstHeaderPatcher = this.valAssignee || this.target;
        var lastHeaderPatcher = this.getLastHeaderPatcher();
        this.overwrite(firstHeaderPatcher.outerStart, lastHeaderPatcher.outerEnd, "(" + this.getInitCode() + "; " + this.getTestCode() + "; " + this.getUpdateCode() + ") {");
    };
    ForInPatcher.prototype.getLastHeaderPatcher = function () {
        var e_2, _a;
        var resultPatcher = null;
        try {
            for (var _b = tslib_1.__values([this.step, this.filter, this.target]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var patcher = _c.value;
                if (patcher && (resultPatcher === null || patcher.contentEnd > resultPatcher.contentEnd)) {
                    resultPatcher = patcher;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return notNull(resultPatcher);
    };
    ForInPatcher.prototype.patchForLoopBody = function () {
        this.removeThenToken();
        this.patchPossibleNewlineAfterLoopHeader(this.getLastHeaderPatcher().outerEnd);
        if (this.body && !this.shouldPatchAsInitTestUpdateLoop() && this.valAssignee) {
            var valueAssignment = this.getValueBinding() + " = " + this.getTargetReference() + "[" + this.getIndexBinding() + "]";
            if (this.valAssignee.statementNeedsParens()) {
                valueAssignment = "(" + valueAssignment + ")";
            }
            this.body.insertLineBefore(valueAssignment, this.getOuterLoopBodyIndent());
        }
        this.patchBodyAndFilter();
    };
    /**
     * Special case for patching for-of case for when the loop is simple enough
     * that for-of works. Note that for-of has slightly different semantics
     * because it uses the iterator protocol rather than CoffeeScript's notion of
     * an array-like object, so this transform sacrifices 100% correctness in
     * favor of cleaner code.
     */
    ForInPatcher.prototype.patchForOfLoop = function () {
        // Save the filter code and remove if it it's there.
        this.getFilterCode();
        if (this.filter) {
            this.remove(this.target.outerEnd, this.filter.outerEnd);
        }
        if (this.valAssignee) {
            var relationToken = this.getRelationToken();
            this.valAssignee.patch();
            this.insert(this.valAssignee.outerStart, '(');
            this.overwrite(relationToken.start, relationToken.end, 'of');
        }
        else {
            // Handle loops like `for [0..2]`
            var valueBinding = this.getValueBinding();
            this.insert(this.target.outerStart, "(let " + valueBinding + " of ");
        }
        if (this.shouldWrapForOfStatementTargetInArrayFrom()) {
            this.insert(this.target.outerStart, 'Array.from(');
        }
        this.target.patch();
        if (this.shouldWrapForOfStatementTargetInArrayFrom()) {
            this.insert(this.target.outerEnd, ')');
        }
        this.insert(this.target.outerEnd, ') {');
        this.removeThenToken();
        this.patchBodyAndFilter();
    };
    ForInPatcher.prototype.getLoopHeaderEnd = function () {
        return Math.max(this.step ? this.step.outerEnd : -1, _super.prototype.getLoopHeaderEnd.call(this));
    };
    ForInPatcher.prototype.requiresExtractingTarget = function () {
        return !this.shouldPatchAsInitTestUpdateLoop() && !this.target.isRepeatable() && !this.shouldPatchAsForOf();
    };
    ForInPatcher.prototype.targetBindingCandidate = function () {
        return 'iterable';
    };
    /**
     * Determine the name that will be used as the source of truth for the index
     * during loop iteration. If the code modifies the user-specified index during
     * the loop body, we need to choose a different variable name and make the
     * loop code a little more complex.
     */
    ForInPatcher.prototype.getInternalIndexBinding = function () {
        if (!this._internalIndexBinding) {
            if (this.needsUniqueIndexName()) {
                this._internalIndexBinding = this.claimFreeBinding(this.indexBindingCandidates());
            }
            else {
                this._internalIndexBinding = this.getIndexBinding();
            }
        }
        return this._internalIndexBinding;
    };
    ForInPatcher.prototype.needsUniqueIndexName = function () {
        // Determining whether this.i is ever modified is hard, so we just assume
        // it might be modified.
        if (this.isThisAssignIndexBinding()) {
            return true;
        }
        var userIndex = this.getIndexBinding();
        // We need to extract this to a variable if there's an assignment within the
        // loop, but assignments outside the loop are fine, so we make a fake scope
        // that only looks at assignments within the loop body. But assignments
        // within closures could also happen temporally in the loop, so bail out if
        // we see one of those.
        if (this.getScope().hasInnerClosureModification(userIndex)) {
            return true;
        }
        var fakeScope = new Scope(this.node, null);
        traverse(this.node, function (child) {
            fakeScope.processNode(child);
        });
        return fakeScope.hasModificationAfterDeclaration(userIndex);
    };
    ForInPatcher.prototype.getInitCode = function () {
        var step = this.getStep();
        if (this.shouldPatchAsInitTestUpdateLoop()) {
            var assignments = [];
            if (this.shouldExtractStart()) {
                assignments.push(this.getStartReference() + " = " + this.getStartCode());
            }
            assignments.push(this.getInternalIndexBinding() + " = " + this.getStartReference());
            if (this.getInternalIndexBinding() !== this.getIndexBinding()) {
                assignments.push(this.getIndexBinding() + " = " + this.getInternalIndexBinding());
            }
            if (!this.isEndFixed()) {
                assignments.push(this.getEndReference() + " = " + this.getEndCode());
            }
            if (!step.isLiteral) {
                assignments.push(step.update + " = " + step.init);
            }
            if (this.getIndexDirection() === UNKNOWN) {
                assignments.push(this.getAscReference() + " = " + this.getAscCode());
            }
            return assignments.join(', ');
        }
        else {
            var direction = this.getIndexDirection();
            var descInit = this.getTargetReference() + ".length - 1";
            var assignments = [];
            if (!step.isLiteral) {
                assignments.push(step.update + " = " + step.init);
            }
            if (direction === DOWN) {
                assignments.push(this.getInternalIndexBinding() + " = " + descInit);
            }
            else if (direction === UP) {
                assignments.push(this.getInternalIndexBinding() + " = 0");
            }
            else {
                assignments.push(this.getAscReference() + " = " + this.getAscCode());
                assignments.push(this.getInternalIndexBinding() + " = " + this.getAscReference() + " ? 0 : " + descInit);
            }
            if (this.getInternalIndexBinding() !== this.getIndexBinding()) {
                assignments.push(this.getIndexBinding() + " = " + this.getInternalIndexBinding());
            }
            return assignments.join(', ');
        }
    };
    ForInPatcher.prototype.getTestCode = function () {
        var direction = this.getIndexDirection();
        if (this.shouldPatchAsInitTestUpdateLoop()) {
            if (!(this.target instanceof RangePatcher)) {
                throw this.error('Expected range patcher for target.');
            }
            var inclusive = this.target.isInclusive();
            var gt = inclusive ? '>=' : '>';
            var lt = inclusive ? '<=' : '<';
            var index = this.getInternalIndexBinding();
            var end = this.getEndReference();
            if (direction === DOWN) {
                return index + " " + gt + " " + end;
            }
            else if (direction === UP) {
                return index + " " + lt + " " + end;
            }
            else {
                return this.getAscReference() + " ? " + index + " " + lt + " " + end + " : " + index + " " + gt + " " + end;
            }
        }
        else {
            var downComparison = this.getInternalIndexBinding() + " >= 0";
            var upComparison = this.getInternalIndexBinding() + " < " + this.getTargetReference() + ".length";
            if (direction === DOWN) {
                return downComparison;
            }
            else if (direction === UP) {
                return upComparison;
            }
            else {
                return this.getAscReference() + " ? " + upComparison + " : " + downComparison;
            }
        }
    };
    ForInPatcher.prototype.getUpdateCode = function () {
        var assignments = [this.getUpdateAssignment()];
        if (this.getInternalIndexBinding() !== this.getIndexBinding()) {
            assignments.push(this.getIndexBinding() + " = " + this.getInternalIndexBinding());
        }
        return assignments.join(', ');
    };
    ForInPatcher.prototype.getUpdateAssignment = function () {
        var index = this.getInternalIndexBinding();
        var step = this.getStep();
        // If step is a variable, we always just add it, since its value determines
        // whether we go forward or backward.
        if (step.number === null) {
            return index + " += " + step.update;
        }
        var direction = this.getIndexDirection();
        var incCode = step.number === 1 ? '++' : " += " + step.update;
        var decCode = step.number === 1 ? '--' : " -= " + step.update;
        if (direction === DOWN) {
            return "" + index + decCode;
        }
        else if (direction === UP) {
            return "" + index + incCode;
        }
        else {
            return this.getAscReference() + " ? " + index + incCode + " : " + index + decCode;
        }
    };
    ForInPatcher.prototype.getStartReference = function () {
        if (!this.shouldExtractStart()) {
            return this.getStartCode();
        }
        if (!this._startReference) {
            this._startReference = this.claimFreeBinding('start');
        }
        return this._startReference;
    };
    ForInPatcher.prototype.isStartFixed = function () {
        if (!(this.target instanceof RangePatcher)) {
            throw this.error('Expected target to be a range.');
        }
        return this.target.left.node.type === 'Int' || this.target.left.node.type === 'Float';
    };
    /**
     * In many cases, we can just initialize the index to the start without an
     * intermediate variable. We only need to save a variable if it's not
     * repeatable and we need to use it to compute the direction.
     */
    ForInPatcher.prototype.shouldExtractStart = function () {
        if (!(this.target instanceof RangePatcher)) {
            throw this.error('Expected target to be a range.');
        }
        return !this.target.left.isRepeatable() && this.getIndexDirection() === UNKNOWN && this.getStep().isVirtual;
    };
    ForInPatcher.prototype.getStartCode = function () {
        if (!(this.target instanceof RangePatcher)) {
            throw this.error('Expected target to be a range.');
        }
        if (!this._startCode) {
            this._startCode = this.target.left.patchAndGetCode();
        }
        return this._startCode;
    };
    ForInPatcher.prototype.getEndReference = function () {
        if (this.isEndFixed()) {
            return this.getEndCode();
        }
        if (!this._endReference) {
            this._endReference = this.claimFreeBinding('end');
        }
        return this._endReference;
    };
    ForInPatcher.prototype.isEndFixed = function () {
        if (!(this.target instanceof RangePatcher)) {
            throw this.error('Expected target to be a range.');
        }
        return this.target.right.node.type === 'Int' || this.target.right.node.type === 'Float';
    };
    ForInPatcher.prototype.getEndCode = function () {
        if (!(this.target instanceof RangePatcher)) {
            throw this.error('Expected target to be a range.');
        }
        if (!this._endCode) {
            this._endCode = this.target.right.patchAndGetCode();
        }
        return this._endCode;
    };
    ForInPatcher.prototype.getAscReference = function () {
        if (!this._ascReference) {
            this._ascReference = this.claimFreeBinding('asc');
        }
        return this._ascReference;
    };
    /**
     * Return the code snippet to determine whether the loop counts up or down, in
     * the event that it needs to be computed at runtime.
     */
    ForInPatcher.prototype.getAscCode = function () {
        var step = this.getStep();
        if (step.isVirtual) {
            if (!this.shouldPatchAsInitTestUpdateLoop()) {
                throw new Error('Should not be getting asc code when the target is not a range and ' + 'the step is unspecified.');
            }
            return this.getStartReference() + " <= " + this.getEndReference();
        }
        else {
            return step.update + " > 0";
        }
    };
    ForInPatcher.prototype.getStep = function () {
        if (this._step === null) {
            this._step = new Step(this.step);
        }
        return this._step;
    };
    /**
     * Determine if we should patch in a way where the loop variable is updated in
     * a C-style for loop. This happens when looping over a range (e.g.
     * `for i of [a...b]`, and in fact we must patch in the style when looping
     * over ranges since CoffeeScript code might depend on the variable being one
     * past the end after the loop runs to completion.
     *
     * For more complicated cases, we need to dynamically compute what direction
     * to iterate in.
     */
    ForInPatcher.prototype.shouldPatchAsInitTestUpdateLoop = function () {
        return this.target instanceof RangePatcher;
    };
    ForInPatcher.prototype.shouldWrapMapExpressionTargetInArrayFrom = function () {
        var shouldWrap = !this.options.looseForExpressions && !this.isTargetAlreadyArray();
        if (shouldWrap) {
            this.addSuggestion(REMOVE_ARRAY_FROM);
        }
        return shouldWrap;
    };
    /**
     * Overridden by ForFromPatcher to always return false.
     */
    ForInPatcher.prototype.shouldWrapForOfStatementTargetInArrayFrom = function () {
        var shouldWrap = !this.options.looseForOf && !this.isTargetAlreadyArray();
        if (shouldWrap) {
            this.addSuggestion(REMOVE_ARRAY_FROM);
        }
        return shouldWrap;
    };
    /**
     * Determine if the loop target is statically known to be an array. If so,
     * then there's no need to use Array.from to convert from an array-like object
     * to an array.
     */
    ForInPatcher.prototype.isTargetAlreadyArray = function () {
        return this.target instanceof RangePatcher || this.target instanceof ArrayInitialiserPatcher;
    };
    /**
     * Determines whether this `for…in` loop has an explicit `by` step.
     */
    ForInPatcher.prototype.hasExplicitStep = function () {
        return !this.getStep().isVirtual;
    };
    /**
     * Determines the direction of index iteration, either UP, DOWN, or UNKNOWN.
     * UNKNOWN means that we cannot statically determine the direction.
     */
    ForInPatcher.prototype.getIndexDirection = function () {
        var step = this.getStep();
        if (this.shouldPatchAsInitTestUpdateLoop()) {
            if (!(this.target instanceof RangePatcher)) {
                throw this.error('Expected target to be a range.');
            }
            if (!step.isVirtual && step.isLiteral) {
                return step.negated ? DOWN : UP;
            }
            else if (this.hasFixedRange()) {
                if (!(this.target.left.node instanceof Number) || !(this.target.right.node instanceof Number)) {
                    throw this.error('Expected numbers for the left and right of the range.');
                }
                var left = this.target.left.node.data;
                var right = this.target.right.node.data;
                return left > right ? DOWN : UP;
            }
            else {
                this.addSuggestion(SIMPLIFY_DYNAMIC_RANGE_LOOPS);
                return UNKNOWN;
            }
        }
        else {
            if (step.isLiteral) {
                return step.negated ? DOWN : UP;
            }
            else {
                this.addSuggestion(SIMPLIFY_DYNAMIC_RANGE_LOOPS);
                return UNKNOWN;
            }
        }
    };
    /**
     * Are we looping over a range with fixed (static) start/end?
     *
     * @example
     *
     *   for [0..3]
     *   for [7.0..10.0]
     */
    ForInPatcher.prototype.hasFixedRange = function () {
        return this.target instanceof RangePatcher && this.isStartFixed() && this.isEndFixed();
    };
    return ForInPatcher;
}(ForPatcher));
export default ForInPatcher;
var Step = /** @class */ (function () {
    function Step(patcher) {
        var negated = false;
        var root = patcher;
        var apply = function (patcher) {
            if (patcher.node instanceof UnaryNegateOp && patcher instanceof UnaryMathOpPatcher) {
                negated = !negated;
                apply(patcher.expression);
            }
            else {
                root = patcher;
            }
        };
        if (patcher) {
            apply(patcher);
            if (!root) {
                throw new Error('Expected non-null root.');
            }
            this.isLiteral = root.node instanceof Int || root.node instanceof Float;
            this.init = patcher.patchAndGetCode();
            if (root.node instanceof Int || root.node instanceof Float) {
                this.isLiteral = true;
                this.update = root.slice(root.contentStart, root.contentEnd);
                this.number = root.node.data;
            }
            else {
                this.isLiteral = false;
                this.update = root.claimFreeBinding('step');
                this.number = null;
            }
        }
        else {
            this.isLiteral = true;
            this.init = '1';
            this.update = '1';
            this.number = 1;
        }
        this.negated = negated;
        this.isVirtual = !patcher;
    }
    return Step;
}());
export { Step };
