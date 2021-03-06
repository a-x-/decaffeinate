import { SourceType } from 'coffee-lex';
import SourceToken from 'coffee-lex/dist/SourceToken';
import SourceTokenList from 'coffee-lex/dist/SourceTokenList';
import SourceTokenListIndex from 'coffee-lex/dist/SourceTokenListIndex';
import { FunctionApplication, NewOp, Node, SoakedFunctionApplication } from 'decaffeinate-parser/dist/nodes';
import MagicString from 'magic-string';
import { Options } from '../options';
import { Suggestion } from '../suggestions';
import DecaffeinateContext from '../utils/DecaffeinateContext';
import PatcherError from '../utils/PatchError';
import Scope from '../utils/Scope';
import { PatcherContext, PatchOptions, RepeatableOptions } from './types';
export declare type AddThisAssignmentCallback = (memberName: string) => string;
export declare type AddDefaultParamCallback = (assigneeCode: string, initCode: string, assigneeNode: Node) => string;
export interface PatcherClass {
    new (context: PatcherContext, ...children: Array<any>): NodePatcher;
    patcherClassForChildNode(node: Node, property: string): PatcherClass | null;
    patcherClassOverrideForNode(node: Node): PatcherClass | null;
}
export default class NodePatcher {
    node: Node;
    context: DecaffeinateContext;
    editor: MagicString;
    options: Options;
    addSuggestion: (suggestion: Suggestion) => void;
    log: (...args: Array<{}>) => void;
    parent: NodePatcher | null;
    contentStart: number;
    contentEnd: number;
    contentStartTokenIndex: SourceTokenListIndex;
    contentEndTokenIndex: SourceTokenListIndex;
    innerStart: number;
    innerEnd: number;
    innerStartTokenIndex: SourceTokenListIndex;
    innerEndTokenIndex: SourceTokenListIndex;
    outerStart: number;
    outerEnd: number;
    outerStartTokenIndex: SourceTokenListIndex;
    outerEndTokenIndex: SourceTokenListIndex;
    adjustedIndentLevel: number;
    _assignee: boolean;
    _containsYield: boolean;
    _containsAwait: boolean;
    _deferredSuffix: string;
    _expression: boolean;
    _hadUnparenthesizedNegation: boolean;
    _implicitlyReturns: boolean;
    _repeatableOptions: RepeatableOptions | null;
    _repeatCode: string | null;
    _returns: boolean;
    addThisAssignmentAtScopeHeader: AddThisAssignmentCallback | null;
    addDefaultParamAssignmentAtScopeHeader: AddDefaultParamCallback | null;
    constructor({ node, context, editor, options, addSuggestion }: PatcherContext);
    /**
     * Allow patcher classes to override the class used to patch their children.
     */
    static patcherClassForChildNode(_node: Node, _property: string): PatcherClass | null;
    /**
     * Allow patcher classes that would patch a node to chose a different class.
     */
    static patcherClassOverrideForNode(_node: Node): PatcherClass | null;
    /**
     * @private
     */
    setupLocationInformation(): void;
    /**
     * Called to trim the range of content for this node. Override in subclasses
     * to customize its behavior, or override `shouldTrimContentRange` to enable
     * or disable it.
     */
    trimContentRange(): void;
    /**
     * Decides whether to trim the content range of this node.
     */
    shouldTrimContentRange(): boolean;
    /**
     * Called when the patcher tree is complete so we can do any processing that
     * requires communication with other patchers.
     */
    initialize(): void;
    /**
     * Calls methods on `editor` to transform the source code represented by
     * `node` from CoffeeScript to JavaScript. By default this method delegates
     * to other patcher methods which can be overridden individually.
     */
    patch(options?: PatchOptions): void;
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
    patchRepeatable(repeatableOptions?: RepeatableOptions): string;
    /**
     * Patch the given expression and get the underlying generated code. This is
     * more robust than calling patch and slice directly, since it also includes
     * code inserted at contentStart (which normally isn't picked up by slice
     * because it's inserted to the left of the index boundary). To accomplish
     * this, we look at the range from contentStart - 1 to contentStart before and
     * after patching and include anything new that was added.
     */
    patchAndGetCode(options?: PatchOptions): string;
    captureCodeForPatchOperation(patchFn: () => void): string;
    /**
     * Catch errors and throw them again annotated with the current node.
     */
    withPrettyErrors(body: () => void): void;
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
    patchAsRepeatableExpression(repeatableOptions?: RepeatableOptions, patchOptions?: PatchOptions): string;
    /**
     * Override this to patch the node as an expression.
     */
    patchAsExpression(_options?: PatchOptions): void;
    /**
     * Override this to patch the node as a statement.
     */
    patchAsStatement(options?: PatchOptions): void;
    /**
     * Override this to patch the node as an expression that would not normally be
     * an expression, often by wrapping it in an immediately invoked function
     * expression (IIFE).
     */
    patchAsForcedExpression(options?: PatchOptions): void;
    /**
     * Insert content at the specified index.
     */
    insert(index: number, content: string): void;
    /**
     * Insert content at the specified index, before any content normally
     * specified with `insert`. Note that this should be used sparingly. In almost
     * every case, the correct behavior is to do all patching operations in order
     * and always use `insert`. However, in some cases (like a constructor that
     * needs the patched contents of the methods below it), we need to do patching
     * out of order, so it's ok to use `prependLeft` to ensure that the code ends
     * up before the later values.
     */
    prependLeft(index: number, content: string): void;
    allowPatchingOuterBounds(): boolean;
    /**
     * @protected
     */
    getEditingBounds(): [number, number];
    /**
     * @protected
     */
    isIndexEditable(index: number): boolean;
    /**
     * @protected
     */
    assertEditableIndex(index: number): void;
    /**
     * When editing outside a node's bounds we expand the bounds to fit, if
     * possible. Note that if a node or a node's parent is wrapped in parentheses
     * we cannot adjust the bounds beyond the inside of the parentheses.
     */
    adjustBoundsToInclude(index: number): void;
    /**
     * Replace the content between the start and end indexes with new content.
     */
    overwrite(start: number, end: number, content: string): void;
    /**
     * Remove the content between the start and end indexes.
     */
    remove(start: number, end: number): void;
    /**
     * Moves content in a range to another index.
     */
    move(start: number, end: number, index: number): void;
    /**
     * Get the current content between the start and end indexes.
     */
    slice(start: number, end: number): string;
    /**
     * Determines whether this node starts with a string.
     */
    startsWith(string: string): boolean;
    /**
     * Determines whether this node ends with a string.
     */
    endsWith(string: string): boolean;
    /**
     * Tells us to force this patcher to generate an expression, or else throw.
     */
    setRequiresExpression(): void;
    /**
     * Tells us to try to patch as an expression, returning whether it can.
     */
    setExpression(force?: boolean): boolean;
    /**
     * Override this to express whether the patcher prefers to be represented as
     * an expression. By default it's simply an alias for `canPatchAsExpression`.
     */
    prefersToPatchAsExpression(): boolean;
    /**
     * Override this if a node cannot be represented as an expression.
     */
    canPatchAsExpression(): boolean;
    /**
     * Gets whether this patcher is working on a statement or an expression.
     */
    willPatchAsExpression(): boolean;
    /**
     * Gets whether this patcher was forced to patch its node as an expression.
     */
    forcedToPatchAsExpression(): boolean;
    /**
     * Marks this node as an assignee. Nested assignees, like destructure
     * operations, should override this method and propagate it to the children.
     */
    setAssignee(): void;
    /**
     * Checks if this node has been marked as an assignee. This is particularly
     * useful for distinguishing rest from spread operations.
     */
    isAssignee(): boolean;
    /**
     * Gets whether this patcher's node implicitly returns.
     */
    implicitlyReturns(): boolean;
    /**
     * Causes the node to be returned from its function.
     */
    setImplicitlyReturns(): void;
    /**
     * Gets the ancestor that will decide the current implicit return behavior.
     * That ancestor will then have implicitReturnWillBreak,
     * patchImplicitReturnStart, and patchImplicitReturnEnd methods that describe
     * how to handle expressions in an implicit return position (usually they are
     * just returned, but in the case of loop IIFEs, they will be added to a
     * list).
     */
    implicitReturnPatcher(): NodePatcher;
    /**
     * Subclasses should return true to declare themselves as the "handler" in an
     * implicit return situation.
     */
    canHandleImplicitReturn(): boolean;
    /**
     * Determines whether the current patcher (which has already declared that it
     * can be an implicit return patcher) will generate code that stops execution
     * in the current block. In the normal case of a return statement, this is
     * true, but in loop IIFEs, there might be e.g. an assignment, which means
     * that the control flow won't necessarily stop.
     */
    implicitReturnWillBreak(): boolean;
    /**
     * Patch the beginning of an implicitly-returned descendant. Unlike most
     * statements, implicitly-returned statements will not have their surrounding
     * parens removed, so the implicit return patching may need to remove
     * surrounding parens.
     */
    patchImplicitReturnStart(patcher: NodePatcher): void;
    /**
     * Return null to indicate that no empty case code should be generated.
     */
    getEmptyImplicitReturnCode(): string | null;
    /**
     * Patch the end of an implicitly-returned descendant.
     */
    patchImplicitReturnEnd(_patcher: NodePatcher): void;
    /**
     * Gets whether this patcher's node returns explicitly from its function.
     */
    explicitlyReturns(): boolean;
    /**
     * Marks this patcher's as containing a node that explicitly returns.
     */
    setExplicitlyReturns(): void;
    /**
     * Mark that this node should have the given suffix appended at the end of
     * patching. For example, this allows a child node to indicate that this node
     * should end with a close-paren, and to do so in a way that respects patching
     * order (doesn't add the close-paren too early).
     */
    appendDeferredSuffix(suffix: string): void;
    /**
     * Internal method that should be called at the end of patching to actually
     * place the deferred suffix in the right place.
     *
     * @protected
     */
    commitDeferredSuffix(): void;
    /**
     * Determines whether this patcher's node needs a semicolon after it. This
     * should be overridden in subclasses as appropriate.
     */
    statementNeedsSemicolon(): boolean;
    /**
     * Determines whether, when appearing as a statement, this patcher's node
     * needs to be surrounded by parentheses.
     *
     * Subclasses should override this and, typically, delegate to their leftmost
     * child patcher. Subclasses may return `false` when they will insert text at
     * the start of the node.
     */
    statementNeedsParens(): boolean;
    /**
     * Determines whether this patcher's node should add parentheses when used in
     * a statement context.
     */
    statementShouldAddParens(): boolean;
    /**
     * Gets the tokens for the whole program.
     */
    getProgramSourceTokens(): SourceTokenList;
    /**
     * Gets the index of the token starting at a particular source index.
     */
    indexOfSourceTokenStartingAtSourceIndex(index: number): SourceTokenListIndex | null;
    /**
     * Gets the index of the token between left and right patchers that matches
     * a predicate function.
     */
    indexOfSourceTokenBetweenPatchersMatching(left: NodePatcher, right: NodePatcher, predicate: (token: SourceToken) => boolean): SourceTokenListIndex | null;
    /**
     * Gets the index of the token between source locations that matches a
     * predicate function.
     */
    indexOfSourceTokenBetweenSourceIndicesMatching(left: number, right: number, predicate: (token: SourceToken) => boolean): SourceTokenListIndex | null;
    /**
     * Gets the token at a particular index.
     */
    sourceTokenAtIndex(index: SourceTokenListIndex): SourceToken | null;
    /**
     * Gets the source encompassed by the given token.
     */
    sourceOfToken(token: SourceToken): string;
    /**
     * Gets the first token in the content of this node.
     */
    firstToken(): SourceToken;
    /**
     * Gets the last token in the content of this node.
     */
    lastToken(): SourceToken;
    /**
     * Gets the token after the end of this node, or null if there is none.
     */
    nextSemanticToken(): SourceToken | null;
    /**
     * Gets the original source of this patcher's node.
     */
    getOriginalSource(): string;
    /**
     * Determines whether this patcher's node spanned multiple lines.
     */
    isMultiline(): boolean;
    /**
     * Gets the patched source of this patcher's node.
     */
    getPatchedSource(): string;
    /**
     * Gets the index of a token after `contentStart` with the matching type, ignoring
     * non-semantic types by default.
     */
    indexOfSourceTokenAfterSourceTokenIndex(start: SourceTokenListIndex, type: SourceType, predicate?: (token: SourceToken) => boolean): SourceTokenListIndex | null;
    /**
     * Determines whether this patcher's node is followed by a particular token.
     */
    hasSourceTokenAfter(type: SourceType, predicate?: (token: SourceToken) => boolean): boolean;
    /**
     * Determines whether this patcher's node is surrounded by parentheses.
     * Also check if these parents are matching, to avoid false positives on things like `(a) && (b)`
     */
    isSurroundedByParentheses(): boolean;
    surroundInParens(): void;
    getBoundingPatcher(): NodePatcher;
    isNodeFunctionApplication(node: Node): node is FunctionApplication | SoakedFunctionApplication | NewOp;
    /**
     * Determines whether this patcher's node can be negated without prepending
     * a `!`, which turns it into a unary operator node.
     */
    canHandleNegationInternally(): boolean;
    /**
     * Negates this patcher's node when patching. Note that we add the `!` inside
     * any parens, since it's generally unsafe to insert code outside our
     * enclosing parens, and we need to handle the non-parenthesized case anyway.
     * Subclasses that need to worry about precedence (e.g. binary operators)
     * should override this method and do something more appropriate.
     */
    negate(): void;
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
    hadUnparenthesizedNegation(): boolean;
    getScope(): Scope;
    /**
     * Gets the indent string for the line that starts this patcher's node.
     */
    getIndent(offset?: number): string;
    /**
     * Force the indentation level of this node, adjusting it forward or backward
     * if necessary. This also sets the "adjusted indent" level, so that later
     * calls to getIndent will return this value.
     */
    setIndent(indentStr: string): void;
    /**
     * Get the amount the adjusted indent level differs from the original level.
     */
    getAdjustedIndentLevel(): number;
    /**
     * Gets the indent string used for each indent in this program.
     */
    getProgramIndentString(): string;
    /**
     * Indent this node a number of times. To unindent, pass a negative number.
     *
     * Note that because this method inserts indents immediately before the first
     * non-whitespace character of each line in the node's source, it should be
     * called *before* any other editing is done to the node's source to ensure
     * that strings inserted before child nodes appear after the indent, not
     * before.
     */
    indent(offset?: number, { skipFirstLine }?: {
        skipFirstLine?: boolean;
    }): void;
    isFirstNodeInLine(startingPoint?: number): boolean;
    /**
     * Gets the index ending the line following this patcher's node.
     *
     * @private
     */
    getEndOfLine(): number;
    /**
     * Appends the given content on a new line after the end of the current line.
     */
    appendLineAfter(content: string, indentOffset?: number): void;
    /**
     * Generate an error referring to a particular section of the source.
     */
    error(message: string, start?: number, end?: number, error?: Error | null): PatcherError;
    /**
     * Register a helper to be reused in several places.
     */
    registerHelper(name: string, code: string): string;
    /**
     * Determines whether this code might have side-effects when run. Most of the
     * time this is the same as isRepeatable, but sometimes the node is
     * long/complicated enough that it's better to extract it as a variable rather
     * than repeat the expression. In that case, a node may declare itself as pure
     * but not repeatable.
     */
    isPure(): boolean;
    /**
     * Determines whether this node can be repeated without side-effects. Most
     * nodes are not repeatable, so that is the default. Subclasses should
     * override this to indicate whether they are repeatable without any changes.
     */
    isRepeatable(): boolean;
    /**
     * Indicate to this patcher that patching should be done in a way that makes
     * it possible to reference the value afterward with no additional
     * side-effects.
     */
    setRequiresRepeatableExpression(repeatableOptions?: RepeatableOptions): void;
    /**
     * Check if this expression has been marked as repeatable, and if so, the
     * repeat options used. Generally this should only be used for advanced cases,
     * like transferring the repeat code result from one patcher to another.
     */
    getRepeatableOptions(): RepeatableOptions | null;
    /**
     * Get the code snippet computed from patchAsRepeatableExpression that can be
     * used to refer to the result of this expression without further
     * side-effects.
     */
    getRepeatCode(): string;
    /**
     * Explicitly set the repeatable result. Generally this should only be used
     * for advanced cases, like transferring the repeat code result from one
     * patcher to another.
     */
    overrideRepeatCode(repeatCode: string): void;
    /**
     * Claim a binding that is unique in the current scope.
     */
    claimFreeBinding(ref?: string | Array<string> | null): string;
    /**
     * Determines whether all the possible code paths in this node are present.
     */
    allCodePathsPresent(): boolean;
    /**
     * Gets the first "interesting token" in the indexed range (default range is `this` + parent)
     */
    getFirstSemanticToken(from?: number, to?: number): SourceToken | null;
    /**
     * Determine if we need to do a `typeof` check in a conditional for this
     * value, to guard against the case where this node is a variable that doesn't
     * exist. IdentifierPatcher overrides this to check the current scope.
     */
    mayBeUnboundReference(): boolean;
    patchInIIFE(innerPatchFn: () => void): void;
    /**
     * Call to indicate that this node yields.
     */
    yields(): void;
    /**
     * Determine if this node or one of its children within the function is a
     * yield statement.
     */
    containsYield(): boolean;
    awaits(): void;
    containsAwait(): boolean;
}
