import SourceTokenListIndex from 'coffee-lex/dist/SourceTokenListIndex';
import NodePatcher from '../../../patchers/NodePatcher';
import SharedBlockPatcher from '../../../patchers/SharedBlockPatcher';
import { PatchOptions } from '../../../patchers/types';
/**
 * Any child patcher that might be turned into an IIFE during patching. Each
 * such child must call markIIFEPatcherDescendant on this patcher in the
 * initialize step.
 */
export interface IIFEPatcher extends NodePatcher {
    willPatchAsIIFE(): boolean;
}
export default class BlockPatcher extends SharedBlockPatcher {
    statements: Array<NodePatcher>;
    _iifePatcherDescendants: Array<IIFEPatcher>;
    _explicitDeclarationsToAdd: Array<string>;
    markIIFEPatcherDescendant(iifePatcher: IIFEPatcher): void;
    /**
     * In some cases, CoffeeScript constructs must be turned into IIFEs, but also
     * have assignments within them. The assignments should be seen as belonging
     * to the outer function scope, not the IIFE function scope, so we need to
     * explicitly hoist any variables that could be affected.
     */
    initialize(): void;
    canPatchAsExpression(): boolean;
    prefersToPatchAsExpression(): boolean;
    setExpression(force?: boolean): boolean;
    setImplicitlyReturns(): void;
    /**
     * Force the patcher to treat the block as inline (semicolon-separated
     * statements) or not (newline-separated statements).
     */
    setShouldPatchInline(shouldPatchInline: boolean): void;
    patchAsStatement({ leftBrace, rightBrace }?: PatchOptions): void;
    private removeInitialAndFinalParens;
    patchInnerStatement(statement: NodePatcher): void;
    /**
     * Remove an unnecessary empty return at the end of a function. Ideally, we
     * want to remove the whole line, but that's only safe if the `return` is on a
     * line by itself. Otherwise, there might be bugs like code being pulled into
     * a comment on the previous line.
     */
    removeFinalEmptyReturn(statement: NodePatcher): void;
    patchAsExpression({ leftBrace, rightBrace }?: PatchOptions): void;
    /**
     * @private
     */
    getSemicolonSourceTokenIndexBetween(left: NodePatcher, right: NodePatcher): SourceTokenListIndex | null;
    /**
     * Blocks only exit via the last statement, so we check its code paths.
     */
    allCodePathsPresent(): boolean;
    allowPatchingOuterBounds(): boolean;
}
