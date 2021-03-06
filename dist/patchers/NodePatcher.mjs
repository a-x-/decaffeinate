import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import { FunctionApplication, NewOp, SoakedFunctionApplication } from 'decaffeinate-parser/dist/nodes';
import { AVOID_IIFES, AVOID_INLINE_ASSIGNMENTS, CLEAN_UP_IMPLICIT_RETURNS } from '../suggestions';
import adjustIndent from '../utils/adjustIndent';
import { logger } from '../utils/debug';
import notNull from '../utils/notNull';
import PatcherError from '../utils/PatchError';
import referencesArguments from '../utils/referencesArguments';
import { isFunction, isSemanticToken } from '../utils/types';
var NodePatcher = /** @class */ (function () {
    function NodePatcher(_a) {
        var node = _a.node, context = _a.context, editor = _a.editor, options = _a.options, addSuggestion = _a.addSuggestion;
        var _this = this;
        this.adjustedIndentLevel = 0;
        this._assignee = false;
        this._containsYield = false;
        this._containsAwait = false;
        this._deferredSuffix = '';
        this._expression = false;
        this._hadUnparenthesizedNegation = false;
        this._implicitlyReturns = false;
        this._repeatableOptions = null;
        this._repeatCode = null;
        this._returns = false;
        // Temporary callbacks that can be added for inter-node communication.
        this.addThisAssignmentAtScopeHeader = null;
        this.addDefaultParamAssignmentAtScopeHeader = null;
        this.log = logger(this.constructor.name);
        this.node = node;
        this.context = context;
        this.editor = editor;
        this.options = options;
        this.addSuggestion = addSuggestion;
        this.withPrettyErrors(function () { return _this.setupLocationInformation(); });
    }
    /**
     * Allow patcher classes to override the class used to patch their children.
     */
    NodePatcher.patcherClassForChildNode = function (_node, _property) {
        return null;
    };
    /**
     * Allow patcher classes that would patch a node to chose a different class.
     */
    NodePatcher.patcherClassOverrideForNode = function (_node) {
        // eslint-disable-line no-unused-vars
        return null;
    };
    /**
     * @private
     */
    NodePatcher.prototype.setupLocationInformation = function () {
        var _a = this, node = _a.node, context = _a.context;
        /**
         * `contentStart` and `contentEnd` is the exclusive range within the original source that
         * composes this patcher's node. For example, here's the contentStart and contentEnd of
         * `a + b` in the expression below:
         *
         *   console.log(a + b)
         *               ^    ^
         */
        this.contentStart = node.start;
        this.contentEnd = node.end;
        if (this.shouldTrimContentRange()) {
            this.trimContentRange();
        }
        var tokens = context.sourceTokens;
        var firstSourceTokenIndex = tokens.indexOfTokenStartingAtSourceIndex(this.contentStart);
        var lastSourceTokenIndex = tokens.indexOfTokenEndingAtSourceIndex(this.contentEnd);
        if (!firstSourceTokenIndex || !lastSourceTokenIndex) {
            if (node.type === 'Program') {
                // Just an empty program.
                return;
            }
            throw this.error("cannot find first or last token in " + node.type + " node");
        }
        this.contentStartTokenIndex = firstSourceTokenIndex;
        this.contentEndTokenIndex = lastSourceTokenIndex;
        var outerStartTokenIndex = firstSourceTokenIndex;
        var outerEndTokenIndex = lastSourceTokenIndex;
        var innerStartTokenIndex = firstSourceTokenIndex;
        var innerEndTokenIndex = lastSourceTokenIndex;
        for (;;) {
            var previousSurroundingTokenIndex = tokens.lastIndexOfTokenMatchingPredicate(isSemanticToken, outerStartTokenIndex.previous());
            var nextSurroundingTokenIndex = tokens.indexOfTokenMatchingPredicate(isSemanticToken, outerEndTokenIndex.next());
            if (!previousSurroundingTokenIndex || !nextSurroundingTokenIndex) {
                break;
            }
            var previousSurroundingToken = tokens.tokenAtIndex(previousSurroundingTokenIndex);
            var nextSurroundingToken = tokens.tokenAtIndex(nextSurroundingTokenIndex);
            if (!previousSurroundingToken ||
                (previousSurroundingToken.type !== SourceType.LPAREN && previousSurroundingToken.type !== SourceType.CALL_START)) {
                break;
            }
            if (!nextSurroundingToken ||
                (nextSurroundingToken.type !== SourceType.RPAREN && nextSurroundingToken.type !== SourceType.CALL_END)) {
                break;
            }
            if (innerStartTokenIndex === firstSourceTokenIndex) {
                innerStartTokenIndex = previousSurroundingTokenIndex;
            }
            if (innerEndTokenIndex === lastSourceTokenIndex) {
                innerEndTokenIndex = nextSurroundingTokenIndex;
            }
            outerStartTokenIndex = previousSurroundingTokenIndex;
            outerEndTokenIndex = nextSurroundingTokenIndex;
        }
        this.innerStartTokenIndex = innerStartTokenIndex;
        this.innerEndTokenIndex = innerEndTokenIndex;
        this.outerStartTokenIndex = outerStartTokenIndex;
        this.outerEndTokenIndex = outerEndTokenIndex;
        /**
         * `innerStart`, `innerEnd`, `outerStart` and `outerEnd` refer to the
         * positions around surrounding parentheses. In most nodes they are the same
         * as `contentStart` and `contentEnd`. For example:
         *
         *              innerStart
         *                  |
         *       outerStart | contentStart
         *                | | |
         *                ▼ ▼ ▼
         *            1 * ((  2 + 3  ))
         *                         ▲ ▲ ▲
         *                         | | |
         *                contentEnd | outerEnd
         *                           |
         *                        innerEnd
         */
        if (innerStartTokenIndex === firstSourceTokenIndex) {
            this.innerStart = this.contentStart;
        }
        else {
            this.innerStart = notNull(tokens.tokenAtIndex(innerStartTokenIndex)).end;
        }
        if (innerEndTokenIndex === lastSourceTokenIndex) {
            this.innerEnd = this.contentEnd;
        }
        else {
            this.innerEnd = notNull(tokens.tokenAtIndex(innerEndTokenIndex)).start;
        }
        this.outerStart = notNull(tokens.tokenAtIndex(outerStartTokenIndex)).start;
        this.outerEnd = notNull(tokens.tokenAtIndex(outerEndTokenIndex)).end;
    };
    /**
     * Called to trim the range of content for this node. Override in subclasses
     * to customize its behavior, or override `shouldTrimContentRange` to enable
     * or disable it.
     */
    NodePatcher.prototype.trimContentRange = function () {
        var context = this.context;
        for (;;) {
            var startChar = context.source[this.contentStart];
            if (startChar === ' ' || startChar === '\t') {
                this.contentStart++;
            }
            else {
                break;
            }
        }
        for (;;) {
            var lastChar = context.source[this.contentEnd - 1];
            if (lastChar === ' ' || lastChar === '\t') {
                this.contentEnd--;
            }
            else {
                break;
            }
        }
    };
    /**
     * Decides whether to trim the content range of this node.
     */
    NodePatcher.prototype.shouldTrimContentRange = function () {
        return false;
    };
    /**
     * Called when the patcher tree is complete so we can do any processing that
     * requires communication with other patchers.
     */
    NodePatcher.prototype.initialize = function () { };
    /**
     * Calls methods on `editor` to transform the source code represented by
     * `node` from CoffeeScript to JavaScript. By default this method delegates
     * to other patcher methods which can be overridden individually.
     */
    NodePatcher.prototype.patch = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.withPrettyErrors(function () {
            if (_this._repeatableOptions !== null) {
                _this._repeatCode = _this.patchAsRepeatableExpression(_this._repeatableOptions, options);
            }
            else if (_this.forcedToPatchAsExpression()) {
                _this.patchAsForcedExpression(options);
                _this.commitDeferredSuffix();
            }
            else if (_this.willPatchAsExpression()) {
                _this.patchAsExpression(options);
                _this.commitDeferredSuffix();
            }
            else {
                _this.patchAsStatement(options);
                _this.commitDeferredSuffix();
            }
        });
    };
    /**
     * Alternative to patch that patches the expression in a way that the result
     * can be referenced later, then returns the code to reference it.
     *
     * This is a shorthand for the simplest use of the repeatable protocol. In
     * more advanced cases (such as repeating code that is deep within the AST),
     * setRequiresRepeatableExpression can be called before the node is patched
     * and getRepeatCode can be called any time after.
     *
     * The actual implementation for making the node repeatable should be in
     * patchAsRepeatableExpression.
     */
    NodePatcher.prototype.patchRepeatable = function (repeatableOptions) {
        if (repeatableOptions === void 0) { repeatableOptions = {}; }
        this.setRequiresRepeatableExpression(repeatableOptions);
        this.patch();
        return this.getRepeatCode();
    };
    /**
     * Patch the given expression and get the underlying generated code. This is
     * more robust than calling patch and slice directly, since it also includes
     * code inserted at contentStart (which normally isn't picked up by slice
     * because it's inserted to the left of the index boundary). To accomplish
     * this, we look at the range from contentStart - 1 to contentStart before and
     * after patching and include anything new that was added.
     */
    NodePatcher.prototype.patchAndGetCode = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this.captureCodeForPatchOperation(function () { return _this.patch(options); });
    };
    NodePatcher.prototype.captureCodeForPatchOperation = function (patchFn) {
        var sliceStart = this.contentStart > 0 ? this.contentStart - 1 : 0;
        // Occasionally, sliceStart will be illegal because it will be in a range
        // that has been removed or overwritten. If that's the case, subtract 1 from
        // sliceStart until we find something that works.
        var beforeCode = null;
        while (beforeCode === null) {
            try {
                beforeCode = this.slice(sliceStart, this.contentStart);
            }
            catch (e) {
                // Assume that this is because the index is an invalid start. It looks
                // like there isn't a robust way to detect this case exactly, so just
                // try a lower start for any error.
                sliceStart -= 1;
                if (sliceStart < 0) {
                    throw this.error('Could not find a valid index to slice for patch operation.');
                }
            }
        }
        patchFn();
        var code = this.slice(sliceStart, this.contentEnd);
        var startIndex = 0;
        while (startIndex < beforeCode.length && startIndex < code.length && beforeCode[startIndex] === code[startIndex]) {
            startIndex++;
        }
        return code.substr(startIndex);
    };
    /**
     * Catch errors and throw them again annotated with the current node.
     */
    NodePatcher.prototype.withPrettyErrors = function (body) {
        try {
            body();
        }
        catch (err) {
            if (!PatcherError.detect(err)) {
                throw this.error(err.message, this.contentStart, this.contentEnd, err);
            }
            else {
                throw err;
            }
        }
    };
    /**
     * Internal patching method that should patch the current node as an
     * expression and also, if necessary, alter it in a way that it can
     *
     * The return value of this function should be a code snippet that references
     * the result of this expression without any further side-effects.
     *
     * In simple cases, such as identifiers, subclasses can override isRepeatable
     * to declare themselves as already repeatable. In more advanced cases,
     * subclasses can override this method to provide custom behavior.
     *
     * This function is also responsible for committing the deferred suffix if
     * necessary.
     *
     * @protected
     */
    NodePatcher.prototype.patchAsRepeatableExpression = function (repeatableOptions, patchOptions) {
        var _this = this;
        if (repeatableOptions === void 0) { repeatableOptions = {}; }
        if (patchOptions === void 0) { patchOptions = {}; }
        if (this.isRepeatable() && !repeatableOptions.forceRepeat) {
            return this.captureCodeForPatchOperation(function () {
                _this.patchAsForcedExpression(patchOptions);
                _this.commitDeferredSuffix();
            });
        }
        else {
            this.addSuggestion(AVOID_INLINE_ASSIGNMENTS);
            // Can't repeat it, so we assign it to a free variable and return that,
            // i.e. `a + b` → `(ref = a + b)`.
            if (repeatableOptions.parens) {
                this.insert(this.innerStart, '(');
            }
            var ref = this.claimFreeBinding(repeatableOptions.ref);
            this.insert(this.innerStart, ref + " = ");
            this.patchAsForcedExpression(patchOptions);
            this.commitDeferredSuffix();
            if (repeatableOptions.parens) {
                this.insert(this.innerEnd, ')');
            }
            return ref;
        }
    };
    /**
     * Override this to patch the node as an expression.
     */
    NodePatcher.prototype.patchAsExpression = function (_options) {
        if (_options === void 0) { _options = {}; }
        throw this.error("'patchAsExpression' must be overridden in subclasses");
    };
    /**
     * Override this to patch the node as a statement.
     */
    NodePatcher.prototype.patchAsStatement = function (options) {
        if (options === void 0) { options = {}; }
        var addParens = this.statementShouldAddParens();
        if (addParens) {
            this.insert(this.outerStart, '(');
        }
        this.patchAsExpression(options);
        if (addParens) {
            this.insert(this.outerEnd, ')');
        }
    };
    /**
     * Override this to patch the node as an expression that would not normally be
     * an expression, often by wrapping it in an immediately invoked function
     * expression (IIFE).
     */
    NodePatcher.prototype.patchAsForcedExpression = function (options) {
        if (options === void 0) { options = {}; }
        this.patchAsExpression(options);
    };
    /**
     * Insert content at the specified index.
     */
    NodePatcher.prototype.insert = function (index, content) {
        if (typeof index !== 'number') {
            throw new Error("cannot insert " + JSON.stringify(content) + " at non-numeric index " + index);
        }
        this.log('INSERT', index, JSON.stringify(content), 'BEFORE', JSON.stringify(this.context.source.slice(index, index + 8)));
        this.adjustBoundsToInclude(index);
        this.editor.appendLeft(index, content);
    };
    /**
     * Insert content at the specified index, before any content normally
     * specified with `insert`. Note that this should be used sparingly. In almost
     * every case, the correct behavior is to do all patching operations in order
     * and always use `insert`. However, in some cases (like a constructor that
     * needs the patched contents of the methods below it), we need to do patching
     * out of order, so it's ok to use `prependLeft` to ensure that the code ends
     * up before the later values.
     */
    NodePatcher.prototype.prependLeft = function (index, content) {
        if (typeof index !== 'number') {
            throw new Error("cannot insert " + JSON.stringify(content) + " at non-numeric index " + index);
        }
        this.log('PREPEND LEFT', index, JSON.stringify(content), 'BEFORE', JSON.stringify(this.context.source.slice(index, index + 8)));
        this.adjustBoundsToInclude(index);
        this.editor.prependLeft(index, content);
    };
    NodePatcher.prototype.allowPatchingOuterBounds = function () {
        return false;
    };
    /**
     * @protected
     */
    NodePatcher.prototype.getEditingBounds = function () {
        var boundingPatcher = this.getBoundingPatcher();
        // When we're a function arg, there isn't a great patcher to use to
        // determine our bounds (we're allowed to patch from the previous
        // comma/paren to the next comma/paren), so loosen the restriction to the
        // entire function.
        if (boundingPatcher.parent &&
            (this.isNodeFunctionApplication(boundingPatcher.parent.node) ||
                boundingPatcher.parent.node.type === 'ArrayInitialiser')) {
            boundingPatcher = boundingPatcher.parent;
        }
        if (this.allowPatchingOuterBounds()) {
            return [boundingPatcher.outerStart, boundingPatcher.outerEnd];
        }
        else {
            return [boundingPatcher.innerStart, boundingPatcher.innerEnd];
        }
    };
    /**
     * @protected
     */
    NodePatcher.prototype.isIndexEditable = function (index) {
        var _a = tslib_1.__read(this.getEditingBounds(), 2), start = _a[0], end = _a[1];
        return index >= start && index <= end;
    };
    /**
     * @protected
     */
    NodePatcher.prototype.assertEditableIndex = function (index) {
        if (!this.isIndexEditable(index)) {
            var _a = tslib_1.__read(this.getEditingBounds(), 2), start = _a[0], end = _a[1];
            throw this.error("cannot edit index " + index + " because it is not editable (i.e. outside [" + start + ", " + end + "))", start, end);
        }
    };
    /**
     * When editing outside a node's bounds we expand the bounds to fit, if
     * possible. Note that if a node or a node's parent is wrapped in parentheses
     * we cannot adjust the bounds beyond the inside of the parentheses.
     */
    NodePatcher.prototype.adjustBoundsToInclude = function (index) {
        this.assertEditableIndex(index);
        if (index < this.innerStart) {
            this.log('Moving `innerStart` from', this.innerStart, 'to', index);
            this.innerStart = index;
        }
        if (index > this.innerEnd) {
            this.log('Moving `innerEnd` from', this.innerEnd, 'to', index);
            this.innerEnd = index;
        }
        if (index < this.outerStart) {
            this.log('Moving `outerStart` from', this.outerStart, 'to', index);
            this.outerStart = index;
        }
        if (index > this.outerEnd) {
            this.log('Moving `outerEnd` from', this.outerEnd, 'to', index);
            this.outerEnd = index;
        }
        if (this.parent) {
            this.parent.adjustBoundsToInclude(index);
        }
    };
    /**
     * Replace the content between the start and end indexes with new content.
     */
    NodePatcher.prototype.overwrite = function (start, end, content) {
        if (typeof start !== 'number' || typeof end !== 'number') {
            throw new Error("cannot overwrite non-numeric range [" + start + ", " + end + ") " + ("with " + JSON.stringify(content)));
        }
        this.log('OVERWRITE', "[" + start + ", " + end + ")", JSON.stringify(this.context.source.slice(start, end)), '→', JSON.stringify(content));
        this.editor.overwrite(start, end, content);
    };
    /**
     * Remove the content between the start and end indexes.
     */
    NodePatcher.prototype.remove = function (start, end) {
        if (typeof start !== 'number' || typeof end !== 'number') {
            throw new Error("cannot remove non-numeric range [" + start + ", " + end + ")");
        }
        this.log('REMOVE', "[" + start + ", " + end + ")", JSON.stringify(this.context.source.slice(start, end)));
        this.editor.remove(start, end);
    };
    /**
     * Moves content in a range to another index.
     */
    NodePatcher.prototype.move = function (start, end, index) {
        if (typeof start !== 'number' || typeof end !== 'number') {
            throw this.error("cannot remove non-numeric range [" + start + ", " + end + ")");
        }
        if (typeof index !== 'number') {
            throw this.error("cannot move to non-numeric index: " + index);
        }
        this.log('MOVE', "[" + start + ", " + end + ") \u2192 " + index, JSON.stringify(this.context.source.slice(start, end)), 'BEFORE', JSON.stringify(this.context.source.slice(index, index + 8)));
        this.editor.move(start, end, index);
    };
    /**
     * Get the current content between the start and end indexes.
     */
    NodePatcher.prototype.slice = function (start, end) {
        // magic-string treats 0 as the end of the string, which we don't want to do.
        if (end === 0) {
            return '';
        }
        return this.editor.slice(start, end);
    };
    /**
     * Determines whether this node starts with a string.
     */
    NodePatcher.prototype.startsWith = function (string) {
        return this.context.source.slice(this.contentStart, this.contentStart + string.length) === string;
    };
    /**
     * Determines whether this node ends with a string.
     */
    NodePatcher.prototype.endsWith = function (string) {
        return this.context.source.slice(this.contentEnd - string.length, this.contentEnd) === string;
    };
    /**
     * Tells us to force this patcher to generate an expression, or else throw.
     */
    NodePatcher.prototype.setRequiresExpression = function () {
        this.setExpression(true);
    };
    /**
     * Tells us to try to patch as an expression, returning whether it can.
     */
    NodePatcher.prototype.setExpression = function (force) {
        if (force === void 0) { force = false; }
        if (force) {
            if (!this.canPatchAsExpression()) {
                throw this.error("cannot represent " + this.node.type + " as an expression");
            }
        }
        else if (!this.prefersToPatchAsExpression()) {
            return false;
        }
        this._expression = true;
        return true;
    };
    /**
     * Override this to express whether the patcher prefers to be represented as
     * an expression. By default it's simply an alias for `canPatchAsExpression`.
     */
    NodePatcher.prototype.prefersToPatchAsExpression = function () {
        return this.canPatchAsExpression();
    };
    /**
     * Override this if a node cannot be represented as an expression.
     */
    NodePatcher.prototype.canPatchAsExpression = function () {
        return true;
    };
    /**
     * Gets whether this patcher is working on a statement or an expression.
     */
    NodePatcher.prototype.willPatchAsExpression = function () {
        return this._expression;
    };
    /**
     * Gets whether this patcher was forced to patch its node as an expression.
     */
    NodePatcher.prototype.forcedToPatchAsExpression = function () {
        return this.willPatchAsExpression() && !this.prefersToPatchAsExpression();
    };
    /**
     * Marks this node as an assignee. Nested assignees, like destructure
     * operations, should override this method and propagate it to the children.
     */
    NodePatcher.prototype.setAssignee = function () {
        this._assignee = true;
    };
    /**
     * Checks if this node has been marked as an assignee. This is particularly
     * useful for distinguishing rest from spread operations.
     */
    NodePatcher.prototype.isAssignee = function () {
        return this._assignee;
    };
    /**
     * Gets whether this patcher's node implicitly returns.
     */
    NodePatcher.prototype.implicitlyReturns = function () {
        return this._implicitlyReturns || false;
    };
    /**
     * Causes the node to be returned from its function.
     */
    NodePatcher.prototype.setImplicitlyReturns = function () {
        this._implicitlyReturns = true;
    };
    /**
     * Gets the ancestor that will decide the current implicit return behavior.
     * That ancestor will then have implicitReturnWillBreak,
     * patchImplicitReturnStart, and patchImplicitReturnEnd methods that describe
     * how to handle expressions in an implicit return position (usually they are
     * just returned, but in the case of loop IIFEs, they will be added to a
     * list).
     */
    NodePatcher.prototype.implicitReturnPatcher = function () {
        if (this.canHandleImplicitReturn()) {
            return this;
        }
        else {
            return notNull(this.parent).implicitReturnPatcher();
        }
    };
    /**
     * Subclasses should return true to declare themselves as the "handler" in an
     * implicit return situation.
     */
    NodePatcher.prototype.canHandleImplicitReturn = function () {
        return false;
    };
    /**
     * Determines whether the current patcher (which has already declared that it
     * can be an implicit return patcher) will generate code that stops execution
     * in the current block. In the normal case of a return statement, this is
     * true, but in loop IIFEs, there might be e.g. an assignment, which means
     * that the control flow won't necessarily stop.
     */
    NodePatcher.prototype.implicitReturnWillBreak = function () {
        return true;
    };
    /**
     * Patch the beginning of an implicitly-returned descendant. Unlike most
     * statements, implicitly-returned statements will not have their surrounding
     * parens removed, so the implicit return patching may need to remove
     * surrounding parens.
     */
    NodePatcher.prototype.patchImplicitReturnStart = function (patcher) {
        if (patcher.node.type === 'Break' || patcher.node.type === 'Continue') {
            if (patcher.isSurroundedByParentheses()) {
                this.remove(patcher.outerStart, patcher.innerStart);
                this.remove(patcher.innerEnd, patcher.outerEnd);
            }
            return;
        }
        if (isFunction(this.node) && this.isMultiline()) {
            this.addSuggestion(CLEAN_UP_IMPLICIT_RETURNS);
        }
        patcher.setRequiresExpression();
        this.insert(patcher.outerStart, 'return ');
    };
    /**
     * Return null to indicate that no empty case code should be generated.
     */
    NodePatcher.prototype.getEmptyImplicitReturnCode = function () {
        return null;
    };
    /**
     * Patch the end of an implicitly-returned descendant.
     */
    NodePatcher.prototype.patchImplicitReturnEnd = function (_patcher) {
        // eslint-disable-line no-unused-vars
        // Nothing to do.
    };
    /**
     * Gets whether this patcher's node returns explicitly from its function.
     */
    NodePatcher.prototype.explicitlyReturns = function () {
        return this._returns || false;
    };
    /**
     * Marks this patcher's as containing a node that explicitly returns.
     */
    NodePatcher.prototype.setExplicitlyReturns = function () {
        this._returns = true;
        if (this.parent) {
            this.parent.setExplicitlyReturns();
        }
    };
    /**
     * Mark that this node should have the given suffix appended at the end of
     * patching. For example, this allows a child node to indicate that this node
     * should end with a close-paren, and to do so in a way that respects patching
     * order (doesn't add the close-paren too early).
     */
    NodePatcher.prototype.appendDeferredSuffix = function (suffix) {
        this._deferredSuffix += suffix;
    };
    /**
     * Internal method that should be called at the end of patching to actually
     * place the deferred suffix in the right place.
     *
     * @protected
     */
    NodePatcher.prototype.commitDeferredSuffix = function () {
        if (this._deferredSuffix) {
            this.insert(this.innerEnd, this._deferredSuffix);
        }
    };
    /**
     * Determines whether this patcher's node needs a semicolon after it. This
     * should be overridden in subclasses as appropriate.
     */
    NodePatcher.prototype.statementNeedsSemicolon = function () {
        return true;
    };
    /**
     * Determines whether, when appearing as a statement, this patcher's node
     * needs to be surrounded by parentheses.
     *
     * Subclasses should override this and, typically, delegate to their leftmost
     * child patcher. Subclasses may return `false` when they will insert text at
     * the start of the node.
     */
    NodePatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    /**
     * Determines whether this patcher's node should add parentheses when used in
     * a statement context.
     */
    NodePatcher.prototype.statementShouldAddParens = function () {
        return this.statementNeedsParens() && !this.isSurroundedByParentheses();
    };
    /**
     * Gets the tokens for the whole program.
     */
    NodePatcher.prototype.getProgramSourceTokens = function () {
        return this.context.sourceTokens;
    };
    /**
     * Gets the index of the token starting at a particular source index.
     */
    NodePatcher.prototype.indexOfSourceTokenStartingAtSourceIndex = function (index) {
        return this.getProgramSourceTokens().indexOfTokenStartingAtSourceIndex(index);
    };
    /**
     * Gets the index of the token between left and right patchers that matches
     * a predicate function.
     */
    NodePatcher.prototype.indexOfSourceTokenBetweenPatchersMatching = function (left, right, predicate) {
        return this.indexOfSourceTokenBetweenSourceIndicesMatching(left.outerEnd, right.outerStart, predicate);
    };
    /**
     * Gets the index of the token between source locations that matches a
     * predicate function.
     */
    NodePatcher.prototype.indexOfSourceTokenBetweenSourceIndicesMatching = function (left, right, predicate) {
        var tokenList = this.getProgramSourceTokens();
        return tokenList.indexOfTokenMatchingPredicate(function (token) {
            return token.start >= left && token.start <= right && predicate(token);
        }, tokenList.indexOfTokenNearSourceIndex(left), tokenList.indexOfTokenNearSourceIndex(right).next());
    };
    /**
     * Gets the token at a particular index.
     */
    NodePatcher.prototype.sourceTokenAtIndex = function (index) {
        return this.getProgramSourceTokens().tokenAtIndex(index);
    };
    /**
     * Gets the source encompassed by the given token.
     */
    NodePatcher.prototype.sourceOfToken = function (token) {
        return this.context.source.slice(token.start, token.end);
    };
    /**
     * Gets the first token in the content of this node.
     */
    NodePatcher.prototype.firstToken = function () {
        var token = this.sourceTokenAtIndex(this.contentStartTokenIndex);
        if (!token) {
            throw this.error('Expected to find a first token for node.');
        }
        return token;
    };
    /**
     * Gets the last token in the content of this node.
     */
    NodePatcher.prototype.lastToken = function () {
        var token = this.sourceTokenAtIndex(this.contentEndTokenIndex);
        if (!token) {
            throw this.error('Expected to find a last token for node.');
        }
        return token;
    };
    /**
     * Gets the token after the end of this node, or null if there is none.
     */
    NodePatcher.prototype.nextSemanticToken = function () {
        return this.getFirstSemanticToken(this.contentEnd, this.context.source.length);
    };
    /**
     * Gets the original source of this patcher's node.
     */
    NodePatcher.prototype.getOriginalSource = function () {
        return this.context.source.slice(this.contentStart, this.contentEnd);
    };
    /**
     * Determines whether this patcher's node spanned multiple lines.
     */
    NodePatcher.prototype.isMultiline = function () {
        return /\n/.test(this.getOriginalSource());
    };
    /**
     * Gets the patched source of this patcher's node.
     */
    NodePatcher.prototype.getPatchedSource = function () {
        return this.slice(this.contentStart, this.contentEnd);
    };
    /**
     * Gets the index of a token after `contentStart` with the matching type, ignoring
     * non-semantic types by default.
     */
    NodePatcher.prototype.indexOfSourceTokenAfterSourceTokenIndex = function (start, type, predicate) {
        if (predicate === void 0) { predicate = isSemanticToken; }
        var index = this.getProgramSourceTokens().indexOfTokenMatchingPredicate(predicate, start.next());
        if (!index) {
            return null;
        }
        var token = this.sourceTokenAtIndex(index);
        if (!token || token.type !== type) {
            return null;
        }
        return index;
    };
    /**
     * Determines whether this patcher's node is followed by a particular token.
     */
    NodePatcher.prototype.hasSourceTokenAfter = function (type, predicate) {
        if (predicate === void 0) { predicate = isSemanticToken; }
        return this.indexOfSourceTokenAfterSourceTokenIndex(this.outerEndTokenIndex, type, predicate) !== null;
    };
    /**
     * Determines whether this patcher's node is surrounded by parentheses.
     * Also check if these parents are matching, to avoid false positives on things like `(a) && (b)`
     */
    NodePatcher.prototype.isSurroundedByParentheses = function () {
        // Surrounding parens will extend outer start/end beyond content start/end,
        // so only consider parens in that case. If we didn't exit early here, we'd
        // get false positives for nodes that start and end with parens without
        // actually being surrounded by parens.
        if (this.contentStart === this.outerStart && this.contentEnd === this.outerEnd) {
            return false;
        }
        var beforeToken = this.sourceTokenAtIndex(this.outerStartTokenIndex);
        var afterToken = this.sourceTokenAtIndex(this.outerEndTokenIndex);
        if (!beforeToken || !afterToken) {
            return false;
        }
        var leftTokenType = SourceType.LPAREN;
        var rightTokenType = SourceType.RPAREN;
        if (beforeToken.type === SourceType.LPAREN && afterToken.type === SourceType.RPAREN) {
            // nothing
        }
        else if (beforeToken.type === SourceType.CALL_START && afterToken.type === SourceType.CALL_END) {
            leftTokenType = SourceType.CALL_START;
            rightTokenType = SourceType.CALL_END;
        }
        else {
            return false;
        }
        var parenRange = this.getProgramSourceTokens().rangeOfMatchingTokensContainingTokenIndex(leftTokenType, rightTokenType, this.outerStartTokenIndex);
        if (!parenRange) {
            return false;
        }
        var rparenIndex = parenRange[1].previous();
        var rparen = this.sourceTokenAtIndex(notNull(rparenIndex));
        return rparen === afterToken;
    };
    NodePatcher.prototype.surroundInParens = function () {
        if (!this.isSurroundedByParentheses()) {
            this.insert(this.outerStart, '(');
            this.insert(this.outerEnd, ')');
        }
    };
    NodePatcher.prototype.getBoundingPatcher = function () {
        var _this = this;
        if (this.isSurroundedByParentheses()) {
            return this;
        }
        else if (this.parent) {
            if (this.isNodeFunctionApplication(this.parent.node) &&
                this.parent.node.arguments.some(function (arg) { return arg === _this.node; })) {
                return this;
            }
            else if (this.parent.node.type === 'ArrayInitialiser') {
                return this;
            }
            else if (this.parent.node.type === 'ObjectInitialiser') {
                return this;
            }
            return this.parent.getBoundingPatcher();
        }
        else {
            return this;
        }
    };
    NodePatcher.prototype.isNodeFunctionApplication = function (node) {
        return node instanceof FunctionApplication || node instanceof SoakedFunctionApplication || node instanceof NewOp;
    };
    /**
     * Determines whether this patcher's node can be negated without prepending
     * a `!`, which turns it into a unary operator node.
     */
    NodePatcher.prototype.canHandleNegationInternally = function () {
        return false;
    };
    /**
     * Negates this patcher's node when patching. Note that we add the `!` inside
     * any parens, since it's generally unsafe to insert code outside our
     * enclosing parens, and we need to handle the non-parenthesized case anyway.
     * Subclasses that need to worry about precedence (e.g. binary operators)
     * should override this method and do something more appropriate.
     */
    NodePatcher.prototype.negate = function () {
        this.insert(this.contentStart, '!');
        this._hadUnparenthesizedNegation = true;
    };
    /**
     * Check if this node has been negated by simply adding a `!` to the front.
     * In some cases, this node may be later changed into an expression that would
     * require additional parens, e.g. a soak container being transformed into a
     * ternary expression, so track the negation so we know to add parens if
     * necessary.
     *
     * Note that most custom negate() implementations already add parens, so they
     * don't need to return true here.
     */
    NodePatcher.prototype.hadUnparenthesizedNegation = function () {
        return this._hadUnparenthesizedNegation;
    };
    NodePatcher.prototype.getScope = function () {
        return this.context.getScope(this.node);
    };
    /**
     * Gets the indent string for the line that starts this patcher's node.
     */
    NodePatcher.prototype.getIndent = function (offset) {
        if (offset === void 0) { offset = 0; }
        return adjustIndent(this.context.source, this.contentStart, this.getAdjustedIndentLevel() + offset);
    };
    /**
     * Force the indentation level of this node, adjusting it forward or backward
     * if necessary. This also sets the "adjusted indent" level, so that later
     * calls to getIndent will return this value.
     */
    NodePatcher.prototype.setIndent = function (indentStr) {
        var currentIndent = this.getIndent();
        var indentLength = this.getProgramIndentString().length;
        var currentIndentLevel = currentIndent.length / indentLength;
        var desiredIndentLevel = indentStr.length / indentLength;
        this.indent(desiredIndentLevel - currentIndentLevel);
    };
    /**
     * Get the amount the adjusted indent level differs from the original level.
     */
    NodePatcher.prototype.getAdjustedIndentLevel = function () {
        return this.adjustedIndentLevel + (this.parent ? this.parent.getAdjustedIndentLevel() : 0);
    };
    /**
     * Gets the indent string used for each indent in this program.
     */
    NodePatcher.prototype.getProgramIndentString = function () {
        return notNull(this.parent).getProgramIndentString();
    };
    /**
     * Indent this node a number of times. To unindent, pass a negative number.
     *
     * Note that because this method inserts indents immediately before the first
     * non-whitespace character of each line in the node's source, it should be
     * called *before* any other editing is done to the node's source to ensure
     * that strings inserted before child nodes appear after the indent, not
     * before.
     */
    NodePatcher.prototype.indent = function (offset, _a) {
        if (offset === void 0) { offset = 1; }
        var _b = (_a === void 0 ? {} : _a).skipFirstLine, skipFirstLine = _b === void 0 ? false : _b;
        if (offset === 0) {
            return;
        }
        this.adjustedIndentLevel += offset;
        var indentString = this.getProgramIndentString();
        var indentToChange = indentString.repeat(Math.abs(offset));
        var start = this.outerStart;
        var end = this.outerEnd;
        var source = this.context.source;
        // See if there are already non-whitespace characters before the start. If
        // so, skip the start to the next line, since we don't want to put
        // indentation in the middle of a line.
        if (skipFirstLine || !this.isFirstNodeInLine()) {
            while (start < end && source[start] !== '\n') {
                start++;
            }
        }
        var hasIndentedThisLine = false;
        for (var i = start; i < end; i++) {
            switch (source[i]) {
                case '\n':
                    hasIndentedThisLine = false;
                    break;
                case ' ':
                case '\t':
                    break;
                default:
                    if (!hasIndentedThisLine) {
                        if (offset > 0) {
                            this.insert(i, indentToChange);
                        }
                        else if (source.slice(i - indentToChange.length, i) === indentToChange) {
                            this.remove(i - indentToChange.length, i);
                        }
                        else {
                            // Ignore this case: we're trying to unindent a line that doesn't
                            // start with enough indentation, or doesn't start with the right
                            // type of indentation, e.g. it starts with spaces when the
                            // program indent string is a tab. This can happen when a file
                            // uses inconsistent indentation in different parts. We only
                            // expect this to come up in the main stage, so getting
                            // indentation wrong means ugly JS code that's still correct.
                            this.log('Warning: Ignoring an unindent operation because the line ' +
                                'did not start with the proper indentation.');
                        }
                        hasIndentedThisLine = true;
                    }
                    break;
            }
        }
    };
    NodePatcher.prototype.isFirstNodeInLine = function (startingPoint) {
        if (startingPoint === void 0) { startingPoint = this.outerStart; }
        var source = this.context.source;
        for (var i = startingPoint - 1; i >= 0 && source[i] !== '\n'; i--) {
            if (source[i] !== '\t' && source[i] !== ' ') {
                return false;
            }
        }
        return true;
    };
    /**
     * Gets the index ending the line following this patcher's node.
     *
     * @private
     */
    NodePatcher.prototype.getEndOfLine = function () {
        var source = this.context.source;
        for (var i = this.outerEnd - '\n'.length; i < source.length; i++) {
            if (source[i] === '\n') {
                return i;
            }
        }
        return source.length;
    };
    /**
     * Appends the given content on a new line after the end of the current line.
     */
    NodePatcher.prototype.appendLineAfter = function (content, indentOffset) {
        if (indentOffset === void 0) { indentOffset = 0; }
        var boundingPatcher = this.getBoundingPatcher();
        var endOfLine = this.getEndOfLine();
        var nextToken = this.nextSemanticToken();
        var insertPoint = Math.min(Math.min(endOfLine, boundingPatcher.innerEnd));
        if (nextToken) {
            insertPoint = Math.min(insertPoint, nextToken.start);
        }
        this.insert(insertPoint, "\n" + this.getIndent(indentOffset) + content);
    };
    /**
     * Generate an error referring to a particular section of the source.
     */
    NodePatcher.prototype.error = function (message, start, end, error) {
        if (start === void 0) { start = this.contentStart; }
        if (end === void 0) { end = this.contentEnd; }
        if (error === void 0) { error = null; }
        var patcherError = new PatcherError(message, this.context.source, start, end);
        if (error) {
            patcherError.stack = error.stack;
        }
        return patcherError;
    };
    /**
     * Register a helper to be reused in several places.
     */
    NodePatcher.prototype.registerHelper = function (name, code) {
        return notNull(this.parent).registerHelper(name, code);
    };
    /**
     * Determines whether this code might have side-effects when run. Most of the
     * time this is the same as isRepeatable, but sometimes the node is
     * long/complicated enough that it's better to extract it as a variable rather
     * than repeat the expression. In that case, a node may declare itself as pure
     * but not repeatable.
     */
    NodePatcher.prototype.isPure = function () {
        return this.isRepeatable();
    };
    /**
     * Determines whether this node can be repeated without side-effects. Most
     * nodes are not repeatable, so that is the default. Subclasses should
     * override this to indicate whether they are repeatable without any changes.
     */
    NodePatcher.prototype.isRepeatable = function () {
        return false;
    };
    /**
     * Indicate to this patcher that patching should be done in a way that makes
     * it possible to reference the value afterward with no additional
     * side-effects.
     */
    NodePatcher.prototype.setRequiresRepeatableExpression = function (repeatableOptions) {
        if (repeatableOptions === void 0) { repeatableOptions = {}; }
        this._repeatableOptions = repeatableOptions;
    };
    /**
     * Check if this expression has been marked as repeatable, and if so, the
     * repeat options used. Generally this should only be used for advanced cases,
     * like transferring the repeat code result from one patcher to another.
     */
    NodePatcher.prototype.getRepeatableOptions = function () {
        return this._repeatableOptions;
    };
    /**
     * Get the code snippet computed from patchAsRepeatableExpression that can be
     * used to refer to the result of this expression without further
     * side-effects.
     */
    NodePatcher.prototype.getRepeatCode = function () {
        if (this._repeatCode === null) {
            throw new Error('Must patch as a repeatable expression to access repeat code.');
        }
        return this._repeatCode;
    };
    /**
     * Explicitly set the repeatable result. Generally this should only be used
     * for advanced cases, like transferring the repeat code result from one
     * patcher to another.
     */
    NodePatcher.prototype.overrideRepeatCode = function (repeatCode) {
        this._repeatCode = repeatCode;
    };
    /**
     * Claim a binding that is unique in the current scope.
     */
    NodePatcher.prototype.claimFreeBinding = function (ref) {
        if (ref === void 0) { ref = null; }
        return this.getScope().claimFreeBinding(this.node, ref);
    };
    /**
     * Determines whether all the possible code paths in this node are present.
     */
    NodePatcher.prototype.allCodePathsPresent = function () {
        return true;
    };
    /**
     * Gets the first "interesting token" in the indexed range (default range is `this` + parent)
     */
    NodePatcher.prototype.getFirstSemanticToken = function (from, to) {
        if (from === void 0) { from = this.contentStart; }
        if (to === void 0) { to = notNull(this.parent).contentEnd; }
        var nextSemanticIdx = this.indexOfSourceTokenBetweenSourceIndicesMatching(from, to, isSemanticToken);
        return nextSemanticIdx && this.sourceTokenAtIndex(nextSemanticIdx);
    };
    /**
     * Determine if we need to do a `typeof` check in a conditional for this
     * value, to guard against the case where this node is a variable that doesn't
     * exist. IdentifierPatcher overrides this to check the current scope.
     */
    NodePatcher.prototype.mayBeUnboundReference = function () {
        return false;
    };
    NodePatcher.prototype.patchInIIFE = function (innerPatchFn) {
        this.addSuggestion(AVOID_IIFES);
        if (this.containsYield()) {
            this.insert(this.innerStart, 'yield* (function*() {');
        }
        else if (this.containsAwait()) {
            this.insert(this.innerStart, 'await (async () => {');
        }
        else {
            this.insert(this.innerStart, '(() => {');
        }
        innerPatchFn();
        if (this.containsYield()) {
            if (referencesArguments(this.node)) {
                this.insert(this.innerEnd, '}).apply(this, arguments)');
            }
            else {
                this.insert(this.innerEnd, '}).call(this)');
            }
        }
        else if (this.containsAwait()) {
            this.insert(this.innerEnd, '})()');
        }
        else {
            this.insert(this.innerEnd, '})()');
        }
    };
    /**
     * Call to indicate that this node yields.
     */
    NodePatcher.prototype.yields = function () {
        this._containsYield = true;
        if (this.parent && !isFunction(this.parent.node)) {
            this.parent.yields();
        }
    };
    /**
     * Determine if this node or one of its children within the function is a
     * yield statement.
     */
    NodePatcher.prototype.containsYield = function () {
        return this._containsYield;
    };
    NodePatcher.prototype.awaits = function () {
        this._containsAwait = true;
        if (this.parent && !isFunction(this.parent.node)) {
            this.parent.awaits();
        }
    };
    NodePatcher.prototype.containsAwait = function () {
        return this._containsAwait;
    };
    return NodePatcher;
}());
export default NodePatcher;
