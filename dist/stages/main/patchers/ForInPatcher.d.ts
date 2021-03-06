import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import BlockPatcher from './BlockPatcher';
import ForPatcher from './ForPatcher';
export declare type IndexDirection = 'UP' | 'DOWN' | 'UNKNOWN';
/**
 * Patcher for CS for...in. We also subclass this patcher for CS for...from, since the behavior is
 * nearly the same.
 */
export default class ForInPatcher extends ForPatcher {
    step: NodePatcher | null;
    _ascReference: string | null;
    _endCode: string | null;
    _endReference: string | null;
    _internalIndexBinding: string | null;
    _startCode: string | null;
    _startReference: string | null;
    _valueBinding: string | null;
    _step: Step | null;
    constructor(patcherContext: PatcherContext, keyAssignee: NodePatcher | null, valAssignee: NodePatcher | null, target: NodePatcher, step: NodePatcher | null, filter: NodePatcher | null, body: BlockPatcher);
    initialize(): void;
    patchAsExpression(): void;
    /**
     * In a case like `x = for a in b when c then a`, we should skip the `map`
     * altogether and just use a `filter`.
     */
    isMapBodyNoOp(): boolean;
    patchBodyForExpressionLoop(): void;
    canPatchAsMapExpression(): boolean;
    canAssigneesBecomeParams(): boolean;
    willPatchAsIIFE(): boolean;
    patchAsStatement(): void;
    /**
     * As long as we aren't using the loop index or a step, we prefer to use JS
     * for-of loops.
     *
     * Overridden by CS for...from to always patch as JS for...of.
     */
    shouldPatchAsForOf(): boolean;
    getValueBinding(): string;
    /**
     * @protected
     */
    computeIndexBinding(): string;
    patchForLoopHeader(): void;
    getLastHeaderPatcher(): NodePatcher;
    patchForLoopBody(): void;
    /**
     * Special case for patching for-of case for when the loop is simple enough
     * that for-of works. Note that for-of has slightly different semantics
     * because it uses the iterator protocol rather than CoffeeScript's notion of
     * an array-like object, so this transform sacrifices 100% correctness in
     * favor of cleaner code.
     */
    patchForOfLoop(): void;
    getLoopHeaderEnd(): number;
    requiresExtractingTarget(): boolean;
    targetBindingCandidate(): string;
    /**
     * Determine the name that will be used as the source of truth for the index
     * during loop iteration. If the code modifies the user-specified index during
     * the loop body, we need to choose a different variable name and make the
     * loop code a little more complex.
     */
    getInternalIndexBinding(): string;
    needsUniqueIndexName(): boolean;
    getInitCode(): string;
    getTestCode(): string;
    getUpdateCode(): string;
    getUpdateAssignment(): string;
    getStartReference(): string;
    isStartFixed(): boolean;
    /**
     * In many cases, we can just initialize the index to the start without an
     * intermediate variable. We only need to save a variable if it's not
     * repeatable and we need to use it to compute the direction.
     */
    shouldExtractStart(): boolean;
    getStartCode(): string;
    getEndReference(): string;
    isEndFixed(): boolean;
    getEndCode(): string;
    getAscReference(): string;
    /**
     * Return the code snippet to determine whether the loop counts up or down, in
     * the event that it needs to be computed at runtime.
     */
    getAscCode(): string;
    getStep(): Step;
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
    shouldPatchAsInitTestUpdateLoop(): boolean;
    shouldWrapMapExpressionTargetInArrayFrom(): boolean;
    /**
     * Overridden by ForFromPatcher to always return false.
     */
    shouldWrapForOfStatementTargetInArrayFrom(): boolean;
    /**
     * Determine if the loop target is statically known to be an array. If so,
     * then there's no need to use Array.from to convert from an array-like object
     * to an array.
     */
    isTargetAlreadyArray(): boolean;
    /**
     * Determines whether this `for…in` loop has an explicit `by` step.
     */
    hasExplicitStep(): boolean;
    /**
     * Determines the direction of index iteration, either UP, DOWN, or UNKNOWN.
     * UNKNOWN means that we cannot statically determine the direction.
     */
    getIndexDirection(): IndexDirection;
    /**
     * Are we looping over a range with fixed (static) start/end?
     *
     * @example
     *
     *   for [0..3]
     *   for [7.0..10.0]
     */
    hasFixedRange(): boolean;
}
export declare class Step {
    isLiteral: boolean;
    isVirtual: boolean;
    negated: boolean;
    init: string;
    update: string;
    number: number | null;
    raw: string;
    constructor(patcher: NodePatcher | null);
}
