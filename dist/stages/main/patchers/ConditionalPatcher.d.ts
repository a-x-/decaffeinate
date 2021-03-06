import SourceTokenListIndex from 'coffee-lex/dist/SourceTokenListIndex';
import { Conditional } from 'decaffeinate-parser/dist/nodes';
import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
import BlockPatcher from './BlockPatcher';
export default class ConditionalPatcher extends NodePatcher {
    node: Conditional;
    condition: NodePatcher;
    consequent: BlockPatcher | null;
    alternate: BlockPatcher | null;
    negated: boolean;
    constructor(patcherContext: PatcherContext, condition: NodePatcher, consequent: BlockPatcher | null, alternate: BlockPatcher | null);
    initialize(): void;
    /**
     * Anything like `break`, `continue`, or `return` inside a conditional means
     * we can't even safely make it an IIFE.
     */
    canPatchAsExpression(): boolean;
    prefersToPatchAsExpression(): boolean;
    setExpression(force?: boolean): boolean;
    negate(): void;
    willPatchAsTernary(): boolean;
    /**
     * @private
     */
    willPatchAsIIFE(): boolean;
    patchAsExpression({ needsParens }?: PatchOptions): void;
    patchAsForcedExpression(): void;
    patchAsIIFE(): void;
    canHandleImplicitReturn(): boolean;
    patchAsStatement(): void;
    /**
     * @private
     */
    patchConditionForStatement(): void;
    /**
     * @private
     */
    patchConsequentForStatement(): void;
    /**
     * @private
     */
    patchAlternateForStatement(): void;
    /**
     * If we ended up as a statement, then we know our children are set as
     * implicit return nodes, so no need to turn the conditional into an
     * expression for implicit return purposes.
     */
    implicitlyReturns(): boolean;
    setImplicitlyReturns(): void;
    /**
     * Conditionals do not need semicolons when used as statements.
     */
    statementNeedsSemicolon(): boolean;
    /**
     * Gets the index of the token representing the `if` at the start.
     *
     * @private
     */
    getIfSourceTokenIndex(): SourceTokenListIndex;
    /**
     * Gets the index of the token representing the `else` between consequent and
     * alternate.
     *
     * @private
     */
    getElseSourceTokenIndex(): SourceTokenListIndex | null;
    /**
     * Gets the index of the token representing the `then` between condition and
     * consequent.
     *
     * @private
     */
    getThenTokenIndex(): SourceTokenListIndex | null;
    /**
     * Conditionals have all code paths if there is an `else` and both the
     * consequent and alternate have all their code paths.
     */
    allCodePathsPresent(): boolean;
}
