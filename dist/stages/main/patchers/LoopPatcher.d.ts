import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
import BlockPatcher from './BlockPatcher';
export default class LoopPatcher extends NodePatcher {
    body: BlockPatcher | null;
    _resultArrayBinding: string | null;
    _resultArrayElementBinding: string | null;
    constructor(patcherContext: PatcherContext, body: BlockPatcher);
    initialize(): void;
    patchAsExpression(): void;
    /**
     * The first of three meaningful indentation levels for where we might want to
     * insert code.
     *
     * As an example, in this code:
     * a((() => {
     *   for (let i = 0; i < b.length; i++) {
     *     let val = b[i];
     *     if (val) {
     *       c;
     *     }
     *   )
     * })())
     *
     * - `getLoopIndent` returns the indentation of the `for`.
     * - `getOuterLoopBodyIndent` returns the indentation of the `if`.
     * - `getLoopBodyIndent` returns the indentation of `c`.
     *
     * However, these levels may change based on whether the loop has a condition,
     * and whether the loop is being formatted as an IIFE or as a regular loop
     * statement.
     *
     * We need to be especially careful about when to actually set the indentation
     * of existing code, since doing that too much can confuse magic-string. The
     * only code that actually is adjusted is the loop body (but only when it's
     * not an inline body), and this is done relatively early on in all cases.
     */
    getLoopIndent(): string;
    /**
     * @see getLoopIndent.
     */
    getOuterLoopBodyIndent(): string;
    /**
     * @see getLoopIndent.
     */
    getLoopBodyIndent(): string;
    /**
     * IIFE-style loop expressions should always be multi-line, even if the loop
     * body in CoffeeScript is inline. This means we need to use a different
     * patching strategy where we insert a newline in the proper place before
     * generating code around the body, then we need to directly create the
     * indentation just before patching the body.
     */
    patchPossibleNewlineAfterLoopHeader(loopHeaderEndIndex: number): void;
    patchBody(): void;
    shouldConvertInlineBodyToNonInline(): boolean;
    canHandleImplicitReturn(): boolean;
    willPatchAsIIFE(): boolean;
    /**
     * Most implicit returns cause program flow to break by using a `return`
     * statement, but we don't do that since we're just collecting values in
     * an array. This allows descendants who care about this to adjust their
     * behavior accordingly.
     */
    implicitReturnWillBreak(): boolean;
    /**
     * If this loop is used as an expression, then we need to collect all the
     * values of the statements in implicit-return position. If all the code paths
     * in our body are present, we can just add `result.push(…)` to all
     * implicit-return position statements. If not, we want those code paths to
     * result in adding `undefined` to the resulting array. The way we do that is
     * by creating an `item` local variable that we set in each code path, and
     * when the code exits through a missing code path (i.e. `if false then b`)
     * then `item` will naturally have the value `undefined` which we then push
     * at the end of the loop body.
     */
    patchImplicitReturnStart(patcher: NodePatcher): void;
    /**
     * @see patchImplicitReturnStart
     */
    patchImplicitReturnEnd(patcher: NodePatcher): void;
    getEmptyImplicitReturnCode(): string;
    /**
     * @private
     */
    getResultArrayBinding(): string;
    /**
     * @private
     */
    getResultArrayElementBinding(): string;
    statementNeedsSemicolon(): boolean;
}
